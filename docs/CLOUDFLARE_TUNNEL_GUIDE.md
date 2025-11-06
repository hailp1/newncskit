# 🌐 NCSKIT Cloudflare Tunnel Deployment Guide

## 🎯 Overview

Cloudflare Tunnel cho phép bạn expose NCSKIT ra internet một cách an toàn mà không cần:
- Mở ports trên router
- Cấu hình firewall
- Static IP address
- SSL certificates (Cloudflare tự động handle)

## 🚀 Quick Start (3 Steps)

### 1. Setup Tunnel
```bash
setup-cloudflare-tunnel.bat
```
- Nhập domain name của bạn
- Script sẽ tự động tạo tunnel và DNS records

### 2. Launch Application
```bash
launch-ncskit-public.bat
```
- Tự động start backend, frontend, và tunnel
- Application sẽ accessible qua domain của bạn

### 3. Access Your App
- **Frontend**: `https://yourdomain.com`
- **API**: `https://api.yourdomain.com`
- **Admin**: `https://admin.yourdomain.com/admin/`
- **Health**: `https://health.yourdomain.com/health/`

## 📋 Prerequisites

### 1. Cloudflare Account
- Đăng ký miễn phí tại [cloudflare.com](https://cloudflare.com)
- Add domain của bạn vào Cloudflare
- Change nameservers theo hướng dẫn

### 2. Install Cloudflared
```bash
# Option 1: Winget (Windows 10/11)
winget install --id Cloudflare.cloudflared

# Option 2: Manual download
# Download từ: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### 3. Domain Setup
- Domain phải được add vào Cloudflare account
- DNS management phải được chuyển về Cloudflare
- SSL/TLS mode: "Flexible" hoặc "Full"

## 🔧 Manual Setup (Advanced)

### Step 1: Login to Cloudflare
```bash
cloudflared tunnel login
```

### Step 2: Create Tunnel
```bash
cloudflared tunnel create ncskit
```

### Step 3: Configure DNS
```bash
cloudflared tunnel route dns ncskit yourdomain.com
cloudflared tunnel route dns ncskit www.yourdomain.com
cloudflared tunnel route dns ncskit api.yourdomain.com
cloudflared tunnel route dns ncskit admin.yourdomain.com
```

### Step 4: Create Config File
```yaml
# cloudflared-config.yml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/credentials.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

### Step 5: Run Tunnel
```bash
cloudflared tunnel --config cloudflared-config.yml run
```

## 🏗️ Architecture

```
Internet ──► Cloudflare Edge ──► Tunnel ──► Local NCSKIT
                                          ├── Frontend :3000
                                          └── Backend  :8000
```

### Traffic Flow
1. **User** → `https://yourdomain.com`
2. **Cloudflare Edge** → Receives request
3. **Tunnel** → Routes to `localhost:3000`
4. **NCSKIT Frontend** → Serves application
5. **API Calls** → `https://api.yourdomain.com` → `localhost:8000`

## 🔒 Security Features

### Automatic SSL/TLS
- Cloudflare provides free SSL certificates
- Automatic HTTPS redirect
- TLS 1.3 support

### DDoS Protection
- Cloudflare's global network protects against attacks
- Rate limiting and bot protection
- Web Application Firewall (WAF)

### Access Control
- IP whitelisting/blacklisting
- Geographic restrictions
- Authentication requirements

## 📊 Monitoring & Management

### Cloudflare Dashboard
- **Traffic Analytics**: Request volume, bandwidth
- **Security Events**: Blocked threats, bot traffic
- **Performance**: Response times, cache hit rates
- **Tunnel Status**: Connection health, uptime

### Local Monitoring
```bash
# Check tunnel status
cloudflared tunnel info ncskit

# View tunnel logs
tail -f cloudflared.log

# Test connectivity
curl https://yourdomain.com/health/
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Tunnel Not Connecting
```bash
# Check authentication
cloudflared tunnel login

# Verify tunnel exists
cloudflared tunnel list

# Check config file
cloudflared tunnel --config cloudflared-config.yml validate
```

#### 2. DNS Not Resolving
- Wait 5-10 minutes for DNS propagation
- Check Cloudflare DNS settings
- Verify nameservers are pointing to Cloudflare

#### 3. SSL/TLS Errors
- Set SSL/TLS mode to "Flexible" in Cloudflare
- Ensure origin server is HTTP (not HTTPS)
- Check certificate status in dashboard

#### 4. Application Not Loading
```bash
# Check local services
curl http://localhost:3000
curl http://localhost:8000/health/

# Check tunnel logs
type cloudflared.log
```

### Debug Commands
```bash
# Test tunnel connectivity
cloudflared tunnel --config cloudflared-config.yml run --loglevel debug

# Check DNS resolution
nslookup yourdomain.com

# Test SSL certificate
curl -I https://yourdomain.com
```

## 🔄 Updates & Maintenance

### Update Cloudflared
```bash
# Windows
winget upgrade --id Cloudflare.cloudflared

# Manual
# Download latest version and replace executable
```

### Restart Tunnel
```bash
# Stop current tunnel (Ctrl+C)
# Restart with:
cloudflared tunnel --config cloudflared-config.yml run
```

### Update Configuration
1. Edit `cloudflared-config.yml`
2. Restart tunnel
3. Changes take effect immediately

## 📈 Performance Optimization

### Cloudflare Settings
- **Caching**: Enable for static assets
- **Minification**: CSS, JS, HTML
- **Compression**: Gzip/Brotli
- **Image Optimization**: Polish, Mirage

### Local Optimization
- Use production builds
- Enable compression in Django
- Optimize database queries
- Configure Redis caching

## 💰 Cost Considerations

### Free Tier Includes
- Unlimited bandwidth
- Basic DDoS protection
- SSL certificates
- DNS management
- Up to 50 tunnels

### Paid Features
- Advanced security rules
- Load balancing
- Analytics & logs retention
- Priority support

## 🔐 Security Best Practices

### 1. Access Control
```yaml
# Add authentication to sensitive paths
ingress:
  - hostname: admin.yourdomain.com
    service: http://localhost:8000
    originRequest:
      httpHostHeader: admin.yourdomain.com
      # Add IP restrictions or authentication
```

### 2. Rate Limiting
- Configure in Cloudflare dashboard
- Protect against brute force attacks
- Limit API requests per IP

### 3. Monitoring
- Enable security events logging
- Set up alerts for suspicious activity
- Regular security audits

## 📞 Support & Resources

### Documentation
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [NCSKIT Documentation](./README_DEPLOYMENT.md)

### Community
- Cloudflare Community Forum
- GitHub Issues for NCSKIT

### Emergency Procedures
1. **Tunnel Down**: Restart tunnel service
2. **DNS Issues**: Check Cloudflare DNS settings
3. **SSL Problems**: Verify SSL/TLS mode
4. **Performance Issues**: Check origin server health

## 🎉 Success Checklist

- [ ] Cloudflare account created and domain added
- [ ] Cloudflared installed and authenticated
- [ ] Tunnel created and configured
- [ ] DNS records pointing to tunnel
- [ ] NCSKIT application running locally
- [ ] Tunnel connected and routing traffic
- [ ] All subdomains accessible via HTTPS
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] Performance optimized

**Your NCSKIT application is now publicly accessible with enterprise-grade security and performance! 🚀**