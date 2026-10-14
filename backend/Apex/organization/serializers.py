from rest_framework import serializers
from .models import Region, Team, Zone
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = "__all__"


class TeamSerializer(serializers.ModelSerializer):

    created_by = serializers.SlugRelatedField(slug_field="username", read_only=True)
    manager = serializers.SlugRelatedField(
        queryset=User.objects.all(), slug_field="username"
    )
    region = serializers.SlugRelatedField(
        queryset=Region.objects.all(), slug_field="name"
    )
    last_updated_by = serializers.SlugRelatedField(
        slug_field="username", read_only=True
    )

    class Meta:
        model = Team
        fields = "__all__"


<<<<<<< HEAD
class TeamOptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name"]


=======
>>>>>>> origin/main
class ZoneSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(slug_field="username", read_only=True)
    updated_by = serializers.SlugRelatedField(slug_field="username", read_only=True)

    class Meta:
        model = Zone
        fields = "__all__"
