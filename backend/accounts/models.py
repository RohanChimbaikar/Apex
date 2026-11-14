from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import ApexUserManager

# Create your models here.


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        REGIONAL_MANAGER = "REGIONAL_MANAGER", "Regional Manager"
        TEAM_LEAD = "TEAM_LEAD", "Team Lead"
        FIELD_AGENT = "FIELD_AGENT", "Field Agent"
        AUDITOR = "AUDITOR", "Auditor"

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.FIELD_AGENT
    )
    team = models.ForeignKey(
        "organization.Team",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="members",
    )

    objects = ApexUserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []
