# 🚨 **URGENT: Database Schema Setup Required**

## ❌ **Current Issue:**
```
Error: Could not find the 'research_domains' column of 'users' in the schema cache
```

## 🔍 **Problem Analysis:**
- ✅ Supabase connection working
- ✅ Basic `users` and `projects` tables exist
- ❌ Missing `research_domains` column and other advanced columns
- ❌ Missing tables: `institutions`, `documents`, `references`, `milestones`, `activities`

## 🛠️ **SOLUTION: Run Database Schema**

### **Option 1: Quick Fix (Recommended)**
1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql/new
2. **Copy & Run**: `frontend/database/add-missing-columns.sql`
3. **This will**:
   - Add missing columns to existing tables
   - Create missing tables with sample data
   - Add proper indexes and RLS policies
   - Fix the `research_domains` error

### **Option 2: Complete Schema (Full Setup)**
1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql/new
2. **Run in order**:
   - First: `frontend/database/complete-schema.sql` (Complete schema)
   - Then: `frontend/database/seed-data.sql` (Sample data)

## 🧪 **After Setup - Test:**

```bash
# Test database structure
cd frontend && node check-database-structure.js

# Test registration
http://localhost:3000/demo-register

# Test Supabase connection
http://localhost:3000/test-supabase
```

## 📊 **Expected Results After Setup:**

### **Users Table Columns:**
```sql
- id, email, first_name, last_name
- research_domains (TEXT[])  ← This fixes the error
- research_interests (TEXT[])
- orcid_id, avatar_url, preferences
- user_role, status, subscription_type
```

### **Additional Tables:**
```sql
- institutions (universities, research centers)
- milestones (project milestones)
- documents (research documents)
- references (citation management)
- activities (user activity tracking)
```

## 🎯 **Quick Commands:**

```bash
# Open Supabase Dashboard
start https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql/new

# Test after setup
cd frontend
node check-database-structure.js
node test-supabase-connection.js
```

## ⚡ **Why This Happened:**
- Initially ran `create-basic-tables.sql` (basic schema)
- Need to run `complete-schema.sql` (full schema)
- Frontend expects advanced columns like `research_domains`

## 🎉 **After Fix:**
- ✅ Registration will work perfectly
- ✅ All demo accounts accessible
- ✅ Complete database with 20+ tables
- ✅ Sample data for testing
- ✅ Ready for advanced features

---

**🚀 Run the SQL now to fix the issue and continue development!**