from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.http import FileResponse, HttpResponseForbidden, Http404
from rest_framework.parsers import MultiPartParser, FormParser
from notes.serializers import RegisterSerializer, NoteSerializer
from notes.models.note import Note
from notes.models.user import CustomUser
import os
import uuid
from urllib.parse import urlparse
from django.conf import settings
from django.shortcuts import get_object_or_404

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.get(email=identifier)
            username = user.username
        except CustomUser.DoesNotExist:
            username = identifier

        user = authenticate(request, username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=HTTP_200_OK)
        return Response({"detail": "Invalid credentials"}, status=HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out"}, status=HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=HTTP_400_BAD_REQUEST)

class UploadAudioView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=HTTP_400_BAD_REQUEST)

        if not file.name.endswith(('.mp3', '.wav')):
            return Response({"error": "Invalid file type. Only MP3 or WAV are allowed."}, status=HTTP_400_BAD_REQUEST)

        unique_filename = f"{uuid.uuid4()}{os.path.splitext(file.name)[1]}"

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'audio_notes')
        os.makedirs(upload_dir, exist_ok=True)

        upload_path = os.path.join(upload_dir, unique_filename)
        try:
            with open(upload_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
        except Exception as e:
            return Response({"error": f"Failed to save file: {str(e)}"}, status=HTTP_400_BAD_REQUEST)

        file_url = request.build_absolute_uri(f"{settings.MEDIA_URL}audio_notes/{unique_filename}")
        return Response({"file_url": file_url}, status=HTTP_200_OK)

class SecureAudioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, note_id):
        note = get_object_or_404(Note, id=note_id, user=request.user)

        if not note.audio_url:
            return HttpResponseForbidden("No audio file associated with this note")

        audio_url_relative = urlparse(note.audio_url).path.replace(settings.MEDIA_URL, '').lstrip('/')

        file_path = os.path.join(settings.MEDIA_ROOT, audio_url_relative)

        print(f"Constructed File Path: {file_path}")

        if not os.path.exists(file_path):
            print("File not found!")
            raise Http404("File not found")

        try:
            return FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')
        except Exception as e:
            print(f"Error serving file: {e}")
            raise Http404("File not found")

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(created_at__date=date)
        return queryset
    def perform_create(self, serializer):
        audio_url = self.request.data.get('audio_url')
        if audio_url and not audio_url.endswith(('.mp3', '.wav')):
            raise ValidationError({"audio_url": "Only MP3 or WAV files are allowed."})
        serializer.save(user=self.request.user, audio_url=audio_url)

    def perform_update(self, serializer):
        audio_url = self.request.data.get('audio_url')

        if audio_url:
            if audio_url == "origin":
                audio_url = serializer.instance.audio_url
            elif not audio_url.endswith(('.mp3', '.wav')):
                raise ValidationError({"audio_url": "Only MP3 or WAV files are allowed."})
        else:
            audio_url = None

        serializer.save(user=self.request.user, audio_url=audio_url)

    def get_serializer_context(self):
        return {'request': self.request}