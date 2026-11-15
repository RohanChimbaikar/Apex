from django.contrib.contenttypes.models import ContentType
from activity.models import ActivityLog


def create_activity_log(
    actor,
    action,
    instance,
    description="",
    metadata=None
):
    content_type = ContentType.objects.get_for_model(instance)

    return ActivityLog.objects.create(
        actor=actor,
        content_type=content_type,
        object_id=instance.pk,
        action=action,
        description=description,
        metadata=metadata or {},
    )