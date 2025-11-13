# ============================================
# NCSKIT - Check DNS Configuration
# Kiểm tra và hướng dẫn sửa DNS
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA DNS CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Đọc Tunnel ID từ config
$tunnelId = $null
if (Test-Path "cloudflared-config.yml") {
    $config = Get-Content "cloudflared-config.yml" -Raw
    if ($config -match "tunnel:\s+([a-f0-9-]+)") {
        $tunnelId = $matches[1]
        Write-Host "Tunnel ID: $tunnelId" -ForegroundColor Green
        Write-Host ""
    }
}

if (-not $tunnelId) {
    Write-Host "[ERROR] Khong tim thay Tunnel ID trong config" -ForegroundColor Red
    exit 1
}

$expectedTarget = "$tunnelId.cfargotunnel.com"
Write-Host "Target DNS mong doi: $expectedTarget" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra DNS
Write-Host "Dang kiem tra DNS..." -ForegroundColor Yellow
Write-Host ""

# 1. Kiểm tra ncskit.org
Write-Host "[1] Kiem tra ncskit.org..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName "ncskit.org" -Type CNAME -ErrorAction SilentlyContinue
    
    if ($dnsResult) {
        $target = $dnsResult[0].NameHost
        Write-Host "   DNS Record: $target" -ForegroundColor Gray
        
        if ($target -match "cfargotunnel\.com") {
            if ($target -eq $expectedTarget) {
                Write-Host "   [OK] DNS da duoc cau hinh dung!" -ForegroundColor Green
            } else {
                Write-Host "   [WARN] DNS tro den tunnel khac: $target" -ForegroundColor Yellow
                Write-Host "   Mong doi: $expectedTarget" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   [ERROR] DNS khong tro den Cloudflare Tunnel!" -ForegroundColor Red
            Write-Host "   Hien tai: $target" -ForegroundColor Red
            Write-Host "   Can: $expectedTarget" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [ERROR] Khong tim thay CNAME record cho ncskit.org" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERROR] Khong the resolve DNS: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Kiểm tra www.ncskit.org
Write-Host "[2] Kiem tra www.ncskit.org..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName "www.ncskit.org" -Type CNAME -ErrorAction SilentlyContinue
    
    if ($dnsResult) {
        $target = $dnsResult[0].NameHost
        Write-Host "   DNS Record: $target" -ForegroundColor Gray
        
        if ($target -match "cfargotunnel\.com") {
            if ($target -eq $expectedTarget) {
                Write-Host "   [OK] DNS da duoc cau hinh dung!" -ForegroundColor Green
            } else {
                Write-Host "   [WARN] DNS tro den tunnel khac: $target" -ForegroundColor Yellow
                Write-Host "   Mong doi: $expectedTarget" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   [ERROR] DNS khong tro den Cloudflare Tunnel!" -ForegroundColor Red
            Write-Host "   Hien tai: $target" -ForegroundColor Red
            Write-Host "   Can: $expectedTarget" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [ERROR] Khong tim thay CNAME record cho www.ncskit.org" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERROR] Khong the resolve DNS: $_" -ForegroundColor Red
}

Write-Host ""

# Hướng dẫn sửa DNS
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HUONG DAN SUA DNS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Neu DNS chua duoc cau hinh dung, lam theo cac buoc sau:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Mo Cloudflare Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dash.cloudflare.com" -ForegroundColor White
Write-Host ""

Write-Host "2. Chon domain: ncskit.org" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Vao DNS > Records" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Them hoac sua 2 CNAME records:" -ForegroundColor Cyan
Write-Host ""

Write-Host "   Record 1:" -ForegroundColor Yellow
Write-Host "   - Type: CNAME" -ForegroundColor White
Write-Host "   - Name: @" -ForegroundColor White
Write-Host "   - Target: $expectedTarget" -ForegroundColor White
Write-Host "   - Proxy status: Proxied (Orange cloud)" -ForegroundColor White
Write-Host "   - TTL: Auto" -ForegroundColor White
Write-Host ""

Write-Host "   Record 2:" -ForegroundColor Yellow
Write-Host "   - Type: CNAME" -ForegroundColor White
Write-Host "   - Name: www" -ForegroundColor White
Write-Host "   - Target: $expectedTarget" -ForegroundColor White
Write-Host "   - Proxy status: Proxied (Orange cloud)" -ForegroundColor White
Write-Host "   - TTL: Auto" -ForegroundColor White
Write-Host ""

Write-Host "5. Hoac chay lenh tu dong:" -ForegroundColor Cyan
Write-Host "   .\cloudflared.exe tunnel route dns ncskit ncskit.org" -ForegroundColor White
Write-Host "   .\cloudflared.exe tunnel route dns ncskit www.ncskit.org" -ForegroundColor White
Write-Host ""

Write-Host "6. Cho DNS propagate (5-10 phut)" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

