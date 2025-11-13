# 🔍 Admin Header Debug Guide

## Vấn Đề
Sau khi login bằng tài khoản admin, phần admin vẫn không xuất hiện ở header.

---

## ✅ Đã Tạo Debug Tools

### 1. Debug Session Page
**File:** `frontend/src/app/debug-session/page.tsx`

**URL:** http://localhost:3000/debug-session

**Chức năng:**
- ✅ Hiển thị NextAuth session
- ✅ Hiển thị Auth Store state
- ✅ Check admin role
- ✅ So sánh cả 2 systems

### 2. Check Admin Script
**File:** `frontend/scripts/check-admin.js`

**Command:**
```bash
cd frontend
node scripts/check-admin.js
```

**Chức năng:**
- ✅ Kiểm tra admin account trong database
- ✅ Hiển thị role và status
- ✅ Verify admin permissions

### 3. Fix Admin Role Script
**File:** `frontend/scripts/fix-admin-role.js`

**Command:**
```bash
cd frontend
node scripts/fix-admin-role.js
```

**Chức năng:**
- ✅ Update role thành "admin"
- ✅ Set status thành "active"
- ✅ Confirm changes

---

## 🎯 Cách Test

### Bước 1: Check Database (Optional)
```bash
cd frontend
node scripts/check-admin.js
```

**Expected Output:**
```
✅ Admin account found:
Email: phuchai.le@gmail.com
Role: admin
Status: active
```

**Nếu role không phải "admin":**
```bash
node scripts/fix-admin-role.js
```

### Bước 2: Login
```
URL: http://localhost:3000/login
Email: phuchai.le@gmail.com
Password: Admin123
```

### Bước 3: Check Debug Page
```
URL: http://localhost:3000/debug-session
```

**Expected Results:**
- ✅ NextAuth Status: "authenticated"
- ✅ NextAuth Role: "admin"
- ✅ Auth Store Role: "admin"
- ✅ Is Admin: YES (both)

### Bước 4: Check Header
Sau khi login, header should show:
- ✅ User menu với tên
- ✅ Admin Panel link trong dropdown
- ✅ Cài đặt Admin link

---

## 🔍 Troubleshooting

### Issue 1: Database Connection Error
**Symptom:**
```
Cannot fetch data from service
```

**Solution:**
1. Check PostgreSQL đang chạy:
```bash
# Windows
services.msc
# Tìm "PostgreSQL" và start nếu stopped
```

2. Check DATABASE_URL trong `.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ncskit
```

3. Test connection:
```bash
cd frontend
npx prisma db push
```

### Issue 2: Role Không Hiển Thị
**Symptom:**
- Debug page shows role = "user" hoặc null
- Admin links không xuất hiện

**Solution:**
```bash
cd frontend
node scripts/fix-admin-role.js
```

Sau đó logout và login lại.

### Issue 3: Session Không Sync
**Symptom:**
- NextAuth có role "admin"
- Auth Store có role "user" hoặc null

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear cookies và login lại
3. Check console cho errors

### Issue 4: Header Không Update
**Symptom:**
- Debug page shows admin = YES
- Header vẫn không có admin links

**Solution:**
1. Check `frontend/src/components/layout/header.tsx`
2. Verify `isAdmin` function:
```typescript
const isAdmin = checkIsAdmin(user)
```

3. Check console cho errors:
```
F12 → Console tab
```

---

## 📊 Expected Flow

### Correct Flow:
```
Login → NextAuth creates session with role="admin"
         ↓
SessionSync component syncs to Auth Store
         ↓
Header reads from Auth Store
         ↓
isAdmin(user) returns true
         ↓
Admin links appear in dropdown
```

### Debug Points:
1. **NextAuth Session:** Check `/debug-session`
2. **Auth Store:** Check `/debug-session`
3. **Header Component:** Check browser console
4. **isAdmin Function:** Check `frontend/src/lib/auth-utils.ts`

---

## 🚀 Quick Test Commands

```bash
# 1. Check admin account
cd frontend
node scripts/check-admin.js

# 2. Fix role if needed
node scripts/fix-admin-role.js

# 3. Start dev server (if not running)
npm run dev

# 4. Open browser
# http://localhost:3000/login
# Login → Check header → Check /debug-session
```

---

## 📝 Files to Check

### 1. Header Component
**File:** `frontend/src/components/layout/header.tsx`
**Line:** ~200 (Admin links section)

### 2. Auth Store
**File:** `frontend/src/store/auth.ts`
**Method:** `setSession()`

### 3. Session Sync
**File:** `frontend/src/components/auth/session-provider-wrapper.tsx`
**Component:** `SessionSync`

### 4. NextAuth Config
**File:** `frontend/src/lib/auth.ts`
**Callback:** `jwt()` and `session()`

### 5. isAdmin Function
**File:** `frontend/src/lib/auth-utils.ts`
**Function:** `isAdmin()`

---

## ✅ Success Criteria

### After Login:
- ✅ `/debug-session` shows role = "admin"
- ✅ Header dropdown has "Admin Panel" link
- ✅ Header dropdown has "Cài đặt Admin" link
- ✅ Can access `/admin` page
- ✅ No console errors

### Debug Page Should Show:
```
NextAuth Session:
  Status: authenticated
  Role: admin
  Is Admin: ✅ YES

Auth Store:
  Authenticated: ✅ YES
  Role: admin
  Is Admin: ✅ YES
```

---

## 🎊 Next Steps

1. **Login:** http://localhost:3000/login
2. **Debug:** http://localhost:3000/debug-session
3. **Check header** for admin dropdown
4. **Test admin access:** http://localhost:3000/admin

**Nếu vẫn không work, check console và share screenshot của debug page!**
