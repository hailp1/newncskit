# NCSKIT Deployment Guide

Complete guide for deploying NCSKIT to production using Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Process](#deployment-process)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedure](#rollback-procedure)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services

- ✅ **Supabase Project**: Database, Auth, and Storage configured
- ✅ **Vercel Account**: Project linked and environment variables set
- ✅ **Docker Container**: R Analytics module running locally
- ✅ **Cloudflare Tunnel**: Tunnel active and DNS configured
- ✅ **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket

### Required Tools

```bash
# Node.js and npm
node --version  # v18+ required
npm --version

# Vercel CLI
npm i -g vercel
vercel --version

# Git
git --version
```

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests passing: `npm run test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds locally: `npm run build`

### 2. Environment Configuration

- [ ] All environment variables set in Vercel Dashboard
- [ ] Supabase credentials verified
- [ ] Analytics API key generated and configured
- [ ] App URL configured correctly

### 3. Services Health

- [ ] Supabase database accessible
- [ ] Docker container running: `docker ps`
- [ ] Cloudflare Tunnel active: `cloudflared tunnel info`
- [ ] Analytics API responding: `curl http://localhost:8000/health`

### 4. Git Repository

- [ ] All changes committed
- [ ] Working on correct branch (main/master for production)
- [ ] Remote repository up to date: `git push`

### 5. Documentation

- [ ] README.md updated
- [ ] CHANGELOG.md updated with new version
- [ ] API documentation current

## Deployment Process

### Option 1: Automated Deployment (Recommended)

#### Preview Deployment

```bash
# Windows
.\deployment\deploy-to-vercel.ps1

# Linux/Mac
./deployment/deploy-to-vercel.sh
```

#### Production Deployment

```bash
# Windows
.\deployment\deploy-to-vercel.ps1 -Production

# Linux/Mac
./deployment/deploy-to-vercel.sh --production
```

### Option 2: Manual Deployment

#### Step 1: Prepare Code

```bash
# Ensure you're on the correct branch
git checkout main

# Pull latest changes
git pull origin main

# Install dependencies
cd frontend
npm install
```

#### Step 2: Run Pre-Deployment Checks

```bash
# Validate environment
npm run validate-env

# Run tests
npm run test

# Type check
npm run type-check

# Build locally
npm run build
```

#### Step 3: Commit and Push

```bash
# Stage changes
git add .

# Commit
git commit -m "chore: prepare for deployment v1.0.0"

# Push to remote
git push origin main
```

#### Step 4: Deploy to Vercel

**Preview Deployment:**
```bash
cd frontend
vercel
```

**Production Deployment:**
```bash
cd frontend
vercel --prod
```

#### Step 5: Monitor Deployment

```bash
# Watch deployment logs
vercel logs <deployment-url> --follow

# Or check in Vercel Dashboard
# https://vercel.com/dashboard
```

### Option 3: Automatic Git Deployment

Vercel automatically deploys when you push to your Git repository:

```bash
# Push to main branch for production
git push origin main

# Push to other branches for preview
git push origin feature-branch
```

Vercel will:
1. Detect the push
2. Start build process
3. Run build command
4. Deploy to edge network
5. Send notification (if configured)

## Post-Deployment Verification

### 1. Verify Deployment URL

```bash
# Get deployment URL
vercel ls

# Open in browser
vercel open
```

### 2. Check Health Endpoints

```bash
# Vercel health
curl https://your-app.vercel.app/api/health

# Supabase health
curl https://your-app.vercel.app/api/health/supabase

# Docker analytics health
curl https://your-app.vercel.app/api/health/docker
```

Expected response:
```json
{
  "status": "healthy",
  "service": "vercel",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Test Core Functionality

#### Authentication Flow
1. Navigate to `/login`
2. Sign in with test account
3. Verify redirect to dashboard
4. Check session persistence

#### Database Connection
1. Navigate to dashboard
2. Verify data loads correctly
3. Test CRUD operations
4. Check RLS policies working

#### File Upload
1. Navigate to upload page
2. Upload a test file
3. Verify file appears in Supabase Storage
4. Check file URL is accessible

#### Analytics API
1. Navigate to analytics page
2. Run a sentiment analysis
3. Verify results display correctly
4. Check response time is acceptable

### 4. Monitor Performance

```bash
# Check Web Vitals in Vercel Dashboard
# https://vercel.com/dashboard/analytics

# Monitor error rate
# https://vercel.com/dashboard/errors

# Check function execution time
# https://vercel.com/dashboard/functions
```

### 5. Verify Environment Variables

```bash
# List environment variables
cd frontend
vercel env ls

# Pull environment variables
vercel env pull .env.vercel

# Verify all required variables are set
```

## Rollback Procedure

### Quick Rollback (Vercel Dashboard)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Deployments** tab
4. Find the last working deployment
5. Click **⋯** → **Promote to Production**

### CLI Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or rollback to previous deployment
vercel rollback
```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Push to trigger new deployment
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Troubleshooting

### Build Fails

**Symptom**: Build fails in Vercel

**Solutions**:
1. Check build logs in Vercel Dashboard
2. Verify all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Check Node.js version matches Vercel (18+)
5. Verify environment variables are set

```bash
# Test build locally
cd frontend
npm install
npm run build

# Check for errors
echo $?  # Should be 0
```

### Environment Variables Not Loading

**Symptom**: App can't connect to Supabase or Analytics

**Solutions**:
1. Verify variables in Vercel Dashboard
2. Check variable names (case-sensitive)
3. Ensure variables are set for correct environment
4. Redeploy after adding variables

```bash
# List environment variables
vercel env ls

# Add missing variable
vercel env add VARIABLE_NAME production
```

### API Routes Timeout

**Symptom**: `/api/analytics` returns 504 timeout

**Solutions**:
1. Check Docker container is running
2. Verify Cloudflare Tunnel is active
3. Test analytics endpoint directly
4. Increase timeout in `vercel.json`

```bash
# Check Docker
docker ps | grep r-analytics

# Check Cloudflare Tunnel
curl https://analytics.ncskit.app/health

# Test from Vercel
curl https://your-app.vercel.app/api/health/docker
```

### Database Connection Fails

**Symptom**: Can't connect to Supabase

**Solutions**:
1. Verify Supabase project is active
2. Check connection pooling limits
3. Verify RLS policies
4. Test connection from local

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Check health endpoint
curl https://your-app.vercel.app/api/health/supabase
```

### Deployment Stuck

**Symptom**: Deployment doesn't complete

**Solutions**:
1. Cancel deployment in Vercel Dashboard
2. Check for infinite loops in code
3. Verify no blocking operations in build
4. Try deploying again

```bash
# Cancel current deployment
vercel cancel

# Redeploy
vercel --prod
```

### Preview Deployments Not Working

**Symptom**: Preview deployments don't trigger

**Solutions**:
1. Check Git integration is connected
2. Verify branch is not ignored
3. Check deployment protection settings
4. Ensure commits are pushed to remote

### High Error Rate

**Symptom**: Many errors in production

**Solutions**:
1. Check error logs in Vercel Dashboard
2. Review Sentry (if configured)
3. Test affected features locally
4. Consider rolling back

```bash
# View recent errors
vercel logs --follow

# Check specific deployment
vercel logs <deployment-url>
```

## Monitoring and Maintenance

### Daily Checks

- [ ] Check error rate in Vercel Dashboard
- [ ] Monitor health check endpoints
- [ ] Review performance metrics
- [ ] Check Docker container uptime

### Weekly Checks

- [ ] Review deployment logs
- [ ] Check database performance
- [ ] Monitor storage usage
- [ ] Review analytics API usage

### Monthly Checks

- [ ] Update dependencies
- [ ] Review and optimize performance
- [ ] Check security updates
- [ ] Backup database

## Useful Commands

```bash
# Deployment
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel --force           # Force new deployment

# Monitoring
vercel logs              # View logs
vercel logs --follow     # Stream logs
vercel inspect           # Inspect deployment

# Management
vercel ls                # List deployments
vercel rm <url>          # Remove deployment
vercel rollback          # Rollback deployment

# Environment
vercel env ls            # List environment variables
vercel env add           # Add environment variable
vercel env rm            # Remove environment variable
vercel env pull          # Pull environment variables

# Project
vercel link              # Link project
vercel open              # Open in browser
vercel domains           # Manage domains
```

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Team Lead**: [Your contact info]
- **DevOps**: [Your contact info]
