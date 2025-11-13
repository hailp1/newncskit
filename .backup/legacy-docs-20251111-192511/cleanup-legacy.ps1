# Cleanup Legacy Files Script (PowerShell)
# Removes Supabase and Django legacy code

Write-Host "🧹 Starting Legacy Files Cleanup..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Create backup directory
$BackupDir = ".backup/legacy-$(Get-Date -Format 'yyyyMMdd')"
Write-Host "📦 Creating backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

# Backup services
if (Test-Path "frontend/src/services") {
    Copy-Item -Path "frontend/src/services" -Destination "$BackupDir/" -Recurse -Force
    Write-Host "✅ Backed up services" -ForegroundColor Green
}

# Backup Supabase lib
if (Test-Path "frontend/src/lib/supabase") {
    Copy-Item -Path "frontend/src/lib/supabase" -Destination "$BackupDir/" -Recurse -Force
    Write-Host "✅ Backed up Supabase lib" -ForegroundColor Green
}

# Backup Django backend
if (Test-Path "backend") {
    Compress-Archive -Path "backend" -DestinationPath "$BackupDir/django-backend.zip" -Force
    Write-Host "✅ Backed up Django backend" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗑️  Deleting legacy files..." -ForegroundColor Yellow

Set-Location "frontend/src"

# Delete Supabase services
Write-Host "Deleting Supabase services..."
Remove-Item -Path "services/auth.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/user.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/user.service.client.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/profile.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/profile.service.client.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/permission.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/admin.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/blog.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/supabase.service.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "services/marketing-projects-no-auth.ts" -ErrorAction SilentlyContinue
Write-Host "✅ Deleted Supabase services" -ForegroundColor Green

# Delete Supabase lib
Write-Host "Deleting Supabase lib..."
Remove-Item -Path "lib/supabase" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib/analytics-cache.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "lib/admin-auth.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "lib/permissions/check.ts" -ErrorAction SilentlyContinue
Write-Host "✅ Deleted Supabase lib" -ForegroundColor Green

# Delete legacy components
Write-Host "Deleting legacy components..."
Remove-Item -Path "components/upload/avatar-upload.tsx" -ErrorAction SilentlyContinue
Remove-Item -Path "components/upload/dataset-upload.tsx" -ErrorAction SilentlyContinue
Write-Host "✅ Deleted legacy components" -ForegroundColor Green

# Delete legacy hooks
Write-Host "Deleting legacy hooks..."
Remove-Item -Path "hooks/use-file-upload.ts" -ErrorAction SilentlyContinue
Write-Host "✅ Deleted legacy hooks" -ForegroundColor Green

# Delete legacy auth pages
Write-Host "Deleting legacy auth pages..."
Remove-Item -Path "app/auth/callback" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/auth/forgot-password" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/auth/reset-password" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Deleted legacy auth pages" -ForegroundColor Green

# Delete legacy API routes
Write-Host "Deleting legacy API routes..."
Remove-Item -Path "app/api/auth/logout" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/auth/session" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/health/supabase" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/lib/supabase.ts" -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/results" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/status" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/roles" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/config" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app/api/analysis/recent" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Deleted legacy API routes" -ForegroundColor Green

Set-Location "../.."

# Delete Django backend
if (Test-Path "backend") {
    Write-Host "Deleting Django backend..."
    Remove-Item -Path "backend" -Recurse -Force
    Write-Host "✅ Deleted Django backend" -ForegroundColor Green
}

# Delete outdated documentation
Write-Host "Cleaning documentation..."
Remove-Item -Path "ADMIN_LOGIN_FIX.md" -ErrorAction SilentlyContinue
Remove-Item -Path "ADMIN_HEADER_DEBUG_GUIDE.md" -ErrorAction SilentlyContinue
Remove-Item -Path "ADMIN_ROLE_FIX_SOLUTION.md" -ErrorAction SilentlyContinue
Remove-Item -Path "AUTHENTICATION_FIX.md" -ErrorAction SilentlyContinue
Remove-Item -Path "LOGIN_UPDATED.md" -ErrorAction SilentlyContinue
Remove-Item -Path "ROOT_CAUSE_ANALYSIS.md" -ErrorAction SilentlyContinue
Remove-Item -Path "SLOW_PAGES_ISSUE.md" -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned documentation" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Removing unused packages..." -ForegroundColor Yellow
Set-Location "frontend"
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr 2>$null
Write-Host "✅ Removed Supabase packages" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:"
Write-Host "  - Backed up to: $BackupDir"
Write-Host "  - Deleted Supabase services"
Write-Host "  - Deleted Supabase lib"
Write-Host "  - Deleted legacy components"
Write-Host "  - Deleted Django backend"
Write-Host "  - Removed unused packages"
Write-Host ""
Write-Host "🚀 Next steps:"
Write-Host "  1. Test application: npm run dev"
Write-Host "  2. Build check: npm run build"
Write-Host "  3. Commit changes: git add . && git commit -m 'chore: cleanup legacy files'"
Write-Host ""
