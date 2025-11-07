# Vercel Setup Verification Script
# Checks if Vercel project is properly configured

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vercel Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecks = @()

# Check 1: Vercel CLI installed
Write-Host "Checking Vercel CLI installation..." -ForegroundColor Yellow
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
    $allChecks += $true
    
    # Get version
    $version = vercel --version 2>$null
    Write-Host "   Version: $version" -ForegroundColor Gray
} else {
    Write-Host "❌ Vercel CLI is not installed" -ForegroundColor Red
    Write-Host "   Install with: npm i -g vercel" -ForegroundColor Yellow
    $allChecks += $false
}

Write-Host ""

# Check 2: Project is linked
Write-Host "Checking project link..." -ForegroundColor Yellow
if (Test-Path "frontend/.vercel") {
    Write-Host "✅ Project is linked to Vercel" -ForegroundColor Green
    $allChecks += $true
    
    # Read project info
    if (Test-Path "frontend/.vercel/project.json") {
        $projectInfo = Get-Content "frontend/.vercel/project.json" | ConvertFrom-Json
        Write-Host "   Project ID: $($projectInfo.projectId)" -ForegroundColor Gray
        Write-Host "   Org ID: $($projectInfo.orgId)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Project is not linked to Vercel" -ForegroundColor Red
    Write-Host "   Run: cd frontend && vercel link" -ForegroundColor Yellow
    $allChecks += $false
}

Write-Host ""

# Check 3: Environment variables
Write-Host "Checking environment variables..." -ForegroundColor Yellow

Set-Location frontend

$envVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_ANALYTICS_URL",
    "ANALYTICS_API_KEY",
    "NEXT_PUBLIC_APP_URL"
)

$envCheckPassed = $true

foreach ($var in $envVars) {
    $result = vercel env ls 2>$null | Select-String -Pattern $var
    
    if ($result) {
        Write-Host "✅ $var is configured" -ForegroundColor Green
    } else {
        Write-Host "❌ $var is missing" -ForegroundColor Red
        $envCheckPassed = $false
    }
}

$allChecks += $envCheckPassed

Set-Location ..

Write-Host ""

# Check 4: vercel.json configuration
Write-Host "Checking vercel.json configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/vercel.json") {
    Write-Host "✅ vercel.json exists" -ForegroundColor Green
    $allChecks += $true
    
    $vercelConfig = Get-Content "frontend/vercel.json" | ConvertFrom-Json
    
    # Check framework
    if ($vercelConfig.framework -eq "nextjs") {
        Write-Host "   ✅ Framework: Next.js" -ForegroundColor Green
    }
    
    # Check functions config
    if ($vercelConfig.functions) {
        Write-Host "   ✅ Functions configured" -ForegroundColor Green
    }
    
    # Check headers
    if ($vercelConfig.headers) {
        Write-Host "   ✅ Security headers configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ vercel.json not found" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 5: Build configuration
Write-Host "Checking build configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/package.json") {
    $packageJson = Get-Content "frontend/package.json" | ConvertFrom-Json
    
    if ($packageJson.scripts.build) {
        Write-Host "✅ Build script exists: $($packageJson.scripts.build)" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ Build script not found in package.json" -ForegroundColor Red
        $allChecks += $false
    }
    
    if ($packageJson.scripts."validate-env") {
        Write-Host "✅ Environment validation script exists" -ForegroundColor Green
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 6: Next.js configuration
Write-Host "Checking Next.js configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/next.config.ts") {
    Write-Host "✅ next.config.ts exists" -ForegroundColor Green
    $allChecks += $true
} elseif (Test-Path "frontend/next.config.js") {
    Write-Host "✅ next.config.js exists" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "❌ Next.js config not found" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 7: Git repository
Write-Host "Checking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    $allChecks += $true
    
    # Check remote
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "   Remote: $remote" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  No remote repository configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Git repository not initialized" -ForegroundColor Red
    Write-Host "   Run: git init" -ForegroundColor Yellow
    $allChecks += $false
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passedChecks = ($allChecks | Where-Object { $_ -eq $true }).Count
$totalChecks = $allChecks.Count

Write-Host "Passed: $passedChecks / $totalChecks checks" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { "Green" } else { "Yellow" })
Write-Host ""

if ($passedChecks -eq $totalChecks) {
    Write-Host "🎉 All checks passed! Your Vercel setup is complete." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test preview deployment: cd frontend && vercel" -ForegroundColor White
    Write-Host "  2. Deploy to production: cd frontend && vercel --prod" -ForegroundColor White
} else {
    Write-Host "⚠️  Some checks failed. Please review the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "  - Install Vercel CLI: npm i -g vercel" -ForegroundColor White
    Write-Host "  - Link project: cd frontend && vercel link" -ForegroundColor White
    Write-Host "  - Add environment variables: vercel env add <VAR_NAME>" -ForegroundColor White
    Write-Host "  - Or configure in dashboard: https://vercel.com/dashboard" -ForegroundColor White
}

Write-Host ""
