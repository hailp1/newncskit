# 🚀 NCSKIT Vercel Deployment Guide

## 📋 **Vercel Deployment Settings**

### **1. Root Directory Configuration**
```
Root Directory: frontend
```
**Lý do:** Vì Next.js app nằm trong thư mục `frontend/`, không phải root của repository.

### **2. Build Settings**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### **3. Environment Variables**
Trong Vercel Dashboard → Settings → Environment Variables, thêm:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=AIzaSyCo8p2IapVdrr03Ed4Aforvd68mdUg7RDI
NODE_ENV=production
```

---

## 🔧 **Step-by-Step Deployment**

### **Phase 1: Prepare Repository**

1. **Ensure Clean Git State**
```bash
git add .
git commit -m "🚀 Prepare for Vercel deployment"
git push origin main
```

2. **Verify Frontend Structure**
```
newNCSkit/
├── frontend/          # ← Root Directory for Vercel
│   ├── package.json
│   ├── next.config.ts
│   ├── src/
│   └── public/
├── backend/
└── README.md
```

### **Phase 2: Vercel Setup**

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import `hailp1/newncskit` repository

2. **Configure Project Settings**
   ```
   Project Name: ncskit-marketing-platform
   Framework: Next.js
   Root Directory: frontend
   ```

3. **Build & Output Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

### **Phase 3: Environment Variables**

**Add these in Vercel Dashboard:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Configuration  
GEMINI_API_KEY=AIzaSyCo8p2IapVdrr03Ed4Aforvd68mdUg7RDI

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Phase 4: Deploy**

1. **Click "Deploy"**
2. **Wait for build to complete**
3. **Check deployment logs for errors**

---

## 📁 **Project Structure for Vercel**

```
Repository Root (newNCSkit/)
├── frontend/                    ← Vercel Root Directory
│   ├── package.json            ← Build dependencies
│   ├── next.config.ts          ← Next.js config
│   ├── tailwind.config.ts      ← Tailwind config
│   ├── tsconfig.json           ← TypeScript config
│   ├── src/
│   │   ├── app/                ← App Router pages
│   │   ├── components/         ← React components
│   │   ├── services/           ← API services
│   │   ├── store/              ← State management
│   │   └── types/              ← TypeScript types
│   ├── public/                 ← Static assets
│   └── .env.local.example      ← Environment template
├── backend/                    ← Not deployed to Vercel
├── database/                   ← SQL files
└── README.md
```

---

## ⚙️ **Vercel Configuration Files**

### **1. Create `vercel.json` (Optional)**
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "frontend/src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### **2. Update `next.config.ts`**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 🗄️ **Database Setup for Production**

### **1. Supabase Production Setup**
1. Create new Supabase project for production
2. Execute SQL files in order:
   ```sql
   -- 1. Execute: frontend/database/marketing-knowledge-base.sql
   -- 2. Execute: frontend/database/research-outline-templates.sql  
   -- 3. Execute: frontend/database/demo-data-complete.sql
   ```

3. Get production credentials:
   ```
   Project URL: https://your-prod-project.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **2. Update Environment Variables**
Replace development URLs with production URLs in Vercel environment variables.

---

## 🔍 **Deployment Verification**

### **1. Build Verification**
```bash
# Test local production build
cd frontend
npm run build
npm start
```

### **2. Post-Deployment Checks**
- [ ] App loads at Vercel URL
- [ ] Dashboard shows metrics from Supabase
- [ ] Project creation works
- [ ] AI outline generation works
- [ ] Database connections work
- [ ] No console errors

### **3. Test URLs**
```
Production App: https://your-app.vercel.app
Dashboard: https://your-app.vercel.app/dashboard
New Project: https://your-app.vercel.app/projects/new
Test Supabase: https://your-app.vercel.app/test-supabase
```

---

## 🚨 **Common Deployment Issues**

### **Issue 1: Build Fails**
```
Error: Cannot find module 'next'
```
**Solution:**
- Ensure `Root Directory` is set to `frontend`
- Check `package.json` exists in frontend folder

### **Issue 2: Environment Variables Not Working**
```
Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```
**Solution:**
- Add all env vars in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly

### **Issue 3: API Routes Not Working**
```
Error: 404 on /api/projects
```
**Solution:**
- Ensure API routes are in `src/app/api/` folder
- Check Next.js App Router structure
- Verify API route exports

### **Issue 4: Supabase Connection Fails**
```
Error: Invalid API key
```
**Solution:**
- Use production Supabase credentials
- Check CORS settings in Supabase
- Verify environment variables

---

## 📊 **Performance Optimization**

### **1. Next.js Optimizations**
```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}
```

### **2. Vercel Analytics**
```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code committed and pushed to GitHub
- [ ] Frontend builds successfully locally
- [ ] Environment variables documented
- [ ] Database schema ready for production
- [ ] API keys secured

### **Vercel Configuration**
- [ ] Root Directory: `frontend`
- [ ] Framework: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Environment variables added

### **Post-Deployment**
- [ ] App loads without errors
- [ ] Database connections work
- [ ] AI features functional
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 🚀 **Quick Deploy Commands**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from frontend directory
cd frontend
vercel

# 4. Set production domain
vercel --prod
```

---

## 🎊 **Production URLs**

After successful deployment:

```
🌐 Production App: https://ncskit-marketing-platform.vercel.app
📊 Dashboard: https://ncskit-marketing-platform.vercel.app/dashboard
📝 New Project: https://ncskit-marketing-platform.vercel.app/projects/new
🧪 Test Page: https://ncskit-marketing-platform.vercel.app/test-supabase
```

---

## 💡 **Pro Tips**

1. **Use Preview Deployments**
   - Every push to non-main branches creates preview
   - Test features before merging to main

2. **Monitor Performance**
   - Use Vercel Analytics
   - Check Core Web Vitals
   - Monitor API response times

3. **Set up Custom Domain**
   - Add custom domain in Vercel Dashboard
   - Configure DNS records
   - Enable HTTPS automatically

4. **Environment Management**
   - Use different Supabase projects for dev/prod
   - Separate API keys for each environment
   - Test with production data structure

---

## 🎯 **Success Criteria**

✅ **Deployment Successful When:**
- App loads at Vercel URL
- All features work in production
- Database connections established
- AI outline generation works
- No console errors
- Mobile responsive
- Fast loading times

**🚀 NCSKIT is now ready for production use!** 🚀