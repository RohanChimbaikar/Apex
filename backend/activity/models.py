from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from organization.models import TimeStampedModel

User = settings.AUTH_USER_MODEL


class ActivityLog(TimeStampedModel):
    class Action(models.TextChoices):
        CREATED = "CREATED", "Created"
        UPDATED = "UPDATED", "Updated"
        DELETED = "DELETED", "Deleted"
        ASSIGNED = "ASSIGNED", "Assigned"
        STATUS_CHANGED = "STATUS_CHANGED", "Status Changed"
        STARTED = "STARTED", "Started"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
    )

    object_id = models.PositiveBigIntegerField()

    content_object = GenericForeignKey(
        "content_type",
        "object_id",
    )
    action = models.CharField(
        max_length=20,
        choices=Action.choices,
    )

    description = models.TextField(blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["content_type", "object_id"],
                name="activity_object_idx",
            ),
        ]

    def __str__(self):
        return f"{self.action} - {self.content_type} #{self.object_id}"
