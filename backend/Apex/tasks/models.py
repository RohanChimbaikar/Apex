from django.db import models
from accounts.models import User
from organization.models import Team, Region
from django.conf import settings

# Create your models here.


class Task(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("ON_HOLD", "On Hold"),
        ("PARTIALLY_COMPLETE", "Partially Complete"),
        ("COMPLETE", "Complete"),
        ("CANCELLED", "Cancelled"),
    ]

    PRIORITY_CHOICES = [
        ("HIGH", "High"),
        ("MEDIUM", "Medium"),
        ("LOW", "Low"),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="MEDIUM"
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="tasks")

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )

    deadline = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks",
    )

    last_updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_tasks",
    )

    def __str__(self):
        return self.name


class Visit(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="visits")
    notes = models.TextField(blank=True, null=True)
    outcome = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visit_created",
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="visit_updated",
    )
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.task.name} ({self.status})"


class VisitAnalysis(models.Model):
    visit = models.OneToOneField(
        Visit, on_delete=models.CASCADE, related_name="analysis"
    )

    summary = models.TextField()
    recommendation = models.TextField()
    risk_flag = models.CharField(max_length=20)
    next_action = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)


class ActivityLog(models.Model):

    ACTION_CHOICES = [
        ("TASK_CREATED", "Task Created"),
        ("TASK_ASSIGNED", "Task Assigned"),
        ("TASK_STATUS_CHANGED", "Task Status Changed"),
        ("VISIT_STARTED", "Visit Started"),
        ("VISIT_COMPLETED", "Visit Completed"),
        ("VISIT_NOTE_ADDED", "Visit Note Added"),
        ("VISIT_UPDATED", "Visit Updated"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="activity_logs",
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="activity_logs",
    )

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="activity_logs",
    )

    action = models.CharField(max_length=30, choices=ACTION_CHOICES)

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        target = (
            self.task.name
            if self.task
            else f"Visit #{self.visit.id}" if self.visit else "N/A"
        )
        return f"{self.user} | {self.get_action_display()} | {target}"
