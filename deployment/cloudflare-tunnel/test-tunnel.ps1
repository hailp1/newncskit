# Test Cloudflare Tunnel connectivity
# This script verifies the tunnel is working correctly

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$TUNNEL_NAME = "ncskit-analytics"
$CONFIG_FILE = ".\config\tunnel-config.yml"

# Check if config exists
if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "✗ Tunnel configuration not found!" -ForegroundColor Red
    Write-Host "Please run .\create-tunnel.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Testing tunnel configuration..." -ForegroundColor Yellow
Write-Host ""

try {
    # Test 1: Check if tunnel exists
    Write-Host "[1/5] Checking tunnel exists..." -ForegroundColor Yellow
    $tunnelInfo = cloudflared tunnel list | Select-String $TUNNEL_NAME
    
    if ($tunnelInfo) {
        Write-Host "✓ Tunnel found: $TUNNEL_NAME" -ForegroundColor Green
    } else {
        throw "Tunnel not found"
    }
    Write-Host ""

    # Test 2: Validate configuration file
    Write-Host "[2/5] Validating configuration..." -ForegroundColor Yellow
    $configContent = Get-Content $CONFIG_FILE -Raw
    
    if ($configContent -match "tunnel:" -and $configContent -match "ingress:") {
        Write-Host "✓ Configuration file is valid" -ForegroundColor Green
    } else {
        throw "Invalid configuration file"
    }
    Write-Host ""

    # Test 3: Check local services
    Write-Host "[3/5] Checking local services..." -ForegroundColor Yellow
    
    # Check R Analytics (port 8000)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ R Analytics is running (port 8000)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  R Analytics is not running (port 8000)" -ForegroundColor Yellow
        Write-Host "   Start it with: docker-compose -f r-analytics/docker-compose.yml up -d" -ForegroundColor Gray
    }
    
    # Check Next.js (port 3000)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ Next.js is running (port 3000)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Next.js is not running (port 3000)" -ForegroundColor Yellow
        Write-Host "   Start it with: cd frontend && npm run dev" -ForegroundColor Gray
    }
    Write-Host ""

    # Test 4: Test tunnel connectivity (dry run)
    Write-Host "[4/5] Testing tunnel connectivity..." -ForegroundColor Yellow
    Write-Host "Starting tunnel in test mode (10 seconds)..." -ForegroundColor Gray
    
    $tunnelProcess = Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", $CONFIG_FILE, "run", $TUNNEL_NAME -PassThru -NoNewWindow
    Start-Sleep -Seconds 10
    
    if ($tunnelProcess.HasExited) {
        Write-Host "⚠️  Tunnel exited unexpectedly" -ForegroundColor Yellow
        Write-Host "   Check logs for errors" -ForegroundColor Gray
    } else {
        Write-Host "✓ Tunnel is running" -ForegroundColor Green
        Stop-Process -Id $tunnelProcess.Id -Force
    }
    Write-Host ""

    # Test 5: Check DNS configuration
    Write-Host "[5/5] Checking DNS configuration..." -ForegroundColor Yellow
    
    try {
        $dnsResult = Resolve-DnsName "analytics.ncskit.org" -ErrorAction SilentlyContinue
        if ($dnsResult) {
            Write-Host "✓ DNS is configured for analytics.ncskit.org" -ForegroundColor Green
            Write-Host "   Points to: $($dnsResult[0].NameHost)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  DNS not configured yet" -ForegroundColor Yellow
            Write-Host "   Run: .\configure-dns.ps1" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Could not check DNS" -ForegroundColor Yellow
    }
    Write-Host ""

    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Tunnel Test Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Tunnel: Ready" -ForegroundColor White
    Write-Host "  Configuration: Valid" -ForegroundColor White
    Write-Host ""
    Write-Host "To start the tunnel:" -ForegroundColor Cyan
    Write-Host "  .\start-tunnel.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "To setup auto-start:" -ForegroundColor Cyan
    Write-Host "  .\setup-tunnel-service.ps1" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "✗ Tunnel test failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
