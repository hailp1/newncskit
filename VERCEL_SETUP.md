# Vercel Deployment Setup Guide

## Critical Configuration Required

⚠️ **IMPORTANT**: You must configure the Root Directory in Vercel Dashboard

### Step-by-Step Setup:

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your project: `newncskit`

2. **Configure Root Directory**
   - Go to **Settings** → **General**
   - Find **Root Directory** setting
   - Set it to: `frontend`
   - Click **Save**

3. **Verify Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Environment Variables**
   Make sure these are set in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Redeploy**
   - After saving Root Directory setting
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger deployment

## Why This Is Needed

The project structure has the Next.js app in the `frontend/` subdirectory:
```
newncskit/
├── frontend/          ← Next.js app is here
│   ├── package.json
│   ├── next.config.ts
│   └── src/
├── backend/
├── r-analytics/
└── vercel.json
```

Vercel needs to know to look in `frontend/` for the Next.js application.

## Troubleshooting

### Error: "No Next.js version detected"
- **Cause**: Root Directory not set to `frontend`
- **Fix**: Set Root Directory to `frontend` in Vercel Dashboard

### Error: "Cannot find module 'pg'"
- **Cause**: Unused postgres-server.ts file (now deleted)
- **Status**: ✅ Fixed in commit 60acea8

### Build succeeds locally but fails on Vercel
- **Cause**: Different environment or missing env vars
- **Fix**: Check Environment Variables in Vercel Dashboard

## Current Status

✅ TypeScript errors: **0 errors**  
✅ Local build: **Successful**  
✅ Unused files: **Removed**  
⏳ Vercel config: **Needs Root Directory setting**

## Next Steps

1. Set Root Directory to `frontend` in Vercel Dashboard
2. Redeploy
3. Monitor deployment at: https://vercel.com/dashboard

---

**Last Updated**: November 8, 2025  
**Commit**: 60acea8
