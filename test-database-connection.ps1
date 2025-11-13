# Test Database Connection Script

Write-Host "=== NCSKIT Database Connection Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
$envPath = "frontend\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "✗ .env.local not found!" -ForegroundColor Red
    Write-Host "Please create frontend/.env.local first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env.local found" -ForegroundColor Green

# Read DATABASE_URL
$envContent = Get-Content $envPath -Raw
if ($envContent -match 'DATABASE_URL=(.+)') {
    $dbUrl = $matches[1].Trim()
    
    # Mask password in display
    $displayUrl = $dbUrl -replace '://([^:]+):([^@]+)@', '://$1:****@'
    Write-Host "✓ DATABASE_URL found: $displayUrl" -ForegroundColor Green
    
    # Check if it's localhost
    if ($dbUrl -match 'localhost') {
        Write-Host "⚠ Using localhost database" -ForegroundColor Yellow
        Write-Host "  Docker or local PostgreSQL must be running" -ForegroundColor Gray
    } elseif ($dbUrl -match 'supabase') {
        Write-Host "✓ Using Supabase cloud database" -ForegroundColor Green
    } elseif ($dbUrl -match 'neon') {
        Write-Host "✓ Using Neon cloud database" -ForegroundColor Green
    }
} else {
    Write-Host "✗ DATABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Cyan

# Test with Prisma
cd frontend
$result = npx prisma db execute --stdin 2>&1 <<< "SELECT 1;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Checking schema status..." -ForegroundColor Cyan
    npx prisma migrate status
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  DATABASE IS READY!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Restart dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
        Write-Host "2. Refresh browser - errors should be gone!" -ForegroundColor White
    }
} else {
    Write-Host "✗ Database connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Database server not running (if localhost)" -ForegroundColor White
    Write-Host "2. Wrong connection string" -ForegroundColor White
    Write-Host "3. Network/firewall issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick fix:" -ForegroundColor Cyan
    Write-Host "Use Supabase free database - see QUICK-FIX-DATABASE-NOW.md" -ForegroundColor White
}
