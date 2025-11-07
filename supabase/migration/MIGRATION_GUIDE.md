# 📦 Database Migration Guide

## Tổng Quan

Guide này hướng dẫn migrate database từ local PostgreSQL sang Supabase.

## ⚠️ Quan Trọng

**Lưu ý**: Dự án hiện tại có thể chưa có local PostgreSQL database với data. Nếu đây là project mới, bạn có thể **skip migration** và chỉ cần:
1. ✅ Chạy Supabase SQL scripts (đã làm ở Task 1)
2. ✅ Update `.env.local` với Supabase credentials (đã làm)
3. ✅ Chuyển sang Task 3

## Khi Nào Cần Migration?

Chỉ cần migration nếu:
- ✅ Bạn có local PostgreSQL database đang chạy
- ✅ Database có data cần preserve
- ✅ Bạn muốn backup data trước khi chuyển

## 🔄 Migration Steps

### Option 1: Có Local Database với Data

#### Step 1: Backup Local Database

**Windows:**
```powershell
cd supabase/migration
./export-local-db.ps1
```

**Linux/Mac:**
```bash
cd supabase/migration
chmod +x export-local-db.sh
./export-local-db.sh
```

Backup sẽ được lưu tại: `supabase/migration/backup_YYYYMMDD_HHMMSS/`

#### Step 2: Review Backup Files

```
backup_YYYYMMDD_HHMMSS/
├── schema.sql       # Database structure
├── data.sql         # Data only
└── full_backup.sql  # Complete backup
```

#### Step 3: Transform Data for Supabase

Nếu có data cần migrate, bạn cần:

1. **Review schema differences**:
   - Local PostgreSQL có thể có tables khác với Supabase schema
   - Supabase sử dụng `auth.users` thay vì custom user table

2. **Transform user references**:
   ```sql
   -- Example: Update user_id references
   -- Old: references to custom users table
   -- New: references to auth.users
   ```

3. **Import data vào Supabase**:
   - Vào Supabase Dashboard → SQL Editor
   - Paste transformed data SQL
   - Run query

#### Step 4: Verify Data Integrity

```sql
-- Check record counts
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'datasets', COUNT(*) FROM public.datasets;

-- Check data samples
SELECT * FROM public.profiles LIMIT 5;
SELECT * FROM public.projects LIMIT 5;
SELECT * FROM public.datasets LIMIT 5;
```

### Option 2: Project Mới (Không Có Data)

Nếu project mới hoặc không có data cần preserve:

1. ✅ **Skip backup** - Không cần export
2. ✅ **Supabase đã setup** - SQL scripts đã chạy ở Task 1
3. ✅ **Environment updated** - `.env.local` đã có Supabase credentials
4. ✅ **Ready for Task 3** - Chuyển sang update frontend code

## 📋 Verification Checklist

- [ ] Supabase project created
- [ ] SQL scripts (01-04) executed successfully
- [ ] `.env.local` updated with Supabase credentials
- [ ] (Optional) Local database backed up
- [ ] (Optional) Data migrated and verified
- [ ] Ready to update frontend code (Task 3)

## 🎯 Current Status

Based on your project:
- ✅ Supabase credentials configured
- ✅ `.env.local` updated
- ✅ `.env.production` template created
- ⏭️ Ready for Task 3: Update Frontend Code

## 🔍 Troubleshooting

### Issue: pg_dump not found
**Solution**: Install PostgreSQL client tools
```bash
# Windows (via Chocolatey)
choco install postgresql

# Mac
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### Issue: Cannot connect to local PostgreSQL
**Solution**: 
- Check if PostgreSQL service is running
- Verify connection string in old `.env.local`
- If no local database exists, skip migration

### Issue: Data import fails in Supabase
**Solution**:
- Check RLS policies are correct
- Verify foreign key references
- Use service_role key for import (not anon key)

## 📚 Additional Resources

- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrating-to-supabase)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)

## ✨ Next Steps

Sau khi hoàn thành migration (hoặc skip nếu không cần):

1. ✅ Verify Supabase connection
2. ✅ Move to Task 3: Update Frontend Code
3. ✅ Install Supabase client libraries
4. ✅ Replace database queries with Supabase client
