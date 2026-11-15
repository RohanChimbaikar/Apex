from django.db.models import Count, Q
from django.utils import timezone

from tasks.models import Task


def get_task_stats(queryset):
    today = timezone.localdate()

    stats = queryset.aggregate(
        total_tasks=Count("id"),
        pending_tasks=Count(
            "id",
            filter=Q(status=Task.Status.PENDING)
        ),
        in_progress_tasks=Count(
            "id",
            filter=Q(status=Task.Status.IN_PROGRESS)
        ),
        completed_tasks=Count(
            "id",
            filter=Q(status=Task.Status.COMPLETED)
        ),
        cancelled_tasks=Count(
            "id",
            filter=Q(status=Task.Status.CANCELLED)
        ),
        high_priority_tasks=Count(
            "id",
            filter=Q(priority=Task.Priority.HIGH)
        ),
        overdue_tasks=Count(
            "id",
            filter=(
                Q(due_date__lt=today) &
                Q(status__in=[
                    Task.Status.PENDING,
                    Task.Status.IN_PROGRESS
                ])
            )
        )
    )

    return stats