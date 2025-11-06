@echo off
echo  Starting NCSKIT with Cloudflare Tunnel for ncskit.org...
echo.

echo  Starting Django backend...
cd backend
start "NCSKIT Backend" cmd /k "python manage.py runserver 0.0.0.0:8000"
timeout /t 5 /nobreak >nul

echo  Starting Next.js frontend...
cd ..\frontend
start "NCSKIT Frontend" cmd /k "npm run dev"
timeout /t 10 /nobreak >nul

echo  Starting Cloudflare Tunnel...
cd ..
start "Cloudflare Tunnel" cmd /k "cloudflared.exe tunnel --config ncskit-tunnel-config.yml run"

echo  NCSKIT is launching with public access!
echo.
echo  Your application will be available at:
echo Frontend: https://ncskit.org
echo API: https://api.ncskit.org
echo Admin: https://admin.ncskit.org/admin/
echo Health: https://health.ncskit.org/health/
echo.
echo  Note: You need to complete Cloudflare setup first
echo 1. Run: cloudflared.exe tunnel login
echo 2. Run: cloudflared.exe tunnel create ncskit
echo 3. Update tunnel ID in ncskit-tunnel-config.yml
echo 4. Create DNS records in Cloudflare dashboard
echo.
pause
