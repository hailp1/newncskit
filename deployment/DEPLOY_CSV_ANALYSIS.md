# 🚀 Deploy CSV Analysis Workflow to Production

**Feature:** CSV Analysis Workflow  
**Status:** Ready for Deployment  
**Date:** 2024-01-10

---

## 📋 Pre-Deployment Checklist

### ✅ Code Complete
- [x] All 9 phases implemented
- [x] 30+ files created
- [x] ~6,000 lines of code
- [x] All components tested
- [x] API endpoints functional
- [x] Types defined
- [x] Services implemented

### ✅ Database Ready
- [x] 5 migration files created
- [x] 60+ tables defined
- [x] Indexes optimized
- [x] RLS policies configured

### ⚠️ To Complete Before Deploy
- [ ] Run Supabase migrations
- [ ] Configure Vercel environment variables
- [ ] Test R Analytics service connection
- [ ] Configure storage bucket policies
- [ ] Set up monitoring

---

## 🗄️ Step 1: Deploy Database (Supabase)

### 1.1 Run Migrations

```bash
# Navigate to project root
cd /path/to/newNCSkit

# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref hfczndbrexnaoczxmopn

# Run migrations
npx supabase db push
```

### 1.2 Verify Tables Created

Check in Supabase Dashboard:
- https://app.supabase.com/project/hfczndbrexnaoczxmopn/editor

Expected tables:
- `analysis_projects`
- `analysis_variables`
- `variable_groups`
- `demographic_ranks`
- `ordinal_categories`
- `analysis_configurations`
- `analysis_results`
- `data_health_reports`

### 1.3 Configure Storage Bucket

In Supabase Dashboard → Storage:

1. Create bucket: `analysis-csv-files`
2. Set policies:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload their own files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'analysis-csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to read their own files
   CREATE POLICY "Users can read their own files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'analysis-csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete their own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'analysis-csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

3. Set file size limit: 50MB
4. Allowed MIME types: `text/csv, application/vnd.ms-excel`

---

## ☁️ Step 2: Deploy Frontend (Vercel)

### 2.1 Prepare for Deployment

```bash
# Navigate to frontend
cd frontend

# Build to check for errors
npm run build
```

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from Git repository
4. Select `newNCSkit` repository
5. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2.3 Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

**Required Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hfczndbrexnaoczxmopn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmY3puZGJyZXhuYW9jenhtb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTEwODgsImV4cCI6MjA3ODA2NzA4OH0.m2wQQOiNyDDl-33lwPqffFJTnRifci5Yd7ezEUUIbIs
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Analytics
NEXT_PUBLIC_ANALYTICS_URL=https://your-r-analytics-url.com
ANALYTICS_API_KEY=your-analytics-api-key

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Optional Variables:**
```env
# Monitoring
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=auto-configured

# Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
```

### 2.4 Deploy

Click "Deploy" and wait for build to complete.

---

## 🔧 Step 3: Configure R Analytics Service

### Option A: Use Mock Results (Quick Start)
- No additional setup needed
- System will automatically use mock results
- Good for testing the workflow

### Option B: Deploy R Analytics Service

**Using Docker + Cloudflare Tunnel:**

1. **Start R Analytics Docker Container:**
   ```bash
   cd r-analytics
   docker build -t r-analytics .
   docker run -d -p 8000:8000 r-analytics
   ```

2. **Setup Cloudflare Tunnel:**
   ```bash
   cd deployment/cloudflare-tunnel
   ./install-cloudflared.ps1
   ./authenticate-cloudflared.ps1
   ./create-tunnel.ps1
   ./configure-dns.ps1
   ./setup-tunnel-service.ps1
   ```

3. **Update Vercel Environment Variable:**
   ```env
   NEXT_PUBLIC_ANALYTICS_URL=https://analytics.your-domain.com
   ```

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Vercel Deployment
- Visit your Vercel URL
- Check deployment logs
- Verify no build errors

### 4.2 Test Database Connection
Navigate to: `https://your-app.vercel.app/api/health/supabase`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

