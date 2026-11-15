from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("organization/", include("organization.urls"))
    ,
    path('tasks/',include("tasks.urls")),

    path("visits/",include("visits.urls"))
]
