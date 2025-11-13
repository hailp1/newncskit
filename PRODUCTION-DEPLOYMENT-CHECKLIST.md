# 🚀 Production Deployment Checklist for ncskit.org

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `frontend/.env.production` and update all values
- [ ] Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Update `DATABASE_URL` with production database credentials
- [ ] Update `GEMINI_API_KEY` with production API key
- [ ] Update `NEXTAUTH_URL` to `https://ncskit.org`
- [ ] Update `NEXT_PUBLIC_APP_URL` to `https://ncskit.org`

### 2. Database Setup
- [ ] Create production PostgreSQL database
- [ ] Update database connection string in `.env.production`
- [ ] Test database connection
- [ ] Backup existing data (if any)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed initial data (if needed)

### 3. Cloudflare Tunnel Setup
- [ ] Install cloudflared: Download from [GitHub](https://github.com/cloudflare/cloudflared/releases/latest)
- [ ] Login to Cloudflare: `cloudflared tunnel login`
- [ ] Create tunnel: `cloudflared tunnel create ncskit`
- [ ] Save Tunnel ID to `tunnel-id.txt`
- [ ] Create `cloudflared-config.yml` (or run `setup-tunnel.ps1`)
- [ ] Route DNS: 
  ```bash
  cloudflared tunnel route dns ncskit ncskit.org
  cloudflared tunnel route dns ncskit www.ncskit.org
  ```

### 4. DNS Configuration
- [ ] Verify DNS records in Cloudflare Dashboard
- [ ] Ensure CNAME records point to `<TUNNEL_ID>.cfargotunnel.com`
- [ ] Enable Proxy (Orange cloud) for both records
- [ ] Wait for DNS propagation (5-10 minutes)
- [ ] Test DNS: `nslookup ncskit.org`

### 5. SSL/TLS Configuration
- [ ] Go to Cloudflare Dashboard → SSL/TLS
- [ ] Set SSL/TLS encryption mode to "Full" or "Flexible"
- [ ] Enable "Always Use HTTPS"
- [ ] Enable "Automatic HTTPS Rewrites"
- [ ] Enable "Minimum TLS Version" to 1.2 or higher

### 6. Security Configuration
- [ ] Enable Cloudflare WAF (Web Application Firewall)
- [ ] Configure rate limiting rules
- [ ] Enable DDoS protection
- [ ] Configure IP Access Rules (if needed)
- [ ] Enable Bot Fight Mode
- [ ] Review and update CORS settings

### 7. Code Quality Checks
- [ ] Run linter: `npm run lint`
- [ ] Run type check: `npm run type-check` (if available)
- [ ] Run tests: `npm test` (if available)
- [ ] Review and fix all warnings
- [ ] Check for console.log statements
- [ ] Review error handling

### 8. Build & Test
- [ ] Build production: `npm run build`
- [ ] Test production build locally: `npm start`
- [ ] Test all critical user flows
- [ ] Test authentication (login/logout)
- [ ] Test API endpoints
- [ ] Test file uploads
- [ ] Test database operations

## Deployment Steps

### Option A: Quick Deployment (Development Mode)
```powershell
# Run the deployment script
.\deploy-production.ps1
```

### Option B: Service Mode (Recommended for Production)
```powershell
# Run as Administrator
.\deploy-production.ps1 -ServiceMode
```

### Option C: Manual Deployment

#### 1. Build Production
```powershell
cd frontend
npm install
npm run build
```

#### 2. Run Database Migrations
```powershell
npx prisma migrate deploy
```

#### 3. Start Production Server
```powershell
# Option 1: Direct
npm start

# Option 2: With PM2
npm install -g pm2
pm2 start npm --name ncskit-prod -- start
pm2 save
pm2 startup
```

#### 4. Start Cloudflare Tunnel
```powershell
# Option 1: Direct
cloudflared tunnel --config cloudflared-config.yml run ncskit

# Option 2: As Windows Service
cloudflared service install
sc start cloudflared
```

## Post-Deployment Checklist

### 1. Verification
- [ ] Visit https://ncskit.org
- [ ] Visit https://www.ncskit.org
- [ ] Check SSL certificate (should show valid)
- [ ] Test homepage loads correctly
- [ ] Test login/authentication
- [ ] Test API endpoints
- [ ] Test file uploads
- [ ] Test database operations
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### 2. Monitoring Setup
- [ ] Setup Sentry for error tracking (optional)
- [ ] Setup Cloudflare Analytics
- [ ] Setup uptime monitoring (e.g., UptimeRobot)
- [ ] Configure Slack/Email alerts
- [ ] Setup log aggregation
- [ ] Monitor server resources (CPU, Memory, Disk)

### 3. Performance Optimization
- [ ] Enable Cloudflare caching
- [ ] Configure cache rules
- [ ] Enable Cloudflare Auto Minify (HTML, CSS, JS)
- [ ] Enable Brotli compression
- [ ] Optimize images (if not already done)
- [ ] Review and optimize database queries
- [ ] Setup CDN for static assets

### 4. Backup & Recovery
- [ ] Setup automated database backups
- [ ] Test database restore procedure
- [ ] Document recovery procedures
- [ ] Setup version control for configs
- [ ] Create rollback plan

### 5. Documentation
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Document database schema
- [ ] Document API endpoints
- [ ] Create runbook for common issues
- [ ] Document monitoring procedures

## Monitoring Commands

### Check Service Status
```powershell
# Next.js (PM2)
pm2 status
pm2 logs ncskit-prod

# Cloudflare Tunnel (Service)
sc query cloudflared

# Cloudflare Tunnel (Direct)
cloudflared tunnel info ncskit
```

### View Logs
```powershell
# Next.js logs
pm2 logs ncskit-prod --lines 100

# Cloudflare Tunnel logs
cloudflared tunnel --config cloudflared-config.yml run ncskit --loglevel debug
```

### Restart Services
```powershell
# Restart Next.js
pm2 restart ncskit-prod

# Restart Cloudflare Tunnel
sc stop cloudflared
sc start cloudflared
```

## Troubleshooting

### Issue: Site not accessible
**Solutions:**
1. Check DNS propagation: `nslookup ncskit.org`
2. Check Cloudflare Tunnel status: `cloudflared tunnel info ncskit`
3. Check Next.js server: `pm2 status`
4. Check firewall settings
5. Review Cloudflare Dashboard for errors

### Issue: SSL/TLS errors
**Solutions:**
1. Check SSL/TLS mode in Cloudflare Dashboard
2. Ensure "Always Use HTTPS" is enabled
3. Clear browser cache
4. Wait for SSL certificate provisioning (can take up to 24 hours)

### Issue: 502 Bad Gateway
**Solutions:**
1. Check if Next.js server is running: `pm2 status`
2. Check if port 3000 is accessible
3. Review Next.js logs: `pm2 logs ncskit-prod`
4. Restart Next.js: `pm2 restart ncskit-prod`

### Issue: Database connection errors
**Solutions:**
1. Verify DATABASE_URL in `.env.production`
2. Check database server is running
3. Verify database credentials
4. Check firewall rules for database port
5. Test connection: `npx prisma db pull`

### Issue: Authentication not working
**Solutions:**
1. Verify NEXTAUTH_URL is set to `https://ncskit.org`
2. Verify NEXTAUTH_SECRET is set
3. Check Google OAuth credentials (if using)
4. Clear browser cookies
5. Check session storage

## Rollback Procedure

If deployment fails:

1. **Stop services:**
```powershell
pm2 stop ncskit-prod
sc stop cloudflared
```

2. **Restore previous version:**
```powershell
git checkout <previous-commit>
cd frontend
npm install
npm run build
```

3. **Restore database (if needed):**
```powershell
# Restore from backup
psql -U postgres -d ncskit_production < backup.sql
```

4. **Restart services:**
```powershell
pm2 restart ncskit-prod
sc start cloudflared
```

## Support & Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/

## Emergency Contacts

- **Domain Registrar:** [Your registrar]
- **Hosting Provider:** [Your provider]
- **Database Provider:** [Your provider]
- **Team Lead:** [Contact info]
- **DevOps:** [Contact info]

---

**Last Updated:** 2024-11-12
**Deployment Version:** 1.0.0
**Domain:** ncskit.org
