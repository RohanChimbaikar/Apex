from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, ValidationError

from .models import Region, Team

User = get_user_model()


class RegionSerializer(ModelSerializer):
    regional_managers = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True
    )
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Region
        fields = [
            "name",
            "description",
            "regional_managers",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["created_at", "updated_at"]


class TeamSerializer(ModelSerializer):
    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all())
    team_lead = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.TEAM_LEAD),
        allow_null=True,
        required=False,
    )
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Team
        fields = [
            "name",
            "description",
            "region",
            "team_lead",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_team_lead(self, value):
        if value is None:
            return value
        if value.role != User.Role.TEAM_LEAD:
            raise ValidationError("The assigned member is not a team lead")

        return value

    def validate_region(self, value):
        user = self.context["request"].user

        if user.role == User.Role.ADMIN:
            return value
        if user.role == User.Role.REGIONAL_MANAGER:
            if value.regional_managers.filter(id=user.id).exists():
                return value
            else:
                raise ValidationError(
                    "You are not authorized to manage teams in this region"
                )
        raise ValidationError("You are not authorized to use this region")
