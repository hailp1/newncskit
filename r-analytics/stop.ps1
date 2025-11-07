# Stop R Analytics Docker container

Write-Host "Stopping R Analytics container..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Container stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stop container!" -ForegroundColor Red
}
