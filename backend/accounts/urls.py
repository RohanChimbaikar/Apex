from django.urls import path

from . import views

urlpatterns = [
    path("token/refresh/", views.ApexTokenRefreshView.as_view(), name="refresh"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutAPIView.as_view(), name="logout"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("csrf/", views.CSRFCookieView.as_view(), name="csrf"),
]
