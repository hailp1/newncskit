#!/bin/bash

# Quick Supabase to Local PostgreSQL Migration
echo "⚡ Quick NCSKIT Supabase Migration"
echo "================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}This script will:${NC}"
echo "1. 🔄 Migrate database from Supabase to local PostgreSQL"
echo "2. 🔧 Update code to use local database"
echo "3. ⚙️  Configure environment files"
echo "4. ✅ Verify migration"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

# Step 1: Make scripts executable
echo -e "${BLUE}[1/4]${NC} Preparing scripts..."
chmod +x migrate-supabase-to-local.sh
chmod +x update-code-for-local-db.sh

# Step 2: Run database migration
echo -e "${BLUE}[2/4]${NC} Starting database migration..."
./migrate-supabase-to-local.sh

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Database migration had issues. Continue anyway? (y/N):${NC}"
    read -p "" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Update code
echo -e "${BLUE}[3/4]${NC} Updating application code..."
./update-code-for-local-db.sh

# Step 4: Verify migration
echo -e "${BLUE}[4/4]${NC} Verifying migration..."
if [ -f "verify-local-db.js" ]; then
    node verify-local-db.js
fi

echo ""
echo -e "${GREEN}🎉 Migration completed!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update frontend/.env.local with your PostgreSQL credentials"
echo "2. Start your application: cd frontend && npm run dev"
echo "3. Test all functionality"
echo ""
echo -e "${YELLOW}Important files created:${NC}"
echo "- supabase-migration-* (backup directory)"
echo "- frontend/src/lib/postgres.ts (PostgreSQL client)"
echo "- frontend/src/lib/database.ts (Database service)"
echo "- verify-local-db.js (Verification script)"
echo ""
echo -e "${BLUE}Backup files:${NC}"
echo "- *.backup (original files backed up)"
echo ""