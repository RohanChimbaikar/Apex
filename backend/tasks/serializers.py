from rest_framework import serializers
from rest_framework.serializers import ValidationError

from accounts.models import User

from . import models


class TaskSerializer(serializers.ModelSerializer):
    team = serializers.PrimaryKeyRelatedField(queryset=models.Team.objects.all())
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), allow_null=True, required=False
    )

    team_name = serializers.CharField(
        source="team.name",
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True, allow_null=True
    )

    updated_by_name = serializers.CharField(
        source="updated_by.get_full_name", read_only=True, allow_null=True
    )

    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = models.Task
        fields = [
            "id",
            "name",
            "description",
            "team",
            "assigned_to",
            "created_by",
            "updated_by",
            "status",
            "priority",
            "scheduled_at",
            "due_date",
            "created_at",
            "updated_at",
            "team_name",
            "assigned_to_name",
            "created_by_name",
            "updated_by_name",
        ]

        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
            "team_name",
            "assigned_to_name",
            "created_by_name",
            "updated_by_name    ",
        ]

    def validate_assigned_to(self, value):
        if value is None:
            return None

        if value.role != User.Role.FIELD_AGENT:
            raise ValidationError("You can only assign tasks to field agents")

        if value.team is None:
            raise ValidationError("This field agent does not belong to a team")

        return value

    def validate(self, attrs):
        team = attrs.get("team")
        assigned_to = attrs.get("assigned_to")

        if assigned_to and team:
            if assigned_to.team_id != team.id:
                raise ValidationError({"assigned_to": "This user belongs to another team"})

        return attrs

    def validate_team(self, value):
        user = self.context["request"].user

        if user.role == User.Role.ADMIN:
            return value

        elif user.role == User.Role.REGIONAL_MANAGER:
            if value.region.regional_managers.filter(id=user.id).exists():
                return value

            else:
                raise ValidationError("This team does not belong to your region")

        if user.role == User.Role.TEAM_LEAD:
            if value.team_lead_id == user.id:
                return value
            else:
                raise ValidationError("Only team leads can perform this action")

        else:
            raise ValidationError("You are not authorized to select this team")
