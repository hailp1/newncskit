@echo off
echo 🌐 Starting Cloudflare Tunnel for NCSKIT...

REM Check if config file exists
if not exist "cloudflared-config.yml" (
    echo ❌ Configuration file not found!
    echo Please run setup-cloudflare-tunnel.bat first
    pause
    exit /b 1
)

REM Check if cloudflared is installed
cloudflared --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Cloudflared is not installed!
    echo Please install cloudflared first
    pause
    exit /b 1
)

echo ✅ Starting tunnel...
echo 📝 Keep this window open to maintain connection
echo 🌐 Your application will be accessible via your domain
echo.

REM Start tunnel
cloudflared tunnel --config cloudflared-config.yml run

pause