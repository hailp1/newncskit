# Check Docker status and start PostgreSQL
Write-Host "Checking Docker Desktop status..." -ForegroundColor Cyan

$maxAttempts = 12
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    
    try {
        $result = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "Docker Desktop is ready!" -ForegroundColor Green
        } else {
            Write-Host "  Docker Desktop is still starting..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Host "  Docker Desktop is still starting..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (-not $dockerReady) {
    Write-Host "Docker Desktop did not start in time. Please check Docker Desktop manually." -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting PostgreSQL container..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml up -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL container started!" -ForegroundColor Green
    
    Write-Host "`nWaiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "`nChecking container status:" -ForegroundColor Cyan
    docker ps --filter "name=ncskit-postgres"
    
    Write-Host "`nSetup complete!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Run database migrations:" -ForegroundColor White
    Write-Host "   cd frontend" -ForegroundColor Gray
    Write-Host "   npx prisma db push" -ForegroundColor Gray
    Write-Host "`n2. Restart your dev server" -ForegroundColor White
    Write-Host "`n3. Refresh your browser" -ForegroundColor White
} else {
    Write-Host "Failed to start PostgreSQL container" -ForegroundColor Red
    Write-Host "Check the error message above" -ForegroundColor Yellow
}
