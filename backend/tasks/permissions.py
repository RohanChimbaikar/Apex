from typing import Any

from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView
from accounts.models import User




class CanAccessTask(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return (
            request.user.is_authenticated
            and request.user.role in [
                User.Role.ADMIN,
                User.Role.FIELD_AGENT,
                User.Role.TEAM_LEAD,
                User.Role.REGIONAL_MANAGER,
            ]
        )

class CanCreateTask(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        if request.method != "POST":
            return True

        return(
                request.user.is_authenticated
                and
                request.user.role in [
                User.Role.ADMIN,
                User.Role.REGIONAL_MANAGER,
                User.Role.TEAM_LEAD
            ]
            )


class CanModifyTask(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:

        if request.method in SAFE_METHODS:
            return True

        return(request.user.is_authenticated
               and
               request.user.role in [
                    User.Role.ADMIN,
                    User.Role.REGIONAL_MANAGER,
                    User.Role.TEAM_LEAD,
               ]
               )

