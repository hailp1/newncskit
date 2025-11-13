# Quick Fix - Setup Database Ngay (5 phút)

## Vấn Đề Hiện Tại

❌ NextAuth CLIENT_FETCH_ERROR
❌ 500 Server Error khi load blog posts
❌ Docker Desktop không khởi động được

## Giải Pháp Nhanh Nhất: Supabase Free Database

### Bước 1: Tạo Database (2 phút)

1. **Vào Supabase:**
   ```
   https://supabase.com
   ```

2. **Sign up/Login:**
   - Dùng Google hoặc GitHub để đăng nhập nhanh

3. **Create New Project:**
   - Click "New Project"
   - Project name: `ncskit-dev`
   - Database password: Tạo password mạnh (lưu lại!)
   - Region: Chọn gần nhất (Singapore)
   - Click "Create new project"
   - Đợi 2 phút để database khởi tạo

### Bước 2: Lấy Connection String (1 phút)

1. **Trong Supabase Dashboard:**
   - Click vào project vừa tạo
   - Sidebar → Settings → Database

2. **Copy Connection String:**
   - Tìm section "Connection string"
   - Chọn tab "URI"
   - Copy connection string (dạng: `postgresql://postgres:[password]@...`)

3. **Thay [password]:**
   - Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo

### Bước 3: Update .env.local (30 giây)

Mở file `frontend/.env.local` và thay đổi:

```env
# Thay dòng này:
DATABASE_URL=postgresql://postgres:ncskit_secure_password_change_me@localhost:5432/ncskit_production

# Bằng connection string từ Supabase:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**Ví dụ:**
```env
DATABASE_URL=postgresql://postgres:MyStr0ngP@ssw0rd@db.abcdefghijk.supabase.co:5432/postgres
```

### Bước 4: Khởi Tạo Database Schema (1 phút)

```powershell
cd frontend
npx prisma db push
```

Bạn sẽ thấy:
```
✔ Generated Prisma Client
✔ The database is now in sync with your Prisma schema
```

### Bước 5: Restart Dev Server (30 giây)

1. **Stop dev server:** Nhấn `Ctrl+C` trong terminal đang chạy dev server

2. **Start lại:**
   ```powershell
   npm run dev
   ```

3. **Refresh browser:**
   - Mở http://localhost:3000
   - Lỗi 500 và NextAuth error sẽ biến mất!

---

## ✅ Kiểm Tra Kết Quả

### Test 1: Database Connection
```powershell
cd frontend
npx prisma migrate status
```

Kết quả: "Database schema is up to date!" ✅

### Test 2: App Hoạt Động
- Mở http://localhost:3000
- Không còn lỗi 500 ✅
- Không còn NextAuth CLIENT_FETCH_ERROR ✅

### Test 3: Login
- Vào http://localhost:3000/auth/login
- Thử đăng ký tài khoản mới
- Login thành công ✅

---

## 🎯 Tại Sao Dùng Supabase?

✅ **Free tier generous:**
- 500MB database
- Unlimited API requests
- 2GB bandwidth/month
- Đủ cho development

✅ **Nhanh:**
- Setup trong 5 phút
- Không cần Docker
- Không cần cài đặt gì

✅ **Reliable:**
- Uptime 99.9%
- Automatic backups
- SSL encryption

✅ **Easy migration:**
- Khi Docker sẵn sàng, chỉ cần:
  1. Export data từ Supabase
  2. Import vào Docker PostgreSQL
  3. Update DATABASE_URL

---

## 🔄 Alternative: Neon.tech

Nếu Supabase không hoạt động, dùng Neon:

1. **Vào:** https://neon.tech
2. **Sign up** với GitHub
3. **Create project:**
   - Name: ncskit-dev
   - Region: Singapore
4. **Copy connection string**
5. **Update .env.local**
6. **Run:** `npx prisma db push`

---

## 📊 So Sánh Options

| Option | Setup Time | Pros | Cons |
|--------|-----------|------|------|
| **Supabase** | 5 min | Free, reliable, easy | External dependency |
| **Neon** | 5 min | Free, fast, modern | External dependency |
| **Docker** | 10+ min | Local, full control | Docker issues |
| **Local PG** | 15 min | Local, no Docker | Config complexity |

**Khuyến nghị:** Dùng Supabase ngay để fix lỗi, sau đó migrate sang Docker khi có thời gian.

---

## 🚀 Next Steps Sau Khi Database OK

1. ✅ Test authentication (login/register)
2. ✅ Setup OAuth providers (Google, LinkedIn, ORCID)
3. ✅ Upload team avatars
4. ✅ Test all features
5. ✅ Deploy to production

---

## 🆘 Troubleshooting

### "Connection refused"
→ Check connection string đúng chưa
→ Check password có ký tự đặc biệt? Cần encode: `@` → `%40`, `#` → `%23`

### "SSL required"
→ Thêm `?sslmode=require` vào cuối connection string:
```
DATABASE_URL=postgresql://...postgres?sslmode=require
```

### "Database does not exist"
→ Đảm bảo dùng database name `postgres` (không phải `ncskit_production`)

### Prisma db push fails
→ Check internet connection
→ Check Supabase project đã khởi tạo xong chưa (đợi 2-3 phút)

---

## 💡 Pro Tips

1. **Save connection string:** Lưu vào password manager
2. **Backup:** Supabase tự động backup, nhưng nên export định kỳ
3. **Monitor:** Check Supabase dashboard để xem database usage
4. **Upgrade:** Nếu cần nhiều hơn 500MB, upgrade plan ($25/month)

---

**Làm theo 5 bước trên và app sẽ hoạt động ngay! 🚀**
