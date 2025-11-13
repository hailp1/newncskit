# ============================================
# NCSKIT Production Build & Deploy Script
# Build production và deploy lên ncskit.org bằng Cloudflare Tunnel
# ============================================

param(
    [switch]$SkipBuild,
    [switch]$SkipTunnel,
    [switch]$SkipDatabase,
    [switch]$ServiceMode
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 NCSKIT PRODUCTION BUILD & DEPLOY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Step 1: Pre-deployment Checks
# ============================================
Write-Host "📋 Step 1: Pre-deployment Checks" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js không được tìm thấy!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm không được tìm thấy!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# Check cloudflared
if (-not $SkipTunnel) {
    $cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cloudflaredPath) {
        # Check if cloudflared.exe exists in current directory
        if (Test-Path "cloudflared.exe") {
            Write-Host "✅ cloudflared.exe found in current directory" -ForegroundColor Green
        } else {
            Write-Host "❌ cloudflared không được tìm thấy!" -ForegroundColor Red
            Write-Host "Vui lòng cài đặt cloudflared hoặc sử dụng flag -SkipTunnel" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✅ cloudflared found" -ForegroundColor Green
    }
}

# Check cloudflared config
if (-not $SkipTunnel) {
    if (-not (Test-Path "cloudflared-config.yml")) {
        Write-Host "❌ cloudflared-config.yml không tồn tại!" -ForegroundColor Red
        Write-Host "Vui lòng tạo file cấu hình Cloudflare Tunnel" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ cloudflared-config.yml found" -ForegroundColor Green
}

# Check frontend directory
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Thư mục frontend không tồn tại!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend directory found" -ForegroundColor Green

Write-Host ""

# ============================================
# Step 2: Stop Running Services
# ============================================
Write-Host "🛑 Step 2: Dừng các services đang chạy" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

# Stop processes on port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "Đang dừng process trên port 3000..." -ForegroundColor Yellow
    $port3000 | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3000 đã được giải phóng" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Port 3000 đang trống" -ForegroundColor Gray
}

# Stop Next.js dev processes
$nextProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        $cmdLine -match "next"
    } catch {
        $false
    }
}

if ($nextProcesses) {
    Write-Host "Đang dừng Next.js processes..." -ForegroundColor Yellow
    $nextProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Next.js processes đã được dừng" -ForegroundColor Green
}

# Stop cloudflared processes
$cloudflaredProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    Write-Host "Đang dừng Cloudflare Tunnel..." -ForegroundColor Yellow
    $cloudflaredProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ Cloudflare Tunnel đã được dừng" -ForegroundColor Green
}

Write-Host ""

