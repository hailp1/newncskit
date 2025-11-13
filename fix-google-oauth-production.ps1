# ============================================
# Fix Google OAuth Callback cho Production
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIX GOOGLE OAUTH CALLBACK - PRODUCTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] Khong tim thay thu muc frontend" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Kiem tra environment variables..." -ForegroundColor Yellow

$envLocalPath = Join-Path $frontendPath ".env.local"
$envProductionPath = Join-Path $frontendPath ".env.production"

# Kiểm tra .env.production
if (Test-Path $envProductionPath) {
    Write-Host "   [OK] File .env.production ton tai" -ForegroundColor Green
    
    $envContent = Get-Content $envProductionPath -Raw
    
    $hasNextAuthUrl = $envContent -match "NEXTAUTH_URL\s*="
    $hasNextPublicAppUrl = $envContent -match "NEXT_PUBLIC_APP_URL\s*="
    
    if ($hasNextAuthUrl) {
        $nextAuthUrl = ($envContent | Select-String -Pattern "NEXTAUTH_URL\s*=\s*(.+)").Matches[0].Groups[1].Value.Trim()
        Write-Host "   NEXTAUTH_URL: $nextAuthUrl" -ForegroundColor Gray
        
        if ($nextAuthUrl -notmatch "^https://ncskit\.org") {
            Write-Host "   [WARN] NEXTAUTH_URL khong phai https://ncskit.org" -ForegroundColor Yellow
            Write-Host "   Can sua thanh: NEXTAUTH_URL=https://ncskit.org" -ForegroundColor Yellow
        } else {
            Write-Host "   [OK] NEXTAUTH_URL dung cho production" -ForegroundColor Green
        }
    } else {
        Write-Host "   [WARN] NEXTAUTH_URL chua duoc cau hinh trong .env.production" -ForegroundColor Yellow
    }
    
    if ($hasNextPublicAppUrl) {
        $nextPublicAppUrl = ($envContent | Select-String -Pattern "NEXT_PUBLIC_APP_URL\s*=\s*(.+)").Matches[0].Groups[1].Value.Trim()
        Write-Host "   NEXT_PUBLIC_APP_URL: $nextPublicAppUrl" -ForegroundColor Gray
        
        if ($nextPublicAppUrl -notmatch "^https://ncskit\.org") {
            Write-Host "   [WARN] NEXT_PUBLIC_APP_URL khong phai https://ncskit.org" -ForegroundColor Yellow
        } else {
            Write-Host "   [OK] NEXT_PUBLIC_APP_URL dung cho production" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   [WARN] File .env.production khong ton tai" -ForegroundColor Yellow
    Write-Host "   Tao file .env.production..." -ForegroundColor Yellow
    
    $productionEnv = @"
# Production Environment Variables
NEXTAUTH_URL=https://ncskit.org
NEXT_PUBLIC_APP_URL=https://ncskit.org
NODE_ENV=production

# Google OAuth (thay the voi credentials that)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Secret (generate voi: openssl rand -base64 32)
NEXTAUTH_SECRET=your-production-secret-here
"@
    
    $productionEnv | Out-File -FilePath $envProductionPath -Encoding UTF8
    Write-Host "   [OK] Da tao .env.production" -ForegroundColor Green
    Write-Host "   [WARN] Vui long cap nhat GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "[2/4] Kiem tra Google Cloud Console configuration..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Vao: https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host ""
Write-Host "   Authorized JavaScript origins phai co:" -ForegroundColor Yellow
Write-Host "     - https://ncskit.org" -ForegroundColor White
Write-Host "     - https://www.ncskit.org" -ForegroundColor White
Write-Host "     - http://localhost:3000 (cho development)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Authorized redirect URIs phai co:" -ForegroundColor Yellow
Write-Host "     - https://ncskit.org/api/auth/callback/google" -ForegroundColor White
Write-Host "     - https://www.ncskit.org/api/auth/callback/google" -ForegroundColor White
Write-Host "     - http://localhost:3000/api/auth/callback/google (cho development)" -ForegroundColor Gray
Write-Host ""

Write-Host "[3/4] Kiem tra code da duoc cap nhat..." -ForegroundColor Yellow

$authFilePath = Join-Path $frontendPath "src\lib\auth.ts"

if (Test-Path $authFilePath) {
    $authContent = Get-Content $authFilePath -Raw
    
    if ($authContent -match "function getBaseUrl\(\)" -and $authContent -match "async redirect\(.*baseUrl.*\)") {
        Write-Host "   [OK] Code da duoc cap nhat voi getBaseUrl() va redirect callback" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Code chua duoc cap nhat" -ForegroundColor Yellow
        Write-Host "   Can cap nhat frontend/src/lib/auth.ts" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] Khong tim thay auth.ts" -ForegroundColor Red
}

Write-Host ""

Write-Host "[4/4] Huong dan fix..." -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Cap nhat .env.production:" -ForegroundColor Cyan
Write-Host "   NEXTAUTH_URL=https://ncskit.org" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_APP_URL=https://ncskit.org" -ForegroundColor White
Write-Host ""
Write-Host "2. Cap nhat Google Cloud Console:" -ForegroundColor Cyan
Write-Host "   - Them https://ncskit.org vao Authorized JavaScript origins" -ForegroundColor White
Write-Host "   - Them https://ncskit.org/api/auth/callback/google vao Authorized redirect URIs" -ForegroundColor White
Write-Host ""
Write-Host "3. Rebuild va restart Next.js:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "4. Test OAuth flow:" -ForegroundColor Cyan
Write-Host "   - Vao https://ncskit.org/auth/login" -ForegroundColor White
Write-Host "   - Click 'Login with Google'" -ForegroundColor White
Write-Host "   - Kiem tra callback URL phai la https://ncskit.org/api/auth/callback/google" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HOAN TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

