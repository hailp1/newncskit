# ============================================
# Deploy to Production - ncskit.org
# Chuyển từ dev mode sang production mode
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY TO PRODUCTION - NCSKIT.ORG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] Khong tim thay thu muc frontend" -ForegroundColor Red
    exit 1
}

# ============================================
# 1. DỪNG DEV SERVER
# ============================================
Write-Host "[1/7] Dung dev server..." -ForegroundColor Yellow

# Kill tất cả Node.js processes (có thể là dev server)
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Tim thay $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Gray
    
    foreach ($proc in $nodeProcesses) {
        try {
            # Kiểm tra xem có phải Next.js dev server không
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            
            if ($cmdLine -match "next dev" -or $cmdLine -match "npm.*dev") {
                Write-Host "     Dang dung Next.js dev server (PID: $($proc.Id))..." -ForegroundColor Yellow
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                Write-Host "       [OK] Da dung dev server" -ForegroundColor Green
            }
        } catch {
            Write-Host "       [WARN] Khong the dung process $($proc.Id): $_" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 3
} else {
    Write-Host "   [OK] Khong co Node.js process nao dang chay" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 2. GIẢI PHÓNG PORT 3000
# ============================================
Write-Host "[2/7] Giai phong port 3000..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   Port 3000 dang duoc su dung, dang giai phong..." -ForegroundColor Yellow
    
    foreach ($conn in $port3000) {
        $pid = $conn.OwningProcess
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "     [OK] Da kill process (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "     [WARN] Khong the kill process (PID: $pid)" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "   [OK] Port 3000 da trong" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 3. KIỂM TRA ENVIRONMENT VARIABLES
# ============================================
Write-Host "[3/7] Kiem tra environment variables..." -ForegroundColor Yellow

$envProductionPath = Join-Path $frontendPath ".env.production"

if (-not (Test-Path $envProductionPath)) {
    Write-Host "   [WARN] .env.production khong ton tai" -ForegroundColor Yellow
    Write-Host "   Dang tao .env.production..." -ForegroundColor Yellow
    
    $productionEnv = @"
# Production Environment Variables
NODE_ENV=production
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org

# Database (thay the voi production database URL)
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD:-ncskit_secure_password_change_me}@localhost:5432/ncskit_production

# NextAuth Secret (generate voi: openssl rand -base64 32)
NEXTAUTH_SECRET=dev-secret-key-for-local-testing-only-change-in-production-12345678

# Google OAuth (thay the voi credentials that)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth (thay the voi credentials that)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Gemini API (neu co)
GEMINI_API_KEY=your-gemini-api-key
"@
    
    $productionEnv | Out-File -FilePath $envProductionPath -Encoding UTF8
    Write-Host "   [OK] Da tao .env.production" -ForegroundColor Green
    Write-Host "   [WARN] Vui long cap nhat cac gia tri trong .env.production" -ForegroundColor Yellow
} else {
    Write-Host "   [OK] .env.production ton tai" -ForegroundColor Green
    
    $envContent = Get-Content $envProductionPath -Raw
    
    # Kiểm tra NEXTAUTH_URL
    if ($envContent -match "NEXTAUTH_URL\s*=\s*https://ncskit\.org") {
        Write-Host "   [OK] NEXTAUTH_URL da duoc set cho production" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] NEXTAUTH_URL chua duoc set cho production" -ForegroundColor Yellow
        Write-Host "   Can sua thanh: NEXTAUTH_URL=https://ncskit.org" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# 4. GENERATE PRISMA CLIENT
# ============================================
Write-Host "[4/7] Generate Prisma Client..." -ForegroundColor Yellow

Push-Location $frontendPath

try {
    $prismaGen = & npm run db:generate 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Prisma Client da duoc generate" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Co the co loi khi generate Prisma Client" -ForegroundColor Yellow
        Write-Host "   Output: $prismaGen" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [WARN] Khong the generate Prisma Client: $_" -ForegroundColor Yellow
}

Pop-Location

Write-Host ""

# ============================================
# 5. BUILD PRODUCTION
# ============================================
Write-Host "[5/7] Build production..." -ForegroundColor Yellow
Write-Host "   Dang build Next.js production (co the mat 2-5 phut)..." -ForegroundColor Gray

Push-Location $frontendPath

try {
    # Set NODE_ENV=production
    $env:NODE_ENV = "production"
    
    # Build
    Write-Host "   Chay: npm run build:prod" -ForegroundColor Gray
    $buildOutput = & npm run build:prod 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Build production thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Build that bai!" -ForegroundColor Red
        Write-Host "   Output: $buildOutput" -ForegroundColor Gray
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "   [ERROR] Loi khi build: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""

# ============================================
# 6. START PRODUCTION SERVER
# ============================================
Write-Host "[6/7] Khoi dong production server..." -ForegroundColor Yellow

# Kiểm tra xem port 3000 đã được giải phóng chưa
Start-Sleep -Seconds 2
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($portCheck) {
    Write-Host "   [WARN] Port 3000 van dang duoc su dung" -ForegroundColor Yellow
    Write-Host "   Dang kill process..." -ForegroundColor Yellow
    
    foreach ($conn in $portCheck) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    
    Start-Sleep -Seconds 2
}

# Start production server
$frontendFullPath = Resolve-Path $frontendPath
Write-Host "   Dang mo cua so PowerShell moi cho production server..." -ForegroundColor Yellow

# Load .env.production
$envFile = Join-Path $frontendPath ".env.production"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendFullPath'; `$env:NODE_ENV='production'; Write-Host 'Starting Next.js Production Server...' -ForegroundColor Cyan; npm start" -WindowStyle Normal

Write-Host "   [OK] Production server dang khoi dong trong cua so moi" -ForegroundColor Green
Write-Host "   Cho server khoi dong (15 giay)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""

# ============================================
# 7. KIỂM TRA PRODUCTION SERVER
# ============================================
Write-Host "[7/7] Kiem tra production server..." -ForegroundColor Yellow

$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($portCheck) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "   [OK] Production server dang chay (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Kiểm tra NODE_ENV
        try {
            $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            Write-Host "   [OK] Health check passed" -ForegroundColor Green
        } catch {
            Write-Host "   [INFO] Health endpoint co the chua san sang" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   [WARN] Server chua san sang hoan toan, cho them vai giay..." -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARN] Port 3000 chua duoc su dung" -ForegroundColor Yellow
    Write-Host "   Co the server chua khoi dong xong" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# TỔNG KẾT
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY HOAN TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Production server:" -ForegroundColor Green
Write-Host "  - Local: http://localhost:3000" -ForegroundColor White
Write-Host "  - Public: https://ncskit.org" -ForegroundColor White
Write-Host ""

Write-Host "Luu y:" -ForegroundColor Yellow
Write-Host "  - Production server dang chay trong cua so PowerShell rieng" -ForegroundColor Gray
Write-Host "  - Dung Ctrl+C trong cua so do de dung server" -ForegroundColor Gray
Write-Host "  - Neu can chay lai dev: npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Kiem tra:" -ForegroundColor Yellow
Write-Host "  - Vao: https://ncskit.org" -ForegroundColor White
Write-Host "  - Test OAuth flows" -ForegroundColor White
Write-Host "  - Kiem tra console khong co loi" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

