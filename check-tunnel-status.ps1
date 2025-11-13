# ============================================
# NCSKIT Cloudflare Tunnel - Auto Check
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA CLOUDFLARE TUNNEL STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()
$success = @()

# 1. Check Cloudflared.exe
Write-Host "[1/8] Kiem tra Cloudflared..." -ForegroundColor Yellow

if (Test-Path "cloudflared.exe") {
    $success += "cloudflared.exe ton tai"
    Write-Host "   [OK] cloudflared.exe ton tai" -ForegroundColor Green
    
    try {
        $version = & .\cloudflared.exe --version 2>&1 | Select-Object -First 1
        Write-Host "   Version: $version" -ForegroundColor Gray
    } catch {
        Write-Host "   [WARN] Khong the kiem tra version" -ForegroundColor Yellow
    }
} else {
    $issues += "cloudflared.exe KHONG TON TAI"
    Write-Host "   [ERROR] cloudflared.exe KHONG TON TAI" -ForegroundColor Red
}

Write-Host ""

# 2. Check Config File
Write-Host "[2/8] Kiem tra Config File..." -ForegroundColor Yellow

if (Test-Path "cloudflared-config.yml") {
    $success += "cloudflared-config.yml ton tai"
    Write-Host "   [OK] cloudflared-config.yml ton tai" -ForegroundColor Green
    
    $config = Get-Content "cloudflared-config.yml" -Raw
    
    if ($config -match "tunnel:\s+([a-f0-9-]+)") {
        $tunnelId = $matches[1]
        Write-Host "   Tunnel ID: $tunnelId" -ForegroundColor Gray
        
        if ($config -match "credentials-file:\s+(.+)") {
            $credPath = $matches[1].Trim()
            Write-Host "   Credentials: $credPath" -ForegroundColor Gray
            
            if (Test-Path $credPath) {
                $success += "Credentials file ton tai"
                Write-Host "   [OK] Credentials file ton tai" -ForegroundColor Green
            } else {
                $issues += "Credentials file KHONG TON TAI: $credPath"
                Write-Host "   [ERROR] Credentials file KHONG TON TAI" -ForegroundColor Red
            }
        }
        
        if ($config -match "hostname:\s+ncskit\.org") {
            $success += "Config co hostname ncskit.org"
            Write-Host "   [OK] Config co hostname ncskit.org" -ForegroundColor Green
        }
        
        if ($config -match "service:\s+http://localhost:3000") {
            $success += "Config tro den localhost:3000"
            Write-Host "   [OK] Config tro den localhost:3000" -ForegroundColor Green
        }
    }
} else {
    $issues += "cloudflared-config.yml KHONG TON TAI"
    Write-Host "   [ERROR] cloudflared-config.yml KHONG TON TAI" -ForegroundColor Red
}

Write-Host ""

# 3. Check Next.js (Port 3000)
Write-Host "[3/8] Kiem tra Next.js (port 3000)..." -ForegroundColor Yellow

$nextjsPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($nextjsPort) {
    $success += "Port 3000 dang duoc su dung"
    Write-Host "   [OK] Port 3000 dang duoc su dung" -ForegroundColor Green
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        $success += "Next.js dang chay va phan hoi"
        Write-Host "   [OK] Next.js dang chay va phan hoi (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $warnings += "Port 3000 dang duoc su dung nhung khong phan hoi"
        Write-Host "   [WARN] Port 3000 dang duoc su dung nhung khong phan hoi" -ForegroundColor Yellow
    }
} else {
    $issues += "Next.js KHONG chay tren port 3000"
    Write-Host "   [ERROR] Next.js KHONG chay tren port 3000" -ForegroundColor Red
}

Write-Host ""

# 4. Check Cloudflared Process
Write-Host "[4/8] Kiem tra Cloudflared Process..." -ForegroundColor Yellow

$cloudflaredProcess = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($cloudflaredProcess) {
    $success += "Cloudflared dang chay"
    Write-Host "   [OK] Cloudflared dang chay" -ForegroundColor Green
    Write-Host "   PID: $($cloudflaredProcess.Id)" -ForegroundColor Gray
    $uptime = [math]::Round((Get-Date).Subtract($cloudflaredProcess.StartTime).TotalMinutes, 1)
    Write-Host "   Uptime: $uptime phut" -ForegroundColor Gray
} else {
    $issues += "Cloudflared KHONG chay"
    Write-Host "   [ERROR] Cloudflared KHONG chay" -ForegroundColor Red
}

