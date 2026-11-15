from rest_framework import serializers


class VisitStatsSerializer(serializers.Serializer):
    total_visits = serializers.IntegerField()
    pending_visits = serializers.IntegerField()
    in_progress_visits = serializers.IntegerField()
    completed_visits = serializers.IntegerField()
    cancelled_visits = serializers.IntegerField()
    visits_completed_last_7_days = serializers.IntegerField()
    visits_completed_last_30_days = serializers.IntegerField()



class TaskStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    cancelled_tasks = serializers.IntegerField()
    high_priority_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    tasks = TaskStatsSerializer()
    visits = VisitStatsSerializer()