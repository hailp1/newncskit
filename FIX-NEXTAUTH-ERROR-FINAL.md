# 🔧 Khắc Phục NextAuth CLIENT_FETCH_ERROR - Giải Pháp Cuối Cùng

## 🚨 Vấn Đề Chính

**Next.js không chạy trên port 3000!**

Lỗi `CLIENT_FETCH_ERROR` xảy ra vì client-side NextAuth không thể kết nối với API route `/api/auth/session` vì server không chạy.

---

## ✅ Giải Pháp

### Bước 1: Khởi Động Next.js ⚠️ QUAN TRỌNG NHẤT

```powershell
cd frontend
npm run dev
```

**Hoặc dùng script tự động:**
```powershell
.\start-all-services.ps1
```

---

### Bước 2: Đã Sửa SessionProvider

Đã cập nhật `frontend/src/components/auth/session-provider-wrapper.tsx` với:
- `basePath="/api/auth"` - Đảm bảo NextAuth biết đúng đường dẫn API
- `refetchInterval={0}` - Tắt auto-refetch để tránh lỗi
- `refetchOnWindowFocus={false}` - Tắt refetch khi focus window

---

### Bước 3: Kiểm Tra

1. **Kiểm tra Next.js đang chạy:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
   ```

2. **Test API route:**
   - Mở browser: http://localhost:3000/api/auth/providers
   - Phải trả về JSON với danh sách providers

3. **Hard refresh browser:**
   - Nhấn `Ctrl+Shift+R` (Hard Refresh)

---

## 📋 Checklist

- [ ] Next.js đang chạy trên port 3000
- [ ] File `.env.local` có `NEXTAUTH_URL=http://localhost:3000`
- [ ] File `.env.local` có `NEXTAUTH_SECRET` (ít nhất 32 ký tự)
- [ ] SessionProvider đã được cập nhật với `basePath`
- [ ] Browser đã được hard refresh
- [ ] API route `/api/auth/providers` trả về JSON

---

## 🔍 Debug

### Kiểm Tra Next.js Logs

Trong cửa sổ PowerShell đang chạy `npm run dev`, kiểm tra:
- Có lỗi khi khởi động không?
- Có lỗi khi load environment variables không?
- Có lỗi khi compile không?

### Kiểm Tra Browser Console

Mở DevTools (F12) → Console:
- Có lỗi network không?
- Có lỗi CORS không?
- NextAuth đang cố fetch từ URL nào?

### Test API Routes Trực Tiếp

```powershell
# Test providers
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -UseBasicParsing

# Test session
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/session" -UseBasicParsing
```

---

## 🛠️ Nếu Vẫn Còn Lỗi

### 1. Xóa Cache và Rebuild

```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### 2. Kiểm Tra Environment Variables

```powershell
cd frontend
Get-Content .env.local | Select-String "NEXTAUTH"
```

### 3. Kiểm Tra Port Conflict

```powershell
# Xem process nào đang dùng port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Get-Process -Id <PID>
```

### 4. Restart Tất Cả

```powershell
# Dừng tất cả Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Khởi động lại
.\start-all-services.ps1
```

---

## 📝 Thay Đổi Đã Thực Hiện

1. ✅ Cập nhật `SessionProvider` với `basePath="/api/auth"`
2. ✅ Tắt auto-refetch để tránh lỗi
3. ✅ Tạo script `start-all-services.ps1` để khởi động tự động

---

## 🎯 Kết Luận

**Vấn đề chính:** Next.js không chạy → Client không thể kết nối với API

**Giải pháp:** Khởi động Next.js và hard refresh browser

**Sau khi khởi động Next.js, lỗi sẽ biến mất!**

---

*Cập nhật: 2025-11-13*

