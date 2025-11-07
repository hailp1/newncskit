# Authenticate Cloudflared with Cloudflare account
# This script initiates the authentication flow

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Cloudflare Tunnel Authentication" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if cloudflared is installed
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflaredPath) {
    Write-Host "✗ Cloudflared is not installed!" -ForegroundColor Red
    Write-Host "Please run .\install-cloudflared.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting authentication process..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. A browser window will open" -ForegroundColor White
Write-Host "2. Log in to your Cloudflare account" -ForegroundColor White
Write-Host "3. Authorize the tunnel" -ForegroundColor White
Write-Host "4. Return to this terminal when complete" -ForegroundColor White
Write-Host ""

$response = Read-Host "Ready to proceed? (Y/n)"
if ($response -eq "n" -or $response -eq "N") {
    Write-Host "Authentication cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Opening browser for authentication..." -ForegroundColor Yellow
Write-Host ""

try {
    # Run cloudflared login
    cloudflared tunnel login

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==================================" -ForegroundColor Green
        Write-Host "✓ Authentication Successful!" -ForegroundColor Green
        Write-Host "==================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credentials saved to:" -ForegroundColor Gray
        Write-Host "  $env:USERPROFILE\.cloudflared\cert.pem" -ForegroundColor White
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: .\create-tunnel.ps1" -ForegroundColor White
        Write-Host "2. Configure your tunnel" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ Authentication failed!" -ForegroundColor Red
        Write-Host "Please try again or check your Cloudflare account" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Authentication error!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
