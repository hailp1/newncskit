# ============================================
# NCSKIT Docker Compose Start Script
# ============================================
# Starts all services (PostgreSQL + R Analytics + Next.js)
# ============================================

Write-Host "🚀 Starting NCSKIT Docker Stack" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Copying .env.docker to .env..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host ""
    Write-Host "📝 Please edit .env file and update:" -ForegroundColor Yellow
    Write-Host "   - POSTGRES_PASSWORD" -ForegroundColor White
    Write-Host "   - NEXTAUTH_SECRET (generate: openssl rand -base64 32)" -ForegroundColor White
    Write-Host "   - GEMINI_API_KEY" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue with default values? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please edit .env file and run this script again" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Build and start services
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ All Services Started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml ps

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   R Analytics: http://localhost:8000" -ForegroundColor White
Write-Host "   PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host ""

Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "   View logs:    docker-compose -f docker-compose.production.yml logs -f" -ForegroundColor White
Write-Host "   Stop all:     docker-compose -f docker-compose.production.yml down" -ForegroundColor White
Write-Host "   Restart:      docker-compose -f docker-compose.production.yml restart" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Run database migrations:" -ForegroundColor White
Write-Host "      docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Setup Cloudflare Tunnel (if not using Docker tunnel):" -ForegroundColor White
Write-Host "      .\setup-tunnel.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Start tunnel:" -ForegroundColor White
Write-Host "      .\start-tunnel.ps1" -ForegroundColor Gray
Write-Host ""
