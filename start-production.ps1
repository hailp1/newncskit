# ============================================
# Start Production Server
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "START PRODUCTION SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] Khong tim thay thu muc frontend" -ForegroundColor Red
    exit 1
}

# Kiểm tra build
if (-not (Test-Path "$frontendPath\.next")) {
    Write-Host "[ERROR] Chua co build production!" -ForegroundColor Red
    Write-Host "Chay: cd frontend && npm run build:prod" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Build production da san sang" -ForegroundColor Green
Write-Host ""

# Dừng các process cũ
Write-Host "Dang dung processes cu..." -ForegroundColor Yellow

Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmdLine -match "next"
} | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 3

# Load environment variables từ .env.production
$envFile = Join-Path $frontendPath ".env.production"
if (Test-Path $envFile) {
    Write-Host "Dang load environment variables tu .env.production..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "[OK] Environment variables da duoc load" -ForegroundColor Green
} else {
    Write-Host "[WARN] .env.production khong ton tai" -ForegroundColor Yellow
}

Write-Host ""

# Start production server
Write-Host "Dang khoi dong production server..." -ForegroundColor Yellow

$frontendFullPath = Resolve-Path $frontendPath

# Set NODE_ENV
$env:NODE_ENV = "production"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendFullPath'; `$env:NODE_ENV='production'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'NEXT.JS PRODUCTION SERVER' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Starting production server...' -ForegroundColor Yellow; Write-Host 'URL: http://localhost:3000' -ForegroundColor Green; Write-Host 'Public: https://ncskit.org' -ForegroundColor Green; Write-Host ''; npm start" -WindowStyle Normal

Write-Host "[OK] Production server dang khoi dong trong cua so moi" -ForegroundColor Green
Write-Host "Cho server khoi dong (15 giay)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Kiểm tra
Write-Host ""
Write-Host "Dang kiem tra server..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Production server dang chay (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Server co the chua san sang, cho them vai giay..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION SERVER DA KHOI DONG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local: http://localhost:3000" -ForegroundColor White
Write-Host "Public: https://ncskit.org" -ForegroundColor White
Write-Host ""
Write-Host "Luu y: Server dang chay trong cua so PowerShell rieng" -ForegroundColor Gray
Write-Host "Dung Ctrl+C trong cua so do de dung server" -ForegroundColor Gray
Write-Host ""

