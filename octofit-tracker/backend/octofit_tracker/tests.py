from django.test import TestCase
from .models import Team, User, Activity, Workout, Leaderboard

class TeamModelTest(TestCase):
    def test_create_team(self):
        team = Team.objects.create(name="Test Team")
        self.assertEqual(team.name, "Test Team")

class UserModelTest(TestCase):
    def test_create_user(self):
        team = Team.objects.create(name="Test Team")
        user = User.objects.create_user(username="testuser", email="test@example.com", password="pass", team=team)
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.team, team)

class ActivityModelTest(TestCase):
    def test_create_activity(self):
        team = Team.objects.create(name="Test Team")
        user = User.objects.create_user(username="testuser", email="test@example.com", password="pass", team=team)
        activity = Activity.objects.create(user=user, type="run", duration=30, calories=200)
        self.assertEqual(activity.type, "run")

class WorkoutModelTest(TestCase):
    def test_create_workout(self):
        workout = Workout.objects.create(name="Pushups", description="Do 20 pushups")
        self.assertEqual(workout.name, "Pushups")

    def test_create_workout_with_schedule_and_max_attendance(self):
        workout = Workout.objects.create(
            name="Manga Maniacs",
            description="Explore the fantastic stories of the most interesting characters from Japanese Manga (graphic novels).",
            schedule="Tuesdays at 7pm",
            max_attendance=15,
        )
        self.assertEqual(workout.name, "Manga Maniacs")
        self.assertEqual(workout.schedule, "Tuesdays at 7pm")
        self.assertEqual(workout.max_attendance, 15)

class LeaderboardModelTest(TestCase):
    def test_create_leaderboard(self):
        team = Team.objects.create(name="Test Team")
        user = User.objects.create_user(username="testuser", email="test@example.com", password="pass", team=team)
        leaderboard = Leaderboard.objects.create(user=user, score=100)
        self.assertEqual(leaderboard.score, 100)
