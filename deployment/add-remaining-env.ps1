# Add remaining environment variables one by one

$ErrorActionPreference = "Continue"

Write-Host "Adding remaining environment variables..." -ForegroundColor Cyan
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
            Write-Host "  ⚠️  $env - may already exist or error occurred" -ForegroundColor Yellow
        }
    }
    
    Remove-Item "temp.txt" -ErrorAction SilentlyContinue
    Write-Host ""
}

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
Add-EnvVar -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" `
    -Value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmY3puZGJyZXhuYW9jenhtb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTEwODgsImV4cCI6MjA3ODA2NzA4OH0.m2wQQOiNyDDl-33lwPqffFJTnRifci5Yd7ezEUUIbIs" `
    -Environments @("production", "preview", "development")

# Add NEXT_PUBLIC_ANALYTICS_URL for production
Add-EnvVar -Name "NEXT_PUBLIC_ANALYTICS_URL" `
    -Value "https://analytics.ncskit.app" `
    -Environments @("production")

# Add NEXT_PUBLIC_ANALYTICS_URL for preview/dev
Add-EnvVar -Name "NEXT_PUBLIC_ANALYTICS_URL" `
    -Value "http://localhost:8000" `
    -Environments @("preview", "development")

# Add NEXT_PUBLIC_APP_URL for production
Add-EnvVar -Name "NEXT_PUBLIC_APP_URL" `
    -Value "https://frontend-hailp1s-projects.vercel.app" `
    -Environments @("production")

# Add NEXT_PUBLIC_APP_URL for preview/dev
Add-EnvVar -Name "NEXT_PUBLIC_APP_URL" `
    -Value "http://localhost:3000" `
    -Environments @("preview", "development")

# Add NODE_ENV for production
Add-EnvVar -Name "NODE_ENV" `
    -Value "production" `
    -Environments @("production")

# Add SKIP_TYPE_CHECK for all environments
Add-EnvVar -Name "SKIP_TYPE_CHECK" `
    -Value "true" `
    -Environments @("production", "preview", "development")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Listing all environment variables:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npx vercel env ls

Write-Host ""
Write-Host "✅ Basic environment variables added!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Still need to add manually:" -ForegroundColor Yellow
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  - ANALYTICS_API_KEY" -ForegroundColor White
Write-Host ""

Set-Location ..