### 4.3 Test CSV Analysis Workflow

1. **Navigate to:** `https://your-app.vercel.app/analysis/new`

2. **Test Upload:**
   - Upload a test CSV file
   - Verify file uploads to Supabase Storage
   - Check health check runs

3. **Test Grouping:**
   - Verify AI suggestions appear
   - Test drag & drop
   - Save groups

4. **Test Demographics:**
   - Select demographics
   - Create custom ranks
   - Save configuration

5. **Test Analysis:**
   - Select analyses
   - Run execution
   - Verify progress tracking

6. **Test Results:**
   - View results
   - Test Excel export
   - Test PDF export

---

## 🔍 Step 5: Monitoring & Debugging

### 5.1 Check Vercel Logs
```bash
vercel logs --follow
```

### 5.2 Check Supabase Logs
- Dashboard → Logs → API Logs
- Check for errors or slow queries

### 5.3 Common Issues

**Issue: "Unauthorized" errors**
- Check Supabase RLS policies
- Verify authentication is working
- Check environment variables

**Issue: "Failed to upload CSV"**
- Check storage bucket exists
- Verify storage policies
- Check file size limits

**Issue: "Analysis execution failed"**
- Check R Analytics service is running
- Verify ANALYTICS_URL is correct
- Check API key is set
- System will fallback to mock results

**Issue: "Export failed"**
- Check browser console for errors
- Verify results exist in database
- Check API endpoint logs

---

## 📊 Step 6: Performance Optimization

### 6.1 Enable Vercel Analytics
- Already configured in `vercel.json`
- View metrics in Vercel Dashboard

### 6.2 Configure Caching
- API routes already have appropriate caching headers
- Static assets cached automatically by Vercel

### 6.3 Database Optimization
- Indexes already created in migrations
- Monitor slow queries in Supabase Dashboard

---

## 🔒 Step 7: Security Review

### 7.1 Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use Vercel environment variables
- ✅ Rotate API keys regularly

### 7.2 Database Security
- ✅ RLS policies enabled
- ✅ Service role key kept secret
- ✅ Row-level access control

### 7.3 File Upload Security
- ✅ File size limits (50MB)
- ✅ File type validation
- ✅ User-specific storage paths

---

## 📝 Step 8: Post-Deployment Tasks

### 8.1 Update Documentation
- [ ] Update README with production URL
- [ ] Document any deployment-specific configurations
- [ ] Create user guide

### 8.2 User Communication
- [ ] Announce new feature
- [ ] Provide demo/tutorial
- [ ] Gather feedback

### 8.3 Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up Slack alerts

---

## 🚨 Rollback Plan

If issues occur after deployment:

### Quick Rollback
```bash
# Revert to previous deployment
vercel rollback
```

### Database Rollback
```bash
# If needed, rollback migrations
npx supabase db reset
```

---

## 📞 Support Contacts

### Issues?
- Check Vercel deployment logs
- Check Supabase logs
- Review error tracking (Sentry)
- Check browser console

### Need Help?
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Documentation: `.kiro/specs/csv-analysis-workflow/`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All code committed to git
- [ ] Build passes locally
- [ ] Environment variables documented
- [ ] Database migrations ready

### Deployment
- [ ] Supabase migrations run
- [ ] Storage bucket configured
- [ ] Vercel environment variables set
- [ ] Frontend deployed to Vercel
- [ ] R Analytics service configured (optional)

### Post-Deployment
- [ ] Health checks passing
- [ ] CSV upload tested
- [ ] Analysis execution tested
- [ ] Export functionality tested
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Application loads without errors
- ✅ Users can sign in
- ✅ CSV upload works
- ✅ Health check runs
- ✅ Variable grouping works
- ✅ Demographics configuration works
- ✅ Analysis selection works
- ✅ Analysis execution completes
- ✅ Results display correctly
- ✅ Export to Excel works
- ✅ Export to PDF works

---

**Deployment Status:** 📋 Ready to Deploy  
**Estimated Time:** 30-60 minutes  
**Difficulty:** Medium  

**Good luck with the deployment!** 🚀

