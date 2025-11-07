# Quick Deploy Script - Automated Vercel Deployment
# This script performs tasks 10.1 and 10.2 automatically

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCSKIT Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Vercel CLI
Write-Host "Step 1: Verifying Vercel CLI..." -ForegroundColor Yellow
try {
    $version = npx vercel --version 2>&1 | Select-String -Pattern "\d+\.\d+\.\d+" | ForEach-Object { $_.Matches.Value }
    Write-Host "✅ Vercel CLI $version installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "   Installing Vercel CLI..." -ForegroundColor Cyan
    npm i -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check if logged in
Write-Host "Step 2: Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = npx vercel whoami 2>&1
if ($whoami -match "hailp1") {
    Write-Host "✅ Logged in as: hailp1" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not logged in. Please login..." -ForegroundColor Yellow
    npx vercel login
}
Write-Host ""

# Step 3: Check if project is linked
Write-Host "Step 3: Checking project link..." -ForegroundColor Yellow
if (Test-Path "frontend/.vercel") {
    Write-Host "✅ Project already linked" -ForegroundColor Green
} else {
    Write-Host "   Linking project to Vercel..." -ForegroundColor Cyan
    Set-Location frontend
    npx vercel link --yes
    Set-Location ..
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
}
Write-Host ""

# Step 4: Add environment variables
Write-Host "Step 4: Configuring environment variables..." -ForegroundColor Yellow
Write-Host "   Reading from .env.local..." -ForegroundColor Cyan

Set-Location frontend

# Create a temporary file with environment variables
$tempFile = "temp-env-vars.txt"

# Add Supabase URL
Write-Host "   Adding NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Gray
"https://hfczndbrexnaoczxmopn.supabase.co" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development 2>&1 | Out-Null

# Add Supabase Anon Key
Write-Host "   Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Gray
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmY3puZGJyZXhuYW9jenhtb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTEwODgsImV4cCI6MjA3ODA2NzA4OH0.m2wQQOiNyDDl-33lwPqffFJTnRifci5Yd7ezEUUIbIs" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development 2>&1 | Out-Null

# Add Analytics URL - Production
Write-Host "   Adding NEXT_PUBLIC_ANALYTICS_URL (Production)..." -ForegroundColor Gray
"https://analytics.ncskit.app" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_ANALYTICS_URL production 2>&1 | Out-Null

# Add Analytics URL - Preview/Dev
Write-Host "   Adding NEXT_PUBLIC_ANALYTICS_URL (Preview/Dev)..." -ForegroundColor Gray
"http://localhost:8000" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_ANALYTICS_URL preview development 2>&1 | Out-Null

# Add App URL - Production
Write-Host "   Adding NEXT_PUBLIC_APP_URL (Production)..." -ForegroundColor Gray
"https://frontend-hailp1s-projects.vercel.app" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_APP_URL production 2>&1 | Out-Null

# Add App URL - Preview/Dev
Write-Host "   Adding NEXT_PUBLIC_APP_URL (Preview/Dev)..." -ForegroundColor Gray
"http://localhost:3000" | Out-File -FilePath $tempFile -Encoding utf8
Get-Content $tempFile | npx vercel env add NEXT_PUBLIC_APP_URL preview development 2>&1 | Out-Null

# Clean up temp file
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Step 5: Verify environment variables
Write-Host "Step 5: Verifying environment variables..." -ForegroundColor Yellow
Set-Location frontend
$envList = npx vercel env ls 2>&1
Write-Host $envList
Set-Location ..
Write-Host ""

# Step 6: Build and test locally
Write-Host "Step 6: Building project locally..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "   Installing dependencies..." -ForegroundColor Cyan
npm install --silent

Write-Host "   Running type check..." -ForegroundColor Cyan
npm run type-check

Write-Host "   Building project..." -ForegroundColor Cyan
npm run build

Write-Host "✅ Local build successful" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Step 7: Deploy to preview
Write-Host "Step 7: Deploying to Vercel (Preview)..." -ForegroundColor Yellow
Write-Host "   This will create a preview deployment..." -ForegroundColor Cyan
Write-Host ""

Set-Location frontend
$deployOutput = npx vercel --yes 2>&1
Write-Host $deployOutput

# Extract deployment URL
$deployUrl = $deployOutput | Select-String -Pattern "https://[^\s]+" | ForEach-Object { $_.Matches.Value } | Select-Object -First 1

Set-Location ..
Write-Host ""

# Step 8: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($deployUrl) {
    Write-Host "🎉 Preview Deployment URL:" -ForegroundColor Green
    Write-Host "   $deployUrl" -ForegroundColor White
    Write-Host ""
    
    # Copy to clipboard
    $deployUrl | Set-Clipboard
    Write-Host "✅ URL copied to clipboard" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. ⚠️  Add sensitive environment variables in Vercel Dashboard:" -ForegroundColor White
Write-Host "     - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "     - ANALYTICS_API_KEY" -ForegroundColor Gray
Write-Host "     URL: https://vercel.com/hailp1s-projects/frontend/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Test the preview deployment:" -ForegroundColor White
if ($deployUrl) {
    Write-Host "     Open: $deployUrl" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "  3. If preview looks good, deploy to production:" -ForegroundColor White
Write-Host "     cd frontend && npx vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Monitor deployment:" -ForegroundColor White
Write-Host "     Dashboard: https://vercel.com/hailp1s-projects/frontend" -ForegroundColor Cyan
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - Setup Guide: deployment/vercel-setup.md" -ForegroundColor Gray
Write-Host "  - Deployment Guide: deployment/DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host ""
