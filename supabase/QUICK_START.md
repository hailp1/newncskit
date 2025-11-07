# 🚀 Quick Start - Setup Supabase trong 5 phút

## Bước 1: Chạy SQL Setup (2 phút)

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (icon database bên trái)
4. Tạo **New Query**
5. Copy toàn bộ nội dung file `00-complete-setup.sql`
6. Paste vào editor
7. Click **Run** (hoặc Ctrl+Enter)

✅ **Xong!** Database schema, RLS policies, và storage buckets đã được tạo.

## Bước 2: Enable Authentication (1 phút)

### Email Auth:
1. Vào **Authentication** > **Providers**
2. **Email** đã được enable mặc định ✅

### Google OAuth (Optional):
1. Enable **Google** provider
2. Nhập Client ID và Secret từ [Google Cloud Console](https://console.cloud.google.com)
3. Thêm redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

### LinkedIn OAuth (Optional):
1. Enable **LinkedIn (OIDC)** provider
2. Nhập Client ID và Secret từ [LinkedIn Developers](https://www.linkedin.com/developers/)
3. Thêm redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

## Bước 3: Cấu Hình URLs (1 phút)

1. Vào **Authentication** > **URL Configuration**
2. Thêm **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
3. Set **Site URL**: `http://localhost:3000`

## Bước 4: Lấy API Keys (30 giây)

1. Vào **Settings** > **API**
2. Copy 2 giá trị sau:
   - **Project URL**: `https://[your-project].supabase.co`
   - **anon public key**: `eyJhbGc...`

## Bước 5: Cập Nhật .env.local (30 giây)

Mở file `frontend/.env.local` và cập nhật:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## ✅ Xác Nhận Setup Thành Công

### Kiểm tra Tables:
Vào **Table Editor**, bạn sẽ thấy:
- ✅ profiles
- ✅ projects
- ✅ datasets
- ✅ analytics_cache

### Kiểm tra Storage:
Vào **Storage**, bạn sẽ thấy:
- ✅ avatars (public)
- ✅ datasets (private)
- ✅ exports (private)

### Kiểm tra Policies:
Vào **Authentication** > **Policies**, bạn sẽ thấy policies cho:
- ✅ profiles (3 policies)
- ✅ projects (4 policies)
- ✅ datasets (4 policies)
- ✅ analytics_cache (2 policies)

## 🎉 Hoàn Tất!

Bây giờ bạn có thể:

1. **Chạy ứng dụng:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test authentication:**
   - Truy cập: http://localhost:3000/auth/register
   - Đăng ký tài khoản mới
   - Đăng nhập
   - Tạo project mới

3. **Kiểm tra database:**
   - Vào Supabase Table Editor
   - Xem table `profiles` - sẽ có user mới
   - Tạo project trong app
   - Xem table `projects` - sẽ có project mới

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"
**Giải pháp:** Chạy lại file `00-complete-setup.sql`

### Lỗi: "permission denied"
**Giải pháp:** File SQL đã có GRANT permissions, nhưng nếu vẫn lỗi:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Lỗi: Storage upload không hoạt động
**Giải pháp:** 
1. Vào **Storage** > Chọn bucket
2. Xem **Policies** tab
3. Đảm bảo có policies cho INSERT, SELECT, DELETE

### Lỗi: RLS blocking queries
**Giải pháp:** Đảm bảo user đã đăng nhập và có session hợp lệ

## 📚 Tài Liệu Chi Tiết

Xem file `SETUP_GUIDE.md` để có hướng dẫn chi tiết hơn.

## 🔗 Links Hữu Ích

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
