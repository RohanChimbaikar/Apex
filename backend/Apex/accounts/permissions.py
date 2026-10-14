from rest_framework.permissions import BasePermission


class CanManageUsers(BasePermission):

    message = "You do not have permission to manage users."

    def has_permission(self, request, view):

        return request.user.is_authenticated and request.user.role == "ADMIN"


class CanManageRegions(BasePermission):

    message = "You do not have permission to manage regions."

    def has_permission(self, request, view):

        return request.user.is_authenticated and request.user.role == "ADMIN"


class CanManageTeams(BasePermission):

    message = "You do not have permission to manage teams."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            "ADMIN",
            "REGIONAL_MANAGER",
        ]

    def has_object_permission(self, request, view, obj):

        if request.user.role == "ADMIN":
            return True

        if request.user.role == "REGIONAL_MANAGER":

            if request.user.team is None:
                return False

            return request.user.team.region == obj.region

        return False


class CanManageTasks(BasePermission):

    message = "You do not have permission to manage tasks."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            "ADMIN",
            "REGIONAL_MANAGER",
            "TEAM_LEAD",
            "FIELD_AGENT",
        ]

    def has_object_permission(self, request, view, obj):

        if request.user.role == "ADMIN":
            return True

        if request.user.role == "REGIONAL_MANAGER":

            if request.user.team is None:
                return False

            return request.user.team.region == obj.team.region

        if request.user.role == "TEAM_LEAD":
            return request.user.team == obj.team

        if request.user.role == "FIELD_AGENT":
            return request.user == obj.assigned_to

        return False


class CanManageVisits(BasePermission):

    message = "You do not have permission to manage visits."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            "ADMIN",
            "REGIONAL_MANAGER",
            "TEAM_LEAD",
            "FIELD_AGENT",
        ]

    def has_object_permission(self, request, view, obj):

        if request.user.role == "ADMIN":
            return True

        if request.user.role == "REGIONAL_MANAGER":

            if request.user.team is None:
                return False

            return request.user.team.region == obj.task.team.region

        if request.user.role == "TEAM_LEAD":
            return request.user.team == obj.task.team

        if request.user.role == "FIELD_AGENT":
            return request.user == obj.task.assigned_to

        return False


class CanViewActivityLogs(BasePermission):

    message = "You do not have permission to view activity logs."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            "ADMIN",
            "REGIONAL_MANAGER",
            "AUDITOR",
        ]

    def has_object_permission(self, request, view, obj):

        if request.user.role in ["ADMIN", "AUDITOR"]:
            return True

        if request.user.role == "REGIONAL_MANAGER":

            if request.user.team is None:
                return False

            if obj.task:
                return request.user.team.region == obj.task.team.region

            if obj.visit:
                return request.user.team.region == obj.visit.task.team.region

        return False


class CanViewReports(BasePermission):

    message = "You do not have permission to view reports."

    def has_permission(self, request, view):

        return request.user.is_authenticated and request.user.role in [
            "ADMIN",
            "REGIONAL_MANAGER",
            "TEAM_LEAD",
            "AUDITOR",
        ]
