# Build and Start Docker R Analytics
# This script builds the Docker image and starts the container

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build & Start R Analytics Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Building Docker Image..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes on first build" -ForegroundColor Gray
Write-Host ""

Push-Location r-analytics

# Build image
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "[OK] Image built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Starting Container..." -ForegroundColor Yellow

# Start container
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start container!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "[OK] Container started" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Waiting for Service..." -ForegroundColor Yellow

# Wait for service to be ready
$maxAttempts = 20
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 5
    $attempt++
    
    Write-Host "  [WAIT] Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            $ready = $true
            Write-Host ""
            Write-Host "[OK] Service is ready!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Service Details:" -ForegroundColor White
            Write-Host "  Status:  $($response.status)" -ForegroundColor Cyan
            Write-Host "  Version: $($response.version)" -ForegroundColor Cyan
            Write-Host "  Uptime:  $($response.uptime)" -ForegroundColor Cyan
        }
    } catch {
        # Continue waiting
    }
}

Pop-Location

if (-not $ready) {
    Write-Host ""
    Write-Host "[WARN] Service started but health check timeout" -ForegroundColor Yellow
    Write-Host "  The service may still be initializing" -ForegroundColor Gray
    Write-Host "  Check logs: docker logs ncskit-r-analytics -f" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Health:  http://localhost:8000/health" -ForegroundColor Green
Write-Host "  Swagger: http://localhost:8000/__docs__/" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

exit 0
