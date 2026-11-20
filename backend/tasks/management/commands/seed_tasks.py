import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from faker import Faker

from ...models import Task, Team  # Adjust your app import

fake = Faker()


class Command(BaseCommand):
    help = "Generate fake tasks for development"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=50,
            help="Number of tasks to generate",
        )

    def handle(self, *args, **options):
        count = options["count"]

        if count < 1:
            raise CommandError("Count must be greater than zero.")

        User = get_user_model()

        teams = list(Team.objects.all())
        users = list(User.objects.all())

        if not teams:
            raise CommandError("Create at least one team first.")

        statuses = list(Task.Status.values)
        priorities = list(Task.Priority.values)

        self.stdout.write(f"Generating {count} tasks...")

        for _ in range(count):
            team = random.choice(teams)

            assigned_to = random.choice(users) if users and random.random() > 0.2 else None
            created_by = random.choice(users) if users else None

            due_date = fake.date_between(
                start_date="-15d",
                end_date="+30d",
            )

            scheduled_at = (
                fake.date_time_between(
                    start_date="-15d",
                    end_date="+15d",
                    tzinfo=timezone.get_current_timezone(),
                )
                if random.random() > 0.3
                else None
            )

            Task.objects.create(
                name=fake.sentence(nb_words=5).rstrip("."),
                description=fake.paragraph(nb_sentences=4),
                team=team,
                status=random.choice(statuses),
                priority=random.choice(priorities),
                due_date=due_date,
                scheduled_at=scheduled_at,
                assigned_to=assigned_to,
                created_by=created_by,
                updated_by=created_by,
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully created {count} tasks!"))
