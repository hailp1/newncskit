# Hướng Dẫn Kết Nối Docker R Analytics

## Tổng Quan

Tài liệu này hướng dẫn cách kết nối và vận hành Docker R Analytics service với hệ thống NCSKIT thông qua Cloudflare Tunnel.

### Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                  Vercel (Production)                         │
│  https://frontend-rg7ve3e59-hailp1s-projects.vercel.app    │
│                                                              │
│  API Routes:                                                │
│  • /api/analytics        → Phân tích dữ liệu               │
│  • /api/health/docker    → Kiểm tra sức khỏe              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS Request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Cloudflare Tunnel (Public Gateway)                │
│  https://analytics.ncskit.app                               │
│                                                              │
│  • Bảo mật kết nối                                          │
│  • Không cần mở port                                        │
│  • SSL/TLS tự động                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Secure Tunnel
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Docker Container (Local Machine)                │
│  Container: ncskit-r-analytics                              │
│  Port: 8000                                                 │
│                                                              │
│  Services:                                                  │
│  • R Analytics API                                          │
│  • Statistical Analysis                                     │
│  • Machine Learning                                         │
└─────────────────────────────────────────────────────────────┘
```

## Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

1. **Docker Desktop**
   - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Phiên bản: 20.10 trở lên
   - RAM: Tối thiểu 8GB (khuyến nghị 16GB)
   - CPU: 4 cores trở lên

2. **Cloudflared CLI** (Tùy chọn - cho public access)
   - Cài đặt: `deployment\cloudflare-tunnel\install-cloudflared.ps1`
   - Hoặc: [Download Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

3. **PowerShell** (Windows)
   - Đã có sẵn trong Windows 10/11

### Tài Khoản Cần Thiết

- **Cloudflare Account** (Miễn phí)
  - Đăng ký tại: https://dash.cloudflare.com/sign-up
  - Cần cho Cloudflare Tunnel

## Cài Đặt Nhanh

### Bước 1: Khởi Động Tất Cả Services

Chạy script tự động:

```powershell
.\deployment\complete-docker-integration.ps1
```

Script này sẽ:
- ✓ Kiểm tra Docker và Cloudflared
- ✓ Build Docker image (nếu cần)
- ✓ Khởi động Docker container
- ✓ Khởi động Cloudflare Tunnel
- ✓ Kiểm tra kết nối
- ✓ Hiển thị báo cáo trạng thái

### Bước 2: Xác Nhận Hoạt Động

Sau khi script chạy xong, kiểm tra:

```powershell
# Kiểm tra Docker container
docker ps

# Kiểm tra health endpoint
curl http://localhost:8000/health

# Kiểm tra Swagger docs
# Mở browser: http://localhost:8000/__docs__/
```

## Cài Đặt Từng Bước (Chi Tiết)

### 1. Cài Đặt Docker

#### Windows

1. Download Docker Desktop từ https://www.docker.com/products/docker-desktop
2. Chạy installer
3. Khởi động lại máy tính
4. Mở Docker Desktop
5. Đợi Docker khởi động hoàn tất

Kiểm tra:
```powershell
docker --version
docker ps
```

### 2. Build Docker Image

```powershell
cd r-analytics
.\build.ps1
```

Hoặc thủ công:
```powershell
cd r-analytics
docker-compose build
```

**Lưu ý**: Build lần đầu có thể mất 5-10 phút để tải R packages.

### 3. Khởi Động Docker Container

```powershell
cd r-analytics
.\start.ps1
```

Hoặc thủ công:
```powershell
cd r-analytics
docker-compose up -d
```

Kiểm tra logs:
```powershell
docker-compose logs -f
```

### 4. Cài Đặt Cloudflare Tunnel (Tùy Chọn)

#### 4.1. Cài Đặt Cloudflared

```powershell
cd deployment\cloudflare-tunnel
.\install-cloudflared.ps1
```

#### 4.2. Xác Thực với Cloudflare

```powershell
.\authenticate-cloudflared.ps1
```

Trình duyệt sẽ mở, đăng nhập vào Cloudflare account.

#### 4.3. Tạo Tunnel

```powershell
.\create-tunnel.ps1
```

Tunnel name: `ncskit-analytics`

#### 4.4. Cấu Hình DNS

**Tự động:**
```powershell
.\configure-dns.ps1
```

**Thủ công (trong Cloudflare Dashboard):**
1. Vào DNS settings
2. Thêm CNAME record:
   - Name: `analytics`
   - Target: `<tunnel-id>.cfargotunnel.com`
   - Proxy: Enabled

#### 4.5. Khởi Động Tunnel

**Chạy thủ công (test):**
```powershell
.\start-tunnel.ps1
```

**Cài đặt Windows Service (production):**
```powershell
# Chạy PowerShell as Administrator
.\setup-tunnel-service.ps1
```

## Kiểm Tra Kết Nối

### Test Local Docker

```powershell
# Health check
curl http://localhost:8000/health

