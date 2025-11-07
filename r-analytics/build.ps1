# Build script for R Analytics Docker container
# This will take 10-30 minutes depending on your system

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Building R Analytics Docker Image" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  This process will take 10-30 minutes" -ForegroundColor Yellow
Write-Host "⚠️  Please be patient while R packages are installed" -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

# Build the image
Write-Host "Starting Docker build..." -ForegroundColor Green
docker-compose build --no-cache

if ($LASTEXITCODE -eq 0) {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Build Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Build time: $($duration.ToString('mm\:ss'))" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start container: docker-compose up -d" -ForegroundColor White
    Write-Host "2. Check logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "3. Test API: .\test-endpoints.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Build Failed!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
}
