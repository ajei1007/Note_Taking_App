from rest_framework import serializers
from notes.models.note import Note
from notes.models.user import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser  # Use the CustomUser model
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Use create_user for secure password hashing
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


# Note Serializer
class NoteSerializer(serializers.ModelSerializer):
    audio_secure_url = serializers.SerializerMethodField()
    audio_url = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'tags', 'is_archived',
            'audio_url', 'audio_secure_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_audio_secure_url(self, obj):
        request = self.context.get('request')
        if obj.audio_url:
            return request.build_absolute_uri(f"/api/secure-audio/{obj.id}/")
        return None