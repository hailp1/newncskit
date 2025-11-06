@echo off
REM NCSKIT Production Deployment Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting NCSKIT Production Deployment...

REM Configuration
set COMPOSE_FILE=docker-compose.production.yml
set ENV_FILE=.env.production

REM Check if environment file exists
if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found!
    echo Please create %ENV_FILE% with your production settings.
    exit /b 1
)

echo 📋 Pre-deployment checks...

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed
    exit /b 1
)

echo ✅ Pre-deployment checks passed

REM Create necessary directories
echo 📁 Creating directories...
if not exist "logs" mkdir logs
if not exist "backup" mkdir backup
if not exist "nginx\ssl" mkdir nginx\ssl

REM Build and start services
echo 🏗️ Building and starting services...
docker-compose -f %COMPOSE_FILE% build --no-cache
docker-compose -f %COMPOSE_FILE% up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose -f %COMPOSE_FILE% exec -T web python manage.py migrate --noinput

REM Collect static files
echo 📦 Collecting static files...
docker-compose -f %COMPOSE_FILE% exec -T web python manage.py collectstatic --noinput

REM Health check
echo 🏥 Performing health check...
timeout /t 10 /nobreak >nul
curl -f http://localhost/health/ >nul 2>&1
if errorlevel 1 (
    echo ❌ Health check failed
    echo Checking logs...
    docker-compose -f %COMPOSE_FILE% logs --tail=50 web
    exit /b 1
)

echo ✅ Health check passed

REM Display status
echo 🎉 Deployment completed successfully!
echo.
echo 📊 Service Status:
docker-compose -f %COMPOSE_FILE% ps

echo.
echo 🔗 Access URLs:
echo Frontend: http://localhost
echo API: http://localhost/api/
echo Admin: http://localhost/admin/
echo Health Check: http://localhost/health/

echo.
echo 📝 Next Steps:
echo 1. Configure production domain and SSL
echo 2. Change default admin password
echo 3. Configure monitoring and backups
echo 4. Set up log rotation

echo.
echo 🚀 NCSKIT is now running in production!