# ============================================
# Check LinkedIn OAuth Configuration
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA LINKEDIN OAUTH CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

# 1. Kiểm tra code
Write-Host "[1/4] Kiem tra code LinkedIn OAuth..." -ForegroundColor Yellow

$authFilePath = Join-Path $frontendPath "src\lib\auth.ts"

if (Test-Path $authFilePath) {
    $authContent = Get-Content $authFilePath -Raw
    
    # Kiểm tra LinkedInProvider
    if ($authContent -match "LinkedInProvider") {
        Write-Host "   [OK] LinkedInProvider da duoc cau hinh" -ForegroundColor Green
        
        # Kiểm tra clientId và clientSecret
        if ($authContent -match "LINKEDIN_CLIENT_ID" -and $authContent -match "LINKEDIN_CLIENT_SECRET") {
            Write-Host "   [OK] Su dung environment variables cho LinkedIn" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Co the chua cau hinh environment variables" -ForegroundColor Yellow
        }
        
        # Kiểm tra scope
        if ($authContent -match "scope.*openid.*profile.*email" -or $authContent -match "scope.*r_emailaddress") {
            Write-Host "   [OK] LinkedIn scope da duoc cau hinh" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Kiem tra LinkedIn scope" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [ERROR] LinkedInProvider khong tim thay trong code" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERROR] Khong tim thay auth.ts" -ForegroundColor Red
}

Write-Host ""

# 2. Kiểm tra environment variables
Write-Host "[2/4] Kiem tra environment variables..." -ForegroundColor Yellow

$envLocalPath = Join-Path $frontendPath ".env.local"
$envProductionPath = Join-Path $frontendPath ".env.production"

$hasLinkedInInLocal = $false
$hasLinkedInInProd = $false

if (Test-Path $envLocalPath) {
    $envLocalContent = Get-Content $envLocalPath -Raw
    if ($envLocalContent -match "LINKEDIN_CLIENT_ID" -and $envLocalContent -match "LINKEDIN_CLIENT_SECRET") {
        $hasLinkedInInLocal = $true
        Write-Host "   [OK] LinkedIn credentials co trong .env.local" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] LinkedIn credentials chua co trong .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [INFO] .env.local khong ton tai (co the khong can cho production)" -ForegroundColor Gray
}

if (Test-Path $envProductionPath) {
    $envProdContent = Get-Content $envProductionPath -Raw
    if ($envProdContent -match "LINKEDIN_CLIENT_ID" -and $envProdContent -match "LINKEDIN_CLIENT_SECRET") {
        $hasLinkedInInProd = $true
        Write-Host "   [OK] LinkedIn credentials co trong .env.production" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] LinkedIn credentials chua co trong .env.production" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [WARN] .env.production khong ton tai" -ForegroundColor Yellow
}

Write-Host ""

# 3. Kiểm tra redirect callback
Write-Host "[3/4] Kiem tra redirect callback..." -ForegroundColor Yellow

if (Test-Path $authFilePath) {
    $authContent = Get-Content $authFilePath -Raw
    
    # Kiểm tra có redirect callback không
    if ($authContent -match "async redirect\(.*baseUrl.*\)" -or $authContent -match "getBaseUrl\(\)") {
        Write-Host "   [OK] Redirect callback da duoc cau hinh" -ForegroundColor Green
        Write-Host "   [OK] Se tu dong su dung NEXTAUTH_URL cho production" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Co the chua co redirect callback" -ForegroundColor Yellow
    }
}

Write-Host ""

# 4. Hướng dẫn cấu hình LinkedIn Developer Portal
Write-Host "[4/4] Huong dan cau hinh LinkedIn Developer Portal..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Vao: https://www.linkedin.com/developers/apps" -ForegroundColor White
Write-Host "   Chon app cua ban" -ForegroundColor White
Write-Host "   Vao tab 'Auth'" -ForegroundColor White
Write-Host ""
Write-Host "   Authorized Redirect URLs phai co:" -ForegroundColor Yellow
Write-Host "     - https://ncskit.org/api/auth/callback/linkedin" -ForegroundColor White
Write-Host "     - https://www.ncskit.org/api/auth/callback/linkedin" -ForegroundColor White
Write-Host "     - http://localhost:3000/api/auth/callback/linkedin (cho development)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Request permissions:" -ForegroundColor Yellow
Write-Host "     - Sign In with LinkedIn using OpenID Connect" -ForegroundColor White
Write-Host "     - r_emailaddress (Email address)" -ForegroundColor White
Write-Host "     - r_liteprofile (Basic profile)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TONG KET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($hasLinkedInInProd -or $hasLinkedInInLocal) {
    Write-Host "✅ LinkedIn OAuth code da duoc cau hinh" -ForegroundColor Green
    Write-Host "⚠️  Can kiem tra LinkedIn Developer Portal" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Can them LinkedIn credentials vao environment variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Can lam:" -ForegroundColor Yellow
Write-Host "  1. Cap nhat LinkedIn Developer Portal redirect URIs" -ForegroundColor White
Write-Host "  2. Kiem tra LINKEDIN_CLIENT_ID va LINKEDIN_CLIENT_SECRET trong production" -ForegroundColor White
Write-Host "  3. Test LinkedIn OAuth flow" -ForegroundColor White
Write-Host ""

