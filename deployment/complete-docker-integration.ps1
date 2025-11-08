# Complete Docker R Analytics Integration Script
# Khoi dong va kiem tra toan bo he thong Docker + Cloudflare Tunnel

param(
    [switch]$SkipBuild,
    [switch]$SkipTunnel,
    [switch]$TestOnly
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCSKIT Docker Integration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Step 1: Check Prerequisites
# ============================================

Write-Host "[1/6] Checking Prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "  [OK] Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker not found! Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check Docker is running
try {
    docker ps | Out-Null
    Write-Host "  [OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker is not running! Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check Cloudflared (if not skipping tunnel)
if (-not $SkipTunnel) {
    try {
        $cloudflaredVersion = cloudflared --version
        Write-Host "  [OK] Cloudflared: $cloudflaredVersion" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Cloudflared not found!" -ForegroundColor Yellow
        Write-Host "     Run: deployment\cloudflare-tunnel\install-cloudflared.ps1" -ForegroundColor White
        $SkipTunnel = $true
    }
}

Write-Host ""

# ============================================
# Step 2: Build Docker Image (if needed)
# ============================================

if (-not $TestOnly) {
    Write-Host "[2/6] Building Docker Image..." -ForegroundColor Yellow
    
    if ($SkipBuild) {
        Write-Host "  [SKIP] Skipping build (SkipBuild flag)" -ForegroundColor Gray
    } else {
        Push-Location r-analytics
        
        # Check if image exists
        $imageExists = docker images ncskit-r-analytics -q
        
        if ($imageExists) {
            Write-Host "  [INFO] Image exists. Rebuild? (y/N): " -ForegroundColor Yellow -NoNewline
            $rebuild = Read-Host
            if ($rebuild -ne 'y' -and $rebuild -ne 'Y') {
                Write-Host "  [SKIP] Using existing image" -ForegroundColor Gray
                Pop-Location
                Write-Host ""
            } else {
                Write-Host "  [ACTION] Building image (this may take 5-10 minutes)..." -ForegroundColor White
                docker-compose build
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  [OK] Image built successfully" -ForegroundColor Green
                } else {
                    Write-Host "  [ERROR] Build failed!" -ForegroundColor Red
                    Pop-Location
                    exit 1
                }
                
                Pop-Location
                Write-Host ""
            }
        } else {
            Write-Host "  [ACTION] Building image (this may take 5-10 minutes)..." -ForegroundColor White
            docker-compose build
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Image built successfully" -ForegroundColor Green
            } else {
                Write-Host "  [ERROR] Build failed!" -ForegroundColor Red
                Pop-Location
                exit 1
            }
            
            Pop-Location
            Write-Host ""
        }
    }
}

# ============================================
# Step 3: Start Docker Container
# ============================================

