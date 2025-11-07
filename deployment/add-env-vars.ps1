# Add Environment Variables to Vercel
# Simple script to add required environment variables

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Environment Variables to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

# Environment variables to add
$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://hfczndbrexnaoczxmopn.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmY3puZGJyZXhuYW9jenhtb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTEwODgsImV4cCI6MjA3ODA2NzA4OH0.m2wQQOiNyDDl-33lwPqffFJTnRifci5Yd7ezEUUIbIs"
}

# Production-specific values
$prodVars = @{
    "NEXT_PUBLIC_ANALYTICS_URL" = "https://analytics.ncskit.app"
    "NEXT_PUBLIC_APP_URL" = "https://frontend-hailp1s-projects.vercel.app"
}

# Preview/Dev values
$devVars = @{
    "NEXT_PUBLIC_ANALYTICS_URL" = "http://localhost:8000"
    "NEXT_PUBLIC_APP_URL" = "http://localhost:3000"
}

Write-Host "Adding common environment variables..." -ForegroundColor Yellow
Write-Host ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Adding $key..." -ForegroundColor Cyan
    
    # Create a temporary file with the value
    $value | Out-File -FilePath "temp.txt" -Encoding utf8 -NoNewline
    
    # Add to all environments
    Get-Content "temp.txt" | npx vercel env add $key production 2>&1 | Out-Null
    Get-Content "temp.txt" | npx vercel env add $key preview 2>&1 | Out-Null
    Get-Content "temp.txt" | npx vercel env add $key development 2>&1 | Out-Null
    
    Write-Host "  ✅ Added to all environments" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding production-specific variables..." -ForegroundColor Yellow
Write-Host ""

foreach ($key in $prodVars.Keys) {
    $value = $prodVars[$key]
    Write-Host "Adding $key (Production)..." -ForegroundColor Cyan
    
    $value | Out-File -FilePath "temp.txt" -Encoding utf8 -NoNewline
    Get-Content "temp.txt" | npx vercel env add $key production 2>&1 | Out-Null
    
    Write-Host "  ✅ Added to production" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding preview/dev variables..." -ForegroundColor Yellow
Write-Host ""

foreach ($key in $devVars.Keys) {
    $value = $devVars[$key]
    Write-Host "Adding $key (Preview/Dev)..." -ForegroundColor Cyan
    
    $value | Out-File -FilePath "temp.txt" -Encoding utf8 -NoNewline
    Get-Content "temp.txt" | npx vercel env add $key preview 2>&1 | Out-Null
    Get-Content "temp.txt" | npx vercel env add $key development 2>&1 | Out-Null
    
    Write-Host "  ✅ Added to preview/dev" -ForegroundColor Green
}

# Clean up
Remove-Item "temp.txt" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Variables Added!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verifying environment variables..." -ForegroundColor Yellow
npx vercel env ls

Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to add these sensitive variables manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   Get from: https://app.supabase.com/project/hfczndbrexnaoczxmopn/settings/api" -ForegroundColor Gray
Write-Host "   Add with: npx vercel env add SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ANALYTICS_API_KEY" -ForegroundColor White
Write-Host "   Generate with: openssl rand -base64 32" -ForegroundColor Gray
Write-Host "   Add with: npx vercel env add ANALYTICS_API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "Or add them in Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "https://vercel.com/hailp1s-projects/frontend/settings/environment-variables" -ForegroundColor Gray
Write-Host ""

Set-Location ..
