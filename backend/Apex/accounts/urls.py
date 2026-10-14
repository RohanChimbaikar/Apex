from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.RegisterAV.as_view(), name="register"),
    path("view-profile/", views.ProfileView.as_view(), name="view-profile"),
    path("users/", views.UserListAV.as_view(), name="user-list"),
    path(
        "user/change-password/",
        views.UserChangePassword.as_view(),
        name="change-password",
    ),
    path("user/<int:pk>/", views.UserDetailAV.as_view(), name="user-detail"),
    path(
        "user/<int:pk>/<str:action>/", views.UserStatusAV.as_view(), name="user-status"
    ),
]
