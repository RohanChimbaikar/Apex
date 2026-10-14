from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from organization.models import Region, Team


class User(AbstractUser):

    ROLE_CHOICES = [
        ("None", "None"),
        ("ADMIN", "Admin"),
        ("REGIONAL_MANAGER", "Regional Manager"),
        ("TEAM_LEAD", "Team Lead"),
        ("FIELD_AGENT", "Field Agent"),
        ("AUDITOR", "Auditor"),
    ]

    email = models.EmailField(unique=True)
    phone = PhoneNumberField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    profile = models.ImageField(upload_to="profiles/", blank=True, null=True)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="None")

    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )

    def __str__(self):
        return self.username
