from django.urls import path
from . import views

urlpatterns = [
    path("regions/", views.RegionList.as_view(), name="region"),
    path("regions/<int:pk>/", views.RegionDetails.as_view(), name="region-update"),
    path("teams/", views.TeamList.as_view(), name="team"),
<<<<<<< HEAD
    path("teams-options/", views.TeamOptions.as_view(), name="team-options"),
=======
>>>>>>> origin/main
    path("teams/<int:pk>/", views.TeamDetails.as_view(), name="team-details"),
    path("zones/", views.ZoneList.as_view(), name="zones"),
    path("zone/<int:pk>/", views.ZoneDetails.as_view(), name="region-details"),
]
