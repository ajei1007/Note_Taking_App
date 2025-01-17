import os
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_delete

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True)
    is_archived = models.BooleanField(default=False)
    audio_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Delete the old audio file if a new one is uploaded
        if self.pk:
            old_note = Note.objects.get(pk=self.pk)
            if old_note.audio_url and old_note.audio_url != self.audio_url:
                old_file_path = os.path.join(settings.MEDIA_ROOT, old_note.audio_url.replace(settings.MEDIA_URL, ''))
                if os.path.isfile(old_file_path):
                    os.remove(old_file_path)
        super().save(*args, **kwargs)

@receiver(post_delete, sender=Note)
def delete_audio_file(sender, instance, **kwargs):
    # Delete the associated audio file when a note is deleted
    if instance.audio_url:
        file_path = os.path.join(settings.MEDIA_ROOT, instance.audio_url.replace(settings.MEDIA_URL, ''))
        if os.path.isfile(file_path):
            os.remove(file_path)