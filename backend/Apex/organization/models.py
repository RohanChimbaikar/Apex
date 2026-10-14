from django.db import models
from django.conf import settings


class Zone(models.Model):
    name = models.CharField(max_length=100,unique=True)
    description = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,blank=True,null=True,related_name='zone_created_by')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,blank=True,null=True,related_name='zone_updated_by')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    about = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_updated_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,related_name='region_updated_by',null=True,blank=True)
    zone = models.ForeignKey(Zone,on_delete=models.SET_NULL,blank=True,null=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100)
    about = models.TextField(blank=True, null=True)
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name="teams"
    )
    manager = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,related_name='managed_teams',null=True,blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,related_name='created_teams',null=True,blank=True)
    last_updated_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,related_name='team_updated_by',null=True,blank=True)
    def __str__(self):
        return self.name