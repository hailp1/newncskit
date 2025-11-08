# Stop Cloudflare Tunnel
# Stops the cloudflared process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stop Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as service
$service = Get-Service CloudflaredTunnel -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "Stopping Cloudflare Tunnel service..." -ForegroundColor Yellow
    
    if ($service.Status -eq "Running") {
        Stop-Service CloudflaredTunnel
        Write-Host "✓ Service stopped" -ForegroundColor Green
    } else {
        Write-Host "⊘ Service is not running" -ForegroundColor Gray
    }
} else {
    # Stop process
    Write-Host "Stopping Cloudflare Tunnel process..." -ForegroundColor Yellow
    
    $processes = Get-Process cloudflared -ErrorAction SilentlyContinue
    
    if ($processes) {
        foreach ($process in $processes) {
            Write-Host "  Stopping PID: $($process.Id)" -ForegroundColor White
            Stop-Process -Id $process.Id -Force
        }
        Write-Host "✓ Process(es) stopped" -ForegroundColor Green
    } else {
        Write-Host "⊘ No cloudflared process found" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Tunnel stopped successfully" -ForegroundColor Green
Write-Host ""
