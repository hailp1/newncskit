#!/bin/bash

# Cleanup Legacy Files Script
# Removes Supabase and Django legacy code

set -e  # Exit on error

echo "🧹 Starting Legacy Files Cleanup..."
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory
echo -e "${YELLOW}📦 Creating backup...${NC}"
mkdir -p .backup/legacy-$(date +%Y%m%d)
BACKUP_DIR=".backup/legacy-$(date +%Y%m%d)"

# Backup services
if [ -d "frontend/src/services" ]; then
    cp -r frontend/src/services "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backed up services${NC}"
fi

# Backup Supabase lib
if [ -d "frontend/src/lib/supabase" ]; then
    cp -r frontend/src/lib/supabase "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backed up Supabase lib${NC}"
fi

# Backup Django backend
if [ -d "backend" ]; then
    tar -czf "$BACKUP_DIR/django-backend.tar.gz" backend/
    echo -e "${GREEN}✅ Backed up Django backend${NC}"
fi

echo ""
echo -e "${YELLOW}🗑️  Deleting legacy files...${NC}"

cd frontend/src

# Delete Supabase services
echo "Deleting Supabase services..."
rm -f services/auth.ts
rm -f services/user.service.ts
rm -f services/user.service.client.ts
rm -f services/profile.service.ts
rm -f services/profile.service.client.ts
rm -f services/permission.service.ts
rm -f services/admin.service.ts
rm -f services/blog.service.ts
rm -f services/supabase.service.ts
rm -f services/marketing-projects-no-auth.ts
echo -e "${GREEN}✅ Deleted Supabase services${NC}"

# Delete Supabase lib
echo "Deleting Supabase lib..."
rm -rf lib/supabase
rm -f lib/analytics-cache.ts
rm -f lib/admin-auth.ts
rm -f lib/permissions/check.ts
echo -e "${GREEN}✅ Deleted Supabase lib${NC}"

# Delete legacy components
echo "Deleting legacy components..."
rm -f components/upload/avatar-upload.tsx
rm -f components/upload/dataset-upload.tsx
echo -e "${GREEN}✅ Deleted legacy components${NC}"

# Delete legacy hooks
echo "Deleting legacy hooks..."
rm -f hooks/use-file-upload.ts
echo -e "${GREEN}✅ Deleted legacy hooks${NC}"

# Delete legacy auth pages
echo "Deleting legacy auth pages..."
rm -rf app/auth/callback
rm -rf app/auth/forgot-password
rm -rf app/auth/reset-password
echo -e "${GREEN}✅ Deleted legacy auth pages${NC}"

# Delete legacy API routes
echo "Deleting legacy API routes..."
rm -rf app/api/auth/logout
rm -rf app/api/auth/session
rm -rf app/api/health/supabase
rm -f app/api/analysis/lib/supabase.ts
rm -rf app/api/analysis/results
rm -rf app/api/analysis/status
rm -rf app/api/analysis/roles
rm -rf app/api/analysis/config
rm -rf app/api/analysis/recent
echo -e "${GREEN}✅ Deleted legacy API routes${NC}"

cd ../..

# Delete Django backend
if [ -d "backend" ]; then
    echo "Deleting Django backend..."
    rm -rf backend/
    echo -e "${GREEN}✅ Deleted Django backend${NC}"
fi

# Delete outdated documentation
echo "Cleaning documentation..."
rm -f ADMIN_LOGIN_FIX.md
rm -f ADMIN_HEADER_DEBUG_GUIDE.md
rm -f ADMIN_ROLE_FIX_SOLUTION.md
rm -f AUTHENTICATION_FIX.md
rm -f LOGIN_UPDATED.md
rm -f ROOT_CAUSE_ANALYSIS.md
rm -f SLOW_PAGES_ISSUE.md
echo -e "${GREEN}✅ Cleaned documentation${NC}"

echo ""
echo -e "${YELLOW}📦 Removing unused packages...${NC}"
cd frontend
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr 2>/dev/null || true
echo -e "${GREEN}✅ Removed Supabase packages${NC}"

echo ""
echo -e "${GREEN}=================================="
echo "✅ Cleanup Complete!"
echo "==================================${NC}"
echo ""
echo "📊 Summary:"
echo "  - Backed up to: $BACKUP_DIR"
echo "  - Deleted Supabase services"
echo "  - Deleted Supabase lib"
echo "  - Deleted legacy components"
echo "  - Deleted Django backend"
echo "  - Removed unused packages"
echo ""
echo "🚀 Next steps:"
echo "  1. Test application: npm run dev"
echo "  2. Build check: npm run build"
echo "  3. Commit changes: git add . && git commit -m 'chore: cleanup legacy files'"
echo ""
