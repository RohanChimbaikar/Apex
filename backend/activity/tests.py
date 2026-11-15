"""
Tests for the centralized activity logging system.

Setup strategy
--------------
Each test class shares one setUp() that creates the minimum viable object
graph (region → team → users → task → visit) using the ORM directly, without
fixtures or factories.  API calls go through APIClient so that view-layer
permission and serialization logic is exercised end-to-end.

Covered scenarios
-----------------
 1.  Task creation generates exactly one CREATED log.
 2.  Task assignment generates an ASSIGNED log with previous and new assignee IDs.
 3.  Task status change generates a STATUS_CHANGED log with old and new values.
 4.  Unrelated task updates do not generate false STATUS_CHANGED events.
 5.  Visit starting generates a STARTED log.
 6.  Visit completion generates a COMPLETED log with AI risk metadata.
 7.  Invalid business operations do not create activity logs.
 8.  A Field Agent cannot see logs belonging to another agent's tasks or visits.
 9.  Regional Managers see logs only within their managed regions.
10.  Team Leads see logs only within their led teams.
11.  Admins can see all activity logs.
12.  Auditors can read all activity logs but cannot modify them.
13.  PUT, PATCH, POST, and DELETE requests against the activity API return 405.
14.  Deleting a Task or Visit preserves historical activity records.
15.  Retrieving an individual activity log does not bypass queryset visibility.
16.  If activity logging fails during a business operation, the business record
     update rolls back (transaction safety).
"""

from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from activity.models import ActivityLog
from organization.models import Region, Team
from tasks.models import Task
from visits.models import Visit


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------

def _make_user(email, role, team=None):
    """Create a bare-minimum User for testing."""
    user = User.objects.create_user(
        email=email,
        password="testpass123",
        role=role,
        team=team,
    )
    return user


# ---------------------------------------------------------------------------
# Test suite
# ---------------------------------------------------------------------------

class ActivityLoggingBaseTestCase(APITestCase):
    """
    Shared setUp for all test cases.

    Object graph
    ------------
    region_a  ← managed by regional_manager
        team_a  ← led by team_lead
            field_agent_a  (assigned tasks / visits)
            field_agent_b  (different agent — used to test isolation)
    region_b  ← separate region (used to verify RM scope)
        team_b
    task_a  → team_a, assigned to field_agent_a
    """

    def setUp(self):
        # Regions
        self.admin = _make_user("admin@apex.test", User.Role.ADMIN)
        self.auditor = _make_user("auditor@apex.test", User.Role.AUDITOR)
        self.regional_manager = _make_user(
            "rm@apex.test", User.Role.REGIONAL_MANAGER
        )

        self.region_a = Region.objects.create(
            name="Region A",
            created_by=self.admin,
            updated_by=self.admin,
        )
        self.region_a.regional_managers.add(self.regional_manager)

        self.region_b = Region.objects.create(
            name="Region B",
            created_by=self.admin,
            updated_by=self.admin,
        )

        # Team leads
        self.team_lead = _make_user("lead@apex.test", User.Role.TEAM_LEAD)
        self.other_team_lead = _make_user(
            "otherlead@apex.test", User.Role.TEAM_LEAD
        )

        self.team_a = Team.objects.create(
            name="Team A",
            region=self.region_a,
            team_lead=self.team_lead,
            created_by=self.admin,
            updated_by=self.admin,
        )
        self.team_b = Team.objects.create(
            name="Team B",
            region=self.region_b,
            team_lead=self.other_team_lead,
            created_by=self.admin,
            updated_by=self.admin,
        )

        # Field agents — assign team after team creation
        self.field_agent_a = _make_user(
            "agent_a@apex.test", User.Role.FIELD_AGENT
        )
        self.field_agent_a.team = self.team_a
        self.field_agent_a.save()

        self.field_agent_b = _make_user(
            "agent_b@apex.test", User.Role.FIELD_AGENT
        )
        self.field_agent_b.team = self.team_b
        self.field_agent_b.save()

        import datetime
        self.task_a = Task.objects.create(
            name="Task Alpha",
            description="Description",
            team=self.team_a,
            status=Task.Status.PENDING,
            priority=Task.Priority.MEDIUM,
            due_date=datetime.date(2027, 1, 1),
            assigned_to=self.field_agent_a,
            created_by=self.admin,
            updated_by=self.admin,
        )

        self.task_b = Task.objects.create(
            name="Task Beta",
            description="Beta description",
            team=self.team_b,
            status=Task.Status.PENDING,
            priority=Task.Priority.LOW,
            due_date=datetime.date(2027, 2, 1),
            assigned_to=self.field_agent_b,
            created_by=self.admin,
            updated_by=self.admin,
        )

        self.visit_a = Visit.objects.create(
            task=self.task_a,
            agent=self.field_agent_a,
            status=Visit.Status.PENDING,
        )

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    def _login(self, user):
        self.client.force_authenticate(user=user)

    def _log_count(self, action=None, instance=None):
        qs = ActivityLog.objects.all()
        if action:
            qs = qs.filter(action=action)
        if instance is not None:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(instance)
            qs = qs.filter(content_type=ct, object_id=instance.pk)
        return qs.count()

    def _last_log(self, action=None, instance=None):
        qs = ActivityLog.objects.all()
        if action:
            qs = qs.filter(action=action)
        if instance is not None:
            from django.contrib.contenttypes.models import ContentType
            ct = ContentType.objects.get_for_model(instance)
            qs = qs.filter(content_type=ct, object_id=instance.pk)
        return qs.order_by("-created_at").first()


