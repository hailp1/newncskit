# ============================================
# NCSKIT - Start All Services Script
# Tự động khởi động: PostgreSQL, Next.js, Cloudflare Tunnel
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NCSKIT - START ALL SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================
# 0. KILL CÁC PROCESSES ĐANG DÙNG PORTS
# ============================================
Write-Host "[0/5] Giai phong ports va kill processes cu..." -ForegroundColor Yellow

# Danh sách ports cần giải phóng
$ports = @(3000, 5432, 8000, 6379)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connections) {
        Write-Host "   Dang giai phong port $port..." -ForegroundColor Yellow
        
        foreach ($conn in $connections) {
            $pid = $conn.OwningProcess
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            
            if ($process) {
                $processName = $process.ProcessName
                Write-Host "     - Kill process: $processName (PID: $pid)" -ForegroundColor Gray
                
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "       [OK] Da kill $processName" -ForegroundColor Green
                } catch {
                    Write-Host "       [WARN] Khong the kill $processName: $_" -ForegroundColor Yellow
                }
            }
        }
        
        # Đợi port được giải phóng
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   [OK] Port $port da trong" -ForegroundColor Green
    }
}

Write-Host ""

# Kill các Node.js processes cũ (có thể là Next.js cũ)
Write-Host "   Dang kill Node.js processes cu..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $count = $nodeProcesses.Count
    Write-Host "     Tim thay $count Node.js process(es)" -ForegroundColor Gray
    
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "       [OK] Da kill Node.js (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "       [WARN] Khong the kill Node.js (PID: $($proc.Id)): $_" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "     [OK] Khong co Node.js process nao" -ForegroundColor Green
}

Write-Host ""