# ============================================
# Step 3: Build Production
# ============================================
if (-not $SkipBuild) {
    Write-Host "🔨 Step 3: Build Production" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    Set-Location frontend
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Cài đặt dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Cài đặt dependencies thất bại!" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        Write-Host "✅ Dependencies đã được cài đặt" -ForegroundColor Green
    } else {
        Write-Host "✅ node_modules đã tồn tại" -ForegroundColor Green
    }
    
    # Generate Prisma Client
    Write-Host "🔧 Generate Prisma Client..." -ForegroundColor Yellow
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Prisma generate có lỗi, tiếp tục..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Prisma Client đã được generate" -ForegroundColor Green
    }
    
    # Build production
    Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
    Write-Host "   (Điều này có thể mất vài phút...)" -ForegroundColor Gray
    
    $env:NODE_ENV = "production"
    $env:SKIP_TYPE_CHECK = "true"
    $env:SKIP_ENV_VALIDATION = "true"
    
    npm run build:prod
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build thất bại!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    # Check if build was successful
    if (-not (Test-Path ".next")) {
        Write-Host "❌ Build không tạo ra thư mục .next!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ Build thành công!" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "⏭️  Step 3: Build Production (SKIPPED)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 4: Database Migration (Optional)
# ============================================
if (-not $SkipDatabase) {
    Write-Host "🗄️  Step 4: Database Migration" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    $runMigration = Read-Host "Chạy database migrations? (y/n)"
    if ($runMigration -eq "y" -or $runMigration -eq "Y") {
        Set-Location frontend
        Write-Host "🔄 Running Prisma migrations..." -ForegroundColor Yellow
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Migration có lỗi!" -ForegroundColor Yellow
            $continue = Read-Host "Tiếp tục? (y/n)"
            if ($continue -ne "y" -and $continue -ne "Y") {
                Set-Location ..
                exit 1
            }
        } else {
            Write-Host "✅ Migrations đã được áp dụng" -ForegroundColor Green
        }
        Set-Location ..
    } else {
        Write-Host "⏭️  Bỏ qua migrations" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Step 4: Database Migration (SKIPPED)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 5: Start Production Server
# ============================================
Write-Host "🚀 Step 5: Khởi động Production Server" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Gray

Set-Location frontend

# Load environment variables from .env.production if exists
$envFile = ".env.production"
if (Test-Path $envFile) {
    Write-Host "📝 Loading environment variables từ .env.production..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Environment variables đã được load" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.production không tồn tại, sử dụng environment variables mặc định" -ForegroundColor Yellow
}

# Set production environment
$env:NODE_ENV = "production"

if ($ServiceMode) {
    Write-Host "📦 Cài đặt PM2..." -ForegroundColor Yellow
    npm install -g pm2 --silent
    
    Write-Host "🚀 Khởi động Next.js với PM2..." -ForegroundColor Yellow
    pm2 delete ncskit-prod -s 2>$null
    pm2 start npm --name "ncskit-prod" -- start
    pm2 save
    
    Write-Host "✅ Production server đã khởi động với PM2" -ForegroundColor Green
    Write-Host "📊 Xem logs: pm2 logs ncskit-prod" -ForegroundColor Gray
    Write-Host "🛑 Dừng server: pm2 stop ncskit-prod" -ForegroundColor Gray
} else {
    Write-Host "🚀 Khởi động Next.js production server..." -ForegroundColor Yellow
    Write-Host "   (Server sẽ chạy trong cửa sổ PowerShell riêng)" -ForegroundColor Gray
    
    $frontendFullPath = (Get-Location).Path
    
    # Load .env.production into the new PowerShell session
    $envLoadScript = ""
    if (Test-Path "$frontendFullPath\.env.production") {
        $envLoadScript = "Get-Content '$frontendFullPath\.env.production' | ForEach-Object { if (`$_ -match '^\s*([^#][^=]+)=(.*)$') { `$key = `$matches[1].Trim(); `$value = `$matches[2].Trim(); [Environment]::SetEnvironmentVariable(`$key, `$value, 'Process') } }; "
    }
    
    $command = "cd '$frontendFullPath'; $envLoadScript`$env:NODE_ENV='production'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'NEXT.JS PRODUCTION SERVER' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Environment Variables:' -ForegroundColor Yellow; Write-Host '  NEXTAUTH_URL: ' -NoNewline; Write-Host `$env:NEXTAUTH_URL -ForegroundColor Gray; Write-Host '  NEXT_PUBLIC_APP_URL: ' -NoNewline; Write-Host `$env:NEXT_PUBLIC_APP_URL -ForegroundColor Gray; Write-Host ''; Write-Host 'Starting production server...' -ForegroundColor Yellow; Write-Host 'Local: http://localhost:3000' -ForegroundColor Green; Write-Host 'Public: https://ncskit.org' -ForegroundColor Green; Write-Host 'OAuth Callback: https://ncskit.org/api/auth/callback/google' -ForegroundColor Green; Write-Host ''; npm start"
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        $command
    ) -WindowStyle Normal
    
    Write-Host "✅ Production server dang khoi dong..." -ForegroundColor Green
    Write-Host "⏳ Doi server khoi dong (15 giay)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Check if server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Production server đang chạy (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Server có thể chưa sẵn sàng, kiểm tra lại sau..." -ForegroundColor Yellow
    }
}

Set-Location ..

Write-Host ""

