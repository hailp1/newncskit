# 🚨 URGENT FIX - Column Name Issue

**Date:** 2025-11-10  
**Issue:** `Could not find the 'project_id' column of 'analysis_variables' in the schema cache`  
**Status:** ⚠️ CRITICAL - Blocking uploads

---

## 🔍 Root Cause

Database table `analysis_variables` có column tên **sai**:
- **Expected:** `project_id`
- **Actual:** Có thể là `analysis_project_id` hoặc column không tồn tại

---

## 🔧 Solution

### Option 1: Run Hotfix Migration (Recommended)

Chạy migration này để tự động fix:

```bash
# Go to Supabase Dashboard
# SQL Editor → New Query
# Copy and paste content from:
supabase/migrations/20241110_hotfix_analysis_variables_column.sql

# Click "Run"
```

Migration này sẽ:
1. ✅ Kiểm tra table `analysis_variables` có tồn tại không
2. ✅ Nếu không tồn tại → Tạo table mới với schema đúng
3. ✅ Nếu tồn tại → Kiểm tra column name
4. ✅ Nếu column là `analysis_project_id` → Rename thành `project_id`
5. ✅ Nếu column là `project_id` → Không làm gì (đã đúng)

---

### Option 2: Manual Fix

Nếu muốn fix thủ công:

#### Step 1: Check current column name
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_variables' 
AND column_name LIKE '%project%';
```

#### Step 2: If column is `analysis_project_id`, rename it
```sql
ALTER TABLE analysis_variables 
RENAME COLUMN analysis_project_id TO project_id;
```

#### Step 3: Verify the fix
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_variables' 
AND column_name = 'project_id';

-- Should return 1 row with project_id
```

---

## 🧪 Test After Fix

### 1. Verify column exists
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_variables'
ORDER BY ordinal_position;

-- Should show project_id as UUID, NOT NULL
```

### 2. Test upload again
1. Go to: https://app.ncskit.org/analysis/new
2. Upload CSV file
3. Should work without errors ✅

---

## 📊 Expected Result

After fix, upload should work:
```
[CSVUploader] Starting upload for: TESTfull_800.csv
[CSVUploader] Response status: 200 ✅
[CSVUploader] Upload successful ✅
```

---

## 🔍 Why This Happened

Có thể có 2 nguyên nhân:

### Cause 1: Migration chưa chạy
- Migration `20240107_create_analysis_tables.sql` chưa được apply
- Table được tạo bởi migration khác với schema khác

### Cause 2: Migration cũ dùng tên khác
- Migration cũ dùng `analysis_project_id`
- Code mới dùng `project_id`
- Mismatch giữa database và code

---

## 🚀 Next Steps After Fix

### 1. Verify Fix ✅
```sql
-- Should return project_id
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'analysis_variables' 
AND column_name = 'project_id';
```

### 2. Test Upload ✅
- Upload CSV file
- Verify project created
- Verify variables created

### 3. Update Documentation ✅
- Document the fix
- Update migration checklist
- Prevent future issues

---

## 📝 Prevention

Để tránh vấn đề này trong tương lai:

### 1. Always use consistent naming
- Stick to `project_id` (not `analysis_project_id`)
- Update all migrations to use same name

### 2. Run migrations in order
- Ensure migrations run in correct order
- Check migration status before deploy

### 3. Verify schema after migration
```sql
-- Always verify after migration
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE 'analysis_%'
ORDER BY table_name, ordinal_position;
```

---

## 🆘 If Fix Doesn't Work

### Check 1: Table exists?
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'analysis_variables';
```

### Check 2: What columns exist?
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analysis_variables';
```

### Check 3: Foreign key correct?
```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'analysis_variables';
```

---

**Action Required:** RUN HOTFIX MIGRATION NOW!

**File:** `supabase/migrations/20241110_hotfix_analysis_variables_column.sql`

