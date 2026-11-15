import django_filters
from django.contrib.contenttypes.models import ContentType

from .models import ActivityLog


class ActivityLogFilter(django_filters.FilterSet):
    """
    FilterSet for ActivityLog.

    Supported query parameters
    --------------------------
    action          Exact match on ActivityLog.Action choices.
    actor           Filter by actor user ID.
    content_type    Filter by '<app_label>.<model>' string, e.g. 'tasks.task'.
    date_from       Include logs created on or after this date (YYYY-MM-DD).
    date_to         Include logs created on or before this date (YYYY-MM-DD).
    task_id         Convenience: logs for a specific task object.
    visit_id        Convenience: logs for a specific visit object.
    """

    action = django_filters.ChoiceFilter(choices=ActivityLog.Action.choices)
    actor = django_filters.NumberFilter(field_name="actor__id")

    content_type = django_filters.CharFilter(method="filter_content_type")

    date_from = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__gte",
    )
    date_to = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__lte",
    )

    task_id = django_filters.NumberFilter(method="filter_task_id")
    visit_id = django_filters.NumberFilter(method="filter_visit_id")

    class Meta:
        model = ActivityLog
        fields = [
            "action",
            "actor",
            "content_type",
            "date_from",
            "date_to",
            "task_id",
            "visit_id",
        ]

    # ------------------------------------------------------------------
    # Custom filter methods
    # ------------------------------------------------------------------

    def filter_content_type(self, queryset, name, value):
        """
        Accept '<app_label>.<model>' (case-insensitive) and resolve to the
        corresponding ContentType row.  Unknown values return an empty queryset
        rather than raising an error.
        """
        try:
            app_label, model = value.lower().split(".", 1)
        except ValueError:
            return queryset.none()

        try:
            ct = ContentType.objects.get(app_label=app_label, model=model)
        except ContentType.DoesNotExist:
            return queryset.none()

        return queryset.filter(content_type=ct)

    def filter_task_id(self, queryset, name, value):
        """Return logs where the referenced object is Task <value>."""
        try:
            ct = ContentType.objects.get(app_label="tasks", model="task")
        except ContentType.DoesNotExist:
            return queryset.none()
        return queryset.filter(content_type=ct, object_id=value)

    def filter_visit_id(self, queryset, name, value):
        """Return logs where the referenced object is Visit <value>."""
        try:
            ct = ContentType.objects.get(app_label="visits", model="visit")
        except ContentType.DoesNotExist:
            return queryset.none()
        return queryset.filter(content_type=ct, object_id=value)
