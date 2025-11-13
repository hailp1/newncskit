# Quick start script for Cloudflare Tunnel
# Run this after setup is complete

Write-Host "🚀 Starting NCSKIT with Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if config exists
if (-not (Test-Path "cloudflared-config.yml")) {
    Write-Host "❌ Config file not found!" -ForegroundColor Red
    Write-Host "Please run setup-tunnel.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check if Next.js is running
$nextjsRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $nextjsRunning) {
    Write-Host "⚠️  Next.js not running on port 3000" -ForegroundColor Yellow
    Write-Host "Starting Next.js..." -ForegroundColor Yellow
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
    
    Write-Host "Waiting for Next.js to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host "✅ Next.js is running" -ForegroundColor Green
Write-Host ""

# Start tunnel
Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your site will be available at:" -ForegroundColor Green
Write-Host "  https://ncskit.org" -ForegroundColor White
Write-Host "  https://www.ncskit.org" -ForegroundColor White
Write-Host ""

cloudflared tunnel --config cloudflared-config.yml run ncskit
