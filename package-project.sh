#!/bin/bash

echo "📦 Đóng gói dự án NCSKit..."
echo "=========================="

# Tạo thư mục backup
mkdir -p backup

# Backup database nếu đang chạy
echo "💾 Backing up database..."
if docker-compose ps | grep -q postgres; then
    docker exec -t $(docker-compose ps -q postgres) pg_dump -U postgres ncskit > backup/database_backup.sql
    echo "✅ Database backup created: backup/database_backup.sql"
else
    echo "⚠️ PostgreSQL container not running, skipping database backup"
fi

# Dọn dẹp files không cần thiết
echo "🧹 Cleaning up unnecessary files..."

# Frontend cleanup
if [ -d "frontend/node_modules" ]; then
    echo "Removing frontend/node_modules..."
    rm -rf frontend/node_modules
fi

if [ -d "frontend/.next" ]; then
    echo "Removing frontend/.next..."
    rm -rf frontend/.next
fi

if [ -d "frontend/.turbo" ]; then
    echo "Removing frontend/.turbo..."
    rm -rf frontend/.turbo
fi

# Backend cleanup
if [ -d "backend/venv" ]; then
    echo "Removing backend/venv..."
    rm -rf backend/venv
fi

echo "Removing Python cache files..."
find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find backend -name "*.pyc" -delete 2>/dev/null || true

if [ -d "backend/logs" ]; then
    echo "Removing backend/logs..."
    rm -rf backend/logs
fi

# Tạo archive
echo "📁 Creating project archive..."

# Kiểm tra xem có Git repository không
if [ -d ".git" ]; then
    echo "Using Git to create archive..."
    git add .
    git commit -m "Prepare for project transfer" || echo "No changes to commit"
    git archive --format=zip --output=ncskit-project-$(date +%Y%m%d-%H%M%S).zip HEAD
else
    echo "Using zip to create archive..."
    zip -r ncskit-project-$(date +%Y%m%d-%H%M%S).zip . \
        -x "frontend/node_modules/*" \
        -x "frontend/.next/*" \
        -x "frontend/.turbo/*" \
        -x "backend/venv/*" \
        -x "backend/__pycache__/*" \
        -x "backend/logs/*" \
        -x "*.pyc" \
        -x ".git/*" \
        -x "*.zip"
fi

# Tạo file thông tin
echo "📋 Creating project info file..."
cat > PROJECT_INFO.txt << EOF
NCSKit Project Package
=====================

Packaged on: $(date)
Packaged by: $(whoami)
Machine: $(hostname)

Project Structure:
- Frontend: Next.js application
- Backend: Django REST API
- Database: PostgreSQL (via Docker)
- R Analysis: Statistical analysis server
- Documentation: Comprehensive docs

Setup Instructions:
1. Extract the archive
2. Run setup-new-machine.sh (Linux/Mac) or setup-new-machine.bat (Windows)
3. Follow the TRANSFER_CHECKLIST.md

Requirements:
- Node.js 18+
- Python 3.8+
- Docker & Docker Compose
- R 4.0+ (optional)

Support Files:
- setup-new-machine.sh/bat: Automated setup script
- TRANSFER_CHECKLIST.md: Step-by-step checklist
- PROJECT_PACKAGING_GUIDE.md: Detailed packaging guide
- backup/database_backup.sql: Database backup (if available)

For support, check the docs/ folder or README.md
EOF

# Hiển thị kết quả
echo ""
echo "✅ Đóng gói hoàn thành!"
echo "======================"
echo ""
echo "📁 Files created:"
ls -la *.zip 2>/dev/null || echo "No zip files found"
ls -la PROJECT_INFO.txt
ls -la setup-new-machine.*
ls -la TRANSFER_CHECKLIST.md
ls -la PROJECT_PACKAGING_GUIDE.md

if [ -f "backup/database_backup.sql" ]; then
    echo "💾 Database backup: backup/database_backup.sql"
fi

echo ""
echo "📋 Next steps:"
echo "1. Copy the .zip file to your new machine"
echo "2. Extract the archive"
echo "3. Run the setup script for your OS"
echo "4. Follow the TRANSFER_CHECKLIST.md"
echo ""
echo "🎉 Ready for transfer!"