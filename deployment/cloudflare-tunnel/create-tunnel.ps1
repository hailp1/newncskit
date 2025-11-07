# Create Cloudflare Tunnel for NCSKIT Analytics
# This script creates a new tunnel and generates configuration

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Create Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TUNNEL_NAME = "ncskit-analytics"
$CONFIG_DIR = ".\config"
$CONFIG_FILE = "$CONFIG_DIR\tunnel-config.yml"

# Check if cloudflared is authenticated
$certPath = "$env:USERPROFILE\.cloudflared\cert.pem"
if (-not (Test-Path $certPath)) {
    Write-Host "✗ Cloudflared is not authenticated!" -ForegroundColor Red
    Write-Host "Please run .\authenticate-cloudflared.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating tunnel: $TUNNEL_NAME" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if tunnel already exists
    $existingTunnel = cloudflared tunnel list | Select-String $TUNNEL_NAME
    
    if ($existingTunnel) {
        Write-Host "⚠️  Tunnel '$TUNNEL_NAME' already exists!" -ForegroundColor Yellow
        Write-Host ""
        $response = Read-Host "Do you want to delete and recreate it? (y/N)"
        
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "Deleting existing tunnel..." -ForegroundColor Yellow
            cloudflared tunnel delete $TUNNEL_NAME
            Write-Host "✓ Deleted" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "Using existing tunnel..." -ForegroundColor Yellow
        }
    }

    # Create tunnel if it doesn't exist
    if (-not $existingTunnel -or ($response -eq "y" -or $response -eq "Y")) {
        Write-Host "Creating new tunnel..." -ForegroundColor Yellow
        cloudflared tunnel create $TUNNEL_NAME
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create tunnel"
        }
        
        Write-Host "✓ Tunnel created successfully!" -ForegroundColor Green
        Write-Host ""
    }

    # Get tunnel ID
    Write-Host "Getting tunnel information..." -ForegroundColor Yellow
    $tunnelInfo = cloudflared tunnel list | Select-String $TUNNEL_NAME
    $tunnelId = ($tunnelInfo -split '\s+')[0]
    
    Write-Host "✓ Tunnel ID: $tunnelId" -ForegroundColor Green
    Write-Host ""

    # Create config directory if it doesn't exist
    if (-not (Test-Path $CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $CONFIG_DIR -Force | Out-Null
    }

    # Generate tunnel configuration
    Write-Host "Generating tunnel configuration..." -ForegroundColor Yellow
    
    $configContent = @"
tunnel: $tunnelId
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

# Ingress rules - route traffic to local services
ingress:
  # Route analytics subdomain to R Analytics Docker container
  - hostname: analytics.ncskit.org
    service: http://localhost:8000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      
  # Route main domain to Next.js frontend (if needed)
  - hostname: ncskit.org
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
      
  # Catch-all rule (required)
  - service: http_status:404

# Logging
loglevel: info
logfile: ./logs/cloudflared.log

# Connection settings
protocol: quic
retries: 3
"@

    $configContent | Out-File -FilePath $CONFIG_FILE -Encoding UTF8
    Write-Host "✓ Configuration saved to: $CONFIG_FILE" -ForegroundColor Green
    Write-Host ""

    # Display configuration
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Tunnel Configuration" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tunnel Name: $TUNNEL_NAME" -ForegroundColor White
    Write-Host "Tunnel ID: $tunnelId" -ForegroundColor White
    Write-Host "Config File: $CONFIG_FILE" -ForegroundColor White
    Write-Host ""
    Write-Host "Routes:" -ForegroundColor Cyan
    Write-Host "  analytics.ncskit.org -> http://localhost:8000 (R Analytics)" -ForegroundColor White
    Write-Host "  ncskit.org -> http://localhost:3000 (Next.js)" -ForegroundColor White
    Write-Host ""

    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Tunnel Created Successfully!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure DNS in Cloudflare Dashboard:" -ForegroundColor White
    Write-Host "   - Go to DNS settings for ncskit.org" -ForegroundColor Gray
    Write-Host "   - Add CNAME record: analytics -> $tunnelId.cfargotunnel.com" -ForegroundColor Gray
    Write-Host "   - Add CNAME record: @ -> $tunnelId.cfargotunnel.com (optional)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Or run DNS configuration automatically:" -ForegroundColor White
    Write-Host "   cloudflared tunnel route dns $TUNNEL_NAME analytics.ncskit.org" -ForegroundColor Gray
    Write-Host "   cloudflared tunnel route dns $TUNNEL_NAME ncskit.org" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test the tunnel:" -ForegroundColor White
    Write-Host "   .\test-tunnel.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Setup auto-start service:" -ForegroundColor White
    Write-Host "   .\setup-tunnel-service.ps1" -ForegroundColor Gray

} catch {
    Write-Host ""
    Write-Host "✗ Failed to create tunnel!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
