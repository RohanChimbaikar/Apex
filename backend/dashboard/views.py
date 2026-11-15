from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.serializers import DashboardSerializer
from dashboard.services import get_dashboard_stats


class DashboardStatsView(APIView):
    def get(self,request):
        stats = get_dashboard_stats(user=request.user)
        serializer = DashboardSerializer(stats)
        return Response(serializer.data,status=status.HTTP_200_OK)
