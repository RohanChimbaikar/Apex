from rest_framework import serializers

from .models import ActivityLog


class ActorSerializer(serializers.Serializer):
    """Minimal actor representation — id and email only."""

    id = serializers.IntegerField()
    email = serializers.EmailField()


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for ActivityLog.

    All fields are explicitly read-only.  No write operations are permitted
    through this serializer or the views that use it.
    """

    actor = ActorSerializer(read_only=True)
    content_type_label = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "actor",
            "content_type_label",
            "object_id",
            "action",
            "description",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_content_type_label(self, obj) -> str:
        """Return '<app_label>.<model>' for the referenced content type."""
        return f"{obj.content_type.app_label}.{obj.content_type.model}"
