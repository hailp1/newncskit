<#
.SYNOPSIS
  Reset and restart the entire local stack (Supabase, backend, frontend build artifacts).

.DESCRIPTION
  - Stops both docker-compose stacks (Supabase + backend/R/Redis).
  - Removes legacy ncskit-frontend containers that still occupy port 3000.
  - Cleans the frontend `.next` cache (and optionally node_modules).
  - Reinstalls frontend dependencies (unless -SkipInstall is provided).
  - Rebuilds Supabase self-hosted stack and backend stack.
  - Prints reminders to restart the frontend dev server manually.

.PARAMETER SkipInstall
  Skips `npm install` for the frontend (useful if you already installed).
#>
param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Write-Step($message) {
  Write-Host "`n==== $message ====" -ForegroundColor Cyan
}

Set-Location $root

# Stop docker stacks
Write-Step "Stopping Supabase stack"
docker compose -f docker-compose.supabase.yml down | Out-Null

Write-Step "Stopping backend stack"
docker compose -f config/docker-compose.yml down | Out-Null

# Remove legacy frontend containers keeping port 3000 busy
Write-Step "Cleaning legacy frontend containers"
$legacy = docker ps -a --filter "name=ncskit-frontend" -q
if ($legacy) {
  docker stop $legacy | Out-Null
  docker rm $legacy | Out-Null
}

# Clean frontend build artifacts
$frontendPath = Join-Path $root "frontend"
Set-Location $frontendPath

Write-Step "Cleaning frontend build assets"
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

if (-not $SkipInstall) {
  Write-Step "Installing frontend dependencies"
  npm install
}

Write-Step "Building frontend (optional)"
try {
  npm run build | Out-Null
} catch {
  Write-Warning "Next.js build failed: $($_.Exception.Message). Fix issues then re-run this script."
}

# Restart stacks
Set-Location $root
Write-Step "Starting Supabase stack"
docker compose -f docker-compose.supabase.yml up -d --build

Write-Step "Starting backend/R stack"
docker compose -f config/docker-compose.yml up -d --build

Write-Step "All services restarted"
Write-Host "Front-end dev server is not auto-started. Run the following when you're ready:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow

