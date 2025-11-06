@echo off
echo ?? NCSKIT.ORG Cloudflare Tunnel Setup Instructions
echo.
echo ?? Prerequisites:
echo 1. Cloudflare account with ncskit.org domain added
echo 2. DNS managed by Cloudflare
echo.
echo ?? Setup Steps:
echo.
echo Step 1: Login to Cloudflare
echo cloudflared.exe tunnel login
echo.
echo Step 2: Create tunnel
echo cloudflared.exe tunnel create ncskit
echo.
echo Step 3: Note the tunnel ID and update ncskit-tunnel-config.yml
echo.
echo Step 4: Create DNS records
echo cloudflared.exe tunnel route dns ncskit ncskit.org
echo cloudflared.exe tunnel route dns ncskit www.ncskit.org
echo cloudflared.exe tunnel route dns ncskit api.ncskit.org
echo cloudflared.exe tunnel route dns ncskit admin.ncskit.org
echo cloudflared.exe tunnel route dns ncskit health.ncskit.org
echo.
echo Step 5: Launch NCSKIT
echo launch-ncskit-org.bat
echo.
echo  After setup, access at:
echo https://ncskit.org
echo https://api.ncskit.org
echo https://admin.ncskit.org/admin/
echo.
pause
