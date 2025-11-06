@echo off
title NCSKIT Production Launcher
color 0A

echo.
echo ========================================
echo    🚀 NCSKIT.ORG Production Launcher
echo ========================================
echo.

echo 📱 Starting Backend Server...
start "NCSKIT Backend" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Server...
start "NCSKIT Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo 🌐 Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared.exe tunnel --config ncskit-tunnel-config.yml run"
timeout /t 2 /nobreak >nul

echo.
echo ✅ NCSKIT Production Services Started!
echo.
echo 🔗 Access URLs:
echo    🌐 Public:  https://ncskit.org
echo    🔧 API:     https://api.ncskit.org
echo    👨‍💼 Admin:   https://admin.ncskit.org/admin/
echo    💚 Health:  https://health.ncskit.org/health/
echo.
echo 📊 Local Development:
echo    🎨 Frontend: http://localhost:3000
echo    📱 Backend:  http://localhost:8000
echo.
echo Press any key to exit...
pause >nul