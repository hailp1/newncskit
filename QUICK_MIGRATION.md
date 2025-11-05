# ⚡ NCSKIT Quick Migration

## 🎯 Tóm tắt nhanh cho việc di chuyển dự án

### 📦 **Máy cũ - 3 bước:**
1. **Dừng services:** `docker-compose down` + Ctrl+C Next.js
2. **Tạo backup:** `./prepare-migration.sh` hoặc Git push
3. **Copy files:** Chuyển archive/repo sang máy mới

### 🚀 **Máy mới - 3 bước:**
1. **Cài đặt:** Node.js, Python, Docker, Git
2. **Lấy project:** Git clone hoặc extract archive
3. **Setup:** `./setup-new-machine.sh` (Linux/Mac) hoặc `setup-new-machine.bat` (Windows)

### ✅ **Kiểm tra:**
- Frontend: http://localhost:3000
- Blog hoạt động: http://localhost:3000/blog

---

## 📋 **Chi tiết đầy đủ:**
- `PROJECT_MIGRATION_GUIDE.md` - Hướng dẫn chi tiết
- `MIGRATION_CHECKLIST.md` - Checklist từng bước
- `prepare-migration.sh` - Script chuẩn bị
- `setup-new-machine.sh/.bat` - Script thiết lập

## 🔧 **Yêu cầu hệ thống:**
- Node.js 18+, Python 3.11+, Docker Desktop, Git
- ~100MB dung lượng (không bao gồm dependencies)
- Ports: 3000 (frontend), 8000 (R), 8001 (backend)

## 🚨 **Lưu ý quan trọng:**
- KHÔNG copy `node_modules/` và `venv/` - luôn cài lại
- Kiểm tra file `.env` có thể cần chỉnh sửa
- Đảm bảo ports không bị conflict