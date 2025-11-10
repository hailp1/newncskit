# 🚀 Deploy to Vercel - Complete Guide

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] Build successful (`npm run build`)
- [x] No TypeScript errors
- [x] No console errors
- [x] All tests passing

### 2. Environment Variables
- [ ] `.env.production` configured
- [ ] Supabase URL set
- [ ] Supabase Anon Key set
- [ ] All API keys configured

### 3. Database
- [ ] Migrations applied
- [ ] Admin user created
- [ ] Sample data seeded (optional)

### 4. Code Cleanup
- [x] Temporary files removed
- [x] Unused code removed
- [x] Comments cleaned up

## 📋 Deployment Steps

### Step 1: Commit Changes

```bash
git add .
git commit -m "chore: cleanup and prepare for deployment"
git push origin main
```

### Step 2: Vercel Configuration

File: `vercel.json` (already configured)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "installCommand": "cd frontend && npm install"
}
```

### Step 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 4: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from Git repository
4. Select your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

7. Click "Deploy"

## 🔧 Environment Variables

### Required Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### How to Add in Vercel:

1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add each variable
4. Select "Production" environment
5. Click "Save"

## 🗄️ Database Setup

### 1. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor
# Run migrations from supabase/migrations/
```

### 2. Create Admin User

```sql
-- In Supabase SQL Editor
UPDATE public.users
SET role = 'super_admin', updated_at = now()
WHERE email = 'your-admin@email.com';
```

### 3. Verify Setup

```sql
-- Check admin user
SELECT id, email, role FROM public.users
WHERE role IN ('super_admin', 'admin');

-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard accessible
- [ ] Blog page loads

### 2. Admin Features
- [ ] Admin menu visible (for admin users)
- [ ] User management works
- [ ] Branding settings accessible
- [ ] All admin pages load

### 3. Performance
- [ ] Page load time < 3s
- [ ] Images optimized
- [ ] No console errors
- [ ] Mobile responsive

### 4. SEO
- [ ] Meta tags present
- [ ] Open Graph images work
- [ ] Sitemap accessible
- [ ] Robots.txt configured

## 🔍 Troubleshooting

### Build Fails

**Error**: TypeScript errors
```bash
# Fix locally first
cd frontend
npm run build
# Fix all errors, then deploy
```

**Error**: Missing dependencies
```bash
# Install dependencies
cd frontend
npm install
# Commit package-lock.json
```

### Environment Variables Not Working

1. Check variable names (case-sensitive)
2. Ensure `NEXT_PUBLIC_` prefix for client-side vars
3. Redeploy after adding variables
4. Check Vercel logs for errors

### Database Connection Issues

1. Verify Supabase URL is correct
2. Check API keys are valid
3. Ensure RLS policies allow access
4. Check Supabase project is active

### Admin Features Not Working

1. Verify user has admin role in database
2. Check auth store loads role correctly
3. Clear browser cache and login again
4. Check console for errors

## 📊 Monitoring

### Vercel Analytics

1. Enable in Project Settings
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates
   - Geographic distribution

### Supabase Monitoring

1. Check Database health
2. Monitor API usage
3. Review logs for errors
4. Check storage usage

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### Manual Deployments

```bash
# Deploy specific branch
vercel --prod

# Deploy with specific commit
git checkout <commit-hash>
vercel --prod
```

## 🎯 Performance Optimization

### After Deployment:

1. **Enable Caching**
   - Static assets cached automatically
   - API routes can use `revalidate`

2. **Image Optimization**
   - Use Next.js Image component
   - Images optimized automatically

3. **Code Splitting**
   - Automatic with Next.js
   - Dynamic imports for large components

4. **CDN**
   - Vercel Edge Network enabled by default
   - Global distribution

## 📝 Deployment Checklist

### Before Deploy:
- [x] Code cleanup complete
- [x] Build successful
- [x] Environment variables ready
- [x] Database migrations ready
- [ ] Domain configured (optional)

### During Deploy:
- [ ] Push to Git
- [ ] Trigger Vercel deployment
- [ ] Monitor build logs
- [ ] Wait for deployment complete

### After Deploy:
- [ ] Test homepage
- [ ] Test login
- [ ] Test admin features
- [ ] Check performance
- [ ] Monitor errors
- [ ] Update DNS (if custom domain)

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate auto-generated

## ✅ Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ Site accessible at Vercel URL
- ✅ All pages load correctly
- ✅ Login/authentication works
- ✅ Admin features accessible
- ✅ Database connections work
- ✅ No console errors
- ✅ Performance acceptable

## 🎉 Post-Deployment

1. **Announce**: Share the URL with team
2. **Monitor**: Watch for errors in first 24h
3. **Optimize**: Review performance metrics
4. **Document**: Update README with live URL
5. **Backup**: Ensure database backups enabled

---

**Live URL**: https://your-project.vercel.app

**Admin Panel**: https://your-project.vercel.app/admin

**Status**: 🟢 Deployed and Running
