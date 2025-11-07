# 🚀 Quick Setup - Supabase (5 phút)

## ✅ Checklist

- [ ] 1. Tạo Supabase project tại https://supabase.com
- [ ] 2. Copy credentials (URL, anon key, service role key)
- [ ] 3. Chạy `01-schema.sql` trong SQL Editor
- [ ] 4. Chạy `02-rls-policies.sql` trong SQL Editor
- [ ] 5. Chạy `03-storage.sql` trong SQL Editor
- [ ] 6. Chạy `04-functions.sql` trong SQL Editor
- [ ] 7. Enable Email authentication
- [ ] 8. (Optional) Enable Google/LinkedIn OAuth
- [ ] 9. Update `.env.local` với credentials
- [ ] 10. Test connection

## 📋 Copy Credentials Template

Sau khi tạo project, copy vào `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Keep existing variables
NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Verification Commands

Chạy trong SQL Editor để verify:

```sql
-- 1. Check tables created
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 4 tables (profiles, projects, datasets, analytics_cache)

-- 2. Check RLS enabled
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Expected: 4 tables

-- 3. Check storage buckets
SELECT COUNT(*) FROM storage.buckets;
-- Expected: 3 buckets (avatars, datasets, exports)

-- 4. Check functions
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_schema = 'public';
-- Expected: 5 functions
```

## ⚡ Fast Track

Nếu muốn chạy tất cả cùng lúc, copy toàn bộ vào SQL Editor:

```sql
-- Paste nội dung của 01-schema.sql
-- Paste nội dung của 02-rls-policies.sql
-- Paste nội dung của 03-storage.sql
-- Paste nội dung của 04-functions.sql
```

Click **Run** một lần!

## 🔍 Common Issues

**Issue**: "permission denied"
**Fix**: Đảm bảo đang dùng service_role key, không phải anon key

**Issue**: "relation already exists"
**Fix**: Bỏ qua, table đã tồn tại rồi

**Issue**: "bucket already exists"
**Fix**: Bỏ qua, bucket đã tồn tại rồi

## ✨ Done!

Sau khi hoàn thành, bạn có:
- ✅ 4 tables với RLS policies
- ✅ 3 storage buckets với policies
- ✅ 5 database functions
- ✅ Authentication configured
- ✅ Ready cho Task 2!
