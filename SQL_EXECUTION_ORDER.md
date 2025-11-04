# 🗄️ SQL FILES EXECUTION ORDER

## 📋 **4 SQL FILES CẦN EXECUTE THEO THỨ TỰ:**

### **FILE 1: Complete Production Schema** ⭐ **QUAN TRỌNG NHẤT**
```
📁 File: frontend/database/complete-production-schema.sql
📊 Size: 19 KB
🎯 Purpose: Tạo tất cả tables, relationships, RLS policies, functions
⚠️ PHẢI EXECUTE TRƯỚC TIÊN!
```

**Nội dung:** Tạo 20+ tables bao gồm:
- users, user_profiles
- business_domains, marketing_models
- research_variables, variable_relationships
- projects, project_models
- research_outlines, research_outline_templates
- user_activities, project_analytics
- Và tất cả RLS policies, indexes, functions

---

### **FILE 2: Sample Production Data**
```
📁 File: frontend/database/sample-production-data.sql
📊 Size: 23 KB
🎯 Purpose: Insert dữ liệu mẫu vào các tables
⚠️ EXECUTE SAU FILE 1!
```

**Nội dung:** Insert data cho:
- 6 business domains (Marketing, Tourism, HR, etc.)
- 6 marketing models (TPB, TAM, SERVQUAL, etc.)
- 15+ research variables với relationships
- Survey question templates
- Usage statistics

---

### **FILE 3: Marketing Knowledge Base**
```
📁 File: frontend/database/marketing-knowledge-base.sql
📊 Size: 11 KB
🎯 Purpose: Thêm dữ liệu marketing mở rộng
⚠️ EXECUTE SAU FILE 2!
```

**Nội dung:** Thêm:
- Extended marketing models data
- Additional research variables
- More comprehensive relationships
- Marketing frameworks details

---

### **FILE 4: Research Outline Templates**
```
📁 File: frontend/database/research-outline-templates.sql
📊 Size: 20 KB
🎯 Purpose: Tạo AI outline templates và survey questions
⚠️ EXECUTE CUỐI CÙNG!
```

**Nội dung:** Tạo:
- Research outline templates cho AI generation
- Survey question templates
- Template mapping và configurations
- Sample research structures

---

## 🚀 **CÁCH EXECUTE TRONG SUPABASE:**

### **BƯỚC 1: Mở Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Login vào account của bạn
3. Select project: **ujcsqwegzchvsxigydcl**

### **BƯỚC 2: Mở SQL Editor**
1. Click **"SQL Editor"** ở sidebar bên trái
2. Bạn sẽ thấy text editor để viết SQL

### **BƯỚC 3: Execute từng file theo thứ tự**

#### **Execute File 1:**
1. Mở file: `frontend/database/complete-production-schema.sql`
2. **Copy toàn bộ nội dung** (Ctrl+A, Ctrl+C)
3. **Paste vào SQL Editor** (Ctrl+V)
4. Click **"Run"** button
5. **Đợi hoàn thành** (có thể mất 1-2 phút)
6. **Check for errors** - nếu có lỗi, fix trước khi tiếp tục

#### **Execute File 2:**
1. **Clear SQL Editor** (xóa nội dung cũ)
2. Mở file: `frontend/database/sample-production-data.sql`
3. **Copy toàn bộ nội dung**
4. **Paste vào SQL Editor**
5. Click **"Run"** button
6. **Đợi hoàn thành**
7. **Check for errors**

#### **Execute File 3:**
1. **Clear SQL Editor**
2. Mở file: `frontend/database/marketing-knowledge-base.sql`
3. **Copy toàn bộ nội dung**
4. **Paste vào SQL Editor**
5. Click **"Run"** button
6. **Đợi hoàn thành**
7. **Check for errors**

#### **Execute File 4:**
1. **Clear SQL Editor**
2. Mở file: `frontend/database/research-outline-templates.sql`
3. **Copy toàn bộ nội dung**
4. **Paste vào SQL Editor**
5. Click **"Run"** button
6. **Đợi hoàn thành**
7. **Check for errors**

---

## ✅ **VERIFICATION - KIỂM TRA SAU KHI EXECUTE:**

### **Check Tables Created:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

**Expected Result:** 20+ tables bao gồm:
- business_domains
- marketing_models
- research_variables
- projects
- users
- project_models
- research_outline_templates
- user_activities
- project_analytics
- etc.

### **Check Sample Data:**
```sql
SELECT 'business_domains' as table_name, COUNT(*) as records FROM business_domains
UNION ALL
SELECT 'marketing_models' as table_name, COUNT(*) as records FROM marketing_models
UNION ALL
SELECT 'research_variables' as table_name, COUNT(*) as records FROM research_variables;
```

**Expected Results:**
- business_domains: **6 records**
- marketing_models: **6+ records**
- research_variables: **15+ records**

---

## ⚠️ **QUAN TRỌNG:**

### **THỨ TỰ PHẢI ĐÚNG:**
1. ✅ **complete-production-schema.sql** (tạo tables)
2. ✅ **sample-production-data.sql** (insert data)
3. ✅ **marketing-knowledge-base.sql** (thêm data)
4. ✅ **research-outline-templates.sql** (templates)

### **NẾU CÓ LỖI:**
- **Đọc error message** carefully
- **Fix lỗi** trước khi tiếp tục
- **Có thể cần execute lại** file bị lỗi
- **Không skip** file nào

### **SAU KHI HOÀN THÀNH:**
- Run verification queries
- Check expected record counts
- Test database connection
- Proceed với local testing

---

## 🎯 **READY TO EXECUTE:**

**Files Location:** `frontend/database/`
**Order:** 1→2→3→4 (KHÔNG ĐƯỢC THAY ĐỔI)
**Platform:** Supabase SQL Editor
**Project:** ujcsqwegzchvsxigydcl

## 🚀 **AFTER DATABASE SETUP:**
```bash
# Test local development
cd frontend && npm run dev

# Deploy to Vercel
node deploy-to-vercel.js
```

**🎊 Execute the 4 SQL files in order and you're ready to go! 🎊**