from typing import Any

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer
from accounts.models import User
from organization.models import Team, Region
from tasks.models import Task
from .models import Visit

class VisitSerializer(ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all()
    )
    class Meta:
        model = Visit
        fields = [
            "id",
            "task",
            "agent",
            "status",
            "started_at",
            "completed_at",
            "notes",
            "outcome",
            "ai_summary",
            "ai_follow_up",
            "ai_risk_flag",
            "ai_next_action",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id","agent","status",
            "started_at","completed_at",
            "ai_summary","ai_follow_up",
            "ai_risk_flag","ai_next_action",
            "created_at","updated_at",
        ]

    def validate_task(self, value):
        user = self.context['request'].user
        if not value.assigned_to:
            raise ValidationError(
                "This Task has not been assigned to a field agent yet."
            )

        if user.role == User.Role.ADMIN:
            return value

        elif user.role == User.Role.REGIONAL_MANAGER:
            if value.team.region.regional_managers.filter(id=user.id).exists():
                return value

            raise ValidationError("You cannot assign a visit in this region")

        elif user.role == User.Role.TEAM_LEAD:
            if value.team.team_lead_id == user.id:
                return value

            raise ValidationError("You cannot assign a visit in this region")


        raise ValidationError("You are not allowed to perform this action")