# Swagger docs
start http://localhost:8000/__docs__/

# Test endpoint
curl -X POST http://localhost:8000/analysis/descriptive?project_id=test `
  -H "Content-Type: application/json" `
  -d '{"variables": ["var1"]}'
```

### Test Cloudflare Tunnel

```powershell
# Health check qua tunnel
curl https://analytics.ncskit.app/health

# Test từ Vercel
curl https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/health/docker
```

### Test Analytics API

```powershell
# Gọi analytics API từ Vercel
curl -X POST https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/analytics `
  -H "Content-Type: application/json" `
  -d '{
    "endpoint": "/health",
    "method": "GET"
  }'
```

## Quản Lý Services

### Docker Container

```powershell
# Xem logs
docker-compose -f r-analytics/docker-compose.yml logs -f

# Dừng container
docker-compose -f r-analytics/docker-compose.yml down

# Khởi động lại
docker-compose -f r-analytics/docker-compose.yml restart

# Xem trạng thái
docker ps

# Xem resource usage
docker stats ncskit-r-analytics
```

### Cloudflare Tunnel

```powershell
# Dừng tunnel
.\deployment\cloudflare-tunnel\stop-tunnel.ps1

# Khởi động lại
.\deployment\cloudflare-tunnel\start-tunnel.ps1

# Xem thông tin tunnel
cloudflared tunnel info ncskit-analytics

# Xem logs (nếu chạy service)
Get-Content .\deployment\cloudflare-tunnel\logs\cloudflared.log -Tail 50 -Wait
```

### Windows Service (Cloudflare Tunnel)

```powershell
# Xem trạng thái
Get-Service CloudflaredTunnel

# Khởi động
Start-Service CloudflaredTunnel

# Dừng
Stop-Service CloudflaredTunnel

# Khởi động lại
Restart-Service CloudflaredTunnel

# Gỡ cài đặt service
cloudflared service uninstall
```

## Troubleshooting

### Docker Container Không Khởi Động

**Triệu chứng:**
- Container exit ngay sau khi start
- Health check fail

**Giải pháp:**

1. Kiểm tra logs:
```powershell
docker-compose -f r-analytics/docker-compose.yml logs
```

2. Kiểm tra port 8000 có bị chiếm:
```powershell
netstat -ano | findstr :8000
```

3. Tăng memory cho Docker:
   - Mở Docker Desktop
   - Settings → Resources
   - Tăng Memory lên 8GB

4. Rebuild image:
```powershell
cd r-analytics
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Cloudflare Tunnel Không Kết Nối

**Triệu chứng:**
- `https://analytics.ncskit.app` không truy cập được
- Tunnel process exit

**Giải pháp:**

1. Kiểm tra tunnel tồn tại:
```powershell
cloudflared tunnel list
```

2. Kiểm tra DNS:
```powershell
nslookup analytics.ncskit.app
```

3. Kiểm tra config file:
```powershell
cat .\deployment\cloudflare-tunnel\config\tunnel-config.yml
```

4. Xem logs:
```powershell
Get-Content .\deployment\cloudflare-tunnel\logs\cloudflared.log -Tail 100
```

5. Tạo lại tunnel:
```powershell
cloudflared tunnel delete ncskit-analytics
.\deployment\cloudflare-tunnel\create-tunnel.ps1
```

### Vercel Không Kết Nối Được Docker

**Triệu chứng:**
- `/api/health/docker` trả về unhealthy
- `/api/analytics` timeout

**Giải pháp:**

1. Kiểm tra environment variables trong Vercel:
```powershell
vercel env ls
```

Cần có:
- `NEXT_PUBLIC_ANALYTICS_URL=https://analytics.ncskit.app`
- `ANALYTICS_API_KEY=<your-key>`

2. Thêm environment variables:
```powershell
vercel env add NEXT_PUBLIC_ANALYTICS_URL
# Nhập: https://analytics.ncskit.app

vercel env add ANALYTICS_API_KEY
# Nhập: <your-api-key>
```

3. Redeploy Vercel:
```powershell
vercel --prod
```

### Analytics API Trả Về Lỗi

**Triệu chứng:**
- API trả về 500 error
- R script error

**Giải pháp:**

1. Kiểm tra logs:
```powershell
docker-compose -f r-analytics/docker-compose.yml logs -f
```

2. Test endpoint trực tiếp:
```powershell
curl http://localhost:8000/health
```

3. Kiểm tra data format:
```powershell
# Upload test data
curl -X POST http://localhost:8000/data/upload?project_id=test `
  -H "Content-Type: application/json" `
  -d '{
    "data": [
      {"x": 1, "y": 2},
      {"x": 3, "y": 4}
    ]
  }'
```

4. Xem Swagger docs để kiểm tra API format:
```
http://localhost:8000/__docs__/
```

## Monitoring và Logs

### Docker Logs

