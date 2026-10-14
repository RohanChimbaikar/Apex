from django.contrib.auth.handlers.modwsgi import check_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import status
from rest_framework import serializers as drf_serializers
from django.core.exceptions import ValidationError

from . import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from .permissions import *

User = get_user_model()


class RegisterAV(APIView):
    permission_classes = [CanManageUsers]

    def post(self, request):
        serializer = serializers.RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            raise drf_serializers.ValidationError(serializer.errors)

    def get(self, request):
        users = User.objects.all()
        serializer = serializers.RegistrationSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = serializers.ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # def post(self,request):
    #     serializer = ProfileSerializer(request.user,data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data,status=status.HTTP_200_OK)
    #     else:
    #         return Response(serializer.errors)

    def put(self, request):
        serializer = serializers.ProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = serializers.ProfileSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListAV(APIView):
    permission_classes = [CanManageUsers]

    def get(self, request):
        users = User.objects.all()
        serializer = serializers.UserListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDetailAV(APIView):
    permission_classes = [CanManageUsers]

    def get(self, request, pk):
        users = get_object_or_404(User, pk=pk)
        serializer = serializers.UserDetailSerializer(users)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = serializers.UserDetailSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = serializers.UserDetailSerializer(
            user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(
            {"message": "User deleted successfully"}, status=status.HTTP_200_OK
        )


class UserStatusAV(APIView):
    permission_classes = [CanManageUsers]

    def patch(self, request, pk, action):
        user = get_object_or_404(User, pk=pk)

        if action == "activate":
            user.is_active = True
        if action == "deactivate":
            user.is_active = False
        user.save()
        serializer = serializers.UserDetailSerializer(user, partial=True)
        # serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserChangePassword(APIView):
    permission_classes = [IsAuthenticated]

    # def post(self, request):
    #     serializer = serializers.ChangePasswordSerializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)

    #     user = request.user
    #     old_password = serializer.validated_data["old_password"]
    #     new_password = serializer.validated_data["new_password"]

    #     if user.check_password(old_password):
    #         try:
    #             validate_password(new_password, user)
    #         except ValidationError as e:
    #             return Response(
    #                 {"new_password": e.messages},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         user.set_password(new_password)
    #         user.save()

    #         return Response(
    #             {"message": "Password changed successfully."},
    #             status=status.HTTP_200_OK
    #         )

    #     return Response(
    #         {"error": "Old password is incorrect."},
    #         status=status.HTTP_400_BAD_REQUEST
    #     )

    def post(self, request):
        serializer = serializers.ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if user.check_password(old_password):
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response(
                    {"error": e.messages}, status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Password changed successfully"},
                status=status.HTTP_202_ACCEPTED,
            )
        else:
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )
