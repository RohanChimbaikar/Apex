from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from accounts.models import User
from tasks.models import Task
from visits.models import Visit


def get_dashboard_stats(user):
    if user.role == User.Role.ADMIN:
        task_queryset = Task.objects.all()
        visit_queryset = Visit.objects.all()
        return {
            "tasks": get_task_stats(task_queryset),
            "visits":get_visit_stats(visit_queryset)
        }

    elif user.role == User.Role.REGIONAL_MANAGER:
        task_queryset = Task.objects.filter(team__region__regional_managers__id=user.id).distinct()
        visit_queryset= Visit.objects.filter(task__team__region__regional_managers__id = user.id).distinct()
        return {
            "tasks": get_task_stats(task_queryset),
            "visits": get_visit_stats(visit_queryset)
        }

    elif user.role == User.Role.TEAM_LEAD:
        task_queryset = Task.objects.filter(team__team_lead_id=user.id).distinct()
        visit_queryset= Visit.objects.filter(task__team__team_lead_id = user.id).distinct()
        return {
            "tasks": get_task_stats(task_queryset),
            "visits": get_visit_stats(visit_queryset)
        }
    elif user.role == User.Role.FIELD_AGENT:
        task_queryset = Task.objects.filter(assigned_to=user.id).distinct()
        visit_queryset= Visit.objects.filter(agent = user.id).distinct()
        return {
            "tasks": get_task_stats(task_queryset),
            "visits": get_visit_stats(visit_queryset)
        }
    elif user.role == User.Role.AUDITOR:
        task_queryset = Task.objects.all()
        visit_queryset = Visit.objects.all()

        return {
            "tasks": get_task_stats(task_queryset),
            "visits": get_visit_stats(visit_queryset)
        }

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


def get_visit_stats(queryset):
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    stats = queryset.aggregate(
        total_visits=Count("id"),
        pending_visits=Count(
            "id",
            filter=Q(status=Visit.Status.PENDING)
        ),
        in_progress_visits=Count(
            "id",
            filter=Q(status=Visit.Status.IN_PROGRESS)
        ),
        completed_visits=Count(
            "id",
            filter=Q(status=Visit.Status.COMPLETED)
        ),
        cancelled_visits=Count(
            "id",
            filter=Q(status=Visit.Status.CANCELLED)
        ),
        visits_completed_last_7_days=Count(
            "id",
            filter=(
                Q(status=Visit.Status.COMPLETED) &
                Q(completed_at__gte=week_ago)
            )
        ),
        visits_completed_last_30_days=Count(
            "id",
            filter=(
                Q(status=Visit.Status.COMPLETED) &
                Q(completed_at__gte=month_ago)
            )
        )
    )

    return stats