from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from tasks.serializers import TaskSerializer
from .mixins import TaskQuerysetMixin
from .permissions import CanCreateTask, CanAccessTask, CanModifyTask


class TaskListView(TaskQuerysetMixin,ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanCreateTask,CanAccessTask]

    def perform_create(self, serializer):
        serializer.save(created_by = self.request.user,updated_by=self.request.user)

class TaskDetailView(TaskQuerysetMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [CanAccessTask,CanModifyTask]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


