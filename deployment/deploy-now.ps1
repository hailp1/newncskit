# Final Deployment Script
# Deploy to Vercel with all fixes applied

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCSKIT Final Deployment to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify we're in the right directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Must run from project root" -ForegroundColor Red
    exit 1
}

# Step 2: Check Vercel link
Write-Host "Step 1: Verifying Vercel setup..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/.vercel")) {
    Write-Host "❌ Project not linked to Vercel" -ForegroundColor Red
    Write-Host "   Run: cd frontend && npx vercel link" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Project is linked to Vercel" -ForegroundColor Green
Write-Host ""

# Step 3: Check environment variables
Write-Host "Step 2: Checking environment variables..." -ForegroundColor Yellow
Set-Location frontend
$envList = npx vercel env ls 2>&1 | Out-String
if ($envList -match "NEXT_PUBLIC_SUPABASE_URL") {
    Write-Host "✅ Environment variables are configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some environment variables may be missing" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Step 4: Commit changes
Write-Host "Step 3: Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes" -ForegroundColor Yellow
    Write-Host ""
    git status --short
    Write-Host ""
    
    $response = Read-Host "Commit these changes? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        $message = Read-Host "Commit message (or press Enter for default)"
        if (-not $message) {
            $message = "chore: prepare for Vercel deployment with type check disabled"
        }
        
        git add .
        git commit -m $message
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Working directory is clean" -ForegroundColor Green
}
Write-Host ""

# Step 5: Deploy to preview
Write-Host "Step 4: Deploying to Vercel (Preview)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This will create a preview deployment for testing." -ForegroundColor Cyan
Write-Host "If successful, you can promote it to production." -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Continue with preview deployment? (Y/n)"
if ($response -eq "n" -or $response -eq "N") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Set-Location frontend

Write-Host ""
Write-Host "Deploying..." -ForegroundColor Cyan
Write-Host ""

$deployOutput = npx vercel --yes 2>&1
Write-Host $deployOutput

# Extract deployment URL
$deployUrl = $deployOutput | Select-String -Pattern "https://[^\s]+" | ForEach-Object { $_.Matches.Value } | Select-Object -First 1

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($deployUrl) {
    Write-Host "🎉 Preview Deployment URL:" -ForegroundColor Green
    Write-Host "   $deployUrl" -ForegroundColor White
    Write-Host ""
    
    # Copy to clipboard
    try {
        $deployUrl | Set-Clipboard
        Write-Host "✅ URL copied to clipboard" -ForegroundColor Green
    } catch {
        # Clipboard may not be available
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open the preview URL and test the deployment" -ForegroundColor White
    Write-Host "  2. Check that pages load correctly" -ForegroundColor White
    Write-Host "  3. Test authentication flow" -ForegroundColor White
    Write-Host "  4. Verify API endpoints work" -ForegroundColor White
    Write-Host ""
    Write-Host "If everything works:" -ForegroundColor Cyan
    Write-Host "  cd frontend && npx vercel --prod" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Remember to update SUPABASE_SERVICE_ROLE_KEY in Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/hailp1s-projects/frontend/settings/environment-variables" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Could not extract deployment URL" -ForegroundColor Yellow
    Write-Host "   Check Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Deployment logs:" -ForegroundColor Cyan
Write-Host "  https://vercel.com/hailp1s-projects/frontend" -ForegroundColor Gray
Write-Host ""
