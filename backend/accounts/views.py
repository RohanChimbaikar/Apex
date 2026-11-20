from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .permissions import IsApexAdmin
from .serializers import ApexTokenObtainPairSerializer, CurrentUserSerializer, RegisterSerializer


@method_decorator(csrf_protect, name="dispatch")
class LoginView(TokenObtainPairView):
    serializer_class = ApexTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]
        access_token = serializer.validated_data["access"]

        response = Response({"access": access_token}, status=status.HTTP_200_OK)
        response.set_cookie(
            key="refresh",
            value=refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            path="/api/",
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )

        return response


@method_decorator(csrf_protect, name="dispatch")
class ApexTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):

        refresh_token = request.COOKIES.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh Token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data.get("access")
        new_refresh_token = serializer.validated_data.get("refresh")

        response = Response({"access": access_token}, status=status.HTTP_200_OK)

        if new_refresh_token:
            response.set_cookie(
                key="refresh",
                value=new_refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                path="/api/",
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            )

        return response


@method_decorator(csrf_protect, name="dispatch")
class LogoutAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")

        if refresh_token is None:
            return Response({"detail": "You are not logged in"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            response = Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

            response.delete_cookie(
                key="refresh",
                path="/api/",
            )

            return response

        response = Response(
            {"detail": "Successfully logged out"},
            status=status.HTTP_200_OK,
        )

        response.delete_cookie(
            key="refresh",
            path="/api/",
        )

        return response


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def CSRFCookieView(request):
    return Response({"detail": "CSRF cookie set"})


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [IsApexAdmin]


class CurrentUserView(RetrieveAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
