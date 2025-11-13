# 🐳 Docker Deployment Guide - Chạy Toàn Bộ Stack

## 📦 Bao Gồm

Docker Compose sẽ chạy:
- ✅ **PostgreSQL** - Database (port 5432)
- ✅ **R Analytics** - Backend service (port 8000)
- ✅ **Next.js Frontend** - Web app (port 3000)
- ✅ **Cloudflare Tunnel** - Expose ra internet (optional)

---

## 🚀 Quick Start (5 phút)

### Bước 1: Cài Docker Desktop
Download: https://www.docker.com/products/docker-desktop/

### Bước 2: Config Environment
```powershell
# Copy template
copy .env.docker .env

# Edit file
notepad .env
```

**Cần điền:**
- `POSTGRES_PASSWORD` - Password cho PostgreSQL
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `GEMINI_API_KEY` - API key từ Google

### Bước 3: Start All Services
```powershell
.\docker-start.ps1
```

### Bước 4: Run Migrations
```powershell
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

### Bước 5: Setup Tunnel (Expose ra Internet)
```powershell
.\setup-tunnel.ps1
```

### ✅ Done!
- Local: http://localhost:3000
- Public: https://ncskit.org (sau khi setup tunnel)

---

## 📋 Chi Tiết Từng Bước

### 1. Chuẩn Bị Environment

#### Option A: Tự động (Recommended)
```powershell
# Script sẽ tự động copy .env.docker → .env
.\docker-start.ps1
```

#### Option B: Thủ công
```powershell
# Copy template
copy .env.docker .env

# Edit
notepad .env
```

**Các giá trị cần config:**

```env
# PostgreSQL Password
POSTGRES_PASSWORD=your_secure_password_here

# NextAuth Secret (generate mới)
NEXTAUTH_SECRET=run_openssl_rand_base64_32

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

### 2. Build & Start Services

#### Option A: Dùng Script (Recommended)
```powershell
.\docker-start.ps1
```

#### Option B: Thủ công
```powershell
# Build images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

---

### 3. Database Setup

#### Run Migrations
```powershell
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

#### Seed Data (Optional)
```powershell
# Seed categories
docker-compose -f docker-compose.production.yml exec frontend node scripts/seed-categories.js

# Seed posts
docker-compose -f docker-compose.production.yml exec frontend node scripts/seed-posts.js
```

---

### 4. Expose ra Internet với Cloudflare Tunnel

#### Option A: Tunnel trong Docker (Recommended)

1. Get Tunnel Token từ Cloudflare Dashboard:
   - Go to: https://dash.cloudflare.com
   - Zero Trust → Networks → Tunnels
   - Create tunnel → Copy token

2. Add token vào `.env`:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
   ```

3. Restart services:
   ```powershell
   docker-compose -f docker-compose.production.yml restart cloudflared
   ```

#### Option B: Tunnel Riêng Biệt

```powershell
# Setup tunnel
.\setup-tunnel.ps1

# Start tunnel
.\start-tunnel.ps1
```

---

## 📊 Monitoring & Management

### Check Status
```powershell
docker-compose -f docker-compose.production.yml ps
```

### View Logs
```powershell
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f r-analytics
docker-compose -f docker-compose.production.yml logs -f postgres
```

### Restart Services
```powershell
# All services
docker-compose -f docker-compose.production.yml restart

# Specific service
docker-compose -f docker-compose.production.yml restart frontend
```

### Stop Services
```powershell
# Stop all
.\docker-stop.ps1

# Or manually
docker-compose -f docker-compose.production.yml down
```

### Access Container Shell
```powershell
# Frontend
docker-compose -f docker-compose.production.yml exec frontend sh

# R Analytics
docker-compose -f docker-compose.production.yml exec r-analytics sh

# PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d ncskit_production
```

---

## 🔧 Useful Commands

### Database Operations
```powershell
# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres ncskit_production > backup.sql

# Restore database
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres ncskit_production < backup.sql

# Access PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d ncskit_production
```

### Frontend Operations
```powershell
# Run Prisma Studio
docker-compose -f docker-compose.production.yml exec frontend npx prisma studio

