# Vercel Project Setup Script
# This script automates the Vercel project setup process

param(
    [switch]$SkipInstall,
    [switch]$SkipLink,
    [string]$ProjectName = "ncskit"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCSKIT Vercel Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Step 1: Check Vercel CLI installation
Write-Host "Step 1: Checking Vercel CLI..." -ForegroundColor Yellow
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    if ($SkipInstall) {
        Write-Host "❌ Vercel CLI not found. Please install: npm i -g vercel" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📦 Installing Vercel CLI globally..." -ForegroundColor Cyan
    npm i -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
}

Write-Host ""

# Step 2: Login to Vercel
Write-Host "Step 2: Vercel Authentication..." -ForegroundColor Yellow
Write-Host "   Please login to your Vercel account in the browser" -ForegroundColor Cyan

vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel login failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Successfully authenticated with Vercel" -ForegroundColor Green
Write-Host ""

# Step 3: Link project
if (-not $SkipLink) {
    Write-Host "Step 3: Linking project to Vercel..." -ForegroundColor Yellow
    
    Set-Location frontend
    
    # Check if already linked
    if (Test-Path ".vercel") {
        Write-Host "⚠️  Project is already linked to Vercel" -ForegroundColor Yellow
        $response = Read-Host "Do you want to re-link? (y/N)"
        
        if ($response -eq "y" -or $response -eq "Y") {
            Remove-Item -Recurse -Force .vercel
            Write-Host "   Removed existing link" -ForegroundColor Cyan
        } else {
            Write-Host "   Keeping existing link" -ForegroundColor Cyan
            Set-Location ..
            Write-Host ""
            Write-Host "✅ Project setup complete!" -ForegroundColor Green
            exit 0
        }
    }
    
    Write-Host "   Follow the prompts to link your project:" -ForegroundColor Cyan
    Write-Host "   - Select your Vercel scope" -ForegroundColor Gray
    Write-Host "   - Link to existing project or create new" -ForegroundColor Gray
    Write-Host "   - Confirm project settings" -ForegroundColor Gray
    Write-Host ""
    
    vercel link
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "Step 3: Skipping project link (--SkipLink flag)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Environment Variables Setup
Write-Host "Step 4: Environment Variables Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to configure environment variables in Vercel Dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required environment variables:" -ForegroundColor Cyan
Write-Host "  1. NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  3. SUPABASE_SERVICE_ROLE_KEY (⚠️  SENSITIVE)" -ForegroundColor White
Write-Host "  4. NEXT_PUBLIC_ANALYTICS_URL" -ForegroundColor White
Write-Host "  5. ANALYTICS_API_KEY (⚠️  SENSITIVE)" -ForegroundColor White
Write-Host "  6. NEXT_PUBLIC_APP_URL" -ForegroundColor White
Write-Host ""

$response = Read-Host "Do you want to add environment variables now via CLI? (y/N)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Adding environment variables..." -ForegroundColor Cyan
    Write-Host "Note: You'll be prompted for each variable value" -ForegroundColor Gray
    Write-Host ""
    
    Set-Location frontend
    
    # Supabase URL
    Write-Host "1/6: NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
    vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
    
    # Supabase Anon Key
    Write-Host "2/6: NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
    
    # Supabase Service Role Key
    Write-Host "3/6: SUPABASE_SERVICE_ROLE_KEY (⚠️  SENSITIVE)" -ForegroundColor Cyan
    vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
    
    # Analytics URL
    Write-Host "4/6: NEXT_PUBLIC_ANALYTICS_URL" -ForegroundColor Cyan
    Write-Host "   Production: https://analytics.ncskit.app" -ForegroundColor Gray
    Write-Host "   Preview/Dev: http://localhost:8000" -ForegroundColor Gray
    vercel env add NEXT_PUBLIC_ANALYTICS_URL production preview development
    
    # Analytics API Key
    Write-Host "5/6: ANALYTICS_API_KEY (⚠️  SENSITIVE)" -ForegroundColor Cyan
    Write-Host "   Generate with: openssl rand -base64 32" -ForegroundColor Gray
    vercel env add ANALYTICS_API_KEY production preview development
    
    # App URL
    Write-Host "6/6: NEXT_PUBLIC_APP_URL" -ForegroundColor Cyan
    Write-Host "   Production: https://$ProjectName.vercel.app" -ForegroundColor Gray
    Write-Host "   Preview/Dev: http://localhost:3000" -ForegroundColor Gray
    vercel env add NEXT_PUBLIC_APP_URL production preview development
    
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Environment variables added" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to add environment variables manually:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "   2. Select your project" -ForegroundColor Cyan
    Write-Host "   3. Navigate to Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host "   4. Add all required variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   See deployment/vercel-setup.md for detailed instructions" -ForegroundColor Gray
}

Write-Host ""

# Step 5: Verify Configuration
Write-Host "Step 5: Verifying Configuration..." -ForegroundColor Yellow

Set-Location frontend

# Check if .vercel directory exists
if (Test-Path ".vercel") {
    Write-Host "✅ Project is linked to Vercel" -ForegroundColor Green
} else {
    Write-Host "⚠️  Project link not found (.vercel directory missing)" -ForegroundColor Yellow
}

# List environment variables
Write-Host ""
Write-Host "Current environment variables:" -ForegroundColor Cyan
vercel env ls 2>$null

Set-Location ..

Write-Host ""

# Step 6: Summary and Next Steps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Vercel CLI installed and authenticated" -ForegroundColor Green
Write-Host "✅ Project linked to Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "  2. Configure deployment settings (if needed)" -ForegroundColor White
Write-Host "  3. Test preview deployment: cd frontend && vercel" -ForegroundColor White
Write-Host "  4. Deploy to production: cd frontend && vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - Setup Guide: deployment/vercel-setup.md" -ForegroundColor Gray
Write-Host "  - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  vercel          - Deploy to preview" -ForegroundColor Gray
Write-Host "  vercel --prod   - Deploy to production" -ForegroundColor Gray
Write-Host "  vercel logs     - View deployment logs" -ForegroundColor Gray
Write-Host "  vercel ls       - List deployments" -ForegroundColor Gray
Write-Host "  vercel env ls   - List environment variables" -ForegroundColor Gray
Write-Host ""
