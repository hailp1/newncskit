# 🚀 NCSKIT Project Migration Guide

## 📋 Tổng quan
Hướng dẫn di chuyển toàn bộ dự án NCSKIT từ máy hiện tại sang máy mới.

## 🎯 Chuẩn bị trước khi di chuyển

### 1. **Dừng tất cả services đang chạy**
```bash
# Dừng Docker containers
docker-compose down

# Dừng Next.js dev server (Ctrl+C)
# Dừng các processes khác
```

### 2. **Kiểm tra dung lượng dự án**
```bash
# Kiểm tra kích thước thư mục
du -sh .
# Hoặc trên Windows
dir /s
```

## 📦 Các phương pháp di chuyển

### **Phương pháp 1: Git Repository (Khuyến nghị)**

#### Bước 1: Tạo Git repository
```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial NCSKIT project setup"

# Tạo repository trên GitHub/GitLab
# Push lên remote
git remote add origin <your-repo-url>
git push -u origin main
```

#### Bước 2: Clone trên máy mới
```bash
# Clone project
git clone <your-repo-url>
cd ncskit

# Cài đặt dependencies
cd frontend
npm install

cd ../backend
pip install -r requirements.txt
```

### **Phương pháp 2: Nén và copy trực tiếp**

#### Bước 1: Tạo archive
```bash
# Trên Windows
tar -czf ncskit-project.tar.gz . --exclude=node_modules --exclude=venv --exclude=.git

# Hoặc sử dụng 7-Zip/WinRAR
```

#### Bước 2: Copy sang máy mới
- USB/External drive
- Cloud storage (Google Drive, OneDrive)
- Network transfer

## 🔧 Thiết lập trên máy mới

### **Yêu cầu hệ thống:**
- Node.js 18+ và npm
- Python 3.11+
- Docker Desktop
- Git
- R (tùy chọn, có thể dùng Docker)

### **Bước 1: Cài đặt dependencies**

#### Frontend (Next.js)
```bash
cd frontend
npm install
```

#### Backend (Django)
```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

### **Bước 2: Cấu hình environment**

#### Frontend environment
```bash
# Tạo frontend/.env.local
cp .env.example .env.local
# Chỉnh sửa các biến môi trường
```

#### Backend environment
```bash
# Tạo backend/.env
cp .env.example .env
# Cấu hình database, API keys
```

### **Bước 3: Khởi động services**

#### Sử dụng Docker (Khuyến nghị)
```bash
# Khởi động tất cả services
docker-compose up

# Hoặc chỉ khởi động một số services
docker-compose up postgres redis r-analysis
```

#### Khởi động thủ công
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend (nếu cần)
cd backend
python manage.py runserver 8001

# Terminal 3: R Analysis (nếu có R)
cd backend/r_analysis
Rscript analysis_server.R
```

## 📊 Database Migration

### **Nếu có dữ liệu quan trọng:**

#### PostgreSQL
```bash
# Xuất database từ máy cũ
pg_dump -h localhost -U user -d ncskit > ncskit_backup.sql

# Import vào máy mới
psql -h localhost -U user -d ncskit < ncskit_backup.sql
```

#### SQLite (Django default)
```bash
# Copy file db.sqlite3 từ backend/
cp backend/db.sqlite3 /path/to/new/machine/backend/
```

## ✅ Kiểm tra sau khi migration

### **1. Kiểm tra services**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001 (nếu có)
- R Analysis: http://localhost:8000 (nếu có)

### **2. Test các tính năng chính**
- [ ] Blog system hoạt động
- [ ] Authentication
- [ ] Dashboard
- [ ] Analysis tools
- [ ] Admin panel

### **3. Kiểm tra logs**
```bash
# Docker logs
docker-compose logs

# Next.js logs
npm run dev

# Django logs
python manage.py runserver
```

## 🚨 Troubleshooting

### **Lỗi thường gặp:**

#### Port conflicts
```bash
# Kiểm tra ports đang sử dụng
netstat -an | findstr :3000
netstat -an | findstr :8000
netstat -an | findstr :8001
```

#### Permission issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

#### Docker issues
```bash
# Reset Docker
docker system prune -a
docker-compose down --volumes
docker-compose up --build
```

#### Node modules issues
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📝 Checklist Migration

### **Trước khi di chuyển:**
- [ ] Backup dữ liệu quan trọng
- [ ] Dừng tất cả services
- [ ] Kiểm tra .env files
- [ ] Tạo Git repository (nếu chưa có)

### **Sau khi di chuyển:**
- [ ] Cài đặt dependencies
- [ ] Cấu hình environment variables
- [ ] Khởi động services
- [ ] Test tất cả tính năng
- [ ] Kiểm tra logs

## 🎯 Lưu ý quan trọng

1. **Không copy node_modules và venv** - Luôn cài lại trên máy mới
2. **Kiểm tra .env files** - Có thể cần thay đổi paths, URLs
3. **Docker volumes** - Có thể cần reset nếu có lỗi
4. **Ports** - Đảm bảo không bị conflict với services khác
5. **Permissions** - Đặc biệt quan trọng trên Linux/Mac

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình migration, hãy kiểm tra:
1. Logs của từng service
2. Network connectivity
3. File permissions
4. Environment variables
5. Dependencies versions