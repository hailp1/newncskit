# 🚀 Hướng Dẫn Khởi Động Nhanh NCSKit

## Tổng Quan
Hướng dẫn này giúp bạn khởi động dự án NCSKit một cách nhanh chóng trên máy mới.

## ⚡ Khởi Động Nhanh (5 phút)

### 1. Yêu Cầu Hệ Thống
```bash
# Kiểm tra các công cụ cần thiết
node --version    # Cần >= 18.0.0
python --version  # Cần >= 3.8.0
docker --version  # Cần có Docker
git --version     # Cần có Git
```

### 2. Giải Nén và Setup
```bash
# Giải nén project
unzip ncskit-project-*.zip
cd ncskit-project

# Chạy setup tự động
chmod +x setup-new-machine.sh
./setup-new-machine.sh
```

### 3. Khởi Động Services
```bash
# Terminal 1: Database
docker-compose up -d

# Terminal 2: Backend
cd backend
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
python manage.py runserver

# Terminal 3: Frontend
cd frontend
npm run dev

# Terminal 4: R Server (optional)
node start-r-server.js
```

### 4. Truy Cập Ứng Dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs

## 🔧 Cấu Hình Nhanh

### Environment Variables
Tạo file `.env` trong thư mục `backend/`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://postgres:password@localhost:5432/ncskit
REDIS_URL=redis://localhost:6379/0
```

### Database Setup
```bash
# Tạo superuser
cd backend
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

## 🐛 Khắc Phục Sự Cố Nhanh

### Lỗi Port Đã Được Sử Dụng
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# Kill process nếu cần
kill -9 <PID>
```

### Lỗi Database Connection
```bash
# Restart PostgreSQL container
docker-compose restart postgres

# Kiểm tra logs
docker-compose logs postgres
```

### Lỗi Node Modules
```bash
# Xóa và cài lại
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Lỗi Python Dependencies
```bash
# Tạo lại virtual environment
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📋 Checklist Hoạt Động

- [ ] ✅ Database container đang chạy
- [ ] ✅ Backend server khởi động thành công
- [ ] ✅ Frontend development server chạy
- [ ] ✅ Có thể truy cập http://localhost:3000
- [ ] ✅ API endpoints hoạt động
- [ ] ✅ Admin panel accessible
- [ ] ✅ Database migrations đã chạy
- [ ] ✅ Static files được serve

## 🎯 Các Tính Năng Chính

### 1. Quản Lý Dự Án Nghiên Cứu
- Tạo và quản lý projects
- Research design workflow
- Data collection setup

### 2. Hệ Thống Survey
- Survey builder với question bank
- Campaign management
- Token reward system

### 3. Phân Tích Dữ Liệu
- Statistical analysis với R
- Data visualization
- Export results

### 4. Admin Dashboard
- User management
- System monitoring
- Revenue tracking

## 🔗 Links Hữu Ích

- **Documentation**: `/docs` folder
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **System Architecture**: `docs/SYSTEM_ARCHITECTURE.md`

## 📞 Hỗ Trợ

### Log Files
```bash
# Frontend logs
npm run dev  # Check terminal output

# Backend logs
tail -f backend/logs/django.log

# Database logs
docker-compose logs postgres

# R server logs
node start-r-server.js  # Check terminal output
```

### Health Check
```bash
# Test system health
node test-system-health.js

# Test database connection
node test-database-connection.js

# Test all components
node comprehensive-functional-test.js
```

### Common Commands
```bash
# Django management
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser

# Frontend development
npm run dev
npm run build
npm run start

# Docker management
docker-compose up -d
docker-compose down
docker-compose logs
```

## 🎉 Hoàn Thành!

Nếu tất cả các bước trên hoạt động bình thường, bạn đã setup thành công NCSKit!

Tiếp theo, bạn có thể:
1. Đọc User Guide để hiểu cách sử dụng
2. Khám phá API Documentation
3. Tùy chỉnh cấu hình theo nhu cầu
4. Phát triển tính năng mới

**Happy coding! 🚀**