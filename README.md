# Overview

#### This project is a Note Management application with features for creating, editing, and deleting notes. Each note supports attaching a voice recording. The application is developed with a backend in Django and a frontend in React, ensuring a secure and user-friendly experience.

### Assumptions

1. User Authentication: 
The application assumes all users must be authenticated to access any feature, including viewing notes, uploading audio files, or performing CRUD operations.

2. Audio File Handling:
Only MP3 and WAV files are allowed for voice recordings.
Uploaded audio files are securely stored and served via authenticated endpoints.

3. Date Filtering:
Notes can be filtered by creation date using a query parameter (?date=YYYY-MM-DD) in API requests.

4. Frontend Interaction:
The frontend assumes that notes with secure audio URLs can fetch audio through authenticated requests.
Audio recording is managed locally using the mic-recorder-to-mp3 library.

# Technical Design and Architecture

### Backend (Django)

- Framework: Django Rest Framework (DRF)
- Authentication: Simple JWT for token-based authentication.

#### Models: 
- CustomUser: Handles user authentication.

- Note: Stores note data, including title, description, tags, audio_url, and user associations.

#### Key Features: 
1. Secure Audio Endpoint:
Implements a SecureAudioView that serves audio files securely to authenticated users.

2. Upload Audio Endpoint:
Handles file uploads and validates file types (MP3/WAV).

3. CRUD Operations:
Fully functional API for notes with create, read, update, and delete operations.

4. Testing:
Automated backend tests are implemented using Django Test Framework to validate API endpoints and ensure proper authentication.

### Frontend (React)

#### State Management: Redux Toolkit.

#### UI Framework: Tailwind CSS.

#### Key Components: 
1. Dashboard:
Displays notes filtered by date.

2. NoteModal:
Handles note creation, editing, and viewing.

3. VoiceRecorder:
Allows users to record audio and attach it to notes.

#### Testing:
Frontend tests are implemented using Jest and React Testing Library for components like NoteModal and VoiceRecorder.

### Architecture

- API:
RESTful endpoints handle user authentication, note management, and audio uploads.

- Database:
PostgreSQL stores user and note data.

- File Storage:
Audio files are stored in the media/audio_notes/ directory.


# Running the Application and Tests with Docker

Ensure Docker is installed on your machine.

Build and start the containers:

```bash
docker-compose up --build
```
Access the application:

Frontend: Navigate to http://localhost:3000 in your browser.

Backend API: Access the API at http://localhost:8000.

-migration

```bash
docker exec -it backend bash
docker manage.py migrate
```

Stop the containers:

```bash
docker-compose down
```

## Running Tests in Docker
To run backend tests in the Docker container:

1. Access the backend container:
```bash
docker exec -it backend bash
```
2. Execute the tests:
```bash
python manage.py test
```

To run frontend tests in the Docker container:

1. Access the frontend container:
```bash
docker exec -it frontend bash
```

2. Execute the tests:
```bash
npm test
```