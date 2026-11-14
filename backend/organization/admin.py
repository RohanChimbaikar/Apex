from django.contrib import admin

from .models import Region, Team

# Register your models here.


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name",)
    filter_horizontal = ("regional_managers",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "team_lead", "created_at")
    list_filter = ("region",)
    search_fields = ("name", "region__name  ")
