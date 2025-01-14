# Use the official Python image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . /app

COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the application port
EXPOSE 8000

# Start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
