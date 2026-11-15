from django.db import transaction
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from activity.models import ActivityLog
from activity.services import create_activity_log
from tasks.serializers import TaskSerializer
from .mixins import TaskQuerysetMixin
from .permissions import CanCreateTask, CanAccessTask, CanModifyTask


class TaskListView(TaskQuerysetMixin, ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanCreateTask, CanAccessTask]

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.save(
                created_by=self.request.user,
                updated_by=self.request.user,
            )
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.CREATED,
                instance=task,
                description=f"Task '{task.name}' created.",
            )


class TaskDetailView(TaskQuerysetMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanAccessTask, CanModifyTask]

    def perform_update(self, serializer):
        # Capture pre-save state before the ORM flushes changes.
        instance = self.get_object()
        old_status = instance.status
        old_assigned_to_id = instance.assigned_to_id

        with transaction.atomic():
            task = serializer.save(updated_by=self.request.user)

            # --- ASSIGNED event (only when assignee actually changed) ---
            new_assigned_to_id = task.assigned_to_id
            if new_assigned_to_id != old_assigned_to_id:
                create_activity_log(
                    actor=self.request.user,
                    action=ActivityLog.Action.ASSIGNED,
                    instance=task,
                    description=(
                        f"Task '{task.name}' assignment changed."
                    ),
                    metadata={
                        "previous_assignee": old_assigned_to_id,
                        "new_assignee": new_assigned_to_id,
                    },
                )

            # --- STATUS_CHANGED event (only when status actually changed) ---
            new_status = task.status
            if new_status != old_status:
                create_activity_log(
                    actor=self.request.user,
                    action=ActivityLog.Action.STATUS_CHANGED,
                    instance=task,
                    description=(
                        f"Task '{task.name}' status changed from "
                        f"{old_status} to {new_status}."
                    ),
                    metadata={
                        "old_status": old_status,
                        "new_status": new_status,
                    },
                )

            # --- UPDATED event (always, for any successful update) ---
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.UPDATED,
                instance=task,
                description=f"Task '{task.name}' updated.",
            )

    def perform_destroy(self, instance):
        with transaction.atomic():
            # Create the DELETED log before the row is removed so the
            # GenericForeignKey content_type / object_id values remain valid
            # inside this transaction.  The ActivityLog row itself is preserved
            # after the task is gone because content_type uses PROTECT and
            # object_id is a plain integer — the log outlives the task.
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.DELETED,
                instance=instance,
                description=f"Task '{instance.name}' deleted.",
                metadata={"task_id": instance.pk, "task_name": instance.name},
            )
            instance.delete()
