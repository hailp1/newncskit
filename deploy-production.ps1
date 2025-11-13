# ============================================
# NCSKIT Production Deployment Script
# ============================================
# This script deploys NCSKIT to production at ncskit.org
# Run in PowerShell (Admin)
# ============================================

param(
    [switch]$SkipBuild,
    [switch]$SkipTunnel,
    [switch]$ServiceMode
)

Write-Host "🚀 NCSKIT Production Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin -and $ServiceMode) {
    Write-Host "❌ This script requires Administrator privileges for service mode!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator" -ForegroundColor Yellow
    exit 1
}

# ============================================
# Step 1: Pre-deployment Checks
# ============================================
Write-Host "Step 1: Pre-deployment Checks" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $($node.Version)" -ForegroundColor Green

# Check npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm found" -ForegroundColor Green

# Check cloudflared (if not skipping tunnel)
if (-not $SkipTunnel) {
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cloudflared) {
        Write-Host "❌ cloudflared not found!" -ForegroundColor Red
        Write-Host "Please install cloudflared first or use -SkipTunnel flag" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ cloudflared found" -ForegroundColor Green
}

# Check .env.production
if (-not (Test-Path "frontend\.env.production")) {
    Write-Host "❌ .env.production not found!" -ForegroundColor Red
    Write-Host "Please create frontend\.env.production with production settings" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ .env.production found" -ForegroundColor Green

Write-Host ""

# ============================================
# Step 2: Stop Running Services
# ============================================
Write-Host "Step 2: Stop Running Services" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

# Stop development server if running
$devProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }
if ($devProcess) {
    Write-Host "Stopping development server..." -ForegroundColor Yellow
    Stop-Process -Id $devProcess.Id -Force
    Write-Host "✅ Development server stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No development server running" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# Step 3: Build Production
# ============================================
if (-not $SkipBuild) {
    Write-Host "Step 3: Build Production" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    
    Set-Location frontend
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install --production=false
    
    Write-Host "Building production bundle..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "Step 3: Build Production (SKIPPED)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 4: Database Migration
# ============================================
Write-Host "Step 4: Database Migration" -ForegroundColor Cyan
Write-Host "--------------------------" -ForegroundColor Cyan

$migrate = Read-Host "Run database migrations? (y/n)"
if ($migrate -eq "y") {
    Set-Location frontend
    Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Migration failed! Continue anyway? (y/n)" -ForegroundColor Yellow
        $continue = Read-Host
        if ($continue -ne "y") {
            Set-Location ..
            exit 1
        }
    } else {
        Write-Host "✅ Migrations applied" -ForegroundColor Green
    }
    Set-Location ..
} else {
    Write-Host "⚠️  Skipping migrations" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 5: Start Production Server
# ============================================
Write-Host "Step 5: Start Production Server" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

Set-Location frontend

if ($ServiceMode) {
    Write-Host "Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
    
    Write-Host "Starting Next.js with PM2..." -ForegroundColor Yellow
    pm2 delete ncskit-prod -s
    pm2 start npm --name "ncskit-prod" -- start
    pm2 save
    
    Write-Host "✅ Production server started with PM2" -ForegroundColor Green
    Write-Host "View logs: pm2 logs ncskit-prod" -ForegroundColor Gray
    Write-Host "Stop server: pm2 stop ncskit-prod" -ForegroundColor Gray
} else {
    Write-Host "Starting Next.js production server..." -ForegroundColor Yellow
    Write-Host "ℹ️  Server will run in this terminal" -ForegroundColor Gray
    Write-Host "ℹ️  Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    # Start in background job
    $job = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm start
    }
    
    Write-Host "✅ Production server started (Job ID: $($job.Id))" -ForegroundColor Green
    Write-Host "View output: Receive-Job -Id $($job.Id) -Keep" -ForegroundColor Gray
    Write-Host "Stop server: Stop-Job -Id $($job.Id)" -ForegroundColor Gray
}

Set-Location ..

Write-Host ""

# ============================================
# Step 6: Setup Cloudflare Tunnel
# ============================================
if (-not $SkipTunnel) {
    Write-Host "Step 6: Setup Cloudflare Tunnel" -ForegroundColor Cyan
    Write-Host "--------------------------------" -ForegroundColor Cyan
    
    # Check if tunnel config exists
    if (-not (Test-Path "cloudflared-config.yml")) {
        Write-Host "⚠️  cloudflared-config.yml not found!" -ForegroundColor Yellow
        Write-Host "Run setup-tunnel.ps1 first to create tunnel configuration" -ForegroundColor Yellow
        $setup = Read-Host "Run setup now? (y/n)"
        
        if ($setup -eq "y") {
            .\setup-tunnel.ps1
        } else {
            Write-Host "⚠️  Skipping tunnel setup" -ForegroundColor Yellow
            Write-Host "Run manually: .\setup-tunnel.ps1" -ForegroundColor Gray
        }
    }
    
    if (Test-Path "cloudflared-config.yml") {
        if ($ServiceMode) {
            Write-Host "Installing Cloudflare Tunnel as Windows Service..." -ForegroundColor Yellow
            cloudflared service install
            
            Write-Host "Starting Cloudflare Tunnel service..." -ForegroundColor Yellow
            sc.exe start cloudflared
            
            Write-Host "✅ Cloudflare Tunnel service started" -ForegroundColor Green
            Write-Host "Check status: sc query cloudflared" -ForegroundColor Gray
            Write-Host "Stop service: sc stop cloudflared" -ForegroundColor Gray
        } else {
            Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow
            Write-Host "ℹ️  Tunnel will run in this terminal" -ForegroundColor Gray
            Write-Host "ℹ️  Press Ctrl+C to stop" -ForegroundColor Gray
            Write-Host ""
            
            # Start tunnel in background job
            $tunnelJob = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                cloudflared tunnel --config cloudflared-config.yml run ncskit
            }
            
            Write-Host "✅ Cloudflare Tunnel started (Job ID: $($tunnelJob.Id))" -ForegroundColor Green
            Write-Host "View output: Receive-Job -Id $($tunnelJob.Id) -Keep" -ForegroundColor Gray
            Write-Host "Stop tunnel: Stop-Job -Id $($tunnelJob.Id)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "Step 6: Setup Cloudflare Tunnel (SKIPPED)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Deployment Complete
# ============================================
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your site is now live at:" -ForegroundColor Yellow
Write-Host "   https://ncskit.org" -ForegroundColor White
Write-Host "   https://www.ncskit.org" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Yellow
if ($ServiceMode) {
    Write-Host "   Next.js: pm2 logs ncskit-prod" -ForegroundColor White
    Write-Host "   Tunnel: sc query cloudflared" -ForegroundColor White
} else {
    Write-Host "   Next.js: Receive-Job -Id $($job.Id) -Keep" -ForegroundColor White
    Write-Host "   Tunnel: Receive-Job -Id $($tunnelJob.Id) -Keep" -ForegroundColor White
}
Write-Host ""
Write-Host "🛑 To stop services:" -ForegroundColor Yellow
if ($ServiceMode) {
    Write-Host "   pm2 stop ncskit-prod" -ForegroundColor White
    Write-Host "   sc stop cloudflared" -ForegroundColor White
} else {
    Write-Host "   Stop-Job -Id $($job.Id)" -ForegroundColor White
    Write-Host "   Stop-Job -Id $($tunnelJob.Id)" -ForegroundColor White
}
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test your site: https://ncskit.org" -ForegroundColor White
Write-Host "   2. Monitor logs for errors" -ForegroundColor White
Write-Host "   3. Setup monitoring & alerts" -ForegroundColor White
Write-Host "   4. Configure Cloudflare WAF rules" -ForegroundColor White
Write-Host ""
