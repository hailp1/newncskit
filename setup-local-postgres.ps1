# Setup local PostgreSQL database for NCSKit
Write-Host "Setting up local PostgreSQL database..." -ForegroundColor Cyan

# Try to create database with common credentials
$passwords = @("postgres", "", "admin", "password")
$success = $false

foreach ($pwd in $passwords) {
    Write-Host "`nTrying password: $(if ($pwd -eq '') { '(empty)' } else { '***' })" -ForegroundColor Yellow
    
    $env:PGPASSWORD = $pwd
    $result = psql -U postgres -c "CREATE DATABASE ncskit_production;" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "already exists") {
        $success = $true
        Write-Host "✓ Database created or already exists!" -ForegroundColor Green
        
        # Update .env.local
        $envPath = "frontend\.env.local"
        $envContent = Get-Content $envPath -Raw
        
        $newDbUrl = "DATABASE_URL=postgresql://postgres:$pwd@localhost:5432/ncskit_production"
        $envContent = $envContent -replace 'DATABASE_URL=.*', $newDbUrl
        
        Set-Content -Path $envPath -Value $envContent
        Write-Host "✓ Updated .env.local with correct credentials" -ForegroundColor Green
        
        # Run Prisma migrations
        Write-Host "`nInitializing database schema..." -ForegroundColor Cyan
        cd frontend
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Database setup complete!" -ForegroundColor Green
            Write-Host "`nNext step: Restart your dev server (Ctrl+C then npm run dev)" -ForegroundColor Cyan
        }
        
        break
    }
}

if (-not $success) {
    Write-Host "`n✗ Could not connect to PostgreSQL with common passwords" -ForegroundColor Red
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres" -ForegroundColor Gray
    Write-Host "  CREATE DATABASE ncskit_production;" -ForegroundColor Gray
}