# Generate Prisma Client
docker-compose -f docker-compose.production.yml exec frontend npx prisma generate

# Run migrations
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

### Clean Up
```powershell
# Stop and remove containers
docker-compose -f docker-compose.production.yml down

# Stop and remove containers + volumes (DELETE DATA!)
docker-compose -f docker-compose.production.yml down -v

# Remove images
docker-compose -f docker-compose.production.yml down --rmi all

# Clean everything
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution:**
```powershell
# Start Docker Desktop
# Wait for it to fully start
# Try again
```

### Issue: "Port already in use"
**Solution:**
```powershell
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill the process or change port in docker-compose.yml
```

### Issue: "Database connection failed"
**Solution:**
```powershell
# Check if PostgreSQL is running
docker-compose -f docker-compose.production.yml ps postgres

# Check logs
docker-compose -f docker-compose.production.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.production.yml restart postgres
```

### Issue: "Frontend not building"
**Solution:**
```powershell
# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache frontend

# Check logs
docker-compose -f docker-compose.production.yml logs frontend
```

### Issue: "R Analytics not responding"
**Solution:**
```powershell
# Check if R Analytics is running
docker-compose -f docker-compose.production.yml ps r-analytics

# Check logs
docker-compose -f docker-compose.production.yml logs r-analytics

# Restart
docker-compose -f docker-compose.production.yml restart r-analytics
```

---

## 🔒 Security Best Practices

### 1. Change Default Passwords
```env
# Use strong passwords
POSTGRES_PASSWORD=use_a_very_strong_password_here_min_32_chars
```

### 2. Generate New Secrets
```powershell
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 3. Limit Exposed Ports
```yaml
# In docker-compose.yml, remove port mappings for internal services
# Only expose frontend (3000) to host
```

### 4. Use Docker Secrets (Production)
```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

---

## 📈 Performance Optimization

### 1. Resource Limits
Edit `docker-compose.production.yml`:
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. Enable Caching
```yaml
services:
  frontend:
    build:
      cache_from:
        - ncskit-frontend:latest
```

### 3. Use Multi-stage Builds
Already implemented in Dockerfiles!

---

## 🔄 Update & Maintenance

### Update Code
```powershell
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

### Update Dependencies
```powershell
# Update npm packages
docker-compose -f docker-compose.production.yml exec frontend npm update

# Rebuild
docker-compose -f docker-compose.production.yml build frontend
docker-compose -f docker-compose.production.yml up -d frontend
```

### Backup Before Update
```powershell
# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres ncskit_production > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Backup volumes
docker run --rm -v ncskit_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres_data_backup.tar.gz /data
```

---

## 📦 Production Deployment Checklist

- [ ] Docker Desktop installed and running
- [ ] `.env` file configured with production values
- [ ] Strong passwords set
- [ ] NEXTAUTH_SECRET generated
- [ ] API keys configured
- [ ] Services built successfully
- [ ] Database migrations run
- [ ] Cloudflare Tunnel configured
- [ ] DNS records verified
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Logs monitored
- [ ] Backup strategy in place

---

## 🆚 Docker vs Direct Deployment

### Docker (Recommended)
**Pros:**
- ✅ Isolated environment
- ✅ Easy to replicate
- ✅ All services in one command
- ✅ Easy rollback
- ✅ Consistent across environments

**Cons:**
- ❌ Requires Docker Desktop
- ❌ More resource usage
- ❌ Learning curve

### Direct Deployment
**Pros:**
- ✅ Lower resource usage
- ✅ Faster startup
- ✅ Direct access to services

**Cons:**
- ❌ Manual setup for each service
- ❌ Dependency conflicts
- ❌ Harder to replicate

---

## 📞 Support

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Troubleshooting: See `PRODUCTION-DEPLOYMENT-CHECKLIST.md`

---

**Last Updated:** 2024-11-12
**Docker Compose Version:** 3.8
**Services:** PostgreSQL 15 + R Analytics + Next.js 16
