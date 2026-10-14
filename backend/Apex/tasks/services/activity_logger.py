from tasks.models import ActivityLog


def log_activity(user, action, description, task=None, visit=None):
    ActivityLog.objects.create(
        user=user,
        action=action,
        description=description,
        task=task,
        visit=visit
    )