# ===========================================================================
# 1. Task creation generates exactly one CREATED log
# ===========================================================================

class TestTaskCreatedLog(ActivityLoggingBaseTestCase):
    def test_task_creation_generates_created_log(self):
        import datetime
        self._login(self.admin)
        payload = {
            "name": "New Task",
            "description": "desc",
            "team": self.team_a.pk,
            "status": Task.Status.PENDING,
            "priority": Task.Priority.HIGH,
            "due_date": "2027-03-01",
            "assigned_to": self.field_agent_a.pk,
        }
        response = self.client.post(reverse("task-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_task_id = response.data.get("id") or Task.objects.filter(name="New Task").first().pk
        new_task = Task.objects.get(name="New Task")

        created_logs = ActivityLog.objects.filter(
            action=ActivityLog.Action.CREATED,
            object_id=new_task.pk,
        )
        self.assertEqual(created_logs.count(), 1, "Expected exactly one CREATED log.")
        log = created_logs.first()
        self.assertEqual(log.actor, self.admin)


# ===========================================================================
# 2. Task assignment generates an ASSIGNED log with previous/new assignee IDs
# ===========================================================================

class TestTaskAssignedLog(ActivityLoggingBaseTestCase):
    def test_assignment_change_generates_assigned_log(self):
        self._login(self.admin)

        # Reassign from agent_a to agent_b (put agent_b in team_a first)
        self.field_agent_b.team = self.team_a
        self.field_agent_b.save()

        payload = {"assigned_to": self.field_agent_b.pk}
        response = self.client.patch(
            reverse("task-details", args=[self.task_a.pk]), payload
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        log = self._last_log(
            action=ActivityLog.Action.ASSIGNED, instance=self.task_a
        )
        self.assertIsNotNone(log, "Expected an ASSIGNED log.")
        self.assertEqual(log.metadata["previous_assignee"], self.field_agent_a.pk)
        self.assertEqual(log.metadata["new_assignee"], self.field_agent_b.pk)
        self.assertEqual(log.actor, self.admin)


# ===========================================================================
# 3. Task status change generates STATUS_CHANGED with old and new values
# ===========================================================================

class TestTaskStatusChangedLog(ActivityLoggingBaseTestCase):
    def test_status_change_generates_status_changed_log(self):
        self._login(self.admin)
        payload = {"status": Task.Status.IN_PROGRESS}
        response = self.client.patch(
            reverse("task-details", args=[self.task_a.pk]), payload
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        log = self._last_log(
            action=ActivityLog.Action.STATUS_CHANGED, instance=self.task_a
        )
        self.assertIsNotNone(log, "Expected a STATUS_CHANGED log.")
        self.assertEqual(log.metadata["old_status"], Task.Status.PENDING)
        self.assertEqual(log.metadata["new_status"], Task.Status.IN_PROGRESS)


# ===========================================================================
# 4. Unrelated update does NOT generate a false STATUS_CHANGED log
# ===========================================================================

class TestNoFalseStatusChangedLog(ActivityLoggingBaseTestCase):
    def test_unrelated_update_does_not_generate_status_changed(self):
        self._login(self.admin)
        before_count = self._log_count(
            action=ActivityLog.Action.STATUS_CHANGED, instance=self.task_a
        )

        payload = {"description": "Updated description only"}
        response = self.client.patch(
            reverse("task-details", args=[self.task_a.pk]), payload
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        after_count = self._log_count(
            action=ActivityLog.Action.STATUS_CHANGED, instance=self.task_a
        )
        self.assertEqual(
            before_count,
            after_count,
            "STATUS_CHANGED log must not be generated when status did not change.",
        )


# ===========================================================================
# 5. Visit starting generates a STARTED log
# ===========================================================================

class TestVisitStartedLog(ActivityLoggingBaseTestCase):
    def test_visit_start_generates_started_log(self):
        self._login(self.field_agent_a)
        response = self.client.post(
            reverse("visit-start", args=[self.visit_a.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        log = self._last_log(
            action=ActivityLog.Action.STARTED, instance=self.visit_a
        )
        self.assertIsNotNone(log, "Expected a STARTED log.")
        self.assertEqual(log.actor, self.field_agent_a)


# ===========================================================================
# 6. Visit completion generates a COMPLETED log with AI risk metadata
# ===========================================================================

class TestVisitCompletedLog(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        # Put visit into IN_PROGRESS state.
        self.visit_a.status = Visit.Status.IN_PROGRESS
        self.visit_a.save()

    def test_visit_completion_generates_completed_log_with_metadata(self):
        self._login(self.field_agent_a)
        payload = {
            "notes": "Routine inspection. All equipment functioning normally.",
            "outcome": "No issues identified.",
        }
        response = self.client.post(
            reverse("visit-completed", args=[self.visit_a.pk]), payload
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        log = self._last_log(
            action=ActivityLog.Action.COMPLETED, instance=self.visit_a
        )
        self.assertIsNotNone(log, "Expected a COMPLETED log.")
        self.assertIn("final_status", log.metadata)
        self.assertIn("ai_risk_flag", log.metadata)
        self.assertEqual(log.metadata["final_status"], Visit.Status.COMPLETED)


# ===========================================================================
# 7. Invalid business operations do not create activity logs
# ===========================================================================

class TestNoLogOnFailedOperation(ActivityLoggingBaseTestCase):
    def test_completing_non_in_progress_visit_produces_no_log(self):
        """Visit is PENDING — completing it must fail and produce no log."""
        self._login(self.field_agent_a)
        before_count = ActivityLog.objects.count()
        payload = {"notes": "some notes", "outcome": "some outcome"}
        response = self.client.post(
            reverse("visit-completed", args=[self.visit_a.pk]), payload
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            ActivityLog.objects.count(),
            before_count,
            "No log should be created for a failed business operation.",
        )


# ===========================================================================
# 8. Field Agent cannot see another agent's logs
# ===========================================================================

class TestFieldAgentCannotSeeOtherAgentLogs(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        # Create a log for task_b (belongs to agent_b)
        from activity.services import create_activity_log
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_b,
            description="Task Beta created.",
        )

    def test_field_agent_cannot_see_other_agent_task_logs(self):
        self._login(self.field_agent_a)
        response = self.client.get(reverse("activity-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # task_b is assigned to agent_b — agent_a must NOT see its logs.
        log_object_ids = [
            item["object_id"] for item in response.data["results"]
        ]
        # The log for task_b has object_id == task_b.pk
        self.assertNotIn(
            self.task_b.pk,
            log_object_ids,
            "Field agent must not see logs for tasks they are not assigned to.",
        )


# ===========================================================================
# 9. Regional Manager sees logs only within managed regions
# ===========================================================================

class TestRegionalManagerScope(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        # Log for task_a (region_a — RM manages this)
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )
        # Log for task_b (region_b — RM does NOT manage this)
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_b,
        )

    def test_rm_sees_only_own_region_logs(self):
        self._login(self.regional_manager)
        response = self.client.get(reverse("activity-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        object_ids = [item["object_id"] for item in response.data["results"]]
        self.assertIn(self.task_a.pk, object_ids)
        self.assertNotIn(self.task_b.pk, object_ids)


# ===========================================================================
# 10. Team Lead sees logs only within led teams
# ===========================================================================

class TestTeamLeadScope(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_b,
        )

    def test_team_lead_sees_only_own_team_logs(self):
        self._login(self.team_lead)
        response = self.client.get(reverse("activity-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        object_ids = [item["object_id"] for item in response.data["results"]]
        self.assertIn(self.task_a.pk, object_ids)
        self.assertNotIn(self.task_b.pk, object_ids)


# ===========================================================================
# 11. Admin can see all activity logs
# ===========================================================================

class TestAdminSeesAllLogs(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_b,
        )

    def test_admin_sees_all_logs(self):
        self._login(self.admin)
        response = self.client.get(reverse("activity-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        object_ids = [item["object_id"] for item in response.data["results"]]
        self.assertIn(self.task_a.pk, object_ids)
        self.assertIn(self.task_b.pk, object_ids)


# ===========================================================================
# 12. Auditors can read all logs but cannot modify them
# ===========================================================================

class TestAuditorAccess(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        self.log = create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )

    def test_auditor_can_read_all_logs(self):
        self._login(self.auditor)
        response = self.client.get(reverse("activity-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data["results"]), 0)

    def test_auditor_cannot_delete_log(self):
        self._login(self.auditor)
        response = self.client.delete(
            reverse("activity-detail", args=[self.log.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


# ===========================================================================
# 13. Write methods against the activity API return 405
# ===========================================================================

class TestActivityApiReadOnly(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        self.log = create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )

    def test_post_to_list_returns_405(self):
        self._login(self.admin)
        response = self.client.post(reverse("activity-list"), {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_to_detail_returns_405(self):
        self._login(self.admin)
        response = self.client.put(
            reverse("activity-detail", args=[self.log.pk]), {}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch_to_detail_returns_405(self):
        self._login(self.admin)
        response = self.client.patch(
            reverse("activity-detail", args=[self.log.pk]), {}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_to_detail_returns_405(self):
        self._login(self.admin)
        response = self.client.delete(
            reverse("activity-detail", args=[self.log.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


# ===========================================================================
# 14. Deleting a Task or Visit preserves historical activity records
# ===========================================================================

class TestLogsPreservedAfterDeletion(ActivityLoggingBaseTestCase):
    def test_task_deletion_preserves_activity_logs(self):
        self._login(self.admin)
        from django.contrib.contenttypes.models import ContentType
        task_ct = ContentType.objects.get_for_model(Task)
        task_pk = self.task_a.pk

        # Create a log to confirm preservation.
        from activity.services import create_activity_log
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_a,
        )

        # Delete via API (which also creates a DELETED log).
        response = self.client.delete(
            reverse("task-details", args=[task_pk])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Task is gone but its logs remain.
        self.assertFalse(Task.objects.filter(pk=task_pk).exists())
        surviving_logs = ActivityLog.objects.filter(
            content_type=task_ct, object_id=task_pk
        )
        self.assertGreater(
            surviving_logs.count(),
            0,
            "Activity logs must be preserved after the referenced task is deleted.",
        )

    def test_visit_deletion_preserves_activity_logs(self):
        self._login(self.admin)
        from django.contrib.contenttypes.models import ContentType
        visit_ct = ContentType.objects.get_for_model(Visit)
        visit_pk = self.visit_a.pk

        from activity.services import create_activity_log
        create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.visit_a,
        )

        response = self.client.delete(
            reverse("visit-details", args=[visit_pk])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(Visit.objects.filter(pk=visit_pk).exists())
        surviving_logs = ActivityLog.objects.filter(
            content_type=visit_ct, object_id=visit_pk
        )
        self.assertGreater(surviving_logs.count(), 0)


# ===========================================================================
# 15. Retrieving an individual log respects queryset visibility
# ===========================================================================

class TestDetailEndpointRespectsScope(ActivityLoggingBaseTestCase):
    def setUp(self):
        super().setUp()
        from activity.services import create_activity_log
        # Log for task_b — agent_a has no access to this.
        self.foreign_log = create_activity_log(
            actor=self.admin,
            action=ActivityLog.Action.CREATED,
            instance=self.task_b,
        )

    def test_field_agent_cannot_retrieve_out_of_scope_log(self):
        self._login(self.field_agent_a)
        response = self.client.get(
            reverse("activity-detail", args=[self.foreign_log.pk])
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ===========================================================================
# 16. Logging failure rolls back the business operation
# ===========================================================================

class TestTransactionRollbackOnLoggingFailure(ActivityLoggingBaseTestCase):
    def test_task_update_rolls_back_if_logging_fails(self):
        """
        If create_activity_log() raises an exception inside transaction.atomic(),
        the task update must be rolled back and the task row must remain
        unchanged in the database.
        """
        self._login(self.admin)
        original_description = self.task_a.description

        with patch(
            "tasks.views.create_activity_log",
            side_effect=Exception("Simulated logging failure"),
        ):
            payload = {"description": "Should not persist"}
            response = self.client.patch(
                reverse("task-details", args=[self.task_a.pk]), payload
            )
            # The view will return 500 when the atomic block raises.
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Verify the task description was NOT changed.
        self.task_a.refresh_from_db()
        self.assertEqual(
            self.task_a.description,
            original_description,
            "Task update must be rolled back when activity logging fails.",
        )
