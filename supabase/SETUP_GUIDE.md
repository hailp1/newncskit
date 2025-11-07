# Hướng Dẫn Setup Supabase Database

## Tổng Quan

Hướng dẫn này sẽ giúp bạn thiết lập database schema, RLS policies, và storage buckets cho NCSKIT trên Supabase.

## Bước 1: Truy Cập Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng database ở sidebar)

## Bước 2: Chạy Migrations Theo Thứ Tự

### 2.1. Tạo Database Schema

Mở file `01-schema.sql` và copy toàn bộ nội dung, sau đó:

1. Paste vào SQL Editor
2. Click **Run** hoặc nhấn `Ctrl+Enter`

**Nội dung tạo:**
- ✅ Table `profiles` - Thông tin user profile
- ✅ Table `projects` - Dự án nghiên cứu
- ✅ Table `datasets` - Datasets trong projects
- ✅ Table `analytics_cache` - Cache kết quả phân tích
- ✅ Indexes cho performance
- ✅ Triggers cho `updated_at`

### 2.2. Thiết Lập Row Level Security (RLS)

Mở file `02-rls-policies.sql` và copy toàn bộ nội dung:

1. Paste vào SQL Editor
2. Click **Run**

**Nội dung tạo:**
- ✅ Enable RLS trên tất cả tables
- ✅ Policies cho profiles (view, insert, update own profile)
- ✅ Policies cho projects (CRUD own projects)
- ✅ Policies cho datasets (CRUD datasets in own projects)
- ✅ Policies cho analytics_cache (read all, write authenticated)

### 2.3. Tạo Storage Buckets và Policies

Mở file `03-storage.sql` và copy toàn bộ nội dung:

1. Paste vào SQL Editor
2. Click **Run**

**Nội dung tạo:**
- ✅ Bucket `avatars` (public) - Avatar images
- ✅ Bucket `datasets` (private) - User datasets
- ✅ Bucket `exports` (private) - Export files
- ✅ Storage policies cho từng bucket

## Bước 3: Xác Nhận Setup

### 3.1. Kiểm Tra Tables

Vào **Table Editor** và xác nhận các tables sau đã được tạo:
- ✅ `profiles`
- ✅ `projects`
- ✅ `datasets`
- ✅ `analytics_cache`

### 3.2. Kiểm Tra Storage Buckets

Vào **Storage** và xác nhận các buckets sau đã được tạo:
- ✅ `avatars` (public)
- ✅ `datasets` (private)
- ✅ `exports` (private)

### 3.3. Kiểm Tra RLS Policies

Vào **Authentication** > **Policies** và xác nhận policies đã được tạo cho:
- ✅ profiles (3 policies)
- ✅ projects (4 policies)
- ✅ datasets (4 policies)
- ✅ analytics_cache (2 policies)

## Bước 4: Cấu Hình Authentication

### 4.1. Enable Email Authentication

1. Vào **Authentication** > **Providers**
2. Enable **Email** provider
3. Cấu hình email templates (optional)

### 4.2. Enable OAuth Providers

#### Google OAuth:
1. Vào **Authentication** > **Providers**
2. Enable **Google**
3. Nhập **Client ID** và **Client Secret** từ Google Cloud Console
4. Thêm redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### LinkedIn OAuth:
1. Enable **LinkedIn (OIDC)**
2. Nhập **Client ID** và **Client Secret** từ LinkedIn Developer Portal
3. Thêm redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 4.3. Cấu Hình Auth Settings

1. Vào **Authentication** > **Settings**
2. Cấu hình:
   - **JWT expiry**: 3600 (1 hour)
   - **Refresh token expiry**: 2592000 (30 days)
   - **Enable automatic token refresh**: ✅
   - **Enable email confirmations**: ✅ (recommended)

### 4.4. Cấu Hình Site URL và Redirect URLs

1. Vào **Authentication** > **URL Configuration**
2. Thêm:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback` (production)

## Bước 5: Tạo Profile Trigger (Auto-create Profile)

Để tự động tạo profile khi user đăng ký, chạy SQL sau:

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Bước 6: Test Database Connection

Chạy query test sau trong SQL Editor:

```sql
-- Test profiles table
SELECT * FROM public.profiles LIMIT 1;

-- Test projects table
SELECT * FROM public.projects LIMIT 1;

-- Test storage buckets
SELECT * FROM storage.buckets;

-- Test RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Bước 7: Cập Nhật Environment Variables

Trong file `frontend/.env.local`, cập nhật:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API (nếu cần)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Lấy thông tin từ **Settings** > **API**:
- **Project URL**: Copy vào `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key**: Copy vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Lỗi: "permission denied for schema public"

**Giải pháp:**
```sql
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
```

### Lỗi: "relation does not exist"

**Giải pháp:** Chạy lại `01-schema.sql` để tạo tables

### Lỗi: Storage policies không hoạt động

**Giải pháp:**
1. Xóa tất cả policies cũ trong Storage
2. Chạy lại `03-storage.sql`

### Lỗi: RLS blocking queries

**Giải pháp:** Kiểm tra policies trong **Authentication** > **Policies** và đảm bảo user đang authenticated

## Database Schema Diagram

```
auth.users (Supabase managed)
    ↓
profiles (1:1)
    ↓
projects (1:N)
    ↓
datasets (1:N)

analytics_cache (independent)
```

## Storage Structure

```
avatars/
  └── {user_id}/
      └── avatar.jpg

datasets/
  └── {user_id}/
      └── {project_id}/
          └── dataset.csv

exports/
  └── {user_id}/
      └── export-{timestamp}.xlsx
```

## Next Steps

Sau khi setup xong:

1. ✅ Test authentication flow (register, login, logout)
2. ✅ Test profile creation
3. ✅ Test project CRUD operations
4. ✅ Test file upload to storage
5. ✅ Verify RLS policies hoạt động đúng

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
