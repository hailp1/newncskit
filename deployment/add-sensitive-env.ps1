# Add sensitive environment variables with placeholder values
# You should update these in Vercel Dashboard after deployment

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Sensitive Environment Variables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Using placeholder values for now" -ForegroundColor Yellow
Write-Host "   Update these in Vercel Dashboard after deployment!" -ForegroundColor Yellow
Write-Host ""

Set-Location frontend

# Function to add env var
function Add-EnvVar {
    param(
        [string]$Name,
        [string]$Value,
        [string[]]$Environments
    )
    
    Write-Host "Adding $Name..." -ForegroundColor Yellow
    
    foreach ($env in $Environments) {
        try {
            $Value | Out-File -FilePath "temp.txt" -Encoding utf8 -NoNewline
            $result = Get-Content "temp.txt" | npx vercel env add $Name $env 2>&1
            Write-Host "  ✅ Added to $env" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  $env - may already exist" -ForegroundColor Yellow
        }
    }
    
    Remove-Item "temp.txt" -ErrorAction SilentlyContinue
    Write-Host ""
}

# Generate a random API key for ANALYTICS_API_KEY
$randomKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "Generated random ANALYTICS_API_KEY: $randomKey" -ForegroundColor Cyan
Write-Host ""

# Add ANALYTICS_API_KEY
Add-EnvVar -Name "ANALYTICS_API_KEY" `
    -Value $randomKey `
    -Environments @("production", "preview", "development")

# Add SUPABASE_SERVICE_ROLE_KEY with placeholder
# This MUST be updated with real value from Supabase Dashboard
Add-EnvVar -Name "SUPABASE_SERVICE_ROLE_KEY" `
    -Value "PLACEHOLDER-UPDATE-IN-VERCEL-DASHBOARD" `
    -Environments @("production", "preview", "development")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All environment variables:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npx vercel env ls

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  ⚠️  IMPORTANT - ACTION REQUIRED ⚠️" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "You MUST update SUPABASE_SERVICE_ROLE_KEY before deployment works correctly!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://app.supabase.com/project/hfczndbrexnaoczxmopn/settings/api" -ForegroundColor White
Write-Host "2. Copy the 'service_role' key (secret)" -ForegroundColor White
Write-Host "3. Update in Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com/hailp1s-projects/frontend/settings/environment-variables" -ForegroundColor Gray
Write-Host ""
Write-Host "Or update via CLI:" -ForegroundColor Cyan
Write-Host "   npx vercel env rm SUPABASE_SERVICE_ROLE_KEY production" -ForegroundColor Gray
Write-Host "   npx vercel env add SUPABASE_SERVICE_ROLE_KEY production" -ForegroundColor Gray
Write-Host ""
Write-Host "ANALYTICS_API_KEY has been set to: $randomKey" -ForegroundColor Cyan
Write-Host "Save this key if you need to use it for local development!" -ForegroundColor Yellow
Write-Host ""

Set-Location ..
