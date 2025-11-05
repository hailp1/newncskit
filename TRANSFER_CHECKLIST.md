# ✅ Checklist Chuyển Dự Án NCSKit

## 📋 Trước Khi Đóng Gói

### Git và Source Code
- [ ] Commit tất cả thay đổi vào Git
- [ ] Push code lên remote repository (nếu có)
- [ ] Kiểm tra `.gitignore` đã loại trừ đúng files

### Database
- [ ] Backup database hiện tại
- [ ] Export schema và data quan trọng
- [ ] Lưu file backup vào thư mục `database/`

### Dọn Dẹp Files
- [ ] Xóa `frontend/node_modules/`
- [ ] Xóa `frontend/.next/`
- [ ] Xóa `backend/venv/`
- [ ] Xóa các file `__pycache__/`
- [ ] Xóa `backend/logs/`

### Kiểm Tra Cấu Hình
- [ ] File `backend/.env` có đầy đủ thông tin
- [ ] File `frontend/.env.local` (nếu có)
- [ ] Kiểm tra `docker-compose.yml`
- [ ] Kiểm tra `requirements.txt` và `package.json`

## 📦 Đóng Gói

### Tạo Archive
- [ ] Sử dụng Git archive: `git archive --format=zip --output=ncskit-project.zip HEAD`
- [ ] Hoặc tạo zip thủ công (loại trừ node_modules, venv, .git)
- [ ] Kiểm tra kích thước file zip (không quá lớn)

### Bao Gồm Files Hỗ Trợ
- [ ] `setup-new-machine.sh` (Linux/Mac)
- [ ] `setup-new-machine.bat` (Windows)
- [ ] `PROJECT_PACKAGING_GUIDE.md`
- [ ] `TRANSFER_CHECKLIST.md`
- [ ] Database backup files

## 🖥️ Yêu Cầu Máy Mới

### Phần Mềm Cần Thiết
- [ ] Node.js 18+ (`node --version`)
- [ ] Python 3.8+ (`python --version`)
- [ ] Docker & Docker Compose (`docker --version`)
- [ ] Git (`git --version`)
- [ ] R 4.0+ (tùy chọn, cho analysis features)

### Hệ Điều Hành
- [ ] Windows 10/11, macOS 10.15+, hoặc Ubuntu 20.04+
- [ ] RAM tối thiểu 8GB (khuyến nghị 16GB)
- [ ] Ổ cứng trống tối thiểu 10GB

## 🚀 Sau Khi Giải Nén Trên Máy Mới

### Bước Đầu
- [ ] Giải nén project vào thư mục mong muốn
- [ ] Mở terminal/command prompt tại thư mục project
- [ ] Kiểm tra tất cả files đã được giải nén đúng

### Chạy Setup
- [ ] Linux/Mac: `chmod +x setup-new-machine.sh && ./setup-new-machine.sh`
- [ ] Windows: Chạy `setup-new-machine.bat` as Administrator
- [ ] Theo dõi quá trình setup, xử lý lỗi nếu có

### Kiểm Tra Sau Setup
- [ ] Database container đang chạy: `docker-compose ps`
- [ ] Test database connection: `node test-database-connection.js`
- [ ] Frontend dependencies: `cd frontend && npm list`
- [ ] Backend dependencies: `cd backend && pip list`

### Khởi Động Services
- [ ] Start database: `docker-compose up -d`
- [ ] Start backend: `cd backend && source venv/bin/activate && python manage.py runserver`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Start R server (optional): `node start-r-server.js`

### Kiểm Tra Hoạt Động
- [ ] Frontend accessible tại http://localhost:3000
- [ ] Backend API tại http://localhost:8000
- [ ] Admin panel tại http://localhost:8000/admin
- [ ] Database queries hoạt động bình thường
- [ ] File upload/download hoạt động

## 🔧 Khôi Phục Database (Nếu Cần)

### Restore từ Backup
- [ ] Copy file backup vào container: `docker cp database_backup.sql postgres_container:/backup.sql`
- [ ] Restore: `docker exec -it postgres_container psql -U postgres -d ncskit -f /backup.sql`
- [ ] Kiểm tra data đã được restore

### Tạo Admin User
- [ ] `cd backend && python manage.py createsuperuser`
- [ ] Test login vào admin panel

## 🐛 Troubleshooting

### Lỗi Thường Gặp
- [ ] Port conflicts: Kiểm tra ports 3000, 8000, 5432 có bị chiếm
- [ ] Permission errors: Chạy với quyền admin/sudo
- [ ] Docker not running: Start Docker Desktop
- [ ] Python/Node version cũ: Update lên version mới

### Log Files
- [ ] Frontend: Check browser console
- [ ] Backend: Check `backend/logs/django.log`
- [ ] Database: `docker-compose logs postgres`
- [ ] Docker: `docker-compose logs`

## 📞 Hỗ Trợ

### Tài Liệu
- [ ] Đọc `README.md` trong project
- [ ] Kiểm tra `docs/` folder
- [ ] Xem `PROJECT_STRUCTURE.md`

### Debug Commands
```bash
# Kiểm tra services
docker-compose ps
docker-compose logs

# Test connections
node test-database-connection.js
node test-system-health.js

# Django commands
python manage.py check
python manage.py showmigrations
```

## ✅ Hoàn Thành

Khi tất cả items trên đã được check:
- [ ] Project đã được setup thành công trên máy mới
- [ ] Tất cả services hoạt động bình thường
- [ ] Database và data đã được khôi phục
- [ ] Có thể develop và test như bình thường

**🎉 Chúc mừng! Dự án đã được chuyển thành công sang máy mới.**