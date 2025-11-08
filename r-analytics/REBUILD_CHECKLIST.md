# R Analytics Docker Rebuild Checklist

## Vấn Đề Đã Phát Hiện

### 1. **R Packages Không Được Cài Đặt**
- Container restart liên tục với lỗi: `there is no package called 'plumber'`
- Build process đã chạy 66 phút nhưng packages không có trong image
- Có 449 packages trong image nhưng KHÔNG có plumber, dplyr, lavaan, etc.

### 2. **Nguyên Nhân**
- Dockerfile cài tất cả packages trong 1 RUN command duy nhất
- Nếu có lỗi trong quá trình cài, Docker không fail mà tiếp tục
- Không có error checking cho từng package

## Giải Pháp Đã Áp Dụng

### 1. **Chia Nhỏ Package Installation**
Thay vì:
```dockerfile
RUN R -e "install.packages(c('plumber', 'jsonlite', 'dplyr', ...), ...)"
```

Đổi thành:
```dockerfile
RUN R -e "install.packages(c('plumber', 'jsonlite'), ...)"
RUN R -e "install.packages(c('dplyr', 'tidyr', 'reshape2'), ...)"
RUN R -e "install.packages(c('psych', 'moments', 'Hmisc'), ...)"
...
```

**Lợi ích:**
- Mỗi RUN command sẽ fail nếu có lỗi
- Dễ debug package nào gây lỗi
- Docker cache từng layer, rebuild nhanh hơn nếu fail

### 2. **Volume Configuration**
- Volume `r-packages` đã được DISABLED trong docker-compose.yml
- Không mount `/usr/local/lib/R/site-library` để tránh override packages

## Files Đã Kiểm Tra

### ✅ Dockerfile
- [x] System dependencies đầy đủ
- [x] R packages chia thành 7 groups
- [x] WORKDIR /app
- [x] COPY api.R và endpoints/
- [x] CMD chạy plumber API

### ✅ docker-compose.yml
- [x] Port 8000:8000
- [x] Environment variables
- [x] Volume r-packages DISABLED
- [x] Health check configuration
- [x] Resource limits

### ✅ Application Files
- [x] api.R (18KB)
- [x] endpoints/data-health.R (10KB)
- [x] endpoints/descriptive-stats.R (2.5KB)
- [x] endpoints/factor-analysis.R (2.3KB)
- [x] endpoints/hypothesis-tests.R (13KB)
- [x] endpoints/regression.R (3.5KB)
- [x] endpoints/sem.R (3.9KB)

## Trạng Thái Hiện Tại

### Docker Images
```
r-analytics-r-analytics:latest  1d4401fb9b0c  16 minutes ago  4.13GB (OLD - NO PACKAGES)
ncskit-r-analytics:latest       6a5bcc884e6a  12 hours ago    5.36GB (OLDER)
```

### Container Status
```
ncskit-r-analytics  Exited (1) 2 minutes ago
```

### Volumes
```
newncskit_r_packages (NOT USED)
```

## Kế Hoạch Rebuild

### Bước 1: Dọn Dẹp
```powershell
# Stop và remove container cũ
docker-compose -f r-analytics/docker-compose.yml down -v

# Remove old images
docker rmi r-analytics-r-analytics:latest
docker rmi ncskit-r-analytics:latest

# Remove unused volumes
docker volume prune -f
```

### Bước 2: Rebuild Image
```powershell
# Build với no-cache để đảm bảo fresh build
docker-compose -f r-analytics/docker-compose.yml build --no-cache

# Thời gian dự kiến: 15-20 phút
# Image size dự kiến: 4-5GB
```

### Bước 3: Start Container
```powershell
# Start container
docker-compose -f r-analytics/docker-compose.yml up -d

# Đợi 30 giây để R packages load
Start-Sleep -Seconds 30

# Check logs
docker logs ncskit-r-analytics --tail 50
```

### Bước 4: Verify
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Test plumber loaded
docker exec ncskit-r-analytics R -e "library(plumber); print('OK')"

# Test API docs
start http://localhost:8000/__docs__/
```

## Expected Results

### Successful Build
```
[+] Building 1200.0s (15/15) FINISHED
 => [2/7] RUN apt-get update && apt-get install...  ✓
 => [3/7] RUN R -e "install.packages(c('plumber'... ✓
 => [4/7] RUN R -e "install.packages(c('dplyr'...  ✓
 => [5/7] RUN R -e "install.packages(c('psych'...  ✓
 ...
 => exporting to image                              ✓
```

### Successful Start
```
> library(plumber)
> pr <- plumber::plumb('api.R')
> pr$run(host='0.0.0.0', port=8000, swagger=TRUE)
Running plumber API at http://0.0.0.0:8000
Running swagger Docs at http://0.0.0.0:8000/__docs__/
```

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08 08:50:00",
  "version": "2.0.0",
  "service": "ncskit-r-analytics",
  "uptime": 30.5
}
```

## Troubleshooting

### Nếu Build Fail
1. Xem log để tìm package nào fail
2. Kiểm tra system dependencies
3. Thử cài package đó riêng lẻ
4. Google error message

### Nếu Container Restart Liên Tục
1. Check logs: `docker logs ncskit-r-analytics`
2. Verify packages: `docker exec ncskit-r-analytics R -e "library(plumber)"`
3. Test manual run: `docker run --rm r-analytics-r-analytics R -e "library(plumber)"`

### Nếu Health Check Fail
1. Đợi thêm thời gian (R packages đang load)
2. Check port: `netstat -ano | findstr :8000`
3. Check firewall
4. Test từ trong container: `docker exec ncskit-r-analytics curl localhost:8000/health`

## Next Steps After Success

1. **Test All Endpoints**
   ```powershell
   .\r-analytics\test-endpoints.ps1
   ```

2. **Setup Cloudflare Tunnel** (Optional)
   ```powershell
   .\deployment\cloudflare-tunnel\install-cloudflared.ps1
   .\deployment\cloudflare-tunnel\create-tunnel.ps1
   ```

3. **Deploy to Production**
   - Update environment variables
   - Configure SSL/TLS
   - Setup monitoring

---

**Prepared**: 2025-11-08 08:50
**Status**: Ready for rebuild
**Estimated Time**: 15-20 minutes
