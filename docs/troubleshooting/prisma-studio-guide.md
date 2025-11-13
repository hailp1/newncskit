# 🎨 Prisma Studio - GUI Guide

## ✅ Prisma Studio Đã Chạy!

**URL:** http://localhost:5555

---

## 📖 Hướng Dẫn Sử Dụng

### Bước 1: Mở Browser

```
Mở trình duyệt và truy cập:
http://localhost:5555
```

### Bước 2: Chọn Table "users"

Trong Prisma Studio, bạn sẽ thấy:
```
┌─────────────────────────┐
│ Prisma Studio           │
├─────────────────────────┤
│ Models:                 │
│ ├─ Account             │
│ ├─ Session             │
│ ├─ User                │ ← Click vào đây
│ ├─ Project             │
│ ├─ ...                 │
└─────────────────────────┘
```

### Bước 3: Tìm User

Sau khi click vào "User", bạn sẽ thấy danh sách users.

**Tìm user với:**
- Email: `phuchai.le@gmail.com`

**Cách tìm:**
1. Scroll xuống để tìm
2. Hoặc dùng filter (nếu có nhiều users)

### Bước 4: Edit Role

**Khi tìm thấy user:**

1. Click vào row của user đó
2. Tìm field "role"
3. Click vào giá trị hiện tại (có thể là "user" hoặc "authenticated")
4. Đổi thành: `admin`
5. Click nút "Save 1 change" (màu xanh, góc trên)

### Bước 5: Verify

Sau khi save, check lại:
- Field "role" = "admin" ✅
- Field "status" = "active" ✅

---

## 🎯 Visual Guide

### Giao Diện Prisma Studio:

```
┌──────────────────────────────────────────────────────────┐
│  Prisma Studio                                    [Save] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Models          │  User Table                           │
│  ├─ Account      │  ┌────────────────────────────────┐  │
│  ├─ Session      │  │ id    email           role     │  │
│  ├─ User    ←    │  ├────────────────────────────────┤  │
│  ├─ Project      │  │ abc   phuchai.le...   user ← Edit│
│  └─ ...          │  │ def   other@...       user     │  │
│                  │  └────────────────────────────────┘  │
│                  │                                       │
└──────────────────────────────────────────────────────────┘
```

### Khi Click Vào Row:

```
┌──────────────────────────────────────────────────────────┐
│  Edit User                                  [Save 1 change]│
├──────────────────────────────────────────────────────────┤
│                                                           │
│  id:           abc-123-def-456                           │
│  email:        phuchai.le@gmail.com                      │
│  fullName:     Le Hai                                    │
│  role:         [user ▼]  ← Click here                    │
│                ├─ user                                    │
│                ├─ admin      ← Select this               │
│                ├─ moderator                              │
│                └─ super_admin                            │
│  status:       active                                    │
│  ...                                                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Sau Khi Save

### Bước 1: Đóng Prisma Studio
- Có thể đóng tab browser
- Hoặc để mở (không ảnh hưởng)

### Bước 2: Logout Khỏi App
```
1. Vào app: http://localhost:3000
2. Click user menu (góc phải)
3. Click "Đăng xuất"
```

### Bước 3: Login Lại
```
URL: http://localhost:3000/login
Email: phuchai.le@gmail.com
Password: Admin123
```

### Bước 4: Check Header
Sau khi login, click vào user menu → Should see:
```
┌─────────────────────────┐
│ Le Hai                  │
│ phuchai.le@gmail.com    │
│ admin                   │
├─────────────────────────┤
│ Quản lý tài khoản      │
│ Cài đặt                │
│ Làm mới thông tin      │
├─────────────────────────┤
│ Admin Panel        ← NEW!│
│ Cài đặt Admin      ← NEW!│
├─────────────────────────┤
│ Đăng xuất              │
└─────────────────────────┘
```

---

## 🔍 Troubleshooting

### Issue 1: Prisma Studio Không Mở

**Symptom:**
```
Error: Cannot connect to database
```

**Solution:**
1. Check PostgreSQL đang chạy:
   ```
   services.msc → PostgreSQL → Start
   ```

2. Check DATABASE_URL trong .env.local

3. Restart Prisma Studio

### Issue 2: Không Thấy User

**Symptom:**
- User table trống
- Không có email phuchai.le@gmail.com

**Solution:**
1. User chưa được tạo
2. Cần chạy: `node scripts/create-admin.js`
3. Hoặc register qua app

### Issue 3: Không Save Được

**Symptom:**
- Click Save nhưng không có gì xảy ra
- Hoặc báo lỗi

**Solution:**
1. Check console trong Prisma Studio (F12)
2. Verify database connection
3. Check field validation

---

## 📝 Quick Reference

### Commands:
```bash
# Start Prisma Studio
cd frontend
npx prisma studio

# Stop Prisma Studio
Ctrl + C in terminal
```

### URLs:
```
Prisma Studio: http://localhost:5555
App Login:     http://localhost:3000/login
Debug Page:    http://localhost:3000/debug-session
```

### Credentials:
```
Email:    phuchai.le@gmail.com
Password: Admin123
```

---

## 🎊 Summary

**Current Status:**
- ✅ Prisma Studio running at http://localhost:5555
- ⏳ Waiting for you to edit role to "admin"

**Next Steps:**
1. Open http://localhost:5555
2. Click "User" model
3. Find your email
4. Edit role to "admin"
5. Save
6. Logout and login
7. Admin button appears! ✅

---

## 🚀 Ready!

**Mở browser và truy cập:**
```
http://localhost:5555
```

**Làm theo hướng dẫn trên để edit role!** 🎨
