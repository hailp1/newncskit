# Fix NextAuth CLIENT_FETCH_ERROR

## ✅ Database Đã OK

Server logs cho thấy:
- ✅ Database queries hoạt động
- ✅ Blog API: 200 OK
- ✅ Auth API: 200 OK (`/api/auth/_log`)

## ❌ Vấn Đề: Browser Cache

NextAuth CLIENT_FETCH_ERROR thường do:
1. Browser cache cũ
2. Session cookies cũ
3. Service worker cũ

## 🔧 Giải Pháp

### Bước 1: Clear Browser Cache (Khuyến nghị)

**Chrome/Edge:**
1. Nhấn `Ctrl + Shift + Delete`
2. Chọn "Cached images and files"
3. Chọn "Cookies and other site data"
4. Time range: "All time"
5. Click "Clear data"

**Hoặc Hard Refresh:**
1. Nhấn `Ctrl + Shift + R` (Windows)
2. Hoặc `Ctrl + F5`

### Bước 2: Clear Application Storage

**Chrome DevTools:**
1. Nhấn `F12` để mở DevTools
2. Tab "Application"
3. Sidebar → "Storage"
4. Click "Clear site data"
5. Refresh page (`F5`)

### Bước 3: Incognito/Private Mode

Test trong Incognito window:
1. `Ctrl + Shift + N` (Chrome)
2. Vào http://localhost:3000
3. Check xem còn lỗi không

### Bước 4: Check NextAuth Session

Mở DevTools Console và chạy:
```javascript
// Check session
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)

// Check CSRF token
fetch('/api/auth/csrf')
  .then(r => r.json())
  .then(console.log)
```

Kết quả mong đợi:
- Session: `{}` (empty nếu chưa login)
- CSRF: `{ csrfToken: "..." }`

---

## 🧪 Test Authentication

### Test 1: Register New Account

1. Vào: http://localhost:3000/auth/register
2. Điền thông tin:
   - Email: test@example.com
   - Password: Test123456
   - Full name: Test User
3. Click "Đăng ký"
4. Nếu thành công → Redirect về dashboard

### Test 2: Login

1. Vào: http://localhost:3000/auth/login
2. Điền thông tin đã đăng ký
3. Click "Đăng nhập"
4. Nếu thành công → Redirect về dashboard

### Test 3: Check Session

Sau khi login, check console:
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Kết quả: Phải có user data

---

## 🔍 Debug Steps

### Check 1: Server Logs

Xem terminal đang chạy dev server:
- Có lỗi gì không?
- API calls có status code gì?

### Check 2: Network Tab

DevTools → Network tab:
1. Filter: "auth"
2. Refresh page
3. Check các request:
   - `/api/auth/session` → 200 OK?
   - `/api/auth/csrf` → 200 OK?
   - `/api/auth/providers` → 200 OK?

### Check 3: Console Errors

DevTools → Console:
- Có error nào khác không?
- Chỉ có NextAuth CLIENT_FETCH_ERROR?

---

## 💡 Common Causes

### 1. NEXTAUTH_URL Mismatch

Check `.env.local`:
```env
NEXTAUTH_URL=https://ncskit.org  ← Sai cho localhost!
```

Nên là:
```env
NEXTAUTH_URL=http://localhost:3000  ← Đúng cho dev
```

Để tôi check...

### 2. NEXTAUTH_SECRET Missing

Check `.env.local` có:
```env
NEXTAUTH_SECRET=dev-secret-key-for-local-testing-only-change-in-production-12345678
```

### 3. Database Connection

Đã OK ✅ (logs cho thấy queries hoạt động)

---

## 🎯 Quick Fix Script

Chạy script này để test:

```powershell
# Test database connection
cd frontend
npx prisma db execute --stdin <<< "SELECT 1;"

# Test NextAuth API
curl http://localhost:3000/api/auth/session
curl http://localhost:3000/api/auth/csrf
```

---

## ✅ Expected Results

Sau khi clear cache và refresh:
- ✅ Không còn CLIENT_FETCH_ERROR
- ✅ Login page hiển thị bình thường
- ✅ Có thể register/login
- ✅ Session hoạt động

---

## 🆘 Nếu Vẫn Lỗi

### Option 1: Check NEXTAUTH_URL

Xem file `.env.local` line ~22:
```env
NEXTAUTH_URL=???
```

Nếu là `https://ncskit.org` → Đổi thành `http://localhost:3000`

### Option 2: Restart Everything

```powershell
# Stop dev server (Ctrl+C)
# Stop Docker
docker-compose down

# Start Docker
docker-compose up -d

# Start dev server
cd frontend
npm run dev
```

### Option 3: Check Browser Console

Copy toàn bộ error message và báo cho tôi.

---

## 📊 Current Status

- ✅ Database: Connected and working
- ✅ Server: Running and responding
- ✅ APIs: Returning 200 OK
- ⚠️ Browser: Có thể cache cũ

**Khả năng cao: Chỉ cần clear browser cache là xong!**

Try: `Ctrl + Shift + R` để hard refresh!
