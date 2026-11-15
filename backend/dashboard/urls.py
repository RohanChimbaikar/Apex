from django.urls import path

from dashboard.views import DashboardStatsView

urlpatterns = [
    path("",view=DashboardStatsView.as_view(),name='dashboard-stats-list')
]