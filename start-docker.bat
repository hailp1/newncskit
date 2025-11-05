@echo off
echo Starting NCSKIT Full Stack with Docker...

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down

REM Remove old volumes (optional - uncomment if you want fresh data)
REM docker volume rm ncskit_postgres_data ncskit_r_packages ncskit_redis_data

REM Build and start all services
echo Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 30

REM Check service status
echo Checking service status...
docker-compose ps

echo.
echo ========================================
echo NCSKIT Services Started Successfully!
echo ========================================
echo.
echo PostgreSQL Database: localhost:5432
echo R Analysis Server:   localhost:8000
echo Django Backend:      localhost:8001
echo Redis Cache:         localhost:6379
echo.
echo Frontend (Next.js):  localhost:3000
echo   Run: cd frontend && npm install && npm run dev
echo.
echo To view logs: docker-compose logs -f [service-name]
echo To stop all:  docker-compose down
echo.

pause