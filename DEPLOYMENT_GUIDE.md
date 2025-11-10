# 🚀 NCSKIT v2.0 - Deployment Guide

## Tổng Quan

Hướng dẫn deploy NCSKIT v2.0 lên Vercel với các tính năng mới:
- CSV Workflow Automation
- Variable Role Tagging
- Auto-Continue Logic
- Smart Role Suggestions
- Model Preview

## 📋 Yêu Cầu Trước Khi Deploy

### 1. Tài Khoản & Dịch Vụ
- [x] Tài khoản Vercel
- [x] Tài khoản Supabase (database)
- [x] GitHub repository
- [ ] R Analytics service (Docker hoặc cloud)

### 2. Chuẩn Bị Môi Trường

#### Supabase Setup
1. Tạo project mới trên Supabase
2. Chạy migration: `supabase/migrations/20241110_variable_role_tags.sql`
3. Lấy credentials:
   - Project URL
   - Anon key
   - Service role key

#### R Analytics Service
1. Deploy R service (Docker hoặc cloud)
2. Lấy URL và API key
3. Test connection

## 🔧 Cấu Hình Vercel

### Bước 1: Import Project

```bash
# Clone repository
git clone https://github.com/your-username/ncskit.git
cd ncskit

# Install dependencies
cd frontend
npm install
```

### Bước 2: Cấu Hình Environment Variables

Trong Vercel Dashboard > Settings > Environment Variables, thêm:

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics Service
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.your-domain.com
ANALYTICS_API_KEY=your-analytics-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Feature Flags (Recommended)
```bash
# CSV Workflow Automation Features
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=true
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING=false
NEXT_PUBLIC_ENABLE_ROLE_TAGGING=true
NEXT_PUBLIC_ENABLE_ROLE_SUGGESTIONS=true
NEXT_PUBLIC_ENABLE_MODEL_PREVIEW=true

# General Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Bước 3: Build Settings

Trong Vercel Dashboard > Settings > Build & Development:

```
Framework Preset: Next.js
Build Command: cd frontend && npm run build
Output Directory: frontend/.next
Install Command: cd frontend && npm install
Development Command: cd frontend && npm run dev
```

### Bước 4: Deploy

```bash
# Push to GitHub
git add .
git commit -m "Release v2.0: CSV Workflow Automation"
git push origin main

# Vercel sẽ tự động deploy
```

## ✅ Kiểm Tra Sau Deploy

### 1. Basic Functionality
- [ ] Homepage loads
- [ ] Login/Register works
- [ ] Dashboard accessible

### 2. CSV Workflow
- [ ] Upload CSV file
- [ ] Health check displays
- [ ] Auto-continue triggers (wait 2 seconds)
- [ ] Grouping suggestions appear
- [ ] Can save groups

### 3. Role Tagging
- [ ] Role selector appears
- [ ] Can assign roles (IV, DV, etc.)
- [ ] Smart suggestions work
- [ ] Validation messages show

### 4. Model Preview
- [ ] Preview button appears
- [ ] Mermaid diagram renders
- [ ] Shows correct relationships

### 5. Performance
- [ ] Page load < 2s
- [ ] No console errors
- [ ] Smooth interactions

## 🐛 Troubleshooting

### Build Errors

**Problem:** TypeScript errors during build
```bash
# Solution: Skip type check
# Add to Vercel environment variables:
SKIP_TYPE_CHECK=true
```

**Problem:** Module not found
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Runtime Errors

**Problem:** Supabase connection failed
```bash
# Check:
1. NEXT_PUBLIC_SUPABASE_URL is correct
2. NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
3. RLS policies are configured
```

**Problem:** Analytics service not responding
```bash
# Check:
1. NEXT_PUBLIC_ANALYTICS_URL is accessible
2. ANALYTICS_API_KEY is correct
3. Service is running
```

**Problem:** Auto-continue not working
```bash
# Check:
1. NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=true
2. No console errors
3. Wait full 2 seconds
4. Check browser console for logs
```

### Performance Issues

**Problem:** Slow page load
```bash
# Solutions:
1. Enable React Compiler (already enabled)
2. Check image optimization
3. Verify CDN caching
4. Monitor Vercel analytics
```

## 📊 Monitoring

### Vercel Dashboard
- Check deployment logs
- Monitor function execution
- Review analytics

### Supabase Dashboard
- Monitor database queries
- Check RLS policies
- Review API usage

### Browser Console
- Check for errors
- Review network requests
- Monitor performance

## 🔄 Rollback Plan

Nếu có vấn đề nghiêm trọng:

### Option 1: Disable Features
```bash
# In Vercel Dashboard, set:
NEXT_PUBLIC_ENABLE_AUTO_CONTINUE=false
NEXT_PUBLIC_ENABLE_ROLE_TAGGING=false
```

### Option 2: Revert Deployment
```bash
# In Vercel Dashboard:
1. Go to Deployments
2. Find previous stable version
3. Click "Promote to Production"
```

### Option 3: Rollback Code
```bash
git revert HEAD
git push origin main
```

## 📈 Success Metrics

### Technical
- ✅ Build time < 3 minutes
- ✅ Page load < 2 seconds
- ✅ Error rate < 1%
- ✅ Uptime > 99.9%

### Feature Adoption
- Auto-continue usage rate
- Role tagging completion rate
- Model preview views
- User satisfaction score

## 🎯 Next Steps

### Immediate (Day 1)
1. Monitor error logs
2. Check user feedback
3. Verify all features
4. Update documentation

### Short-term (Week 1)
1. Analyze usage metrics
2. Fix minor bugs
3. Optimize performance
4. Gather feedback

### Long-term (Month 1)
1. Review feature adoption
2. Plan improvements
3. Update roadmap
4. Celebrate! 🎉

## 📞 Support

### Documentation
- [Requirements](/.kiro/specs/csv-workflow-automation/requirements.md)
- [Design](/.kiro/specs/csv-workflow-automation/design.md)
- [Tasks](/.kiro/specs/csv-workflow-automation/tasks.md)
- [Release Notes](/RELEASE_NOTES_v2.0.md)

### Contact
- GitHub Issues: [Report bugs](https://github.com/your-username/ncskit/issues)
- Email: support@ncskit.org

---

**Version:** 2.0.0  
**Last Updated:** November 10, 2025  
**Status:** ✅ Ready for Production
