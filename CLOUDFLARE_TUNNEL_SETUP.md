# 🚀 Cloudflare Tunnel Setup Guide for ncskit.org

## Prerequisites
- Domain ncskit.org đã được add vào Cloudflare
- Cloudflare account với quyền quản lý domain

## Step 1: Download Cloudflared

### Windows:
1. Download từ: https://github.com/cloudflare/cloudflared/releases/latest
2. Tải file: `cloudflared-windows-amd64.exe`
3. Đổi tên thành `cloudflared.exe`
4. Di chuyển vào thư mục dự án hoặc thêm vào PATH

### Hoặc dùng PowerShell (Admin):
```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

## Step 2: Login to Cloudflare

```bash
cloudflared tunnel login
```

- Browser sẽ mở
- Chọn domain `ncskit.org`
- Authorize

## Step 3: Create Tunnel

```bash
cloudflared tunnel create ncskit
```

Lưu lại **Tunnel ID** (sẽ hiển thị sau khi tạo)

## Step 4: Create Config File

Tạo file `cloudflared-config.yml` trong thư mục dự án:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<YOUR_USERNAME>\.cloudflared\<TUNNEL_ID>.json

ingress:
  # Route ncskit.org to Next.js app
  - hostname: ncskit.org
    service: http://localhost:3000
  
  # Route www.ncskit.org to Next.js app
  - hostname: www.ncskit.org
    service: http://localhost:3000
  
  # Catch-all rule (required)
  - service: http_status:404
```

**Thay thế:**
- `<TUNNEL_ID>` bằng Tunnel ID từ Step 3
- `<YOUR_USERNAME>` bằng username Windows của bạn

## Step 5: Route DNS

```bash
cloudflared tunnel route dns ncskit ncskit.org
cloudflared tunnel route dns ncskit www.ncskit.org
```

## Step 6: Run Tunnel

### Development (Terminal):
```bash
cloudflared tunnel --config cloudflared-config.yml run ncskit
```

### Production (Windows Service):

1. Install as service:
```bash
cloudflared service install
```

2. Start service:
```bash
sc start cloudflared
```

## Step 7: Update Next.js Config

Cập nhật `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  
  // Allow Cloudflare Tunnel
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Step 8: Update Environment Variables

Thêm vào `frontend/.env.local`:

```env
# Production URL
NEXT_PUBLIC_APP_URL=https://ncskit.org
NEXTAUTH_URL=https://ncskit.org
```

## Verification

1. Start Next.js dev server:
```bash
cd frontend
npm run dev
```

2. Start Cloudflare Tunnel (terminal mới):
```bash
cloudflared tunnel --config cloudflared-config.yml run ncskit
```

3. Truy cập: https://ncskit.org

## Troubleshooting

### Issue: "tunnel credentials file not found"
**Solution:** Check đường dẫn trong `cloudflared-config.yml`

### Issue: "connection refused"
**Solution:** Đảm bảo Next.js đang chạy trên port 3000

### Issue: "DNS not resolving"
**Solution:** 
- Đợi 5-10 phút để DNS propagate
- Check Cloudflare DNS settings
- Đảm bảo Proxy status là "Proxied" (orange cloud)

### Issue: "SSL/TLS errors"
**Solution:**
- Vào Cloudflare Dashboard → SSL/TLS
- Set mode to "Full" hoặc "Flexible"

## Production Deployment

### Option 1: Windows Service (Recommended)
```bash
# Install
cloudflared service install

# Start
sc start cloudflared

# Stop
sc stop cloudflared

# Uninstall
cloudflared service uninstall
```

### Option 2: PM2 (Alternative)
```bash
npm install -g pm2

# Start tunnel
pm2 start cloudflared --name tunnel -- tunnel --config cloudflared-config.yml run ncskit

# Start Next.js
pm2 start npm --name ncskit -- run start

# Save
pm2 save

# Startup on boot
pm2 startup
```

## Security Best Practices

1. **Enable Cloudflare WAF:**
   - Cloudflare Dashboard → Security → WAF
   - Enable managed rules

2. **Rate Limiting:**
   - Security → Rate Limiting
   - Add rules for API endpoints

3. **Access Control:**
   - Zero Trust → Access → Applications
   - Add authentication for admin routes

4. **SSL/TLS:**
   - SSL/TLS → Edge Certificates
   - Enable "Always Use HTTPS"
   - Enable "Automatic HTTPS Rewrites"

## Monitoring

### Check Tunnel Status:
```bash
cloudflared tunnel info ncskit
```

### View Logs:
```bash
cloudflared tunnel --config cloudflared-config.yml run ncskit --loglevel debug
```

### Cloudflare Dashboard:
- Zero Trust → Networks → Tunnels
- View traffic, health, and metrics

## Useful Commands

```bash
# List tunnels
cloudflared tunnel list

# Delete tunnel
cloudflared tunnel delete ncskit

# Cleanup DNS
cloudflared tunnel route dns --overwrite-dns ncskit ncskit.org

# Test config
cloudflared tunnel --config cloudflared-config.yml ingress validate
```

## Next Steps

1. ✅ Setup tunnel
2. ✅ Configure DNS
3. ✅ Test locally
4. 🔄 Deploy to production
5. 🔄 Setup monitoring
6. 🔄 Configure WAF rules
7. 🔄 Setup backups

## Support

- Cloudflare Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Community: https://community.cloudflare.com/
- Status: https://www.cloudflarestatus.com/