if (-not $TestOnly) {
    Write-Host "[3/6] Starting Docker Container..." -ForegroundColor Yellow
    
    Push-Location r-analytics
    
    # Check if container is already running
    $containerRunning = docker ps --filter "name=ncskit-r-analytics" --format "{{.Names}}"
    
    if ($containerRunning) {
        Write-Host "  [WARN] Container already running" -ForegroundColor Yellow
        Write-Host "  [INFO] Restart container? (y/N): " -ForegroundColor Yellow -NoNewline
        $restart = Read-Host
        if ($restart -eq 'y' -or $restart -eq 'Y') {
            Write-Host "  [ACTION] Restarting container..." -ForegroundColor White
            docker-compose restart
        } else {
            Write-Host "  [SKIP] Using existing container" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [ACTION] Starting container..." -ForegroundColor White
        docker-compose up -d
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Failed to start container!" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    }
    
    Pop-Location
    
    # Wait for container to be ready
    Write-Host "  [ACTION] Waiting for service to be ready..." -ForegroundColor White
    $maxAttempts = 12
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 5
        $attempt++
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
            if ($response.status -eq "healthy") {
                $ready = $true
                Write-Host "  [OK] Container is ready!" -ForegroundColor Green
            }
        } catch {
            Write-Host "  [WAIT] Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if (-not $ready) {
        Write-Host "  [WARN] Container started but health check failed" -ForegroundColor Yellow
        Write-Host "     Check logs: docker-compose -f r-analytics/docker-compose.yml logs" -ForegroundColor White
    }
    
    Write-Host ""
}

# ============================================
# Step 4: Start Cloudflare Tunnel
# ============================================

if (-not $TestOnly -and -not $SkipTunnel) {
    Write-Host "[4/6] Starting Cloudflare Tunnel..." -ForegroundColor Yellow
    
    # Check if tunnel is already running
    $tunnelRunning = Get-Process cloudflared -ErrorAction SilentlyContinue
    
    if ($tunnelRunning) {
        Write-Host "  [OK] Tunnel already running (PID: $($tunnelRunning.Id))" -ForegroundColor Green
    } else {
        # Check if tunnel exists
        try {
            $tunnelInfo = cloudflared tunnel info ncskit-analytics 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [ACTION] Starting tunnel..." -ForegroundColor White
                Write-Host "     Note: Tunnel will run in background" -ForegroundColor Gray
                Write-Host "     To stop: deployment\cloudflare-tunnel\stop-tunnel.ps1" -ForegroundColor Gray
                
                # Start tunnel in background
                Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "ncskit-analytics" -WindowStyle Hidden
                
                Start-Sleep -Seconds 3
                
                $tunnelRunning = Get-Process cloudflared -ErrorAction SilentlyContinue
                if ($tunnelRunning) {
                    Write-Host "  [OK] Tunnel started (PID: $($tunnelRunning.Id))" -ForegroundColor Green
                } else {
                    Write-Host "  [WARN] Tunnel may not have started" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  [WARN] Tunnel 'ncskit-analytics' not found" -ForegroundColor Yellow
                Write-Host "     Run: deployment\cloudflare-tunnel\create-tunnel.ps1" -ForegroundColor White
            }
        } catch {
            Write-Host "  [WARN] Could not check tunnel status" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# ============================================
# Step 5: Test Connections
# ============================================

Write-Host "[5/6] Testing Connections..." -ForegroundColor Yellow

$tests = @()

# Test 1: Local Docker
Write-Host "  [TEST] Testing local Docker (http://localhost:8000)..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-Host "    [OK] Local Docker: HEALTHY" -ForegroundColor Green
        $tests += @{ Name = "Local Docker"; Status = "PASS" }
    } else {
        Write-Host "    [FAIL] Local Docker: UNHEALTHY" -ForegroundColor Red
        $tests += @{ Name = "Local Docker"; Status = "FAIL" }
    }
} catch {
    Write-Host "    [FAIL] Local Docker: UNREACHABLE" -ForegroundColor Red
    $tests += @{ Name = "Local Docker"; Status = "FAIL"; Error = $_.Exception.Message }
}

# Test 2: Cloudflare Tunnel (if not skipped)
if (-not $SkipTunnel) {
    Write-Host "  [TEST] Testing Cloudflare Tunnel (https://analytics.ncskit.app)..." -ForegroundColor White
    try {
        $response = Invoke-RestMethod -Uri "https://analytics.ncskit.app/health" -TimeoutSec 10
        if ($response.status -eq "healthy") {
            Write-Host "    [OK] Cloudflare Tunnel: HEALTHY" -ForegroundColor Green
            $tests += @{ Name = "Cloudflare Tunnel"; Status = "PASS" }
        } else {
            Write-Host "    [FAIL] Cloudflare Tunnel: UNHEALTHY" -ForegroundColor Red
            $tests += @{ Name = "Cloudflare Tunnel"; Status = "FAIL" }
        }
    } catch {
        Write-Host "    [WARN] Cloudflare Tunnel: UNREACHABLE" -ForegroundColor Yellow
        Write-Host "       (May need DNS propagation or tunnel configuration)" -ForegroundColor Gray
        $tests += @{ Name = "Cloudflare Tunnel"; Status = "WARN"; Error = $_.Exception.Message }
    }
}

# Test 3: Vercel Integration
Write-Host "  [TEST] Testing Vercel integration..." -ForegroundColor White
try {
    $vercelUrl = "https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/health/docker"
    $response = Invoke-RestMethod -Uri $vercelUrl -TimeoutSec 10
    if ($response.status -eq "healthy") {
        Write-Host "    [OK] Vercel Integration: HEALTHY" -ForegroundColor Green
        $tests += @{ Name = "Vercel Integration"; Status = "PASS" }
    } else {
        Write-Host "    [FAIL] Vercel Integration: UNHEALTHY" -ForegroundColor Red
        $tests += @{ Name = "Vercel Integration"; Status = "FAIL" }
    }
} catch {
    Write-Host "    [WARN] Vercel Integration: UNREACHABLE" -ForegroundColor Yellow
    Write-Host "       (Vercel may need to connect to tunnel)" -ForegroundColor Gray
    $tests += @{ Name = "Vercel Integration"; Status = "WARN"; Error = $_.Exception.Message }
}

Write-Host ""

# ============================================
# Step 6: Summary
# ============================================

Write-Host "[6/6] Integration Summary" -ForegroundColor Yellow
Write-Host ""

# Test Results Table
Write-Host "  Test Results:" -ForegroundColor White
Write-Host "  +-------------------------+----------+" -ForegroundColor Gray
Write-Host "  | Component               | Status   |" -ForegroundColor Gray
Write-Host "  +-------------------------+----------+" -ForegroundColor Gray

foreach ($test in $tests) {
    $statusColor = switch ($test.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Gray" }
    }
    
    $component = $test.Name.PadRight(23)
    $status = $test.Status.PadRight(8)
    
    Write-Host "  | " -ForegroundColor Gray -NoNewline
    Write-Host $component -NoNewline
    Write-Host " | " -ForegroundColor Gray -NoNewline
    Write-Host $status -ForegroundColor $statusColor -NoNewline
    Write-Host " |" -ForegroundColor Gray
}

Write-Host "  +-------------------------+----------+" -ForegroundColor Gray
Write-Host ""

# Service URLs
Write-Host "  Service URLs:" -ForegroundColor White
Write-Host "  * Local Docker:      http://localhost:8000" -ForegroundColor Cyan
Write-Host "  * Swagger Docs:      http://localhost:8000/__docs__/" -ForegroundColor Cyan
if (-not $SkipTunnel) {
    Write-Host "  * Public Tunnel:     https://analytics.ncskit.app" -ForegroundColor Cyan
}
Write-Host "  * Vercel Health:     https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/health/docker" -ForegroundColor Cyan
Write-Host "  * Vercel Analytics:  https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/analytics" -ForegroundColor Cyan
Write-Host ""

# Management Commands
Write-Host "  Management Commands:" -ForegroundColor White
Write-Host "  * View logs:         docker-compose -f r-analytics/docker-compose.yml logs -f" -ForegroundColor White
Write-Host "  * Stop Docker:       docker-compose -f r-analytics/docker-compose.yml down" -ForegroundColor White
if (-not $SkipTunnel) {
    Write-Host "  * Stop Tunnel:       deployment\cloudflare-tunnel\stop-tunnel.ps1" -ForegroundColor White
}
Write-Host "  * Restart All:       .\deployment\complete-docker-integration.ps1" -ForegroundColor White
Write-Host ""

# Status Summary
$passCount = ($tests | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($tests | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($tests | Where-Object { $_.Status -eq "WARN" }).Count

if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "  [SUCCESS] All systems operational!" -ForegroundColor Green
} elseif ($failCount -eq 0) {
    Write-Host "  [WARN] System operational with warnings" -ForegroundColor Yellow
} else {
    Write-Host "  [ERROR] Some systems failed - check logs above" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Return exit code based on results
if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
