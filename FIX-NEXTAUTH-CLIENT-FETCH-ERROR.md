# 🔧 Khắc Phục NextAuth CLIENT_FETCH_ERROR

## 📋 Nguyên Nhân

Lỗi `[next-auth][error][CLIENT_FETCH_ERROR]` xảy ra khi:
1. **NEXTAUTH_URL** không được cấu hình đúng
2. **NEXTAUTH_SECRET** thiếu hoặc không hợp lệ
3. Next.js chưa restart sau khi thay đổi environment variables
4. API route `/api/auth/[...nextauth]` không hoạt động
5. CORS hoặc network issues

---

## ✅ Giải Pháp

### Bước 1: Kiểm Tra Environment Variables

Mở file `frontend/.env.local` và đảm bảo có:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
```

**Lưu ý:**
- `NEXTAUTH_URL` phải khớp với URL bạn đang truy cập
- `NEXTAUTH_SECRET` phải có ít nhất 32 ký tự
- Generate secret: `openssl rand -base64 32`

---

### Bước 2: Restart Next.js Dev Server

**QUAN TRỌNG:** Sau khi thay đổi `.env.local`, bạn PHẢI restart Next.js:

1. Trong cửa sổ PowerShell đang chạy Next.js:
   - Nhấn `Ctrl+C` để dừng server

2. Chạy lại:
   ```powershell
   cd frontend
   npm run dev
   ```

---

### Bước 3: Kiểm Tra API Routes

Mở browser và kiểm tra:

1. **Providers endpoint:**
   ```
   http://localhost:3000/api/auth/providers
   ```
   - Phải trả về JSON với danh sách providers

2. **Session endpoint:**
   ```
   http://localhost:3000/api/auth/session
   ```
   - Phải trả về JSON (có thể là `{}` nếu chưa đăng nhập)

---

### Bước 4: Hard Refresh Browser

1. Mở DevTools (F12)
2. Nhấn `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
3. Hoặc: Right-click vào nút Refresh → "Empty Cache and Hard Reload"

---

### Bước 5: Kiểm Tra Console Logs

Mở browser DevTools → Console và kiểm tra:
- Có lỗi CORS không?
- Có lỗi network không?
- NextAuth có đang cố fetch từ đúng URL không?

---

## 🔍 Kiểm Tra Chi Tiết

### Kiểm Tra Next.js Đang Chạy:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Kiểm Tra Environment Variables:

```powershell
cd frontend
Get-Content .env.local | Select-String "NEXTAUTH"
```

### Test API Route:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -UseBasicParsing
```

---

## 🛠️ Script Tự Động

Tạo file `fix-nextauth-error.ps1` trong thư mục gốc:

```powershell
# Kiểm tra và fix NextAuth
cd frontend

# Kiểm tra .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Tao file .env.local..."
    @"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-for-local-testing-only-change-in-production-12345678
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}

# Kiểm tra NEXTAUTH_URL
$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "NEXTAUTH_URL\s*=") {
    Add-Content ".env.local" "`nNEXTAUTH_URL=http://localhost:3000"
}

# Kiểm tra NEXTAUTH_SECRET
if ($envContent -notmatch "NEXTAUTH_SECRET\s*=") {
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Add-Content ".env.local" "`nNEXTAUTH_SECRET=$secret"
}

Write-Host "✅ Da kiem tra .env.local"
Write-Host "⚠️  CAN RESTART Next.js dev server!"
Write-Host "   Ctrl+C trong cua so Next.js, roi chay lai: npm run dev"
```

---

## 📝 Checklist Khắc Phục

- [ ] File `.env.local` có `NEXTAUTH_URL=http://localhost:3000`
- [ ] File `.env.local` có `NEXTAUTH_SECRET` (ít nhất 32 ký tự)
- [ ] Đã **RESTART** Next.js dev server sau khi sửa `.env.local`
- [ ] Browser đã được hard refresh (Ctrl+Shift+R)
- [ ] API route `/api/auth/providers` trả về JSON
- [ ] Không có lỗi CORS trong console
- [ ] Next.js đang chạy trên port 3000

---

## 🚨 Lỗi Thường Gặp

### "Cannot read properties of undefined"
- **Nguyên nhân:** SessionProvider chưa được wrap đúng
- **Giải pháp:** Kiểm tra `frontend/src/app/layout.tsx` có `<AuthProviderWrapper>`

### "Network Error" hoặc "Failed to fetch"
- **Nguyên nhân:** Next.js chưa chạy hoặc API route lỗi
- **Giải pháp:** Restart Next.js và kiểm tra logs

### "Invalid NEXTAUTH_URL"
- **Nguyên nhân:** NEXTAUTH_URL không khớp với URL hiện tại
- **Giải pháp:** Đảm bảo `NEXTAUTH_URL=http://localhost:3000` khi dev local

---

## 📞 Thông Tin Thêm

- **NextAuth Docs:** https://next-auth.js.org/
- **Troubleshooting:** https://next-auth.js.org/troubleshooting
- **Environment Variables:** https://next-auth.js.org/configuration/options#environment-variables

---

*Cập nhật: 2025-11-13*

