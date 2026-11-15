from django.utils import timezone
from rest_framework import status

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from visits.services.ai_service import analyze_visit
from rest_framework.views import APIView
from visits.mixins import VisitQuerysetMixin
from visits.permissions import CanCreateVisit, CanModifyVisit
from . import serializers
from .models import Visit
from visits.serializers import VisitSerializer


class VisitListView(VisitQuerysetMixin,ListCreateAPIView):
    serializer_class = VisitSerializer
    permission_classes = [CanCreateVisit]

    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        serializer.save(agent=task.assigned_to)


class VisitDetailsView(VisitQuerysetMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = VisitSerializer
    permission_classes = [CanModifyVisit]


class VisitStartView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,pk):
        visit = get_object_or_404(
            Visit.objects.filter(agent=request.user),
            pk=pk
        )

        if visit.agent != request.user:
            return Response({"detail":"You are not authorized to start this visit"},status=status.HTTP_403_FORBIDDEN)

        if visit.status != Visit.Status.PENDING:
            return Response({"detail":"Only Pending Visits can be started"},status=status.HTTP_400_BAD_REQUEST)

        visit.status = Visit.Status.IN_PROGRESS
        visit.started_at = timezone.now()
        visit.save()
        serializer = VisitSerializer(visit)

        return Response(serializer.data,status=status.HTTP_200_OK)




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

        visit.notes = notes
        visit.outcome = outcome
        visit.status = Visit.Status.COMPLETED
        visit.completed_at = timezone.now()
        ai_results = analyze_visit(visit.notes, visit.outcome)

        visit.ai_summary = ai_results["summary"]
        visit.ai_follow_up = ai_results["follow_up"]
        visit.ai_risk_flag = ai_results["risk_flag"]
        visit.ai_next_action = ai_results["next_action"]

        visit.save()

        serializer = VisitSerializer(visit)

        return Response(serializer.data, status=status.HTTP_200_OK)