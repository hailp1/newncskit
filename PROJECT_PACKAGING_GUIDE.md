# Hướng Dẫn Đóng Gói Dự Án NCSKit

## Tổng Quan
Hướng dẫn này giúp bạn đóng gói dự án NCSKit để chuyển sang máy khác một cách an toàn và đầy đủ.

## Các Bước Đóng Gói

### 1. Dọn Dẹp Dự Án

Trước khi đóng gói, hãy dọn dẹp các file không cần thiết:

```bash
# Xóa node_modules (sẽ được cài lại trên máy mới)
rm -rf frontend/node_modules
rm -rf frontend/.next

# Xóa Python virtual environment (sẽ được tạo lại)
rm -rf backend/venv
rm -rf backend/__pycache__
rm -rf backend/apps/*/__pycache__
rm -rf backend/apps/*/migrations/__pycache__

# Xóa các file log và cache
rm -rf backend/logs
rm -rf frontend/.turbo
```

### 2. Kiểm Tra File Cấu Hình

Đảm bảo các file cấu hình quan trọng có mặt:

**Frontend:**
- `frontend/package.json` ✓
- `frontend/package-lock.json` ✓
- `frontend/next.config.ts` ✓
- `frontend/.env.local` (nếu có)

**Backend:**
- `backend/requirements.txt` ✓
- `backend/ncskit_backend/settings.py` ✓
- `backend/.env` ✓
- `backend/manage.py` ✓

**Docker:**
- `docker-compose.yml` ✓
- `backend/Dockerfile` ✓

### 3. Tạo File Backup Database

```bash
# Backup PostgreSQL database (nếu đang chạy)
pg_dump -h localhost -U postgres -d ncskit > database_backup.sql

# Hoặc sử dụng script có sẵn
node setup-local-database.js --backup
```

### 4. Tạo Archive

#### Sử dụng Git (Khuyến nghị)
```bash
# Đảm bảo tất cả thay đổi đã được commit
git add .
git commit -m "Prepare for project transfer"

# Tạo archive từ Git
git archive --format=zip --output=ncskit-project.zip HEAD
```

#### Sử dụng Zip thông thường
```bash
# Tạo zip file loại trừ các thư mục không cần thiết
zip -r ncskit-project.zip . \
  -x "frontend/node_modules/*" \
  -x "frontend/.next/*" \
  -x "backend/venv/*" \
  -x "backend/__pycache__/*" \
  -x "backend/logs/*" \
  -x "*.pyc" \
  -x ".git/*"
```

### 5. Tạo Setup Script cho Máy Mới

Tạo file `setup-new-machine.sh`:

```bash
#!/bin/bash
echo "Setting up NCSKit on new machine..."

# Install Node.js dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup Python virtual environment
echo "Setting up Python environment..."
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
cd ..

# Setup database
echo "Setting up database..."
docker-compose up -d postgres
sleep 10
node setup-local-database.js

# Run migrations
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
cd ..

echo "Setup complete! You can now run the project with:"
echo "1. Start backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Start R server: node start-r-server.js"
```

### 6. Tạo File Checklist

Tạo file `TRANSFER_CHECKLIST.md`:

```markdown
# Checklist Chuyển Dự Án

## Trước Khi Đóng Gói
- [ ] Commit tất cả thay đổi vào Git
- [ ] Backup database
- [ ] Xóa node_modules và .next
- [ ] Xóa Python venv và __pycache__
- [ ] Kiểm tra file .env có đầy đủ

## Sau Khi Giải Nén Trên Máy Mới
- [ ] Cài đặt Node.js (v18+)
- [ ] Cài đặt Python (v3.8+)
- [ ] Cài đặt Docker và Docker Compose
- [ ] Cài đặt R (v4.0+)
- [ ] Chạy setup-new-machine.sh
- [ ] Kiểm tra kết nối database
- [ ] Test chạy frontend và backend
- [ ] Restore database backup (nếu cần)

## Yêu Cầu Hệ Thống Máy Mới
- Node.js 18+
- Python 3.8+
- Docker & Docker Compose
- R 4.0+
- PostgreSQL (qua Docker)
- Git
```

## Cấu Trúc Dự Án Sau Khi Đóng Gói

```
ncskit-project/
├── frontend/                 # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── next.config.ts
├── backend/                  # Django backend
│   ├── apps/
│   ├── ncskit_backend/
│   ├── requirements.txt
│   └── manage.py
├── docs/                     # Documentation
├── .kiro/                    # Kiro specs
├── docker-compose.yml        # Docker configuration
├── setup-new-machine.sh      # Setup script
├── TRANSFER_CHECKLIST.md     # Transfer checklist
└── README.md                 # Project readme
```

## Lưu Ý Quan Trọng

1. **Environment Variables**: Đảm bảo file `.env` có đầy đủ thông tin cần thiết
2. **Database**: Backup database trước khi chuyển
3. **Dependencies**: Không đóng gói node_modules và venv
4. **Secrets**: Kiểm tra không có API keys hoặc passwords trong code
5. **Permissions**: Đảm bảo setup script có quyền execute

## Khôi Phục Trên Máy Mới

1. Giải nén project
2. Chạy `chmod +x setup-new-machine.sh`
3. Chạy `./setup-new-machine.sh`
4. Kiểm tra các service hoạt động
5. Restore database backup nếu cần

## Hỗ Trợ

Nếu gặp vấn đề khi setup trên máy mới, kiểm tra:
- Log files trong `backend/logs/`
- Docker container status: `docker-compose ps`
- Database connection: `node test-database-connection.js`
- R server: `node start-r-server.js`