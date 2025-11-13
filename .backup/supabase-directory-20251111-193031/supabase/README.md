# 🗄️ Supabase Configuration

Thư mục này chứa tất cả các file cấu hình và migration scripts cho Supabase database.

## 📁 Cấu Trúc Files

### Setup Files (Chạy theo thứ tự)
- **`00-complete-setup.sql`** ⭐ - **CHẠY FILE NÀY** - Setup hoàn chỉnh tất cả trong 1 file
- `01-schema.sql` - Database schema (tables, indexes, triggers)
- `02-rls-policies.sql` - Row Level Security policies
- `03-storage.sql` - Storage buckets và policies

### Documentation
- **`QUICK_START.md`** ⭐ - **ĐỌC FILE NÀY TRƯỚC** - Hướng dẫn setup nhanh 5 phút
- `SETUP_GUIDE.md` - Hướng dẫn chi tiết từng bước
- `README.md` - File này

### Migration Tools
- `migration/` - Tools để migrate từ PostgreSQL local sang Supabase
  - `MIGRATION_GUIDE.md` - Hướng dẫn migration
  - `export-local-db.sh` - Script export cho Linux/Mac
  - `export-local-db.ps1` - Script export cho Windows

## 🚀 Quick Start

### Cách Nhanh Nhất (5 phút):

1. **Chạy SQL Setup:**
   - Mở [Supabase Dashboard](https://app.supabase.com) > SQL Editor
   - Copy toàn bộ nội dung file `00-complete-setup.sql`
   - Paste và Run

2. **Enable Authentication:**
   - Vào Authentication > Providers
   - Enable Email (đã có sẵn)
   - (Optional) Enable Google/LinkedIn OAuth

3. **Cấu hình URLs:**
   - Vào Authentication > URL Configuration
   - Thêm: `http://localhost:3000/auth/callback`

4. **Lấy API Keys:**
   - Vào Settings > API
   - Copy Project URL và anon key

5. **Cập nhật .env.local:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

✅ **Xong!** Xem chi tiết trong `QUICK_START.md`

## 📊 Database Schema

### Tables Created:

#### `profiles`
- Extends `auth.users` với thông tin bổ sung
- Fields: id, email, full_name, avatar_url, timestamps
- Auto-created khi user đăng ký

#### `projects`
- Dự án nghiên cứu của user
- Fields: id, user_id, name, description, timestamps
- RLS: User chỉ thấy projects của mình

#### `datasets`
- Datasets trong projects
- Fields: id, project_id, name, file_url, metadata, timestamps
- RLS: User chỉ thấy datasets trong projects của mình

#### `analytics_cache`
- Cache kết quả phân tích AI
- Fields: id, request_hash, action, request_data, response_data, timestamps
- RLS: Authenticated users có thể đọc/ghi

### Storage Buckets:

#### `avatars` (public)
- Avatar images của users
- Structure: `{user_id}/avatar.jpg`
- Public read, user can upload/update/delete own

#### `datasets` (private)
- Dataset files của users
- Structure: `{user_id}/{project_id}/dataset.csv`
- User chỉ access được files của mình

#### `exports` (private)
- Export files (Excel, PDF, etc.)
- Structure: `{user_id}/export-{timestamp}.xlsx`
- User chỉ access được exports của mình

## 🔒 Security (RLS Policies)

### Profiles:
- ✅ Users can view/insert/update own profile
- ❌ Users cannot view other profiles

### Projects:
- ✅ Users can CRUD own projects
- ❌ Users cannot access other users' projects

### Datasets:
- ✅ Users can CRUD datasets in own projects
- ❌ Users cannot access datasets in other projects

### Storage:
- ✅ Users can upload/view/delete own files
- ❌ Users cannot access other users' files
- ✅ Avatars are publicly readable

## 🔧 Environment Variables

Cần thiết trong `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Lấy từ: **Supabase Dashboard** > **Settings** > **API**

## 📝 Features Implemented

### Authentication:
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ LinkedIn OAuth
- ✅ Email confirmation
- ✅ Password reset
- ✅ Auto-create profile on signup

### Database:
- ✅ User profiles
- ✅ Projects management
- ✅ Datasets storage
- ✅ Analytics caching
- ✅ Row Level Security
- ✅ Automatic timestamps

### Storage:
- ✅ Avatar uploads
- ✅ Dataset file storage
- ✅ Export file storage
- ✅ Per-user access control

## 🧪 Testing

### Test Database Setup:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

### Test Authentication:
1. Register new user: http://localhost:3000/auth/register
2. Check `profiles` table - should have new entry
3. Login with credentials
4. Create a project
5. Check `projects` table - should have new entry

## 🐛 Troubleshooting

### "relation does not exist"
**Giải pháp:** Chạy lại `00-complete-setup.sql`

### "permission denied for schema public"
**Giải pháp:** Đã có GRANT trong setup SQL, nhưng nếu vẫn lỗi:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### RLS blocking queries
**Giải pháp:** 
- Đảm bảo user đã authenticated
- Check policies trong Authentication > Policies
- Test với service_role key (chỉ để debug)

### Storage upload fails
**Giải pháp:**
- Check bucket exists: Storage > Buckets
- Check policies: Storage > [bucket] > Policies tab
- Verify file path format: `{user_id}/filename`

## 📚 Documentation Links

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Helpers - Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🔄 Migration from Local PostgreSQL

Nếu bạn có database PostgreSQL local và muốn migrate sang Supabase:

1. Xem `migration/MIGRATION_GUIDE.md`
2. Chạy export script:
   - Windows: `migration/export-local-db.ps1`
   - Linux/Mac: `migration/export-local-db.sh`
3. Import vào Supabase

## 📞 Support

Nếu gặp vấn đề:
1. Check `SETUP_GUIDE.md` - Troubleshooting section
2. Check Supabase logs: Dashboard > Logs
3. Check browser console for errors
4. Verify environment variables

## ✅ Setup Checklist

- [ ] Chạy `00-complete-setup.sql` trong Supabase SQL Editor
- [ ] Enable Email authentication
- [ ] (Optional) Configure Google OAuth
- [ ] (Optional) Configure LinkedIn OAuth
- [ ] Add redirect URLs
- [ ] Copy API keys to `.env.local`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test project creation
- [ ] Test file upload
- [ ] Verify RLS policies working

## 🎯 Next Steps

Sau khi setup xong:

1. ✅ Test authentication flow
2. ✅ Create sample project
3. ✅ Upload sample dataset
4. ✅ Test analytics features
5. ✅ Deploy to production
6. ✅ Configure production URLs
7. ✅ Set up backups (Supabase Dashboard > Database > Backups)
