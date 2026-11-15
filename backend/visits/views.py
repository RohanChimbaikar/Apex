from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    get_object_or_404,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from activity.models import ActivityLog
from activity.services import create_activity_log
from visits.mixins import VisitQuerysetMixin
from visits.permissions import CanCreateVisit, CanModifyVisit
from visits.serializers import VisitSerializer
from visits.services.ai_service import analyze_visit
from .models import Visit


class VisitListView(VisitQuerysetMixin, ListCreateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [CanCreateVisit]

    def perform_create(self, serializer):
        with transaction.atomic():
            task = serializer.validated_data["task"]
            visit = serializer.save(agent=task.assigned_to)
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.CREATED,
                instance=visit,
                description=f"Visit #{visit.pk} created for task '{task.name}'.",
            )


class VisitDetailsView(VisitQuerysetMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = VisitSerializer
    permission_classes = [CanModifyVisit]

    def perform_update(self, serializer):
        # Capture pre-save state.
        instance = self.get_object()
        old_status = instance.status

        with transaction.atomic():
            visit = serializer.save()

            # --- STATUS_CHANGED (only when status actually changed) ---
            new_status = visit.status
            if new_status != old_status:
                create_activity_log(
                    actor=self.request.user,
                    action=ActivityLog.Action.STATUS_CHANGED,
                    instance=visit,
                    description=(
                        f"Visit #{visit.pk} status changed from "
                        f"{old_status} to {new_status}."
                    ),
                    metadata={
                        "old_status": old_status,
                        "new_status": new_status,
                    },
                )

            # --- UPDATED (always, for any successful update) ---
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.UPDATED,
                instance=visit,
                description=f"Visit #{visit.pk} updated.",
            )

    def perform_destroy(self, instance):
        with transaction.atomic():
            create_activity_log(
                actor=self.request.user,
                action=ActivityLog.Action.DELETED,
                instance=instance,
                description=f"Visit #{instance.pk} deleted.",
                metadata={"visit_id": instance.pk},
            )
            instance.delete()


class VisitStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = get_object_or_404(
            Visit.objects.filter(agent=request.user),
            pk=pk,
        )

        if visit.agent != request.user:
            return Response(
                {"detail": "You are not authorized to start this visit"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if visit.status != Visit.Status.PENDING:
            return Response(
                {"detail": "Only Pending Visits can be started"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            visit.status = Visit.Status.IN_PROGRESS
            visit.started_at = timezone.now()
            visit.save()

            create_activity_log(
                actor=request.user,
                action=ActivityLog.Action.STARTED,
                instance=visit,
                description=f"Visit #{visit.pk} started.",
            )

        serializer = VisitSerializer(visit)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VisitCompletedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = get_object_or_404(
            Visit.objects.filter(agent=request.user),
            pk=pk,
        )

        if visit.status != Visit.Status.IN_PROGRESS:
            return Response(
                {"detail": "Only in-progress visits can be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes = request.data.get("notes", "").strip()
        outcome = request.data.get("outcome", "").strip()

        if not notes or not outcome:
            return Response(
                {"detail": "Both notes and outcome are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            visit.notes = notes
            visit.outcome = outcome
            visit.status = Visit.Status.COMPLETED
            visit.completed_at = timezone.now()

            # Existing Mock AI integration — preserved exactly as-is.
            ai_results = analyze_visit(visit.notes, visit.outcome)
            visit.ai_summary = ai_results["summary"]
            visit.ai_follow_up = ai_results["follow_up"]
            visit.ai_risk_flag = ai_results["risk_flag"]
            visit.ai_next_action = ai_results["next_action"]

            visit.save()

            create_activity_log(
                actor=request.user,
                action=ActivityLog.Action.COMPLETED,
                instance=visit,
                description=f"Visit #{visit.pk} completed.",
                metadata={
                    "final_status": visit.status,
                    "ai_risk_flag": visit.ai_risk_flag,
                },
            )

        serializer = VisitSerializer(visit)
        return Response(serializer.data, status=status.HTTP_200_OK)