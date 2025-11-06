@echo off
echo ========================================
echo    NCSKIT FINAL RELEASE DEPLOYMENT
echo ========================================
echo.
echo Version: 1.0.0 Final Release
echo Status: Production Ready
echo.

REM Check if required files exist
if not exist "FINAL_RELEASE_GUIDE.md" (
    echo ERROR: FINAL_RELEASE_GUIDE.md not found!
    pause
    exit /b 1
)

if not exist "RELEASE_CHECKLIST.md" (
    echo ERROR: RELEASE_CHECKLIST.md not found!
    pause
    exit /b 1
)

if not exist "config\docker-compose.production.yml" (
    echo ERROR: Production docker-compose file not found!
    pause
    exit /b 1
)

echo [1/6] Checking environment configuration...
if not exist ".env.production" (
    echo WARNING: .env.production not found. Creating from example...
    if exist ".env.production.example" (
        copy ".env.production.example" ".env.production"
        echo Please edit .env.production with your actual credentials before continuing.
        pause
    ) else (
        echo ERROR: No environment template found!
        pause
        exit /b 1
    )
)

echo [2/6] Checking frontend environment...
if not exist "frontend\.env.production" (
    echo WARNING: frontend/.env.production not found. Creating from example...
    if exist "frontend\.env.production.example" (
        copy "frontend\.env.production.example" "frontend\.env.production"
        echo Please edit frontend/.env.production with your production URLs.
        pause
    )
)

echo [3/6] Checking backend environment...
if not exist "backend\.env.production" (
    echo WARNING: backend/.env.production not found. Creating from example...
    if exist "backend\.env.production.example" (
        copy "backend\.env.production.example" "backend\.env.production"
        echo Please edit backend/.env.production with your database settings.
        pause
    )
)

echo [4/6] Stopping any existing containers...
docker-compose -f config\docker-compose.production.yml down

echo [5/6] Building and starting production containers...
docker-compose -f config\docker-compose.production.yml up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start production containers!
    echo Check Docker logs for details:
    echo docker-compose -f config\docker-compose.production.yml logs
    pause
    exit /b 1
)

echo [6/6] Waiting for services to start...
timeout /t 30 /nobreak

echo.
echo ========================================
echo    DEPLOYMENT VERIFICATION
echo ========================================

REM Test if services are running
echo Testing service availability...

REM Check if containers are running
docker-compose -f config\docker-compose.production.yml ps

echo.
echo ========================================
echo    NCSKIT FINAL RELEASE DEPLOYED!
echo ========================================
echo.
echo Production URLs:
echo - Application: https://ncskit.org
echo - Admin Panel: https://ncskit.org/admin  
echo - Blog: https://ncskit.org/blog
echo - API: https://api.ncskit.org
echo.
echo Next Steps:
echo 1. Run: deployment\setup-cloudflare-tunnel.bat
echo 2. Run: deployment\test-live-urls.bat
echo 3. Complete OAuth provider configuration
echo 4. Test all functionality with real users
echo.
echo Documentation:
echo - FINAL_RELEASE_GUIDE.md - Complete deployment guide
echo - RELEASE_CHECKLIST.md - Post-deployment verification
echo - docs\OAUTH_SETUP.md - OAuth configuration
echo.
echo ========================================
echo    PRODUCTION DEPLOYMENT COMPLETE!
echo ========================================
pause