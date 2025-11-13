# ============================================
# NCSKIT - Auto Fix DNS Configuration
# Tự động cấu hình DNS cho Cloudflare Tunnel
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TU DONG CAU HINH DNS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Đọc Tunnel ID từ config
$tunnelId = $null
if (Test-Path "cloudflared-config.yml") {
    $config = Get-Content "cloudflared-config.yml" -Raw
    if ($config -match "tunnel:\s+([a-f0-9-]+)") {
        $tunnelId = $matches[1]
    }
}

if (-not $tunnelId) {
    Write-Host "[ERROR] Khong tim thay Tunnel ID trong config" -ForegroundColor Red
    exit 1
}

Write-Host "Tunnel ID: $tunnelId" -ForegroundColor Green
Write-Host ""

# Cấu hình DNS cho ncskit.org
Write-Host "[1/2] Cau hinh DNS cho ncskit.org..." -ForegroundColor Yellow
$result1 = & .\cloudflared.exe tunnel route dns ncskit ncskit.org 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] DNS da duoc cau hinh cho ncskit.org" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Co the DNS da duoc cau hinh hoac co loi" -ForegroundColor Yellow
    Write-Host "   Output: $result1" -ForegroundColor Gray
}

Write-Host ""

# Cấu hình DNS cho www.ncskit.org
Write-Host "[2/2] Cau hinh DNS cho www.ncskit.org..." -ForegroundColor Yellow
$result2 = & .\cloudflared.exe tunnel route dns ncskit www.ncskit.org 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] DNS da duoc cau hinh cho www.ncskit.org" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Co the DNS da duoc cau hinh hoac co loi" -ForegroundColor Yellow
    Write-Host "   Output: $result2" -ForegroundColor Gray
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HOAN TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Luu y:" -ForegroundColor Yellow
Write-Host "  - DNS co the mat 5-10 phut de propagate" -ForegroundColor White
Write-Host "  - Kiem tra lai sau: .\check-dns-config.ps1" -ForegroundColor White
Write-Host ""

