# ============================================
# Production Release Script
# Kiểm tra và release production
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION RELEASE - NCSKIT.ORG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================
# 1. KIỂM TRA CODE
# ============================================
Write-Host "[1/6] Kiem tra code..." -ForegroundColor Yellow

$authFilePath = "frontend\src\lib\auth.ts"

if (Test-Path $authFilePath) {
    $authContent = Get-Content $authFilePath -Raw
    
    $checks = @{
        "getBaseUrl() function" = $authContent -match "function getBaseUrl\(\)"
        "redirect() callback" = $authContent -match "async redirect\(.*baseUrl.*\)"
        "GoogleProvider" = $authContent -match "GoogleProvider"
        "LinkedInProvider" = $authContent -match "LinkedInProvider"
    }
    
    $allOk = $true
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "   [OK] $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "   [ERROR] $($check.Key) khong tim thay" -ForegroundColor Red
            $allOk = $false
        }
    }
    
    if (-not $allOk) {
        Write-Host "   [ERROR] Code chua du cau hinh, vui long kiem tra lai" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   [ERROR] Khong tim thay auth.ts" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# 2. KIỂM TRA ENVIRONMENT VARIABLES
# ============================================
Write-Host "[2/6] Kiem tra environment variables..." -ForegroundColor Yellow

$envProductionPath = "frontend\.env.production"
$requiredVars = @(
    "NEXTAUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "NEXTAUTH_SECRET"
)

if (Test-Path $envProductionPath) {
    $envContent = Get-Content $envProductionPath -Raw
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var\s*=") {
            $value = ($envContent | Select-String -Pattern "$var\s*=\s*(.+)").Matches[0].Groups[1].Value.Trim()
            if ($value -and $value -notmatch "your-|CHANGE_THIS|example") {
                Write-Host "   [OK] $var" -ForegroundColor Green
            } else {
                Write-Host "   [WARN] $var chua duoc set hoac la placeholder" -ForegroundColor Yellow
                $missingVars += $var
            }
        } else {
            Write-Host "   [WARN] $var khong tim thay" -ForegroundColor Yellow
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "   [WARN] Co $($missingVars.Count) bien chua duoc cau hinh" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARN] .env.production khong ton tai" -ForegroundColor Yellow
    Write-Host "   [INFO] Can tao file .env.production voi cac bien can thiet" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# 3. KIỂM TRA SERVICES
# ============================================
Write-Host "[3/6] Kiem tra services..." -ForegroundColor Yellow

# PostgreSQL
$postgresPort = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($postgresPort) {
    Write-Host "   [OK] PostgreSQL: Port 5432" -ForegroundColor Green
} else {
    Write-Host "   [WARN] PostgreSQL: Chua chay" -ForegroundColor Yellow
}

# Next.js
$nextjsPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($nextjsPort) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   [OK] Next.js: Port 3000 (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   [WARN] Next.js: Port 3000 dang duoc su dung nhung khong phan hoi" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARN] Next.js: Chua chay" -ForegroundColor Yellow
}

# Cloudflare Tunnel
$tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "   [OK] Cloudflare Tunnel: Dang chay (PID: $($tunnelProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Cloudflare Tunnel: Chua chay" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 4. KIỂM TRA DNS
# ============================================
Write-Host "[4/6] Kiem tra DNS..." -ForegroundColor Yellow

try {
    $dnsResult = Resolve-DnsName "ncskit.org" -Type CNAME -ErrorAction SilentlyContinue
    if ($dnsResult) {
        $target = $dnsResult[0].NameHost
        if ($target -match "cfargotunnel\.com") {
            Write-Host "   [OK] DNS ncskit.org tro den Cloudflare Tunnel" -ForegroundColor Green
            Write-Host "   Target: $target" -ForegroundColor Gray
        } else {
            Write-Host "   [WARN] DNS ncskit.org khong tro den Cloudflare Tunnel" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [WARN] Khong the resolve DNS cho ncskit.org" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [WARN] Khong the kiem tra DNS: $_" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 5. KIỂM TRA OAUTH CONSOLES
# ============================================
Write-Host "[5/6] Kiem tra OAuth Consoles..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   ⚠️  CAN KIEM TRA THU CONG:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Google Cloud Console:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host "   - Authorized JavaScript origins: https://ncskit.org, https://www.ncskit.org" -ForegroundColor Gray
Write-Host "   - Authorized redirect URIs: https://ncskit.org/api/auth/callback/google" -ForegroundColor Gray
Write-Host ""
Write-Host "   LinkedIn Developer Portal:" -ForegroundColor Cyan
Write-Host "   https://www.linkedin.com/developers/apps" -ForegroundColor White
Write-Host "   - Authorized Redirect URLs: https://ncskit.org/api/auth/callback/linkedin" -ForegroundColor Gray
Write-Host ""

# ============================================
# 6. TỔNG KẾT VÀ HƯỚNG DẪN
# ============================================
Write-Host "[6/6] Tong ket..." -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION RELEASE CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Da kiem tra:" -ForegroundColor Green
Write-Host "  ✅ Code configuration" -ForegroundColor White
Write-Host "  ✅ Environment variables" -ForegroundColor White
Write-Host "  ✅ Services status" -ForegroundColor White
Write-Host "  ✅ DNS configuration" -ForegroundColor White
Write-Host ""

Write-Host "Can lam tiep:" -ForegroundColor Yellow
Write-Host "  1. Cap nhat Google Cloud Console redirect URIs" -ForegroundColor White
Write-Host "  2. Cap nhat LinkedIn Developer Portal redirect URIs" -ForegroundColor White
Write-Host "  3. Kiem tra environment variables trong production" -ForegroundColor White
Write-Host "  4. Rebuild Next.js neu can" -ForegroundColor White
Write-Host "  5. Test OAuth flows tren production" -ForegroundColor White
Write-Host ""

Write-Host "Xem chi tiet: PRODUCTION-RELEASE-CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

