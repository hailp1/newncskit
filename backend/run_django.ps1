# Django management script for Windows
param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Set Django settings
$env:DJANGO_SETTINGS_MODULE = "ncskit_backend.settings_simple"

# Run Django command
switch ($Command) {
    "makemigrations" {
        python manage.py makemigrations
    }
    "migrate" {
        python manage.py migrate
    }
    "runserver" {
        python manage.py runserver 8000
    }
    "shell" {
        python manage.py shell
    }
    "createsuperuser" {
        python manage.py createsuperuser
    }
    default {
        python manage.py $Command
    }
}