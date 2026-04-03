# Generated migration for adding schedule and max_attendance to Workout

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('octofit_tracker', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='workout',
            name='schedule',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='workout',
            name='max_attendance',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
