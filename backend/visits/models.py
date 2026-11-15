from django.conf import settings
from django.db import models

from organization.models import TimeStampedModel
from tasks.models import Task

# Create your models here.

User = settings.AUTH_USER_MODEL


class Visit(TimeStampedModel):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        SCHEDULED = "SCHEDULED", "Scheduled"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        FAILED = "FAILED", "Failed"

    task = models.ForeignKey(Task, on_delete=models.PROTECT, related_name="visits")
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="visits",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)
    outcome = models.TextField(blank=True)

    ai_summary = models.TextField(blank=True, editable=False)

    ai_follow_up = models.TextField(blank=True, editable=False)
    ai_risk_flag = models.CharField(max_length=20, blank=True, editable=False)
    ai_next_action = models.TextField(blank=True, editable=False)

    readonly_fields = (
        "started_at",
        "completed_at",
        "created_at",
        "updated_at",
        "ai_summary",
        "ai_follow_up",
        "ai_risk_flag",
        "ai_next_action",
    )
