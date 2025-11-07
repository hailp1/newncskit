# Start R Analytics Docker container
# Run this after building the image

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Starting R Analytics Container" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
$imageExists = docker images ncskit-r-analytics -q
if (-not $imageExists) {
    Write-Host "⚠️  Docker image not found!" -ForegroundColor Yellow
    Write-Host "Please run .\build.ps1 first to build the image" -ForegroundColor Yellow
    exit 1
}

# Start container
Write-Host "Starting container..." -ForegroundColor Green
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Container started successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Wait for health check
    Write-Host "Waiting for service to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check health
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
        Write-Host "✓ Service is healthy!" -ForegroundColor Green
        Write-Host "  Status: $($health.status)" -ForegroundColor Gray
        Write-Host "  Version: $($health.version)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "API is ready at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Swagger docs at: http://localhost:8000/__docs__/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Run .\test-endpoints.ps1 to test the API" -ForegroundColor White
    } catch {
        Write-Host "⚠️  Service is starting... (may take 30-60 seconds)" -ForegroundColor Yellow
        Write-Host "Check logs: docker-compose logs -f" -ForegroundColor White
    }
} else {
    Write-Host "✗ Failed to start container!" -ForegroundColor Red
}
