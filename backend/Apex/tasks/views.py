from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.permissions import IsAdminOrReadOnly

from .models import Task, Visit, VisitAnalysis
from .serializers import (
    TaskSerializer,
    VisitSerializer,
    VisitUpdateSerializer,
)
from .services.activity_logger import log_activity
from .services.ai_service import analyze_visit

from accounts.permissions import *


class TaskList(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanManageTasks]
    queryset = Task.objects.all()

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Task.objects.all()

        if user.role == "REGIONAL_MANAGER":
            return Task.objects.filter(team__region=user.team.region)

        if user.role == "TEAM_LEAD":
            return Task.objects.filter(team=user.team)

        if user.role == "FIELD_AGENT":
            return Task.objects.filter(assigned_to=user)

        return Task.objects.none()

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)

        log_activity(
            user=self.request.user,
            action="TASK_CREATED",
            description=f"Task '{task.name}' created.",
            task=task,
        )


class TaskDetails(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanManageTasks]
    queryset = Task.objects.all()

    def perform_update(self, serializer):
        old_task = self.get_object()

        old_status = old_task.status
        old_assigned_to = old_task.assigned_to

        task = serializer.save(last_updated_by=self.request.user)

        # Status Changed
        if old_status != task.status:
            log_activity(
                user=self.request.user,
                action="TASK_STATUS_CHANGED",
                description=f"Task '{task.name}' status changed from '{old_status}' to '{task.status}'.",
                task=task,
            )

        # Assignment Changed
        if old_assigned_to != task.assigned_to:
            assigned_to = (
                task.assigned_to.username if task.assigned_to else "Unassigned"
            )

            log_activity(
                user=self.request.user,
                action="TASK_ASSIGNED",
                description=f"Task '{task.name}' assigned to {assigned_to}.",
                task=task,
            )


# -----------------------------
# VISITS
# -----------------------------


class VisitList(generics.ListCreateAPIView):
    serializer_class = VisitSerializer
    queryset = Visit.objects.all()
    permission_classes = [CanManageVisits]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Visit.objects.all()

        if user.role == "REGIONAL_MANAGER":
            return Visit.objects.filter(task__team__region=user.team.region)

        if user.role == "TEAM_LEAD":
            return Visit.objects.filter(task__team=user.team)

        if user.role == "FIELD_AGENT":
            return Visit.objects.filter(task__assigned_to=user)

        return Visit.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VisitDetails(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VisitUpdateSerializer
    queryset = Visit.objects.all()
    permission_classes = [CanManageVisits]

    def perform_update(self, serializer):
        visit = serializer.save(updated_by=self.request.user)

        log_activity(
            user=self.request.user,
            action="VISIT_UPDATED",
            description="Visit details updated",
            visit=visit,
        )


# -----------------------------
# START VISIT
# -----------------------------


class VisitStarted(APIView):
    permission_classes = [CanManageVisits]

    def patch(self, request, pk):
        visit = get_object_or_404(Visit, pk=pk)
        self.check_object_permissions(request, visit)

        if visit.status != "PENDING":
            return Response(
                {"error": "This visit has already been started."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visit.status = "IN_PROGRESS"
        visit.started_at = timezone.now()
        visit.updated_by = request.user
        visit.save()

        log_activity(
            user=request.user,
            action="VISIT_STARTED",
            description=f"Visit for task '{visit.task.name}' started.",
            visit=visit,
        )

        serializer = VisitSerializer(visit)

        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------
# COMPLETE VISIT
# -----------------------------


class VisitCompleted(APIView):
    permission_classes = [CanManageVisits]

    def patch(self, request, pk):
        visit = get_object_or_404(Visit, pk=pk)
        self.check_object_permissions(request, visit)

        if visit.status != "IN_PROGRESS":
            return Response(
                {"error": "Only an in-progress visit can be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visit.status = "COMPLETED"
        visit.completed_at = timezone.now()
        visit.updated_by = request.user
        visit.save()
        # Generate AI Analysis
        result = analyze_visit(visit.notes)

        VisitAnalysis.objects.update_or_create(
            visit=visit,
            defaults={
                "summary": result["summary"],
                "recommendation": result["recommendation"],
                "risk_flag": result["risk_flag"],
                "next_action": result["next_action"],
            },
        )

        log_activity(
            user=request.user,
            action="VISIT_COMPLETED",
            description="Visit completed.",
            visit=visit,
            task=visit.task,
        )

        serializer = VisitSerializer(visit)

        return Response(serializer.data, status=status.HTTP_200_OK)
