# Simple OAuth test script
Write-Host "TEST OAUTH CONFIGURATION" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check servers
Write-Host "Checking servers..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "Frontend server: RUNNING (port 3000)" -ForegroundColor Green
} catch {
    Write-Host "Frontend server: NOT RUNNING" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "Backend server: RUNNING (port 8001)" -ForegroundColor Green
} catch {
    Write-Host "Backend server: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Verify OAuth
Write-Host "Verifying OAuth configuration..." -ForegroundColor Yellow
node scripts/verify-oauth.js

Write-Host ""
Write-Host "Test URLs:" -ForegroundColor Yellow
Write-Host "Login: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "Register: http://localhost:3000/register" -ForegroundColor Cyan

Write-Host ""
Write-Host "Opening login page..." -ForegroundColor Yellow
Start-Process "http://localhost:3000/login"