from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from notes.models import Note

User = get_user_model()

class APITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123"
        )
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'password123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_note(self):
        data = {'title': 'Test Note', 'description': 'This is a test note'}
        response = self.client.post(reverse('notes-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Note')

    def test_list_notes(self):
        Note.objects.create(user=self.user, title="Note 1", description="Desc 1")
        Note.objects.create(user=self.user, title="Note 2", description="Desc 2")
        response = self.client.get(reverse('notes-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_update_note(self):
        note = Note.objects.create(user=self.user, title="Old Title", description="Old Desc")
        data = {'title': 'New Title', 'description': 'New Desc'}
        response = self.client.put(reverse('notes-detail', args=[note.id]), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New Title')

    def test_delete_note(self):
        note = Note.objects.create(user=self.user, title="To Delete", description="Delete Me")
        response = self.client.delete(reverse('notes-detail', args=[note.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=note.id).exists())
