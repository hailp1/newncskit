@echo off
echo 🌐 Setting up Cloudflare Tunnel for NCSKIT...

REM Check if cloudflared is installed
cloudflared --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Cloudflared is not installed!
    echo Please install cloudflared first:
    echo 1. Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
    echo 2. Or run: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

echo ✅ Cloudflared found

REM Check if user is logged in
if not exist "%USERPROFILE%\.cloudflared\cert.pem" (
    echo 🔐 Please login to Cloudflare first...
    cloudflared tunnel login
    if errorlevel 1 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
)

echo ✅ Cloudflare authentication found

REM Prompt for domain name
set /p DOMAIN="Enter your domain name (e.g., example.com): "
if "%DOMAIN%"=="" (
    echo ❌ Domain name is required
    pause
    exit /b 1
)

echo 📝 Creating tunnel for domain: %DOMAIN%

REM Create tunnel
echo Creating tunnel 'ncskit'...
cloudflared tunnel create ncskit

REM Get tunnel ID
for /f "tokens=*" %%i in ('cloudflared tunnel list ^| findstr ncskit ^| for /f "tokens=1" %%a in ("%%i") do echo %%a') do set TUNNEL_ID=%%i

if "%TUNNEL_ID%"=="" (
    echo ❌ Failed to get tunnel ID
    pause
    exit /b 1
)

echo ✅ Tunnel created with ID: %TUNNEL_ID%

REM Create DNS records
echo 🌐 Creating DNS records...
cloudflared tunnel route dns ncskit %DOMAIN%
cloudflared tunnel route dns ncskit www.%DOMAIN%
cloudflared tunnel route dns ncskit api.%DOMAIN%
cloudflared tunnel route dns ncskit admin.%DOMAIN%
cloudflared tunnel route dns ncskit health.%DOMAIN%

REM Create config file
echo 📝 Creating configuration file...
(
echo # Cloudflare Tunnel Configuration for NCSKIT
echo tunnel: %TUNNEL_ID%
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_ID%.json
echo.
echo # Ingress rules
echo ingress:
echo   # Frontend - Main domain
echo   - hostname: %DOMAIN%
echo     service: http://localhost:3000
echo     originRequest:
echo       httpHostHeader: %DOMAIN%
echo.      
echo   # Frontend - www subdomain  
echo   - hostname: www.%DOMAIN%
echo     service: http://localhost:3000
echo     originRequest:
echo       httpHostHeader: www.%DOMAIN%
echo.
echo   # Backend API
echo   - hostname: api.%DOMAIN%
echo     service: http://localhost:8000
echo     originRequest:
echo       httpHostHeader: api.%DOMAIN%
echo.      
echo   # Admin panel
echo   - hostname: admin.%DOMAIN%
echo     service: http://localhost:8000
echo     originRequest:
echo       httpHostHeader: admin.%DOMAIN%
echo.
echo   # Health checks
echo   - hostname: health.%DOMAIN%
echo     service: http://localhost:8000
echo     originRequest:
echo       httpHostHeader: health.%DOMAIN%
echo.
echo   # Catch-all rule
echo   - service: http_status:404
echo.
echo # Logging
echo loglevel: info
echo logfile: cloudflared.log
) > cloudflared-config.yml

echo ✅ Configuration file created: cloudflared-config.yml

REM Update environment files
echo 📝 Updating environment configuration...

REM Update .env.production
if exist ".env.production" (
    echo Updating .env.production...
    powershell -Command "(Get-Content .env.production) -replace 'ALLOWED_HOSTS=.*', 'ALLOWED_HOSTS=localhost,127.0.0.1,%DOMAIN%,www.%DOMAIN%,api.%DOMAIN%,admin.%DOMAIN%,health.%DOMAIN%' | Set-Content .env.production"
    powershell -Command "(Get-Content .env.production) -replace 'CORS_ALLOWED_ORIGINS=.*', 'CORS_ALLOWED_ORIGINS=https://%DOMAIN%,https://www.%DOMAIN%,https://api.%DOMAIN%' | Set-Content .env.production"
)

REM Update frontend environment
if exist "frontend\.env.production" (
    echo Updating frontend/.env.production...
    powershell -Command "(Get-Content frontend\.env.production) -replace 'NEXT_PUBLIC_API_URL=.*', 'NEXT_PUBLIC_API_URL=https://api.%DOMAIN%' | Set-Content frontend\.env.production"
)

echo ✅ Environment files updated

echo.
echo 🎉 Cloudflare Tunnel setup completed!
echo.
echo 📋 Next steps:
echo 1. Start your NCSKIT application:
echo    start-production.bat
echo.
echo 2. Start the tunnel in a new terminal:
echo    cloudflared tunnel --config cloudflared-config.yml run
echo.
echo 3. Access your application:
echo    Frontend: https://%DOMAIN%
echo    API: https://api.%DOMAIN%
echo    Admin: https://admin.%DOMAIN%/admin/
echo    Health: https://health.%DOMAIN%/health/
echo.
echo 📝 Note: Keep the tunnel running to maintain connectivity
echo.
pause