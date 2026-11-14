from django.urls import path

from . import views

urlpatterns = [
    path("regions/", views.RegionAPIView.as_view(), name="regions"),
    path(
        "regions/<int:pk>/", views.RegionDetailAPIView.as_view(), name="region-details"
    ),
    path("teams/", views.TeamAPIView.as_view(), name="teams"),
    path("teams/<int:pk>/", views.TeamDetailsAPIView.as_view(), name="team-details"),
]
