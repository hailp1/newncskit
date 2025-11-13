# Export Local PostgreSQL Database
# Run this script to backup your local database before migration

Write-Host "🔄 Exporting Local PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "supabase/migration/backup_$timestamp"

# Create backup directory
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Database connection info
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "ncskit"
$dbUser = "postgres"

Write-Host "📦 Backup Directory: $backupDir" -ForegroundColor Yellow
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Cyan
$pgIsRunning = $false
try {
    $testConnection = & pg_isready -h $dbHost -p $dbPort -U $dbUser 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pgIsRunning = $true
        Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ PostgreSQL is not running or pg_isready not found" -ForegroundColor Red
}

if (-not $pgIsRunning) {
    Write-Host ""
    Write-Host "⚠️  Cannot connect to PostgreSQL" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  1. Start PostgreSQL service" -ForegroundColor Gray
    Write-Host "  2. Skip migration if no local data exists" -ForegroundColor Gray
    Write-Host "  3. Manually export data if needed" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Migration cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Export schema
Write-Host ""
Write-Host "📋 Exporting schema..." -ForegroundColor Cyan
$schemaFile = "$backupDir/schema.sql"
try {
    & pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --schema-only -f $schemaFile 2>&1 | Out-Null
    if (Test-Path $schemaFile) {
        Write-Host "✅ Schema exported: $schemaFile" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Schema export failed (database might not exist)" -ForegroundColor Yellow
}

# Export data
Write-Host ""
Write-Host "📊 Exporting data..." -ForegroundColor Cyan
$dataFile = "$backupDir/data.sql"
try {
    & pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --data-only -f $dataFile 2>&1 | Out-Null
    if (Test-Path $dataFile) {
        Write-Host "✅ Data exported: $dataFile" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Data export failed (database might be empty)" -ForegroundColor Yellow
}

# Export full backup
Write-Host ""
Write-Host "💾 Creating full backup..." -ForegroundColor Cyan
$fullBackupFile = "$backupDir/full_backup.sql"
try {
    & pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $fullBackupFile 2>&1 | Out-Null
    if (Test-Path $fullBackupFile) {
        Write-Host "✅ Full backup created: $fullBackupFile" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Full backup failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Export Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Backup Location: $backupDir" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review exported files in $backupDir" -ForegroundColor Gray
Write-Host "  2. Run Supabase SQL scripts (01-04) if not done yet" -ForegroundColor Gray
Write-Host "  3. Update .env.local with Supabase credentials" -ForegroundColor Gray
Write-Host "  4. Continue to Task 3" -ForegroundColor Gray
Write-Host ""
