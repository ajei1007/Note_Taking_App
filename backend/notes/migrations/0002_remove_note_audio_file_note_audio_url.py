# Generated by Django 5.1.4 on 2025-01-17 08:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='note',
            name='audio_file',
        ),
        migrations.AddField(
            model_name='note',
            name='audio_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
