from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from accounts.models import User
from tasks.models import Task
from visits.models import Visit
from .models import ActivityLog


class ActivityLogQuerysetMixin:
    """
    Scope the ActivityLog queryset to only the logs that the current user is
    permitted to see.

    The scoping rules mirror the existing Task and Visit queryset mixins
    (TaskQuerysetMixin, VisitQuerysetMixin) so there is a single consistent
    source of truth for access control.

    Role           | Visible logs
    ---------------|------------------------------------------------------------
    ADMIN          | All logs
    AUDITOR        | All logs (read-only enforced at the view/permission level)
    REGIONAL_MANAGER | Logs for tasks and visits in managed regions
    TEAM_LEAD      | Logs for tasks and visits in led teams
    FIELD_AGENT    | Logs for their assigned tasks and their own visits
    Other / unauthenticated | Empty queryset

    Implementation notes
    --------------------
    - ContentType lookups are done once per request using get_for_model(),
      which is internally cached by Django's contenttypes framework.
    - Task and Visit IDs are fetched as flat value lists to build the final
      Q filter, avoiding N+1 queries on the ActivityLog table.
    - distinct() is applied to guard against fan-out from M2M joins
      (e.g. regional_managers is a M2M field on Region).
    """

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return ActivityLog.objects.none()

        # Admins and Auditors see everything.
        if user.role in (User.Role.ADMIN, User.Role.AUDITOR):
            return ActivityLog.objects.select_related(
                "actor", "content_type"
            ).order_by("-created_at")

        task_ct = ContentType.objects.get_for_model(Task)
        visit_ct = ContentType.objects.get_for_model(Visit)

        if user.role == User.Role.REGIONAL_MANAGER:
            task_ids = Task.objects.filter(
                team__region__regional_managers__id=user.id
            ).values_list("id", flat=True)

            visit_ids = Visit.objects.filter(
                task__team__region__regional_managers__id=user.id
            ).values_list("id", flat=True)

        elif user.role == User.Role.TEAM_LEAD:
            task_ids = Task.objects.filter(
                team__team_lead_id=user.id
            ).values_list("id", flat=True)

            visit_ids = Visit.objects.filter(
                task__team__team_lead_id=user.id
            ).values_list("id", flat=True)

        elif user.role == User.Role.FIELD_AGENT:
            task_ids = Task.objects.filter(
                assigned_to=user
            ).values_list("id", flat=True)

            visit_ids = Visit.objects.filter(
                agent=user
            ).values_list("id", flat=True)

        else:
            return ActivityLog.objects.none()

        return (
            ActivityLog.objects.select_related("actor", "content_type")
            .filter(
                Q(content_type=task_ct, object_id__in=task_ids)
                | Q(content_type=visit_ct, object_id__in=visit_ids)
            )
            .distinct()
            .order_by("-created_at")
        )
