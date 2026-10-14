from django.shortcuts import render
from . import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.shortcuts import get_object_or_404
from .permissions import IsAdminOrReadOnly
from .models import Region, Team, Zone
from accounts.permissions import *


class RegionList(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = serializers.RegionSerializer
    permission_classes = [CanManageRegions]


class RegionDetails(APIView):
    permission_classes = [CanManageRegions]

    def get(self, request, pk):
        region = get_object_or_404(Region, pk=pk)
        serializer = serializers.RegionSerializer(region)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        region = get_object_or_404(Region, pk=pk)
        serializer = serializers.RegionSerializer(region, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        region = get_object_or_404(Region, pk=pk)
        serializer = serializers.RegionSerializer(
            region, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        region = get_object_or_404(Region, pk=pk)
        region.delete()
        return Response(
            {"message": "Region deleted successfully"}, status=status.HTTP_200_OK
        )


class TeamList(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = serializers.TeamSerializer
    permission_classes = [CanManageTeams]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


<<<<<<< HEAD
class TeamOptions(generics.ListAPIView):
    queryset = Team.objects.only("id", "name")
    serializer_class = serializers.TeamOptionsSerializer
    permission_classes = [CanManageTeams]


=======
>>>>>>> origin/main
class TeamDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = serializers.TeamSerializer
    permission_classes = [CanManageTeams]

    def perform_update(self, serializer):
        serializer.save(last_updated_by=self.request.user)


class ZoneList(generics.ListCreateAPIView):
    queryset = Zone.objects.all()
    serializer_class = serializers.ZoneSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ZoneDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Zone.objects.all()
    serializer_class = serializers.ZoneSerializer
    permission_classes = [CanManageRegions]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
