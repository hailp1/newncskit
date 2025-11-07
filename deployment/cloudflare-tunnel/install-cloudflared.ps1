# Install Cloudflared CLI on Windows
# This script downloads and installs cloudflared

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Cloudflared Installation Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if cloudflared is already installed
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue

if ($cloudflaredPath) {
    Write-Host "✓ Cloudflared is already installed!" -ForegroundColor Green
    Write-Host "  Location: $($cloudflaredPath.Source)" -ForegroundColor Gray
    Write-Host "  Version: " -NoNewline -ForegroundColor Gray
    cloudflared --version
    Write-Host ""
    
    $response = Read-Host "Do you want to reinstall? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Download URL for Windows
$downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$installPath = "$env:ProgramFiles\cloudflared"
$exePath = "$installPath\cloudflared.exe"

Write-Host "Downloading cloudflared..." -ForegroundColor Yellow
Write-Host "  From: $downloadUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Create installation directory
    if (-not (Test-Path $installPath)) {
        New-Item -ItemType Directory -Path $installPath -Force | Out-Null
    }

    # Download cloudflared
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    
    Write-Host "✓ Download complete!" -ForegroundColor Green
    Write-Host ""

    # Add to PATH if not already there
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$installPath*") {
        Write-Host "Adding cloudflared to system PATH..." -ForegroundColor Yellow
        [Environment]::SetEnvironmentVariable(
            "Path",
            "$currentPath;$installPath",
            "Machine"
        )
        Write-Host "✓ Added to PATH" -ForegroundColor Green
        Write-Host "  Note: You may need to restart your terminal" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Installation Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installed version:" -ForegroundColor Cyan
    & $exePath --version
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your terminal to use 'cloudflared' command" -ForegroundColor White
    Write-Host "2. Run: .\authenticate-cloudflared.ps1" -ForegroundColor White
    Write-Host "3. Follow the authentication instructions" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation:" -ForegroundColor Yellow
    Write-Host "1. Download from: $downloadUrl" -ForegroundColor White
    Write-Host "2. Save to: $exePath" -ForegroundColor White
    Write-Host "3. Add to PATH: $installPath" -ForegroundColor White
    exit 1
}
