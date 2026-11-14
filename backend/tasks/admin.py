from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "team",
        "assigned_to",
        "status",
        "priority",
        "due_date",
    )

    list_filter = (
        "status",
        "priority",
        "team",
    )

    search_fields = (
        "name",
        "team__name",
        "assigned_to__email",
    )

    ordering = ("due_date",)
