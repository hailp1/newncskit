# Stop Cloudflare Tunnel service

#Requires -RunAsAdministrator

Write-Host "Stopping Cloudflare Tunnel service..." -ForegroundColor Yellow

$SERVICE_NAME = "CloudflaredTunnel"

try {
    $service = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq "Running") {
            Stop-Service -Name $SERVICE_NAME -Force
            Write-Host "✓ Tunnel service stopped" -ForegroundColor Green
        } else {
            Write-Host "Service is not running (Status: $($service.Status))" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Service not found!" -ForegroundColor Red
        Write-Host "The tunnel may not be installed as a service" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to stop service!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
