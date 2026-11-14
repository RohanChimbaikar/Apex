from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "actor",
        "action",
        "content_type",
        "object_id",
        "created_at",
    )

    list_filter = (
        "action",
        "content_type",
        "created_at",
    )

    search_fields = (
        "description",
        "actor__email",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "actor",
        "content_type",
        "object_id",
        "action",
        "description",
        "metadata",
        "created_at",
        "updated_at",
        "content_object",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
