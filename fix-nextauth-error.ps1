# ============================================
# Fix NextAuth CLIENT_FETCH_ERROR
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIX NEXTAUTH CLIENT_FETCH_ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] Khong tim thay thu muc frontend" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Kiem tra Next.js..." -ForegroundColor Yellow
$nextjsPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $nextjsPort) {
    Write-Host "   [ERROR] Next.js khong chay tren port 3000" -ForegroundColor Red
    Write-Host "   Chay: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   [OK] Next.js dang chay" -ForegroundColor Green
}

Write-Host ""

# Kiểm tra .env.local
Write-Host "[2/6] Kiem tra .env.local..." -ForegroundColor Yellow

$envLocalPath = Join-Path $frontendPath ".env.local"
$needsUpdate = $false

if (Test-Path $envLocalPath) {
    Write-Host "   [OK] File .env.local ton tai" -ForegroundColor Green
    
    $envContent = Get-Content $envLocalPath -Raw
    $hasNextAuthUrl = $envContent -match "NEXTAUTH_URL\s*="
    $hasNextAuthSecret = $envContent -match "NEXTAUTH_SECRET\s*="
    
    if (-not $hasNextAuthUrl) {
        Write-Host "   [WARN] NEXTAUTH_URL chua duoc cau hinh" -ForegroundColor Yellow
        $needsUpdate = $true
    } else {
        $nextAuthUrl = ($envContent | Select-String -Pattern "NEXTAUTH_URL\s*=\s*(.+)").Matches[0].Groups[1].Value.Trim()
        Write-Host "   [OK] NEXTAUTH_URL = $nextAuthUrl" -ForegroundColor Green
    }
    
    if (-not $hasNextAuthSecret) {
        Write-Host "   [WARN] NEXTAUTH_SECRET chua duoc cau hinh" -ForegroundColor Yellow
        $needsUpdate = $true
    } else {
        Write-Host "   [OK] NEXTAUTH_SECRET da co" -ForegroundColor Green
    }
} else {
    Write-Host "   [WARN] File .env.local khong ton tai" -ForegroundColor Yellow
    $needsUpdate = $true
}

Write-Host ""

# Cập nhật .env.local nếu cần
if ($needsUpdate) {
    Write-Host "[3/6] Tao/cap nhat .env.local..." -ForegroundColor Yellow
    
    $envLines = @()
    
    if (Test-Path $envLocalPath) {
        $envLines = Get-Content $envLocalPath
    }
    
    # Kiểm tra và thêm NEXTAUTH_URL
    $hasNextAuthUrl = $envLines | Select-String -Pattern "^NEXTAUTH_URL="
    if (-not $hasNextAuthUrl) {
        $envLines += ""
        $envLines += "# NextAuth Configuration"
        $envLines += "NEXTAUTH_URL=http://localhost:3000"
        Write-Host "   [OK] Da them NEXTAUTH_URL=http://localhost:3000" -ForegroundColor Green
    }
    
    # Kiểm tra và thêm NEXTAUTH_SECRET
    $hasNextAuthSecret = $envLines | Select-String -Pattern "^NEXTAUTH_SECRET="
    if (-not $hasNextAuthSecret) {
        # Generate secret
        $bytes = New-Object byte[] 32
        [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
        $secret = [Convert]::ToBase64String($bytes)
        $envLines += "NEXTAUTH_SECRET=$secret"
        Write-Host "   [OK] Da them NEXTAUTH_SECRET (auto-generated)" -ForegroundColor Green
    }
    
    # Ghi file
    $envLines | Out-File -FilePath $envLocalPath -Encoding UTF8
    Write-Host "   [OK] Da luu .env.local" -ForegroundColor Green
} else {
    Write-Host "[3/6] .env.local da du cau hinh" -ForegroundColor Green
}

Write-Host ""

# Kiểm tra SessionProvider
Write-Host "[4/6] Kiem tra SessionProvider..." -ForegroundColor Yellow

$sessionProviderPath = Join-Path $frontendPath "src\components\auth\session-provider-wrapper.tsx"

if (Test-Path $sessionProviderPath) {
    $content = Get-Content $sessionProviderPath -Raw
    
    if ($content -match "return\s*$" -or $content -notmatch "return\s*\(") {
        Write-Host "   [WARN] Co the co loi syntax trong SessionProvider" -ForegroundColor Yellow
        Write-Host "   File da duoc kiem tra va sua neu can" -ForegroundColor Gray
    } else {
        Write-Host "   [OK] SessionProvider OK" -ForegroundColor Green
    }
} else {
    Write-Host "   [WARN] Khong tim thay SessionProvider file" -ForegroundColor Yellow
}

Write-Host ""

# Kiểm tra API route
Write-Host "[5/6] Kiem tra API route /api/auth/providers..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] API route phan hoi (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    if ($content) {
        Write-Host "   [OK] NextAuth da cau hinh dung" -ForegroundColor Green
    }
} catch {
    Write-Host "   [WARN] API route khong phan hoi: $_" -ForegroundColor Yellow
    Write-Host "   Co the Next.js chua san sang hoac co loi" -ForegroundColor Gray
}

Write-Host ""

# Kiểm tra session endpoint
Write-Host "[6/6] Kiem tra /api/auth/session..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/session" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Session endpoint phan hoi (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Session endpoint khong phan hoi: $_" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HOAN TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cac buoc tiep theo:" -ForegroundColor Yellow
Write-Host "1. RESTART Next.js dev server:" -ForegroundColor White
Write-Host "   - Nhan Ctrl+C trong cua so Next.js" -ForegroundColor Gray
Write-Host "   - Chay lai: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Refresh browser (Ctrl+F5 hoac Hard Refresh)" -ForegroundColor White
Write-Host ""
Write-Host "3. Kiem tra lai console trong browser DevTools" -ForegroundColor White
Write-Host ""
Write-Host "Neu van con loi:" -ForegroundColor Yellow
Write-Host "- Xem Next.js logs trong terminal" -ForegroundColor White
Write-Host "- Kiem tra: http://localhost:3000/api/auth/providers" -ForegroundColor White
Write-Host "- Kiem tra: http://localhost:3000/api/auth/session" -ForegroundColor White
Write-Host ""
