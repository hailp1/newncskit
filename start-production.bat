@echo off
echo 🚀 Starting NCSKIT Production Environment...

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ .env.production file not found!
    echo Please create .env.production with your production settings.
    echo You can copy from .env.production.example
    pause
    exit /b 1
)

echo 📋 Starting services...

REM Start backend server
echo 🔧 Starting Django backend...
cd backend
start "NCSKIT Backend" cmd /k "python manage.py runserver 0.0.0.0:8000 --settings=ncskit_backend.settings_production"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server (for development, in production use nginx)
echo 🎨 Starting Next.js frontend...
cd ..\frontend
start "NCSKIT Frontend" cmd /k "npm run dev"

echo ✅ NCSKIT is starting up!
echo.
echo 🔗 Access URLs:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api/
echo Admin Panel: http://localhost:8000/admin/
echo Health Check: http://localhost:8000/health/
echo.
echo 📝 Note: This is a development setup.
echo For true production deployment, use Docker with deploy.bat
echo.
pause