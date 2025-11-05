# NCSKIT Docker Setup Guide

Hướng dẫn thiết lập NCSKIT với Docker để dễ dàng di chuyển giữa các máy tính.

## 🚀 Khởi động nhanh

### Windows:
```bash
# Chạy script tự động
start-docker.bat

# Hoặc thủ công
docker-compose up --build -d
cd frontend
npm install
npm run dev
```

### Linux/Mac:
```bash
# Chạy script tự động
chmod +x start-docker.sh
./start-docker.sh

# Hoặc thủ công
docker-compose up --build -d
cd frontend
npm install
npm run dev
```

## 📋 Yêu cầu hệ thống

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose v2.0+
- Node.js 18+ (cho frontend)
- 4GB RAM trống
- 10GB dung lượng ổ cứng

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   PostgreSQL    │    │   R Analysis    │
│   Next.js       │◄──►│   Database      │◄──►│   Server        │
│   Port: 3000    │    │   Port: 5432    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Django Backend │◄─────────────┘
                        │  Port: 8001     │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │     Redis       │
                        │   Port: 6379    │
                        └─────────────────┘
```

## 🐳 Các Docker Services

### 1. PostgreSQL Database
- **Image**: postgres:15
- **Port**: 5432
- **Database**: ncskit
- **User**: postgres
- **Password**: postgres
- **Features**:
  - Tự động khởi tạo schema
  - Dữ liệu mẫu (users, blog posts, domains)
  - Persistent storage

### 2. R Analysis Server
- **Build**: ./backend/r_analysis/Dockerfile
- **Port**: 8000
- **Features**:
  - R 4.3.0 với các packages thống kê
  - Plumber API server
  - Health check endpoint
  - Kết nối PostgreSQL

### 3. Django Backend
- **Build**: ./backend/Dockerfile
- **Port**: 8001
- **Features**:
  - Python 3.11
  - Django REST API
  - PostgreSQL connection
  - Gunicorn server

### 4. Redis Cache
- **Image**: redis:7-alpine
- **Port**: 6379
- **Features**:
  - Session storage
  - Cache layer
  - Persistent data

## 🔧 Cấu hình

### Environment Variables

#### Frontend (.env.local):
```env
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ncskit
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ncskit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Auth Configuration
AUTH_DISABLED=false
JWT_SECRET=your-secret-key-here

# API URLs
R_ANALYSIS_URL=http://localhost:8000
DJANGO_BACKEND_URL=http://localhost:8001

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NCSKIT
```

#### Backend (.env):
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ncskit
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,django-backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 📊 Database Schema

### Bảng chính:
- **users**: Thông tin người dùng và authentication
- **user_sessions**: Quản lý phiên đăng nhập
- **business_domains**: Lĩnh vực kinh doanh
- **marketing_models**: Mô hình marketing
- **projects**: Dự án nghiên cứu
- **blog_posts**: Bài viết blog
- **analysis_results**: Kết quả phân tích

### Dữ liệu mẫu:
- Admin user: admin@ncskit.org / admin123
- Demo user: demo@ncskit.org / demo123
- 5 business domains
- 5 marketing models
- 2 blog posts mẫu

## 🚀 Khởi động hệ thống

### Bước 1: Khởi động Docker services
```bash
docker-compose up --build -d
```

### Bước 2: Kiểm tra services
```bash
docker-compose ps
```

### Bước 3: Xem logs (nếu cần)
```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f postgres
docker-compose logs -f r-analysis
docker-compose logs -f django-backend
```

### Bước 4: Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔍 Kiểm tra hệ thống

### Health Checks:
- PostgreSQL: `docker-compose exec postgres pg_isready -U postgres`
- R Server: `curl http://localhost:8000/health`
- Django: `curl http://localhost:8001/health/`
- Redis: `docker-compose exec redis redis-cli ping`

### Test Endpoints:
- Frontend: http://localhost:3000
- Blog: http://localhost:3000/blog
- R Analysis: http://localhost:8000/__docs__/
- Django Admin: http://localhost:8001/admin/

## 🛠️ Quản lý dữ liệu

### Backup Database:
```bash
docker-compose exec postgres pg_dump -U postgres ncskit > backup.sql
```

### Restore Database:
```bash
docker-compose exec -T postgres psql -U postgres ncskit < backup.sql
```

### Reset Database:
```bash
docker-compose down -v
docker-compose up --build -d
```

## 📦 Di chuyển sang máy khác

### Bước 1: Backup toàn bộ
```bash
# Backup code
git clone [repository-url]

# Backup database
docker-compose exec postgres pg_dump -U postgres ncskit > ncskit-backup.sql

# Backup volumes (optional)
docker run --rm -v ncskit_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .
```

### Bước 2: Setup máy mới
```bash
# Copy files
git clone [repository-url]
cd ncskit

# Start services
docker-compose up --build -d

# Restore database (if needed)
docker-compose exec -T postgres psql -U postgres ncskit < ncskit-backup.sql

# Start frontend
cd frontend
npm install
npm run dev
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

#### 1. Port đã được sử dụng
```bash
# Kiểm tra port
netstat -an | findstr :5432
netstat -an | findstr :8000

# Thay đổi port trong docker-compose.yml
```

#### 2. Database connection failed
```bash
# Kiểm tra PostgreSQL
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 3. R packages installation failed
```bash
# Rebuild R container
docker-compose build --no-cache r-analysis
docker-compose up -d r-analysis
```

#### 4. Frontend không kết nối được database
```bash
# Kiểm tra .env.local
# Restart frontend
cd frontend
npm run dev
```

### Logs và Debugging:
```bash
# Xem logs realtime
docker-compose logs -f

# Vào container để debug
docker-compose exec postgres bash
docker-compose exec r-analysis bash
docker-compose exec django-backend bash
```

## 🔒 Bảo mật

### Production Setup:
1. Thay đổi passwords mặc định
2. Sử dụng environment variables
3. Enable SSL/TLS
4. Cấu hình firewall
5. Regular backups

### Environment Variables cần thay đổi:
```env
POSTGRES_PASSWORD=strong-password-here
JWT_SECRET=random-secret-key-here
DJANGO_SECRET_KEY=django-secret-key-here
```

## 📈 Monitoring

### Docker Stats:
```bash
docker stats
```

### Service Health:
```bash
# Check all services
docker-compose ps

# Detailed health check
docker-compose exec postgres pg_isready
curl http://localhost:8000/health
curl http://localhost:8001/health/
```

## 🎯 Tính năng chính

### ✅ Hoàn thành:
- ✅ PostgreSQL database với schema đầy đủ
- ✅ Authentication system (login/register)
- ✅ Blog system với SEO
- ✅ R Analysis server
- ✅ Django REST API
- ✅ Docker containerization
- ✅ Auto database initialization
- ✅ Health checks

### 🚧 Đang phát triển:
- 🚧 Advanced analytics features
- 🚧 File upload/processing
- 🚧 Email notifications
- 🚧 OAuth integration
- 🚧 Advanced admin panel

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Rebuild containers: `docker-compose up --build -d`
4. Reset everything: `docker-compose down -v && docker-compose up --build -d`

---

**Chúc bạn sử dụng NCSKIT thành công! 🚀**