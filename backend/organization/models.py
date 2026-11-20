from django.conf import settings
from django.db import models

# Create your models here.

User = settings.AUTH_USER_MODEL


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Region(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    regional_managers = models.ManyToManyField(User, blank=True, related_name="managed_regions")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_regions"
    )
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="updated_regions"
    )

    def __str__(self):
        return self.name


class Team(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    team_lead = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="led_teams"
    )
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name="teams")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_teams"
    )
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="updated_teams"
    )

    team_members = models.ManyToManyField(
        User,
        related_name="teams",
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["region", "name"],
                name="unique_team_name_per_region",
            )
        ]

    def __str__(self):
        return self.name
