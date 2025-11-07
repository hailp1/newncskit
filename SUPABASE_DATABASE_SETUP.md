# 🎯 Hướng Dẫn Setup Supabase Database

## Tình Trạng Hiện Tại

✅ **Authentication đã được migrate sang Supabase** (Task 3.3 hoàn thành)
❌ **Database chưa có tables** - Cần setup ngay

## 🚀 Setup Nhanh (5 phút)

### Bước 1: Mở Supabase Dashboard

1. Truy cập: https://app.supabase.com
2. Chọn project của bạn
3. Click vào **SQL Editor** (icon database bên trái)

### Bước 2: Chạy Setup SQL

1. Click **New Query**
2. Mở file: `supabase/00-complete-setup.sql`
3. Copy **TOÀN BỘ** nội dung file
4. Paste vào SQL Editor
5. Click **Run** (hoặc nhấn Ctrl+Enter)
6. Đợi ~10 giây để hoàn thành

### Bước 3: Xác Nhận Setup Thành Công

#### Kiểm tra Tables:
1. Click vào **Table Editor** (icon table bên trái)
2. Bạn sẽ thấy 4 tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `datasets`
   - ✅ `analytics_cache`

#### Kiểm tra Storage:
1. Click vào **Storage** (icon folder bên trái)
2. Bạn sẽ thấy 3 buckets:
   - ✅ `avatars` (public)
   - ✅ `datasets` (private)
   - ✅ `exports` (private)

#### Kiểm tra Policies:
1. Click vào **Authentication** > **Policies**
2. Bạn sẽ thấy policies cho tất cả tables

### Bước 4: Cấu Hình Authentication (Optional)

#### Email Auth (Đã enable sẵn):
- Vào **Authentication** > **Providers**
- Email provider đã được enable ✅

#### Google OAuth (Optional):
1. Enable **Google** provider
2. Nhập Client ID và Secret từ Google Cloud Console
3. Thêm redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

#### LinkedIn OAuth (Optional):
1. Enable **LinkedIn (OIDC)** provider
2. Nhập Client ID và Secret từ LinkedIn Developers
3. Thêm redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

### Bước 5: Cấu Hình Redirect URLs

1. Vào **Authentication** > **URL Configuration**
2. Thêm **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
3. Set **Site URL**: `http://localhost:3000`

### Bước 6: Lấy API Keys

1. Vào **Settings** > **API**
2. Copy 2 giá trị:
   - **Project URL**: `https://[your-project].supabase.co`
   - **anon public key**: `eyJhbGc...`

### Bước 7: Cập Nhật Environment Variables

Mở file `frontend/.env.local` và cập nhật:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## ✅ Hoàn Tất!

Bây giờ bạn có thể:

### 1. Test Authentication:
```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000/auth/register
- Đăng ký tài khoản mới
- Kiểm tra email confirmation
- Đăng nhập

### 2. Kiểm Tra Database:
Vào Supabase **Table Editor** > `profiles`
- Sẽ thấy user mới được tạo tự động

### 3. Test Project Creation:
- Đăng nhập vào app
- Tạo project mới
- Kiểm tra table `projects` trong Supabase

## 📊 Database Schema Đã Tạo

### Tables:

#### 1. `profiles`
```sql
- id (UUID, FK to auth.users)
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```
**Auto-created khi user đăng ký**

#### 2. `projects`
```sql
- id (UUID)
- user_id (UUID, FK to auth.users)
- name (TEXT)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. `datasets`
```sql
- id (UUID)
- project_id (UUID, FK to projects)
- name (TEXT)
- file_url (TEXT)
- file_size (INTEGER)
- row_count (INTEGER)
- column_count (INTEGER)
- created_at (TIMESTAMP)
```

#### 4. `analytics_cache`
```sql
- id (UUID)
- request_hash (TEXT)
- action (TEXT)
- request_data (JSONB)
- response_data (JSONB)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
```

### Storage Buckets:

#### 1. `avatars` (public)
- User avatar images
- Path: `{user_id}/avatar.jpg`
- Public readable

#### 2. `datasets` (private)
- User dataset files
- Path: `{user_id}/{project_id}/dataset.csv`
- Private, user-only access

#### 3. `exports` (private)
- Export files
- Path: `{user_id}/export-{timestamp}.xlsx`
- Private, user-only access

## 🔒 Security Features

### Row Level Security (RLS):
- ✅ Enabled trên tất cả tables
- ✅ Users chỉ thấy data của mình
- ✅ Automatic user_id checking
- ✅ Cascade deletes

### Storage Security:
- ✅ Per-user folder structure
- ✅ Upload/download policies
- ✅ Public avatars, private datasets

### Authentication:
- ✅ Email confirmation
- ✅ Password reset
- ✅ OAuth support
- ✅ JWT tokens
- ✅ Auto-refresh

## 🧪 Test Queries

Chạy trong SQL Editor để test:

```sql
-- 1. Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Check storage buckets
SELECT * FROM storage.buckets;

-- 4. Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"
**Nguyên nhân:** Tables chưa được tạo
**Giải pháp:** Chạy lại `00-complete-setup.sql`

### Lỗi: "permission denied"
**Nguyên nhân:** RLS policies chưa được tạo
**Giải pháp:** Chạy lại `00-complete-setup.sql` (có GRANT permissions)

### Lỗi: "bucket not found"
**Nguyên nhân:** Storage buckets chưa được tạo
**Giải pháp:** Chạy lại `00-complete-setup.sql`

### User không thể tạo project
**Nguyên nhân:** RLS policies blocking
**Giải pháp:** 
1. Check user đã authenticated chưa
2. Verify policies trong Authentication > Policies
3. Check user_id match với auth.uid()

### File upload fails
**Nguyên nhân:** Storage policies chưa đúng
**Giải pháp:**
1. Check bucket exists
2. Verify file path format: `{user_id}/filename`
3. Check storage policies

## 📚 Tài Liệu Chi Tiết

Xem thêm trong thư mục `supabase/`:

- **`QUICK_START.md`** - Hướng dẫn nhanh 5 phút
- **`SETUP_GUIDE.md`** - Hướng dẫn chi tiết từng bước
- **`README.md`** - Tổng quan về database schema
- **`00-complete-setup.sql`** - File SQL setup hoàn chỉnh

## 🎯 Next Steps

Sau khi setup database xong:

### 1. Test Authentication Flow:
- [ ] Register new user
- [ ] Confirm email
- [ ] Login
- [ ] Check profile created

### 2. Test Database Operations:
- [ ] Create project
- [ ] View projects list
- [ ] Update project
- [ ] Delete project

### 3. Test File Upload:
- [ ] Upload avatar
- [ ] Upload dataset
- [ ] Download file
- [ ] Delete file

### 4. Proceed to Next Tasks:
- [ ] Task 3.4: Update file upload to use Supabase Storage
- [ ] Task 3.5: Remove unused dependencies (NextAuth, etc.)
- [ ] Task 3.6: Update API routes to use Supabase

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Guide](https://supabase.com/docs/guides/auth)

## ✨ Summary

**Đã tạo:**
- ✅ 4 database tables với RLS
- ✅ 3 storage buckets với policies
- ✅ Auto-create profile trigger
- ✅ Indexes cho performance
- ✅ Updated_at triggers
- ✅ Complete security policies

**Cần làm tiếp:**
1. Chạy `00-complete-setup.sql` trong Supabase
2. Cấu hình authentication providers
3. Cập nhật `.env.local`
4. Test authentication và database operations
5. Proceed to next tasks

**Thời gian:** ~5-10 phút để setup hoàn chỉnh
