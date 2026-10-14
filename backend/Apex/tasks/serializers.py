<<<<<<< HEAD
from .models import Task, Visit, VisitAnalysis
from rest_framework import serializers


from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source="team.name",
        read_only=True,
    )
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = "__all__"

    def get_assigned_to_name(self, obj):
        if obj.assigned_to is None:
            return None

        return obj.assigned_to.get_full_name() or obj.assigned_to.username


=======
from .models import Task,Visit, VisitAnalysis
from rest_framework import serializers

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields ="__all__"
        
        
        
>>>>>>> origin/main
class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = "__all__"
<<<<<<< HEAD

=======
        
>>>>>>> origin/main

class VisitUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
<<<<<<< HEAD
        fields = ["task", "notes", "outcome", "status"]


class VisitAnalysisSerializer(serializers.ModelSerializer):
    model = VisitAnalysis
    fields = "__all__"
=======
        fields = ['task','notes','outcome','status']
        
        
    
class VisitAnalysisSerializer(serializers.ModelSerializer):
    model = VisitAnalysis
    fields = "__all__"


    
>>>>>>> origin/main
