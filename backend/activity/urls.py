from django.urls import path

from .views import ActivityLogDetailView, ActivityLogListView

urlpatterns = [
    path("", ActivityLogListView.as_view(), name="activity-list"),
    path("<int:pk>/", ActivityLogDetailView.as_view(), name="activity-detail"),
]
