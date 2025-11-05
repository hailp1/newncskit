# ✅ NCSKIT Migration Checklist

## 📋 Máy cũ (Chuẩn bị)

### Bước 1: Dừng services
- [ ] Dừng Next.js dev server (Ctrl+C)
- [ ] Dừng Docker: `docker-compose down`
- [ ] Dừng các processes khác

### Bước 2: Backup dữ liệu
- [ ] Copy file `backend/db.sqlite3` (nếu có)
- [ ] Backup các file `.env*`
- [ ] Backup thư mục `uploads/` (nếu có)

### Bước 3: Tạo archive
**Option A: Git (Khuyến nghị)**
```bash
git add .
git commit -m "Pre-migration backup"
git push origin main
```

**Option B: Archive file**
```bash
# Chạy script tự động
./prepare-migration.sh

# Hoặc thủ công
tar --exclude=node_modules --exclude=venv --exclude=.git -czf ncskit.tar.gz .
```

## 🚀 Máy mới (Thiết lập)

### Bước 1: Cài đặt yêu cầu hệ thống
- [ ] Node.js 18+ và npm
- [ ] Python 3.11+
- [ ] Docker Desktop
- [ ] Git

### Bước 2: Lấy project
**Option A: Git clone**
```bash
git clone <your-repo-url>
cd ncskit
```

**Option B: Extract archive**
```bash
tar -xzf ncskit.tar.gz
cd ncskit
```

### Bước 3: Chạy setup tự động
```bash
# Linux/Mac
chmod +x setup-new-machine.sh
./setup-new-machine.sh

# Windows
setup-new-machine.bat
```

### Bước 4: Khởi động services
```bash
# Sử dụng Docker (khuyến nghị)
docker-compose up

# Hoặc thủ công
cd frontend && npm run dev
```

## 🔍 Kiểm tra hoạt động

### URLs cần test:
- [ ] Frontend: http://localhost:3000
- [ ] Blog: http://localhost:3000/blog
- [ ] Dashboard: http://localhost:3000/dashboard
- [ ] About: http://localhost:3000/about

### Tính năng cần test:
- [ ] Trang chủ load được
- [ ] Blog system hiển thị 2 bài viết
- [ ] Navigation menu hoạt động
- [ ] Responsive design
- [ ] Console không có lỗi critical

## 🚨 Troubleshooting nhanh

### Port conflicts:
```bash
# Kiểm tra port đang dùng
netstat -an | findstr :3000
# Kill process nếu cần
```

### Node modules issues:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Docker issues:
```bash
docker-compose down --volumes
docker system prune -a
docker-compose up --build
```

### Permission issues (Linux/Mac):
```bash
sudo chown -R $USER:$USER .
chmod +x *.sh
```

## 📞 Hỗ trợ nhanh

**Lỗi thường gặp:**
1. **Port 3000 busy** → Dừng process khác hoặc đổi port
2. **npm install fails** → Xóa node_modules và cài lại
3. **Docker build fails** → Kiểm tra Docker Desktop đang chạy
4. **Permission denied** → Chạy với sudo hoặc thay đổi ownership

**Thông tin project:**
- Frontend: Next.js 16.0.1
- Backend: Django + Python
- Database: SQLite (development)
- Analysis: R + Docker
- Cache: Redis

**Kích thước dự án:** ~50-100MB (không bao gồm dependencies)