```powershell
# Real-time logs
docker-compose -f r-analytics/docker-compose.yml logs -f

# Last 100 lines
docker-compose -f r-analytics/docker-compose.yml logs --tail=100

# Logs của service cụ thể
docker logs ncskit-r-analytics -f
```

### Cloudflare Tunnel Logs

```powershell
# Xem logs
Get-Content .\deployment\cloudflare-tunnel\logs\cloudflared.log -Tail 50 -Wait

# Tìm errors
Select-String -Path .\deployment\cloudflare-tunnel\logs\cloudflared.log -Pattern "error"
```

### Health Monitoring

```powershell
# Script kiểm tra tự động
.\deployment\cloudflare-tunnel\test-tunnel.ps1

# Hoặc manual
curl http://localhost:8000/health
curl https://analytics.ncskit.app/health
curl https://frontend-rg7ve3e59-hailp1s-projects.vercel.app/api/health/docker
```

## Performance Tuning

### Docker Resource Limits

Chỉnh sửa `r-analytics/docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'        # Tăng nếu có nhiều CPU
      memory: 8G       # Tăng nếu xử lý dataset lớn
    reservations:
      cpus: '2'
      memory: 2G
```

### R Memory Settings

Chỉnh sửa environment variables:

```yaml
environment:
  - R_MAX_MEMORY=16G    # Tăng cho dataset lớn
  - R_MAX_CORES=8       # Tăng cho parallel processing
```

### Caching

Analytics API có built-in caching:
- Cache TTL: 1 hour (mặc định)
- Circuit breaker: Tự động retry khi fail
- Request timeout: 30 seconds

## Security Best Practices

### 1. API Key Management

```powershell
# Tạo API key mạnh
$apiKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Thêm vào Vercel
vercel env add ANALYTICS_API_KEY
```

### 2. Cloudflare Access (Tùy chọn)

Bảo vệ tunnel với Cloudflare Access:
1. Vào Cloudflare Dashboard
2. Access → Applications
3. Add Application
4. Chọn Self-hosted
5. Cấu hình authentication

### 3. Rate Limiting

Đã được implement trong `/api/analytics`:
- Circuit breaker
- Request timeout
- Retry logic

## Backup và Recovery

### Backup Docker Volumes

```powershell
# Backup R packages
docker run --rm -v ncskit-r-packages:/data -v ${PWD}:/backup alpine tar czf /backup/r-packages-backup.tar.gz /data

# Restore
docker run --rm -v ncskit-r-packages:/data -v ${PWD}:/backup alpine tar xzf /backup/r-packages-backup.tar.gz -C /
```

### Backup Tunnel Config

```powershell
# Backup credentials
Copy-Item -Path "$env:USERPROFILE\.cloudflared" -Destination ".\backup\cloudflared" -Recurse

# Backup config
Copy-Item -Path ".\deployment\cloudflare-tunnel\config" -Destination ".\backup\tunnel-config" -Recurse
```

## Tài Liệu Tham Khảo

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Cloudflare Tunnel
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub](https://github.com/cloudflare/cloudflared)

### R Analytics
- API Documentation: `http://localhost:8000/__docs__/`
- README: `r-analytics/README.md`

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs (xem phần Monitoring)
2. Chạy test script: `.\deployment\complete-docker-integration.ps1 -TestOnly`
3. Xem troubleshooting guide ở trên
4. Liên hệ team NCSKIT

## Checklist Hoàn Thành

- [ ] Docker Desktop đã cài đặt và chạy
- [ ] Docker image đã build thành công
- [ ] Docker container đang chạy
- [ ] Health check local thành công (`http://localhost:8000/health`)
- [ ] Cloudflared đã cài đặt (nếu cần public access)
- [ ] Cloudflare Tunnel đã tạo và chạy
- [ ] DNS đã cấu hình
- [ ] Health check qua tunnel thành công (`https://analytics.ncskit.app/health`)
- [ ] Vercel environment variables đã cấu hình
- [ ] Vercel health check thành công
- [ ] Analytics API test thành công

## Tóm Tắt Commands

```powershell
# Setup tất cả
.\deployment\complete-docker-integration.ps1

# Chỉ test (không start services)
.\deployment\complete-docker-integration.ps1 -TestOnly

# Skip build image
.\deployment\complete-docker-integration.ps1 -SkipBuild

# Skip tunnel
.\deployment\complete-docker-integration.ps1 -SkipTunnel

# Dừng tất cả
docker-compose -f r-analytics/docker-compose.yml down
.\deployment\cloudflare-tunnel\stop-tunnel.ps1

# Xem logs
docker-compose -f r-analytics/docker-compose.yml logs -f
Get-Content .\deployment\cloudflare-tunnel\logs\cloudflared.log -Tail 50 -Wait
```

---

**Phiên bản**: 1.0.0  
**Cập nhật**: 2024-01-07  
**Tác giả**: NCSKIT Team