# Kill cloudflared processes cũ
Write-Host "   Dang kill Cloudflared processes cu..." -ForegroundColor Yellow
$cloudflaredProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($cloudflaredProcesses) {
    $count = $cloudflaredProcesses.Count
    Write-Host "     Tim thay $count Cloudflared process(es)" -ForegroundColor Gray
    
    foreach ($proc in $cloudflaredProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "       [OK] Da kill Cloudflared (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "       [WARN] Khong the kill Cloudflared (PID: $($proc.Id)): $_" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "     [OK] Khong co Cloudflared process nao" -ForegroundColor Green
}

Write-Host ""

# Stop Docker containers cũ nếu có
Write-Host "   Dang stop Docker containers cu..." -ForegroundColor Yellow

$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if ($dockerRunning) {
    if (Test-Path "docker-compose.production.yml") {
        try {
            docker-compose -f docker-compose.production.yml down 2>&1 | Out-Null
            Write-Host "     [OK] Da stop Docker containers" -ForegroundColor Green
        } catch {
            Write-Host "     [WARN] Khong the stop Docker containers: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "     [INFO] Docker khong chay, bo qua" -ForegroundColor Gray
}

Write-Host ""
Write-Host "   [OK] Da giai phong ports va kill processes cu" -ForegroundColor Green
Write-Host ""

# Đợi một chút để đảm bảo ports được giải phóng hoàn toàn
Start-Sleep -Seconds 3

# ============================================
# 1. KIỂM TRA DOCKER
# ============================================
Write-Host "[1/5] Kiem tra Docker..." -ForegroundColor Yellow

$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "   [WARN] Docker khong chay" -ForegroundColor Yellow
    Write-Host "   Dang mo Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    Write-Host "   Cho Docker khoi dong (30 giay)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "   [OK] Docker dang chay" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 2. KHỞI ĐỘNG POSTGRESQL
# ============================================
Write-Host "[2/5] Khoi dong PostgreSQL..." -ForegroundColor Yellow

$postgresPort = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue

if (-not $postgresPort) {
    Write-Host "   PostgreSQL khong chay, dang khoi dong..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.production.yml") {
        docker-compose -f docker-compose.production.yml up -d postgres 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] PostgreSQL dang khoi dong..." -ForegroundColor Green
            Write-Host "   Cho PostgreSQL san sang (10 giay)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        } else {
            Write-Host "   [WARN] Khong the khoi dong PostgreSQL qua Docker" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [WARN] Khong tim thay docker-compose.production.yml" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [OK] PostgreSQL da chay tren port 5432" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 3. BUILD VÀ KHỞI ĐỘNG NEXT.JS PRODUCTION
# ============================================
Write-Host "[3/5] Build va khoi dong Next.js Production..." -ForegroundColor Yellow

$nextjsPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $nextjsPort) {
    Write-Host "   Next.js khong chay, dang build va khoi dong production..." -ForegroundColor Yellow
    
    if (Test-Path "frontend") {
        $frontendPath = Resolve-Path "frontend"
        
        # Kiểm tra build production
        $buildPath = Join-Path $frontendPath ".next"
        $needsBuild = -not (Test-Path $buildPath)
        
        if ($needsBuild) {
            Write-Host "   [INFO] Chua co build production, dang build..." -ForegroundColor Yellow
            Write-Host "   (Co the mat 2-5 phut)" -ForegroundColor Gray
            
            Push-Location $frontendPath
            
            try {
                # Generate Prisma Client
                Write-Host "   Dang generate Prisma Client..." -ForegroundColor Gray
                & npm run db:generate 2>&1 | Out-Null
                
                # Build production
                Write-Host "   Dang build production..." -ForegroundColor Gray
                $env:NODE_ENV = "production"
                $buildOutput = & npm run build:prod 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   [OK] Build production thanh cong!" -ForegroundColor Green
                } else {
                    Write-Host "   [WARN] Build co the co loi, nhung tiep tuc..." -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   [WARN] Loi khi build: $_" -ForegroundColor Yellow
            } finally {
                Pop-Location
            }
        } else {
            Write-Host "   [OK] Build production da san sang" -ForegroundColor Green
        }
        
        # Kiểm tra .env.production
        $envProductionPath = Join-Path $frontendPath ".env.production"
        if (-not (Test-Path $envProductionPath)) {
            Write-Host "   [WARN] .env.production khong ton tai, dang tao..." -ForegroundColor Yellow
            
            $productionEnv = @"
NODE_ENV=production
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
"@
            $productionEnv | Out-File -FilePath $envProductionPath -Encoding UTF8
            Write-Host "   [OK] Da tao .env.production" -ForegroundColor Green
        }
        
        # Khởi động Next.js Production trong window mới
        Write-Host "   Dang mo cua so PowerShell moi cho Next.js Production..." -ForegroundColor Yellow
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; `$env:NODE_ENV='production'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'NEXT.JS PRODUCTION SERVER' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Starting production server...' -ForegroundColor Yellow; Write-Host 'URL: http://localhost:3000' -ForegroundColor Green; Write-Host 'Public: https://ncskit.org' -ForegroundColor Green; Write-Host ''; npm start" -WindowStyle Normal
        
        Write-Host "   Cho Next.js production khoi dong (15 giay)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Kiểm tra lại
        $nextjsPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($nextjsPort) {
            Write-Host "   [OK] Next.js da khoi dong" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Next.js co the chua san sang, vui long kiem tra lai" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [ERROR] Khong tim thay thu muc frontend" -ForegroundColor Red
    }
} else {
    Write-Host "   [OK] Next.js da chay tren port 3000" -ForegroundColor Green
    
    # Kiểm tra xem có phản hồi không
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   [OK] Next.js phan hoi thanh cong (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   [WARN] Port 3000 dang duoc su dung nhung khong phan hoi" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# 4. KHỞI ĐỘNG CLOUDFLARE TUNNEL
# ============================================
Write-Host "[4/5] Khoi dong Cloudflare Tunnel..." -ForegroundColor Yellow

# Kiểm tra config
if (-not (Test-Path "cloudflared-config.yml")) {
    Write-Host "   [ERROR] Khong tim thay cloudflared-config.yml" -ForegroundColor Red
    Write-Host "   Chay: .\setup-tunnel.ps1" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra credentials
$config = Get-Content "cloudflared-config.yml" -Raw
if ($config -match "credentials-file:\s+(.+)") {
    $credPath = $matches[1].Trim()
    if (-not (Test-Path $credPath)) {
        Write-Host "   [ERROR] Credentials file khong ton tai: $credPath" -ForegroundColor Red
        Write-Host "   Chay: .\cloudflared.exe tunnel login" -ForegroundColor Yellow
        exit 1
    }
}

# Kiểm tra xem cloudflared đã chạy chưa
$cloudflaredProcess = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($cloudflaredProcess) {
    Write-Host "   [INFO] Cloudflared da chay (PID: $($cloudflaredProcess.Id))" -ForegroundColor Green
    Write-Host "   Neu can restart, dung: Stop-Process -Name cloudflared" -ForegroundColor Gray
} else {
    Write-Host "   Dang khoi dong Cloudflare Tunnel..." -ForegroundColor Yellow
    
    if (Test-Path "cloudflared.exe") {
        # Khởi động tunnel trong window mới
        $configPath = Resolve-Path "cloudflared-config.yml"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Cloudflare Tunnel...' -ForegroundColor Cyan; .\cloudflared.exe tunnel --config '$configPath' run ncskit" -WindowStyle Normal
        
        Write-Host "   [OK] Cloudflare Tunnel dang khoi dong trong cua so moi" -ForegroundColor Green
        Write-Host "   Cho tunnel ket noi (5 giay)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "   [ERROR] Khong tim thay cloudflared.exe" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 5. KIỂM TRA TẤT CẢ SERVICES
# ============================================
Write-Host "[5/5] Kiem tra cac services..." -ForegroundColor Yellow
Write-Host ""

$allOk = $true

# Kiểm tra PostgreSQL
$postgresCheck = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($postgresCheck) {
    Write-Host "   [OK] PostgreSQL: Port 5432" -ForegroundColor Green
} else {
    Write-Host "   [WARN] PostgreSQL: Chua chay" -ForegroundColor Yellow
    $allOk = $false
}

# Kiểm tra Next.js
$nextjsCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($nextjsCheck) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   [OK] Next.js: http://localhost:3000 (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   [WARN] Next.js: Port 3000 dang duoc su dung nhung khong phan hoi" -ForegroundColor Yellow
        $allOk = $false
    }
} else {
    Write-Host "   [WARN] Next.js: Chua chay" -ForegroundColor Yellow
    $allOk = $false
}

# Kiểm tra Cloudflare Tunnel
$tunnelCheck = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelCheck) {
    Write-Host "   [OK] Cloudflare Tunnel: Dang chay (PID: $($tunnelCheck.Id))" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Cloudflare Tunnel: Chua chay" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# ============================================
# TỔNG KẾT
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TONG KET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allOk) {
    Write-Host "✅ TAT CA SERVICES DA KHOI DONG THANH CONG!" -ForegroundColor Green
} else {
    Write-Host "⚠️  CO MOT SO SERVICES CHUA SAN SANG" -ForegroundColor Yellow
    Write-Host "   Vui long kiem tra lai cac services tren" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Cac services:" -ForegroundColor Green
Write-Host "  - PostgreSQL: Port 5432" -ForegroundColor White
Write-Host "  - Next.js: http://localhost:3000" -ForegroundColor White
Write-Host "  - Cloudflare Tunnel: Dang chay" -ForegroundColor White
Write-Host ""

Write-Host "Truy cap website:" -ForegroundColor Yellow
Write-Host "  - Local: http://localhost:3000" -ForegroundColor White
Write-Host "  - Public: https://ncskit.org" -ForegroundColor White
Write-Host "  - Public: https://www.ncskit.org" -ForegroundColor White
Write-Host ""

Write-Host "Luu y:" -ForegroundColor Yellow
Write-Host "  - Next.js dang chay trong cua so PowerShell rieng" -ForegroundColor Gray
Write-Host "  - Cloudflare Tunnel dang chay trong cua so PowerShell rieng" -ForegroundColor Gray
Write-Host "  - Dung Ctrl+C trong cac cua so do de dung services" -ForegroundColor Gray
Write-Host ""

Write-Host "De dung tat ca services:" -ForegroundColor Yellow
Write-Host "  - Next.js: Ctrl+C trong cua so Next.js" -ForegroundColor White
Write-Host "  - Tunnel: Ctrl+C trong cua so Tunnel" -ForegroundColor White
Write-Host "  - PostgreSQL: docker-compose -f docker-compose.production.yml down" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

