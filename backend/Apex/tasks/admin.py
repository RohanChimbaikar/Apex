from django.contrib import admin

from .models import Task, Visit, ActivityLog, VisitAnalysis
from .services.activity_logger import log_activity


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "description",
        "priority",
        "created_at",
        "created_by",
        "updated_at",
        "deadline",
    ]
    search_fields = ["name"]
    list_filter = ["priority", "created_at", "team"]
    list_per_page = 3

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        if not change:
            log_activity(
                user=request.user,
                action="TASK_CREATED",
                description=f"Task '{obj.name}' created.",
                task=obj,
            )


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = [
        "task",
        "notes",
        "created_at",
        "status",
        "started_at",
        "completed_at",
    ]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        if not change:
            log_activity(
                user=request.user,
                action="VISIT_CREATED",
                description=f"Visit created for task '{obj.task.name}'.",
                visit=obj,
            )


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = [
        "action",
        "user",
        "task",
        "visit",
        "created_at",
    ]
    
admin.site.register(VisitAnalysis)