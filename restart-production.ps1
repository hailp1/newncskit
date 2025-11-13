# ============================================
# Restart Production Services
# Khởi động lại tất cả production services
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESTART PRODUCTION SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop services first
Write-Host "Step 1: Stopping existing services..." -ForegroundColor Yellow
& "$PSScriptRoot\stop-production.ps1"

Write-Host ""
Write-Host "Step 2: Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Step 3: Starting production server..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"
$env:NODE_ENV = "production"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$((Get-Location).Path)'; `$env:NODE_ENV='production'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'NEXT.JS PRODUCTION SERVER' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Starting production server...' -ForegroundColor Yellow; Write-Host 'Local: http://localhost:3000' -ForegroundColor Green; Write-Host 'Public: https://ncskit.org' -ForegroundColor Green; Write-Host ''; npm start"
) -WindowStyle Normal

Write-Host "✅ Production server starting..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Step 4: Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

if (Test-Path "cloudflared.exe") {
    $cloudflared = ".\cloudflared.exe"
} else {
    $cloudflared = "cloudflared"
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$((Get-Location).Path)'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'CLOUDFLARE TUNNEL' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Starting Cloudflare Tunnel...' -ForegroundColor Yellow; Write-Host 'Your site will be available at:' -ForegroundColor Green; Write-Host '  https://ncskit.org' -ForegroundColor White; Write-Host '  https://www.ncskit.org' -ForegroundColor White; Write-Host ''; $cloudflared tunnel --config cloudflared-config.yml run"
) -WindowStyle Normal

Write-Host "✅ Cloudflare Tunnel starting..." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Services restarted successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your site: https://ncskit.org" -ForegroundColor Yellow
Write-Host "🔗 Local: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

