from django.contrib import admin
from .models import Region, Team, Zone


# Register your models here.
class ZoneAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at", "created_by", "updated_at", "updated_by"]


admin.site.register(Region)
admin.site.register(Team)
admin.site.register(Zone, ZoneAdmin)
