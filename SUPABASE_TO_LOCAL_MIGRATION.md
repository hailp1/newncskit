# 🔄 Supabase to Local PostgreSQL Migration Guide

## 📋 Tổng quan
Hướng dẫn chi tiết để chuyển toàn bộ database từ Supabase về PostgreSQL local, bao gồm:
- Schema (tables, indexes, constraints)
- Data (tất cả records)
- Relationships (foreign keys)
- Functions và triggers
- Permissions và policies

## 🎯 Chuẩn bị

### 1. **Thông tin Supabase cần có:**
- Project URL: `https://your-project.supabase.co`
- Service Role Key (có quyền admin)
- Database Password

### 2. **Tools cần cài đặt:**
```bash
# PostgreSQL client tools
# Windows: Download từ postgresql.org
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql-client

# Supabase CLI (optional)
npm install -g supabase
```

### 3. **Local PostgreSQL setup:**
```bash
# Sử dụng Docker (khuyến nghị)
docker-compose up postgres

# Hoặc cài đặt PostgreSQL local
```

## 🔧 Phương pháp Migration

### **Phương pháp 1: Sử dụng pg_dump (Khuyến nghị)**

#### Bước 1: Export từ Supabase
```bash
# Lấy connection string từ Supabase Dashboard > Settings > Database
# Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Export schema + data
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  > supabase_backup.sql

# Hoặc chỉ export schema
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --schema-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  > supabase_schema.sql

# Chỉ export data
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --data-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  > supabase_data.sql
```

#### Bước 2: Import vào Local PostgreSQL
```bash
# Kết nối đến local PostgreSQL
psql -h localhost -U user -d ncskit

# Import toàn bộ
psql -h localhost -U user -d ncskit < supabase_backup.sql

# Hoặc import từng phần
psql -h localhost -U user -d ncskit < supabase_schema.sql
psql -h localhost -U user -d ncskit < supabase_data.sql
```

### **Phương pháp 2: Sử dụng Supabase CLI**

#### Bước 1: Login và link project
```bash
supabase login
supabase link --project-ref [your-project-ref]
```

#### Bước 2: Export database
```bash
# Export schema
supabase db dump --schema-only > supabase_schema.sql

# Export data
supabase db dump --data-only > supabase_data.sql

# Export toàn bộ
supabase db dump > supabase_full.sql
```

### **Phương pháp 3: Manual Export (cho tables lớn)**

#### Export từng table riêng biệt:
```bash
# Export users table
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --table=public.users \
  --data-only \
  --no-owner \
  > users_data.sql

# Tương tự cho các tables khác
```

## 📊 Schema Migration Script

Tôi sẽ tạo script tự động để tạo schema local dựa trên TypeScript types:

## 🚀 Quick Migration Steps

### **Bước 1: Chuẩn bị**
```bash
# Đảm bảo PostgreSQL local đang chạy
docker-compose up postgres

# Hoặc kiểm tra PostgreSQL service
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # Mac
```

### **Bước 2: Chạy migration script**
```bash
# Linux/Mac
chmod +x migrate-supabase-to-local.sh
./migrate-supabase-to-local.sh

# Windows
migrate-supabase-to-local.bat
```

### **Bước 3: Cập nhật code**
```bash
# Linux/Mac
chmod +x update-code-for-local-db.sh
./update-code-for-local-db.sh

# Windows - chạy thủ công các bước trong script
```

### **Bước 4: Cấu hình environment**
```bash
# Cập nhật frontend/.env.local
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ncskit
POSTGRES_USER=user
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql://user:password@localhost:5432/ncskit
```

### **Bước 5: Test migration**
```bash
# Kiểm tra database
node verify-local-db.js

# Khởi động ứng dụng
cd frontend && npm run dev
```

## 🔧 Manual Migration (Nếu script không hoạt động)

### **1. Export từ Supabase**
```bash
# Lấy connection string từ Supabase Dashboard
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  > supabase_backup.sql
```

### **2. Import vào Local PostgreSQL**
```bash
# Tạo database
createdb -h localhost -U user ncskit

# Import schema
psql -h localhost -U user -d ncskit < frontend/database/create-full-schema.sql

# Import data
psql -h localhost -U user -d ncskit < supabase_backup.sql
```

### **3. Cập nhật code thủ công**
```bash
# Cài đặt PostgreSQL client
npm install pg @types/pg

# Copy PostgreSQL service files từ script
# Cập nhật imports trong các service files
# Thay thế supabase.from() với db.from()
```

## 📊 Verification Checklist

### **Database Structure:**
- [ ] Tất cả tables đã được tạo
- [ ] Foreign keys và constraints hoạt động
- [ ] Indexes đã được tạo
- [ ] Triggers và functions hoạt động

### **Data Migration:**
- [ ] Users data
- [ ] Projects data  
- [ ] Business domains data
- [ ] Marketing models data
- [ ] References và documents
- [ ] Admin logs và permissions

### **Application Integration:**
- [ ] Database connection hoạt động
- [ ] Authentication system
- [ ] CRUD operations
- [ ] Search và filtering
- [ ] File uploads (nếu có)

## 🚨 Troubleshooting

### **Connection Issues:**
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kiểm tra port
netstat -an | grep 5432

# Test connection
psql -h localhost -U user -d ncskit -c "SELECT 1;"
```

### **Permission Issues:**
```sql
-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE ncskit TO user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user;
```

### **Data Type Issues:**
```sql
-- Kiểm tra data types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

### **Performance Issues:**
```sql
-- Tạo indexes bổ sung
CREATE INDEX CONCURRENTLY idx_projects_user_status ON projects(user_id, status);
CREATE INDEX CONCURRENTLY idx_activities_created_at ON activities(created_at DESC);

-- Analyze tables
ANALYZE;
```

## 📈 Post-Migration Optimization

### **1. Connection Pooling**
```typescript
// Cấu hình connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **2. Query Optimization**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### **3. Backup Strategy**
```bash
# Daily backup script
pg_dump -h localhost -U user ncskit | gzip > backup_$(date +%Y%m%d).sql.gz

# Automated backup with cron
0 2 * * * /path/to/backup-script.sh
```

## 🎯 Benefits of Local PostgreSQL

### **Performance:**
- Faster queries (no network latency)
- Better control over indexes và optimization
- Custom functions và procedures

### **Development:**
- Offline development capability
- Full database access và debugging
- Custom extensions và configurations

### **Cost:**
- No Supabase subscription fees
- Unlimited database size
- No API rate limits

### **Security:**
- Full control over data
- Custom security policies
- No third-party data exposure

## 📞 Support

Nếu gặp vấn đề trong quá trình migration:

1. **Kiểm tra logs:** PostgreSQL logs, application logs
2. **Verify connections:** Database connectivity, credentials
3. **Check permissions:** User privileges, table access
4. **Test queries:** Manual SQL testing
5. **Compare schemas:** Supabase vs Local structure

**Files được tạo:**
- `migrate-supabase-to-local.sh/.bat` - Migration script
- `update-code-for-local-db.sh` - Code update script  
- `frontend/database/create-full-schema.sql` - Complete schema
- `frontend/src/lib/postgres.ts` - PostgreSQL client
- `verify-local-db.js` - Verification script