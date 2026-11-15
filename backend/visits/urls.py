from django.urls import path

from visits import views

urlpatterns = [
    path("",views.VisitListView.as_view(),name='visit-list'),
    path("<int:pk>/",views.VisitDetailsView.as_view(),name="visit-details"),
    path("<int:pk>/start/",views.VisitStartView.as_view(),name='visit-start'),
    path("<int:pk>/complete/", views.VisitCompletedView.as_view(), name='visit-completed'),
]