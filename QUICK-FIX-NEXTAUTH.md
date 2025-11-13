# ⚡ Quick Fix: NextAuth CLIENT_FETCH_ERROR

## 🎯 Giải Pháp Nhanh (3 Bước)

### Bước 1: Kiểm Tra .env.local

```powershell
cd frontend
Get-Content .env.local | Select-String "NEXTAUTH"
```

**Phải có:**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=... (ít nhất 32 ký tự)
```

**Nếu thiếu, thêm vào file `.env.local`:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-for-local-testing-only-change-in-production-12345678
```

---

### Bước 2: RESTART Next.js ⚠️ QUAN TRỌNG

1. Trong cửa sổ PowerShell đang chạy Next.js:
   - Nhấn `Ctrl+C`

2. Chạy lại:
   ```powershell
   cd frontend
   npm run dev
   ```

**⚠️ LƯU Ý:** Phải restart sau khi sửa `.env.local`!

---

### Bước 3: Hard Refresh Browser

1. Mở DevTools (F12)
2. Nhấn `Ctrl+Shift+R` (Hard Refresh)
3. Kiểm tra lại console

---

## ✅ Kiểm Tra

Mở browser và test:
- http://localhost:3000/api/auth/providers (phải trả về JSON)
- http://localhost:3000/api/auth/session (phải trả về JSON)

---

## 📝 Nguyên Nhân

Lỗi này thường xảy ra khi:
1. `NEXTAUTH_URL` không được set
2. Next.js chưa restart sau khi sửa env
3. API route không hoạt động

---

*Xem chi tiết: `FIX-NEXTAUTH-CLIENT-FETCH-ERROR.md`*

