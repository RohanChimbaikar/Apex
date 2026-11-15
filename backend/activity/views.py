from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .filters import ActivityLogFilter
from .mixins import ActivityLogQuerysetMixin
from .pagination import ActivityLogPagination
from .serializers import ActivityLogSerializer


class ActivityLogListView(ActivityLogQuerysetMixin, ListAPIView):
    """
    GET /activity/

    Returns a paginated, filterable list of activity logs scoped to the
    authenticated user's role.

    Supports filtering via ActivityLogFilter and ordering by created_at.
    Write methods (POST, PUT, PATCH, DELETE) are not permitted.
    """

    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ActivityLogPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ActivityLogFilter
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]


class ActivityLogDetailView(ActivityLogQuerysetMixin, RetrieveAPIView):
    """
    GET /activity/<id>/

    Retrieve a single activity log entry.

    The role-scoped queryset mixin ensures that users cannot fetch logs
    for objects they are not permitted to access, even by guessing IDs.
    Write methods are not permitted.
    """

    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
