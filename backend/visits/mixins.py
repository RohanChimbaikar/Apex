from django.contrib.auth import  get_user_model
from .models import Visit

User = get_user_model()


class VisitQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Visit.objects.all()

        if user.role == User.Role.REGIONAL_MANAGER:
            return Visit.objects.filter(task__team__region__regional_managers=user).distinct()

        if user.role == User.Role.TEAM_LEAD:
            return Visit.objects.filter(task__team__team_lead_id=user.id)

        if user.role == User.Role.FIELD_AGENT:
            return Visit.objects.filter(agent=user)

        return Visit.objects.none()