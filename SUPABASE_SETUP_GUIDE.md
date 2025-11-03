# 🔗 Hướng dẫn Setup Supabase Database

## ✅ **Trạng thái hiện tại:**
- ✅ Kết nối Supabase thành công
- ✅ Auth service hoạt động
- ⚠️ Cần tạo database tables

## 🛠️ **Cách 1: Tạo tables qua Supabase Dashboard (Khuyến nghị)**

### Bước 1: Truy cập Supabase Dashboard
1. Đi tới: https://supabase.com/dashboard
2. Login vào project: `ujcsqwegzchvsxigydcl`

### Bước 2: Tạo Tables
1. Vào **SQL Editor** trong dashboard
2. Copy và paste nội dung file `frontend/create-basic-tables.sql`
3. Click **Run** để tạo tables

### Bước 3: Kiểm tra Tables
1. Vào **Table Editor**
2. Xem tables: `users`, `projects`
3. Kiểm tra test data đã được tạo

## 🛠️ **Cách 2: Sử dụng Supabase CLI (Nâng cao)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref ujcsqwegzchvsxigydcl

# Run migrations
supabase db push
```

## 🧪 **Test sau khi setup:**

```bash
# Chạy test kết nối
cd frontend
node test-supabase-connection.js

# Hoặc test qua browser
# Truy cập: http://localhost:3000/test-supabase
```

## 📋 **Tables cần tạo:**

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    subscription_type VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 **Row Level Security (RLS)**

Sau khi tạo tables, enable RLS:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own projects" ON projects 
FOR SELECT USING (owner_id::text = auth.uid()::text);
```

## 🎯 **Kết quả mong đợi:**

Sau khi setup xong:
- ✅ Tables `users` và `projects` tồn tại
- ✅ Test data có sẵn (3 demo users, 2 demo projects)
- ✅ RLS policies hoạt động
- ✅ Frontend có thể kết nối và query data

## 🚀 **Next Steps:**

1. **Setup tables** (làm ngay bây giờ)
2. **Test frontend connection** 
3. **Integrate với Django backend**
4. **Add more tables** (references, documents, etc.)
5. **Deploy to production**