Write-Host ""

# 5. Check Tunnel List
Write-Host "[5/8] Kiem tra Tunnel trong Cloudflare..." -ForegroundColor Yellow

if (Test-Path "cloudflared.exe") {
    try {
        $tunnelList = & .\cloudflared.exe tunnel list 2>&1
        
        if ($tunnelList -match "ncskit") {
            $success += "Tunnel 'ncskit' ton tai trong Cloudflare"
            Write-Host "   [OK] Tunnel 'ncskit' ton tai trong Cloudflare" -ForegroundColor Green
        } else {
            $warnings += "Tunnel 'ncskit' khong tim thay trong danh sach"
            Write-Host "   [WARN] Tunnel 'ncskit' khong tim thay trong danh sach" -ForegroundColor Yellow
        }
    } catch {
        $warnings += "Khong the kiem tra tunnel list"
        Write-Host "   [WARN] Khong the kiem tra tunnel list" -ForegroundColor Yellow
    }
} else {
    $warnings += "Khong the kiem tra (cloudflared.exe khong ton tai)"
}

Write-Host ""

# 6. Check DNS
Write-Host "[6/8] Kiem tra DNS Configuration..." -ForegroundColor Yellow

try {
    $dnsNcskit = Resolve-DnsName "ncskit.org" -Type CNAME -ErrorAction SilentlyContinue
    if ($dnsNcskit) {
        $target = $dnsNcskit[0].NameHost
        if ($target -match "cfargotunnel\.com") {
            $success += "DNS ncskit.org da duoc cau hinh"
            Write-Host "   [OK] DNS ncskit.org da duoc cau hinh" -ForegroundColor Green
            Write-Host "   Points to: $target" -ForegroundColor Gray
        } else {
            $warnings += "DNS ncskit.org khong tro den Cloudflare Tunnel"
            Write-Host "   [WARN] DNS ncskit.org khong tro den Cloudflare Tunnel" -ForegroundColor Yellow
        }
    } else {
        $warnings += "Khong the resolve DNS cho ncskit.org"
        Write-Host "   [WARN] Khong the resolve DNS cho ncskit.org" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Khong the kiem tra DNS"
    Write-Host "   [WARN] Khong the kiem tra DNS" -ForegroundColor Yellow
}

Write-Host ""

# 7. Check PostgreSQL
Write-Host "[7/8] Kiem tra PostgreSQL (port 5432)..." -ForegroundColor Yellow

$postgresPort = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue

if ($postgresPort) {
    $success += "PostgreSQL dang chay tren port 5432"
    Write-Host "   [OK] PostgreSQL dang chay tren port 5432" -ForegroundColor Green
} else {
    $warnings += "PostgreSQL khong chay tren port 5432"
    Write-Host "   [WARN] PostgreSQL khong chay tren port 5432" -ForegroundColor Yellow
}

Write-Host ""

# 8. Check Frontend Folder
Write-Host "[8/8] Kiem tra Frontend Folder..." -ForegroundColor Yellow

if (Test-Path "frontend") {
    $success += "Frontend folder ton tai"
    Write-Host "   [OK] Frontend folder ton tai" -ForegroundColor Green
    
    if (Test-Path "frontend\package.json") {
        $success += "Frontend co package.json"
        Write-Host "   [OK] Frontend co package.json" -ForegroundColor Green
    } else {
        $warnings += "Frontend khong co package.json"
    }
} else {
    $issues += "Frontend folder KHONG TON TAI"
    Write-Host "   [ERROR] Frontend folder KHONG TON TAI" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TONG KET KIEM TRA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Thanh cong: $($success.Count)" -ForegroundColor Green
Write-Host "Canh bao: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "Loi: $($issues.Count)" -ForegroundColor Red
Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "TAT CA DEU ON! Tunnel san sang hoat dong." -ForegroundColor Green
} elseif ($issues.Count -eq 0) {
    Write-Host "Khong co loi nghiem trong, nhung co mot so canh bao." -ForegroundColor Yellow
} else {
    Write-Host "CO LOI CAN KHAC PHUC:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

