# Script to add environment variables to Vercel
# This script adds all required environment variables from .env.local to Vercel

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Environment Variables to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
Set-Location frontend

# Read .env.local file
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.local"

# Parse environment variables
$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Cyan
Write-Host ""

# Required variables
$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_ANALYTICS_URL",
    "NEXT_PUBLIC_APP_URL"
)

# Add each variable to Vercel
foreach ($key in $requiredVars) {
    if ($envVars.ContainsKey($key)) {
        $value = $envVars[$key]
        
        Write-Host "Adding $key..." -ForegroundColor Yellow
        
        # For production, use production values
        if ($key -eq "NEXT_PUBLIC_ANALYTICS_URL") {
            # Production: Cloudflare Tunnel URL
            $prodValue = "https://analytics.ncskit.app"
            Write-Host "  Production: $prodValue" -ForegroundColor Gray
            echo $prodValue | npx vercel env add $key production 2>$null
            
            # Preview/Dev: localhost
            Write-Host "  Preview/Dev: $value" -ForegroundColor Gray
            echo $value | npx vercel env add $key preview development 2>$null
        }
        elseif ($key -eq "NEXT_PUBLIC_APP_URL") {
            # Production: Vercel URL
            $prodValue = "https://frontend-hailp1s-projects.vercel.app"
            Write-Host "  Production: $prodValue" -ForegroundColor Gray
            echo $prodValue | npx vercel env add $key production 2>$null
            
            # Preview/Dev: localhost
            Write-Host "  Preview/Dev: $value" -ForegroundColor Gray
            echo $value | npx vercel env add $key preview development 2>$null
        }
        else {
            # Same value for all environments
            Write-Host "  Value: $value" -ForegroundColor Gray
            echo $value | npx vercel env add $key production preview development 2>$null
        }
        
        Write-Host "✅ Added $key" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Host "⚠️  $key not found in .env.local" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Variables Added!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to add sensitive keys manually:" -ForegroundColor Yellow
Write-Host "  1. SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  2. ANALYTICS_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Add them with:" -ForegroundColor Cyan
Write-Host "  npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development" -ForegroundColor Gray
Write-Host "  npx vercel env add ANALYTICS_API_KEY production preview development" -ForegroundColor Gray
Write-Host ""
Write-Host "Or in Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "  https://vercel.com/hailp1s-projects/frontend/settings/environment-variables" -ForegroundColor Gray
Write-Host ""

Set-Location ..
