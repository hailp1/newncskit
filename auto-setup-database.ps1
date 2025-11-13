# Automatic Database Setup
# This script waits for Docker and sets up PostgreSQL automatically

Write-Host "=== NCSKit Database Auto-Setup ===" -ForegroundColor Cyan
Write-Host ""

# Wait for Docker Desktop to be ready
Write-Host "Waiting for Docker Desktop to start..." -ForegroundColor Yellow
Write-Host "(This usually takes 1-3 minutes)" -ForegroundColor Gray
Write-Host ""

$maxWait = 180  # 3 minutes
$elapsed = 0
$dockerReady = $false

while ($elapsed -lt $maxWait -and -not $dockerReady) {
    Start-Sleep -Seconds 10
    $elapsed += 10
    
    try {
        $null = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
        } else {
            Write-Host "  Still waiting... ($elapsed seconds)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Still waiting... ($elapsed seconds)" -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "Docker Desktop is taking longer than expected." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Check the Docker Desktop app for any errors" -ForegroundColor White
    Write-Host "2. Once it's running, manually run:" -ForegroundColor White
    Write-Host "   docker-compose -f docker-compose.production.yml up -d postgres" -ForegroundColor Gray
    Write-Host "   cd frontend" -ForegroundColor Gray
    Write-Host "   npx prisma db push" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "Docker Desktop is ready!" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL
Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml up -d postgres

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL container started!" -ForegroundColor Green
Write-Host ""

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Initialize database
Write-Host "Initializing database schema..." -ForegroundColor Cyan
cd frontend
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DATABASE SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
    Write-Host "2. Refresh your browser" -ForegroundColor White
    Write-Host "3. The 500 error should be gone!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Database initialization failed" -ForegroundColor Red
    Write-Host "Check the error message above" -ForegroundColor Yellow
}
