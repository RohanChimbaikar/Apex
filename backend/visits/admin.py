from django.contrib import admin

from .models import Visit


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "task",
        "agent",
        "status",
        "started_at",
        "completed_at",
    )

    list_filter = (
        "status",
        "agent",
    )

    search_fields = (
        "task__name",
        "agent__email",
        "notes",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "started_at",
        "completed_at",
        "created_at",
        "updated_at",
    )