# ============================================
# Step 6: Start Cloudflare Tunnel
# ============================================
if (-not $SkipTunnel) {
    Write-Host "🌐 Step 6: Khởi động Cloudflare Tunnel" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Gray
    
    # Wait a bit more for server to be fully ready
    Write-Host "⏳ Doi server san sang (5 giay)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check if server is accessible
    $serverReady = $false
    for ($i = 0; $i -lt 6; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            $serverReady = $true
            break
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $serverReady) {
        Write-Host "⚠️  Server chưa sẵn sàng, nhưng vẫn sẽ khởi động tunnel..." -ForegroundColor Yellow
    }
    
    # Determine cloudflared path
    $cloudflaredCmd = "cloudflared"
    if (Test-Path "cloudflared.exe") {
        $cloudflaredCmd = ".\cloudflared.exe"
    }
    
    if ($ServiceMode) {
        Write-Host "📦 Cài đặt Cloudflare Tunnel như Windows Service..." -ForegroundColor Yellow
        & $cloudflaredCmd service install
        
        Write-Host "🚀 Khởi động Cloudflare Tunnel service..." -ForegroundColor Yellow
        sc.exe start cloudflared
        
        Write-Host "✅ Cloudflare Tunnel service đã khởi động" -ForegroundColor Green
        Write-Host "📊 Kiểm tra status: sc query cloudflared" -ForegroundColor Gray
        Write-Host "🛑 Dừng service: sc stop cloudflared" -ForegroundColor Gray
    } else {
        Write-Host "🚀 Khởi động Cloudflare Tunnel..." -ForegroundColor Yellow
        Write-Host "   (Tunnel sẽ chạy trong cửa sổ PowerShell riêng)" -ForegroundColor Gray
        
        $configPath = (Resolve-Path "cloudflared-config.yml").Path
        
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$((Get-Location).Path)'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'CLOUDFLARE TUNNEL' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Starting Cloudflare Tunnel...' -ForegroundColor Yellow; Write-Host 'Your site will be available at:' -ForegroundColor Green; Write-Host '  https://ncskit.org' -ForegroundColor White; Write-Host '  https://www.ncskit.org' -ForegroundColor White; Write-Host ''; $cloudflaredCmd tunnel --config '$configPath' run"
        ) -WindowStyle Normal
        
        Write-Host "✅ Cloudflare Tunnel đang khởi động..." -ForegroundColor Green
        Write-Host "⏳ Doi tunnel ket noi (10 giay)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
} else {
    Write-Host "⏭️  Step 6: Cloudflare Tunnel (SKIPPED)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Deployment Complete
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Website của bạn đã sẵn sàng tại:" -ForegroundColor Yellow
Write-Host "   https://ncskit.org" -ForegroundColor White
Write-Host "   https://www.ncskit.org" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Local URL:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Yellow
if ($ServiceMode) {
    Write-Host "   Next.js: pm2 logs ncskit-prod" -ForegroundColor White
    Write-Host "   Tunnel: sc query cloudflared" -ForegroundColor White
} else {
    Write-Host "   Next.js và Tunnel đang chạy trong các cửa sổ PowerShell riêng" -ForegroundColor White
    Write-Host "   Kiểm tra logs trong các cửa sổ đó" -ForegroundColor White
}
Write-Host ""
Write-Host "🛑 Để dừng services:" -ForegroundColor Yellow
if ($ServiceMode) {
    Write-Host "   pm2 stop ncskit-prod" -ForegroundColor White
    Write-Host "   sc stop cloudflared" -ForegroundColor White
} else {
    Write-Host "   Nhấn Ctrl+C trong các cửa sổ PowerShell của Next.js và Tunnel" -ForegroundColor White
}
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Kiểm tra website: https://ncskit.org" -ForegroundColor White
Write-Host "   2. Kiểm tra logs để đảm bảo không có lỗi" -ForegroundColor White
Write-Host "   3. Thiết lập monitoring & alerts" -ForegroundColor White
Write-Host "   4. Cấu hình Cloudflare WAF rules" -ForegroundColor White
Write-Host ""

