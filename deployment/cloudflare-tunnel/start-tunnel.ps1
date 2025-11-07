# Start Cloudflare Tunnel manually (for testing)
# Use this for development/testing before setting up as service

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Start Cloudflare Tunnel" -ForegroundColor Cyan
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

Write-Host "Starting tunnel: $TUNNEL_NAME" -ForegroundColor Yellow
Write-Host "Config: $CONFIG_FILE" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Run tunnel
    cloudflared tunnel --config $CONFIG_FILE run $TUNNEL_NAME
} catch {
    Write-Host ""
    Write-Host "✗ Tunnel stopped!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
