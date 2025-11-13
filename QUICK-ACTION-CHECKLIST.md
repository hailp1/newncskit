# Quick Action Checklist - Làm Ngay

## ✅ ĐÃ LÀM
- [x] Khởi động Docker Desktop (đang chạy)
- [x] Phân tích OAuth config
- [x] Tạo báo cáo chi tiết

## 🔄 ĐANG CHỜ
- [ ] Docker Desktop khởi động xong (2-3 phút)

## 📋 CẦN LÀM TIẾP

### 1. Database (Ưu tiên cao nhất)

**Khi Docker sẵn sàng (kiểm tra bằng `docker ps`):**
```powershell
# Start PostgreSQL
docker-compose -f docker-compose.production.yml up -d postgres

# Đợi 15 giây
Start-Sleep -Seconds 15

# Khởi tạo database
cd frontend
npx prisma db push

# Restart dev server (Ctrl+C rồi chạy lại)
npm run dev
```

### 2. Google OAuth Config

**Vào Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**Sửa OAuth 2.0 Client ID:**

**Authorized JavaScript Origins - THÊM:**
```
http://localhost:3000
```

**Authorized Redirect URIs - THÊM:**
```
http://localhost:3000/api/auth/callback/google
```

**Authorized Redirect URIs - XÓA:**
```
https://hfczndbrexnaoczxmopn.supabase.co/auth/v1/callback
https://app.ncskit.org/api/auth/callback/linkedin
https://ncskit.org/api/auth/callback/linkedin
```

**Điền credentials vào `.env.local`:**
```env
GOOGLE_CLIENT_ID=your_client_id_from_google_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_console
```

### 3. Kiểm Tra Kết Quả

**Database:**
```powershell
cd frontend
npx prisma migrate status
```
Phải thấy: "Database schema is up to date!"

**App:**
- Mở http://localhost:3000
- Không còn lỗi 500 ✅
- Blog posts load được ✅

**Google OAuth:**
- Thấy nút "Sign in with Google" ✅
- Click vào không lỗi ✅

## ⏱️ THỜI GIAN ƯỚC TÍNH

- Docker khởi động: 2-3 phút
- Setup database: 1 phút
- Fix Google OAuth: 2 phút
- **Tổng: ~5-6 phút**

## 🆘 NẾU GẶP VẤN ĐỀ

### Docker không khởi động sau 5 phút
→ Dùng cloud database (Supabase/Neon) - xem `BAO-CAO-TONG-HOP.md`

### Prisma db push lỗi
→ Kiểm tra DATABASE_URL trong `.env.local`
→ Kiểm tra PostgreSQL container đang chạy: `docker ps`

### Google OAuth không hoạt động
→ Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET đã điền chưa
→ Kiểm tra redirect URIs trong Google Console

## 📄 TÀI LIỆU THAM KHẢO

- `BAO-CAO-TONG-HOP.md` - Chi tiết đầy đủ
- `MANUAL-DATABASE-SETUP.md` - Hướng dẫn database
- `GOOGLE-OAUTH-FIX.md` - Hướng dẫn OAuth

---

**Bắt đầu từ bước 1 (Database) ngay khi Docker sẵn sàng!**
