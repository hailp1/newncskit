# Test Docker Configuration
Write-Host "🔍 Testing Docker Configuration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
$docker = docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker: $docker" -ForegroundColor Green
} else {
    Write-Host "❌ Docker not found!" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
$compose = docker-compose --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker Compose: $compose" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Compose not found!" -ForegroundColor Red
    exit 1
}

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Check required variables
    $env_content = Get-Content ".env" -Raw
    
    $checks = @{
        "POSTGRES_PASSWORD" = $env_content -match "POSTGRES_PASSWORD=.+"
        "NEXTAUTH_SECRET" = $env_content -match "NEXTAUTH_SECRET=.+"
    }
    
    foreach ($key in $checks.Keys) {
        if ($checks[$key]) {
            Write-Host "  ✅ $key is set" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $key is missing!" -ForegroundColor Red
        }
    }
    
    # Check optional variables
    if ($env_content -match "GEMINI_API_KEY=your-gemini-api-key-here") {
        Write-Host "  ⚠️  GEMINI_API_KEY not configured (using default)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ GEMINI_API_KEY is configured" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Run: Copy-Item .env.docker .env" -ForegroundColor Yellow
    exit 1
}

# Check docker-compose.yml
Write-Host "Checking docker-compose.production.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.production.yml") {
    Write-Host "✅ docker-compose.production.yml exists" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.production.yml not found!" -ForegroundColor Red
    exit 1
}

# Validate docker-compose config
Write-Host "Validating docker-compose config..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml config > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ docker-compose config is valid" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose config has errors!" -ForegroundColor Red
    docker-compose -f docker-compose.production.yml config
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "All Checks Passed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to start Docker stack!" -ForegroundColor Green
Write-Host "Run: docker-start.ps1" -ForegroundColor White
Write-Host ""
