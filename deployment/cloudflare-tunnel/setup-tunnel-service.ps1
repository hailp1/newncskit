# Setup Cloudflare Tunnel as Windows Service
# This script installs the tunnel as a system service for auto-start

#Requires -RunAsAdministrator

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Tunnel Windows Service" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$TUNNEL_NAME = "ncskit-analytics"
$SERVICE_NAME = "CloudflaredTunnel"
$CONFIG_FILE = (Resolve-Path ".\config\tunnel-config.yml").Path

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "✗ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if config exists
if (-not (Test-Path $CONFIG_FILE)) {
    Write-Host "✗ Tunnel configuration not found!" -ForegroundColor Red
    Write-Host "Please run .\create-tunnel.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing tunnel as Windows Service..." -ForegroundColor Yellow
Write-Host ""

try {
    # Check if service already exists
    $existingService = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    
    if ($existingService) {
        Write-Host "⚠️  Service already exists!" -ForegroundColor Yellow
        $response = Read-Host "Do you want to reinstall? (y/N)"
        
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "Stopping and removing existing service..." -ForegroundColor Yellow
            Stop-Service -Name $SERVICE_NAME -Force -ErrorAction SilentlyContinue
            cloudflared service uninstall
            Write-Host "✓ Removed existing service" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "Installation cancelled." -ForegroundColor Yellow
            exit 0
        }
    }

    # Install service
    Write-Host "Installing service..." -ForegroundColor Yellow
    cloudflared service install --config $CONFIG_FILE
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install service"
    }
    
    Write-Host "✓ Service installed" -ForegroundColor Green
    Write-Host ""

    # Start service
    Write-Host "Starting service..." -ForegroundColor Yellow
    Start-Service -Name $SERVICE_NAME
    
    # Wait a moment for service to start
    Start-Sleep -Seconds 3
    
    # Check service status
    $service = Get-Service -Name $SERVICE_NAME
    
    if ($service.Status -eq "Running") {
        Write-Host "✓ Service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Service status: $($service.Status)" -ForegroundColor Yellow
    }
    Write-Host ""

    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✓ Service Setup Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Details:" -ForegroundColor Cyan
    Write-Host "  Name: $SERVICE_NAME" -ForegroundColor White
    Write-Host "  Status: $($service.Status)" -ForegroundColor White
    Write-Host "  Startup Type: $($service.StartType)" -ForegroundColor White
    Write-Host "  Config: $CONFIG_FILE" -ForegroundColor White
    Write-Host ""
    Write-Host "Service Management:" -ForegroundColor Cyan
    Write-Host "  Start: Start-Service $SERVICE_NAME" -ForegroundColor White
    Write-Host "  Stop: Stop-Service $SERVICE_NAME" -ForegroundColor White
    Write-Host "  Restart: Restart-Service $SERVICE_NAME" -ForegroundColor White
    Write-Host "  Status: Get-Service $SERVICE_NAME" -ForegroundColor White
    Write-Host "  Uninstall: cloudflared service uninstall" -ForegroundColor White
    Write-Host ""
    Write-Host "Logs:" -ForegroundColor Cyan
    Write-Host "  Location: .\logs\cloudflared.log" -ForegroundColor White
    Write-Host "  View: Get-Content .\logs\cloudflared.log -Tail 50 -Wait" -ForegroundColor White
    Write-Host ""
    Write-Host "The tunnel will now start automatically on system boot!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "✗ Service installation failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure cloudflared is installed" -ForegroundColor White
    Write-Host "2. Verify configuration file exists" -ForegroundColor White
    Write-Host "3. Check you have administrator privileges" -ForegroundColor White
    exit 1
}
