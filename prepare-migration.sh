#!/bin/bash

# NCSKIT Project Migration Preparation Script
echo "🚀 NCSKIT Project Migration Preparation"
echo "======================================"

# Tạo thư mục backup
mkdir -p migration-backup

# 1. Dừng các services đang chạy
echo "📋 Stopping running services..."
docker-compose down 2>/dev/null || echo "Docker compose not running"

# 2. Tạo danh sách files quan trọng
echo "📝 Creating file inventory..."
find . -name "*.env*" > migration-backup/env-files.txt
find . -name "*.sql" > migration-backup/sql-files.txt
find . -name "package*.json" > migration-backup/package-files.txt
find . -name "requirements.txt" > migration-backup/requirements-files.txt

# 3. Backup database nếu có
echo "💾 Backing up databases..."
if [ -f "backend/db.sqlite3" ]; then
    cp backend/db.sqlite3 migration-backup/
    echo "✅ SQLite database backed up"
fi

# 4. Backup environment files
echo "🔧 Backing up environment files..."
cp frontend/.env* migration-backup/ 2>/dev/null || echo "No frontend .env files"
cp backend/.env* migration-backup/ 2>/dev/null || echo "No backend .env files"
cp .env* migration-backup/ 2>/dev/null || echo "No root .env files"

# 5. Tạo project info
echo "📊 Creating project information..."
cat > migration-backup/project-info.txt << EOF
NCSKIT Project Migration Info
Generated: $(date)

Project Structure:
$(find . -type d -name "node_modules" -prune -o -type d -name "venv" -prune -o -type d -print | head -20)

Key Files:
- Frontend: Next.js 16.0.1
- Backend: Django + Python
- Database: SQLite/PostgreSQL
- Analysis: R + Docker
- Cache: Redis

Ports Used:
- Frontend: 3000
- Backend: 8001
- R Analysis: 8000
- PostgreSQL: 5432
- Redis: 6379

Dependencies:
- Node.js 18+
- Python 3.11+
- Docker Desktop
- Git
EOF

# 6. Tạo archive (loại trừ node_modules, venv, .git)
echo "📦 Creating project archive..."
tar --exclude='node_modules' \
    --exclude='venv' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='__pycache__' \
    --exclude='.next' \
    -czf migration-backup/ncskit-project.tar.gz .

# 7. Tính toán kích thước
echo "📏 Calculating sizes..."
ARCHIVE_SIZE=$(du -h migration-backup/ncskit-project.tar.gz | cut -f1)
PROJECT_SIZE=$(du -sh . --exclude=node_modules --exclude=venv --exclude=.git | cut -f1)

echo ""
echo "✅ Migration preparation completed!"
echo "=================================="
echo "📦 Archive size: $ARCHIVE_SIZE"
echo "📁 Project size (excluding deps): $PROJECT_SIZE"
echo "📂 Backup location: ./migration-backup/"
echo ""
echo "📋 Next steps:"
echo "1. Copy migration-backup/ncskit-project.tar.gz to new machine"
echo "2. Extract: tar -xzf ncskit-project.tar.gz"
echo "3. Follow PROJECT_MIGRATION_GUIDE.md"
echo ""
echo "🔗 Files to transfer:"
ls -la migration-backup/