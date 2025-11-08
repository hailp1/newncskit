# 🔧 Vercel Environment Variables Setup

## ❌ Lỗi Hiện Tại

```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

Build từ GitHub đang fail vì thiếu environment variables.

---

## ✅ Giải Pháp: Thêm Environment Variables

### Bước 1: Truy Cập Vercel Dashboard

1. Đi tới: https://vercel.com/hailp1s-projects/frontend
2. Click vào tab **"Settings"**
3. Click vào **"Environment Variables"** ở sidebar

### Bước 2: Thêm Các Biến Môi Trường

Thêm các biến sau (tất cả environments: Production, Preview, Development):

#### Required Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Build Configuration
SKIP_TYPE_CHECK=true
SKIP_ENV_VALIDATION=true

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Optional Variables:

```bash
# R Analytics (if using)
NEXT_PUBLIC_R_ANALYTICS_URL=http://your-r-analytics-url

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Bước 3: Lấy Supabase Credentials

1. Đi tới: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Bước 4: Redeploy

Sau khi thêm environment variables:

**Option 1: Qua Dashboard**
1. Vào tab "Deployments"
2. Click "..." trên deployment mới nhất
3. Click "Redeploy"

**Option 2: Qua CLI**
```bash
cd frontend
npx vercel --prod
```

**Option 3: Push Git**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 📋 Checklist

- [ ] Thêm `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Thêm `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Thêm `SKIP_TYPE_CHECK=true`
- [ ] Thêm `SKIP_ENV_VALIDATION=true`
- [ ] Thêm `NEXT_PUBLIC_APP_URL`
- [ ] Redeploy project
- [ ] Verify deployment thành công

---

## 🔍 Verify Environment Variables

Sau khi deploy, kiểm tra:

```bash
# Check if env vars are loaded
curl https://your-domain.vercel.app/api/health
```

Hoặc xem trong Vercel Dashboard:
- Settings → Environment Variables
- Deployments → Click deployment → Environment Variables tab

---

## 🚨 Troubleshooting

### Lỗi: "Environment variable not found"
- Đảm bảo đã chọn đúng environment (Production/Preview/Development)
- Redeploy sau khi thêm variables

### Lỗi: "Supabase client creation failed"
- Kiểm tra URL và key có đúng format không
- Verify key chưa expired
- Check Supabase project còn active không

### Build vẫn fail
- Check build logs trong Vercel dashboard
- Verify tất cả required env vars đã được thêm
- Try clear build cache và redeploy

---

## 📝 Quick Setup Script

Nếu bạn muốn setup qua CLI:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
npx vercel login

# Link project
cd frontend
npx vercel link

# Add environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add SKIP_TYPE_CHECK production
npx vercel env add SKIP_ENV_VALIDATION production

# Deploy
npx vercel --prod
```

---

## ✅ Success Indicators

Khi setup thành công, bạn sẽ thấy:

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✅ Production: https://your-domain.vercel.app
```

---

**Next Steps:**
1. Thêm environment variables vào Vercel Dashboard
2. Redeploy project
3. Test production URL
4. Setup custom domain (optional)
