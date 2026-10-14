from django.urls import path
from . import views

urlpatterns = [
    path("", views.TaskList.as_view(), name="task-list"),
    path("<int:pk>/", views.TaskDetails.as_view(), name="task-details"),
    path("visits/", views.VisitList.as_view(), name="visit-list"),
    path("visits/<int:pk>/", views.VisitDetails.as_view(), name="visit-details"),
    path("visits/<int:pk>/start/", views.VisitStarted.as_view(), name="visit-start"),
    path(
        "visits/<int:pk>/complete/",
        views.VisitCompleted.as_view(),
        name="visit-complete",
    ),
]
