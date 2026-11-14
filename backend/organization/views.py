from django.contrib.auth import get_user_model
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from accounts.permissions import CanManageTeams, IsApexAdmin

from . import serializers
from .models import Region, Team

User = get_user_model()


class RegionAPIView(ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = serializers.RegionSerializer
    permission_classes = [IsApexAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)


class RegionDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = serializers.RegionSerializer
    permission_classes = [IsApexAdmin]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class TeamAPIView(ListCreateAPIView):
    serializer_class = serializers.TeamSerializer
    permission_classes = [CanManageTeams]

    def get_queryset(self):
        if self.request.user.role == User.Role.ADMIN:
            return Team.objects.all()

        elif self.request.user.role == User.Role.REGIONAL_MANAGER:
            return Team.objects.filter(region__regional_managers=self.request.user)
        else:
            return Team.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)


class TeamDetailsAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.TeamSerializer
    permission_classes = [CanManageTeams]

    def get_queryset(self):
        if self.request.user.role == User.Role.ADMIN:
            return Team.objects.all()
        elif self.request.user.role == User.Role.REGIONAL_MANAGER:
            return Team.objects.filter(region__regional_managers=self.request.user)
        else:
            return Team.objects.none()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
