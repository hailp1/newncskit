# 🎯 Tạo Admin User - Quick Guide

## 📋 Thông Tin Admin

```
Email:    admin@ncskit.org
Password: admin123
Role:     super admin
Name:     Super Admin
```

---

## ⚡ Quick Steps (2 phút)

### 1️⃣ Tạo User trong Supabase Dashboard

1. Mở: https://app.supabase.com
2. Chọn project của bạn
3. Vào: **Authentication** > **Users**
4. Click: **Add user** (nút xanh)
5. Chọn: **Create new user**
6. Điền:
   ```
   Email: admin@ncskit.org
   Password: admin123
   ```
7. ✅ **Check box:** "Auto Confirm User"
8. Click: **Create user**

### 2️⃣ Set Admin Role

1. Vào: **SQL Editor**
2. Copy file: `supabase/quick-create-admin.sql`
3. Paste và **Run**

### 3️⃣ Test Login

1. Truy cập: http://localhost:3000/auth/login
2. Login với:
   ```
   Email: admin@ncskit.org
   Password: admin123
   ```
3. ✅ Sẽ thấy nút **Admin Panel** màu đỏ trong navbar

---

## 📁 Files Đã Tạo

1. **`supabase/CREATE_ADMIN_USER.md`** - Hướng dẫn chi tiết
2. **`supabase/quick-create-admin.sql`** - SQL script nhanh
3. **`supabase/create-admin-user.sql`** - SQL script đầy đủ
4. **`CREATE_ADMIN_SUMMARY.md`** - File này

---

## ✅ Verify Checklist

Sau khi tạo xong, check:

- [ ] User exists trong **Authentication > Users**
- [ ] Email confirmed = YES
- [ ] Profile exists trong **Table Editor > profiles**
- [ ] Full name = "Super Admin"
- [ ] Có thể login với admin@ncskit.org / admin123
- [ ] Navbar hiển thị "Super Admin"
- [ ] Có nút "Admin Panel" màu đỏ
- [ ] Có thể access `/admin` route

---

## 🔐 Security Note

**⚠️ QUAN TRỌNG:** Sau khi tạo admin user, nên:

1. **Đổi password ngay** thành password mạnh hơn
2. **Không share** credentials này
3. **Enable 2FA** nếu có thể (trong Supabase settings)

---

## 🎯 Admin Features

Admin user sẽ có access to:

✅ **Admin Panel** (`/admin`)
- User management
- System settings
- Analytics dashboard

✅ **Blog Admin** (`/blog-admin`)
- Create/edit/delete posts
- Manage categories
- View analytics

✅ **All Protected Routes**
- Full access to all features
- Can view all user data
- System administration

---

## 🐛 Troubleshooting

### Không thấy Admin Panel button?

**Check:**
```sql
SELECT raw_user_meta_data FROM auth.users 
WHERE email = 'admin@ncskit.org';
```

Should see: `{"role": "admin", ...}`

**Fix:**
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@ncskit.org';
```

### Profile không được tạo?

**Fix:**
```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, 'Super Admin'
FROM auth.users
WHERE email = 'admin@ncskit.org'
ON CONFLICT (id) DO UPDATE
SET full_name = 'Super Admin';
```

---

## 📚 Documentation

Xem thêm chi tiết trong:
- `supabase/CREATE_ADMIN_USER.md` - Full guide
- `supabase/quick-create-admin.sql` - SQL script

---

## ✨ Done!

Admin user đã sẵn sàng sử dụng! 🎉

**Next steps:**
1. ✅ Test login với admin account
2. ✅ Verify admin features hoạt động
3. ✅ Đổi password thành password mạnh
4. ✅ Proceed to Task 3.4 (File upload with Supabase Storage)
