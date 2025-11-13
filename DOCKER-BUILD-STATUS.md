# 🔨 Docker Build Status

## 🚀 Build đang chạy...

### Progress:
- ✅ Loading build context (~692MB)
- 🔄 Installing R packages
- ⏳ Building frontend (Next.js)
- ⏳ Building r-analytics (R service)

### Estimated Time:
- **First build:** 5-10 phút (download + install dependencies)
- **Subsequent builds:** 1-2 phút (cached layers)

### Current Status:
```
[+] Building 50s (16/34)
 => Transferring context: 692MB
 => Installing R packages...
```

---

## 📊 What's Being Built:

### 1. PostgreSQL
- ✅ Using official image (no build needed)
- Image: `postgres:15-alpine`

### 2. R Analytics
- 🔄 Building custom image
- Base: `r-base:4.3.2`
- Installing: plumber, jsonlite, dplyr, etc.

### 3. Next.js Frontend
- 🔄 Building production image
- Base: `node:20-alpine`
- Multi-stage build (deps → builder → runner)
- Output: Standalone Next.js app

---

## 🎯 After Build Completes:

### 1. Start Services
```powershell
docker-compose -f docker-compose.production.yml up -d
```

### 2. Check Status
```powershell
docker-compose -f docker-compose.production.yml ps
```

### 3. View Logs
```powershell
docker-compose -f docker-compose.production.yml logs -f
```

### 4. Run Migrations
```powershell
docker-compose -f docker-compose.production.yml exec frontend npx prisma migrate deploy
```

---

## 💡 Tips:

- **First build is slow** - Docker downloads base images and installs all dependencies
- **Subsequent builds are fast** - Docker caches layers
- **Large context** - node_modules is being transferred (can optimize with .dockerignore)
- **Be patient** - Building production images takes time but worth it!

---

## 🐛 If Build Fails:

### Check logs:
```powershell
# View full build output
docker-compose -f docker-compose.production.yml build --progress=plain
```

### Clean and rebuild:
```powershell
# Remove old images
docker-compose -f docker-compose.production.yml down --rmi all

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

### Check disk space:
```powershell
docker system df
```

---

**Status:** 🔄 Building...
**Progress:** ~50s / ~300-600s
**Next:** Start services after build completes
