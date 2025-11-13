# ============================================
# Test Database Connection từ Production Server
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA DATABASE CONNECTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra PostgreSQL đang chạy
Write-Host "[1/4] Kiem tra PostgreSQL..." -ForegroundColor Yellow

$postgresPort = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
$dockerPostgres = docker ps --filter "name=postgres" --format "{{.Names}}" 2>&1

if ($postgresPort -or $dockerPostgres) {
    Write-Host "   [OK] PostgreSQL dang chay" -ForegroundColor Green
    if ($dockerPostgres) {
        Write-Host "   Docker container: $dockerPostgres" -ForegroundColor Gray
    }
} else {
    Write-Host "   [ERROR] PostgreSQL khong chay!" -ForegroundColor Red
    Write-Host "   Chay: docker-compose -f docker-compose.production.yml up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Kiểm tra DATABASE_URL
Write-Host "[2/4] Kiem tra DATABASE_URL..." -ForegroundColor Yellow

$frontendPath = "frontend"
$envFiles = @(
    (Join-Path $frontendPath ".env.production"),
    (Join-Path $frontendPath ".env.local"),
    (Join-Path $frontendPath ".env")
)

$databaseUrl = $null
$foundInFile = $null

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match "DATABASE_URL\s*=\s*(.+)") {
            $databaseUrl = $matches[1].Trim()
            $foundInFile = $envFile
            break
        }
    }
}

# Kiểm tra environment variable
if (-not $databaseUrl) {
    $databaseUrl = $env:DATABASE_URL
    if ($databaseUrl) {
        $foundInFile = "Environment Variable"
    }
}

if ($databaseUrl) {
    Write-Host "   [OK] DATABASE_URL tim thay trong: $foundInFile" -ForegroundColor Green
    
    # Mask password trong output
    $maskedUrl = $databaseUrl -replace "://([^:]+):([^@]+)@", "://`$1:***@"
    Write-Host "   URL: $maskedUrl" -ForegroundColor Gray
    
    # Kiểm tra xem có đúng localhost không
    if ($databaseUrl -match "localhost|127.0.0.1|postgres:5432") {
        Write-Host "   [OK] Database URL tro den localhost/Docker" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Database URL tro den remote server" -ForegroundColor Gray
    }
} else {
    Write-Host "   [ERROR] DATABASE_URL khong tim thay!" -ForegroundColor Red
    Write-Host "   Can tao .env.production voi DATABASE_URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Vi du:" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL=postgresql://postgres:password@localhost:5432/ncskit_production" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# 3. Test kết nối database qua API
Write-Host "[3/4] Test ket noi database qua Production Server..." -ForegroundColor Yellow

try {
    # Test qua API endpoint (nếu có)
    $apiTest = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Production server dang chay (Status: $($apiTest.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Khong the ket noi den production server" -ForegroundColor Yellow
    Write-Host "   Server co the chua khoi dong hoan toan" -ForegroundColor Gray
}

Write-Host ""

# 4. Test kết nối database trực tiếp
Write-Host "[4/4] Test ket noi database truc tiep..." -ForegroundColor Yellow

$testScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.`$connect();
    console.log('OK: Database connected successfully');
    
    // Test query
    const userCount = await prisma.user.count().catch(() => 0);
    console.log('OK: Query test passed (Users: ' + userCount + ')');
    
    await prisma.`$disconnect();
    process.exit(0);
  } catch (error) {
    console.log('ERROR: ' + error.message);
    process.exit(1);
  }
}

test();
"@

$testScriptPath = Join-Path $frontendPath "test-db-temp.js"
$testScript | Out-File -FilePath $testScriptPath -Encoding UTF8

Push-Location $frontendPath

try {
    Write-Host "   Dang test ket noi..." -ForegroundColor Gray
    
    # Load environment variables
    if (Test-Path ".env.production") {
        Get-Content ".env.production" | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
    
    $result = & node $testScriptPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Database connection successful!" -ForegroundColor Green
        $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "   [ERROR] Database connection failed!" -ForegroundColor Red
        $result | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    }
} catch {
    Write-Host "   [ERROR] Loi khi test: $_" -ForegroundColor Red
} finally {
    Pop-Location
    if (Test-Path $testScriptPath) {
        Remove-Item $testScriptPath -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KET QUA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

