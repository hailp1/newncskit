# Configure DNS for Cloudflare Tunnel
# This script sets up DNS records for the tunnel

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Configure DNS for Tunnel" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$TUNNEL_NAME = "ncskit-analytics"
$DOMAIN = "ncskit.org"

# Check if tunnel exists
$tunnelInfo = cloudflared tunnel list | Select-String $TUNNEL_NAME

if (-not $tunnelInfo) {
    Write-Host "✗ Tunnel '$TUNNEL_NAME' not found!" -ForegroundColor Red
    Write-Host "Please run .\create-tunnel.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Configuring DNS routes..." -ForegroundColor Yellow
Write-Host ""

try {
    # Configure analytics subdomain
    Write-Host "Setting up analytics.$DOMAIN..." -ForegroundColor Yellow
    cloudflared tunnel route dns $TUNNEL_NAME "analytics.$DOMAIN"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ analytics.$DOMAIN configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to configure analytics.$DOMAIN" -ForegroundColor Yellow
        Write-Host "   You may need to configure this manually in Cloudflare Dashboard" -ForegroundColor Gray
    }
    Write-Host ""

    # Ask if user wants to configure main domain
    $response = Read-Host "Do you want to route main domain ($DOMAIN) through tunnel? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Setting up $DOMAIN..." -ForegroundColor Yellow
        cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $DOMAIN configured" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to configure $DOMAIN" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ DNS Configuration Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configured routes:" -ForegroundColor Cyan
    Write-Host "  https://analytics.$DOMAIN -> R Analytics API" -ForegroundColor White
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "  https://$DOMAIN -> Next.js Frontend" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Note: DNS propagation may take a few minutes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the tunnel: .\start-tunnel.ps1" -ForegroundColor White
    Write-Host "2. Test the connection: .\test-tunnel.ps1" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "✗ DNS configuration failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual configuration:" -ForegroundColor Yellow
    Write-Host "1. Go to Cloudflare Dashboard -> DNS" -ForegroundColor White
    Write-Host "2. Add CNAME record:" -ForegroundColor White
    Write-Host "   Name: analytics" -ForegroundColor Gray
    Write-Host "   Target: $TUNNEL_NAME.cfargotunnel.com" -ForegroundColor Gray
    exit 1
}
