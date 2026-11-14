from .models import Task
from accounts.models import User

class TaskQuerysetMixin:
    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.ADMIN:
            return Task.objects.all()

        if user.role == User.Role.REGIONAL_MANAGER:
            return Task.objects.filter(team__region__regional_managers__id = user.id).distinct()

        if user.role ==  User.Role.TEAM_LEAD:
            return Task.objects.filter(team__team_lead_id=user.id)

        if user.role == User.Role.FIELD_AGENT:
            return Task.objects.filter(assigned_to=user)


        return Task.objects.none()