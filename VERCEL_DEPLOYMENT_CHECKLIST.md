# Vercel Deployment Checklist - Data Analysis & Campaigns v2

## 🎯 Overview

This checklist covers deployment of two major features:
1. **Data Analysis Workflow** - Fixed auto-detection triggers
2. **Campaigns Feature** - Database schema ready (APIs pending)

**Build Status**: ✅ Passing (No TypeScript errors)
**Deployment Target**: Vercel
**Date**: 2024-01-09

---

## 📋 Pre-Deployment Checklist

### ✅ Phase 1: Data Analysis Workflow

#### Files Modified/Created:
- [x] `frontend/src/stores/workflowStore.ts` - Added event system
- [x] `frontend/src/app/analysis/[projectId]/page.tsx` - New workflow container
- [x] `frontend/src/components/analysis/VariableGroupingPanel.tsx` - Confirmed detection
- [x] `frontend/src/components/analysis/DemographicSelectionPanel.tsx` - Confirmed detection

#### Verification Steps:
- [x] TypeScript compilation passes
- [x] Build completes successfully
- [x] No console errors in development
- [ ] Manual testing completed
- [ ] Auto-detection triggers on grouping step
- [ ] Auto-detection triggers on demographic step
- [ ] Navigation between steps works
- [ ] Auto-save functionality works

#### Dependencies:
- [x] Zustand store (already installed)
- [x] React hooks (built-in)
- [x] Existing components (no new dependencies)

**Status**: ✅ Ready for deployment (pending manual testing)

---

### ⚠️ Phase 2: Campaigns Feature

#### Database Migrations Created:
- [x] `backend/database/migrations/003-create-survey-campaigns.sql`
- [x] `backend/database/migrations/004-create-campaign-views.sql`

#### Backend APIs Status:
- [ ] ❌ CRUD endpoints NOT implemented
- [ ] ❌ Lifecycle endpoints NOT implemented
- [ ] ❌ Analytics endpoints NOT implemented
- [ ] ❌ Token management NOT implemented

#### Frontend Status:
- [x] ✅ Components exist (with "Coming Soon" alerts)
- [ ] ❌ NOT connected to real APIs
- [ ] ❌ Mock data still in use

**Status**: ⚠️ NOT ready for deployment (database only)

**Recommendation**: 
- ✅ Deploy database migrations to staging
- ❌ DO NOT enable campaign features in production yet
- ✅ Keep "Coming Soon" alerts active

---

## 🗄️ Database Migration Plan

### Step 1: Backup Current Database
```bash
# On Supabase/PostgreSQL
pg_dump -h [host] -U [user] -d [database] > backup_$(date +%Y%m%d).sql
```

### Step 2: Run Migrations (Staging First)
```sql
-- Connect to staging database
\i backend/database/migrations/003-create-survey-campaigns.sql
\i backend/database/migrations/004-create-campaign-views.sql

-- Verify tables created
\dt survey_campaigns
\dt campaign_participants
\dt campaign_analytics
\dt campaign_templates

-- Verify views created
\dv campaign_analytics_summary
\dv recent_campaign_activity
\dm campaign_stats
\dm campaign_performance

-- Test refresh function
SELECT refresh_campaign_views();
```

### Step 3: Verify Data
```sql
-- Check default templates inserted
SELECT COUNT(*) FROM campaign_templates WHERE is_system_template = true;
-- Expected: 4

-- Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE tablename LIKE 'campaign%' OR tablename LIKE 'survey_campaigns';
-- Expected: 20+ indexes
```

### Step 4: Set Up Scheduled Refresh (Optional)
```sql
-- If using pg_cron
SELECT cron.schedule(
  'refresh-campaign-views',
  '*/5 * * * *',
  'SELECT refresh_campaign_views();'
);
```

---

## 🚀 Vercel Deployment Steps

### 1. Environment Variables Check

Verify these are set in Vercel:

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Auth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=...

# Optional (for campaigns when ready)
EMAIL_SERVICE_API_KEY=...
JOB_QUEUE_URL=...
```

### 2. Deploy to Staging

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Build locally first
npm run build

# Deploy to Vercel (staging)
vercel --prod=false

# Or use Vercel CLI
vercel deploy
```

### 3. Post-Deployment Verification

#### Test Data Analysis Workflow:
```bash
# Visit staging URL
https://your-app-staging.vercel.app/analysis/test-project-123

# Test checklist:
- [ ] Page loads without errors
- [ ] Workflow stepper displays
- [ ] Can navigate to grouping step
- [ ] Auto-detection shows loading state
- [ ] Suggestions appear after ~500ms
- [ ] Can navigate to demographic step
- [ ] Auto-detection triggers
- [ ] High-confidence items auto-selected
- [ ] Can navigate back and forth
- [ ] Auto-save indicator appears
```

#### Test Campaigns (Limited):
```bash
# Visit campaigns pages
https://your-app-staging.vercel.app/campaigns

# Expected behavior:
- [ ] Dashboard loads
- [ ] Shows "Coming Soon" alerts
- [ ] No console errors
- [ ] Templates page accessible
- [ ] Creation wizard shows but doesn't submit
```

### 4. Database Migration on Production

**⚠️ IMPORTANT: Only run if campaigns will be enabled**

```bash
# Connect to production database
psql $PRODUCTION_DATABASE_URL

# Run migrations in transaction
BEGIN;
\i backend/database/migrations/003-create-survey-campaigns.sql
\i backend/database/migrations/004-create-campaign-views.sql
COMMIT;

# Verify
SELECT COUNT(*) FROM campaign_templates;
```

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or via Git
git push origin main
# (Vercel auto-deploys from main branch)
```

---

## 🧪 Testing Checklist

### Data Analysis Workflow Testing

#### Unit Tests:
- [x] Workflow store tests created
- [ ] Run tests: `npm test -- workflow-integration.test.ts`
- [ ] All tests passing

#### Integration Tests:
- [ ] Navigate through complete workflow
- [ ] Test with real project data
- [ ] Test with empty data
- [ ] Test error scenarios
- [ ] Test auto-save functionality

#### Browser Testing:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Campaigns Testing (When APIs Ready)

#### API Tests:
- [ ] Create campaign
- [ ] List campaigns
- [ ] Update campaign
- [ ] Delete campaign
- [ ] Launch campaign
- [ ] View analytics

#### UI Tests:
- [ ] Creation wizard flow
- [ ] Dashboard filtering
- [ ] Analytics display
- [ ] Template selection

---

## 📊 Monitoring Setup

### Vercel Analytics
```bash
# Enable in Vercel dashboard
- Web Analytics
- Speed Insights
- Error tracking
```

### Custom Monitoring

Add to `frontend/src/app/layout.tsx`:
```typescript
// Track workflow navigation
useEffect(() => {
  if (typeof window !== 'undefined') {
    window.analytics?.track('Workflow Step Changed', {
      step: currentStep,
      timestamp: new Date()
    });
  }
}, [currentStep]);
```

### Database Monitoring
```sql
-- Create monitoring view
CREATE VIEW campaign_health AS
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as campaigns_today,
  SUM(current_participants) as total_participants,
  SUM(total_tokens_awarded) as total_tokens_spent
FROM survey_campaigns;
```

---

## 🔧 Rollback Plan

### If Data Analysis Issues:
```bash
# Revert to previous deployment
vercel rollback

# Or revert specific files
git revert [commit-hash]
git push origin main
```

### If Database Issues:
```sql
-- Rollback migrations
DROP TABLE IF EXISTS campaign_analytics CASCADE;
DROP TABLE IF EXISTS campaign_participants CASCADE;
DROP TABLE IF EXISTS campaign_templates CASCADE;
DROP TABLE IF EXISTS survey_campaigns CASCADE;
DROP MATERIALIZED VIEW IF EXISTS campaign_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS campaign_performance CASCADE;
DROP VIEW IF EXISTS campaign_analytics_summary CASCADE;
DROP VIEW IF EXISTS recent_campaign_activity CASCADE;
DROP FUNCTION IF EXISTS refresh_campaign_views() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

---

## 📝 Deployment Notes

### What's Being Deployed:

#### ✅ Ready for Production:
1. **Data Analysis Workflow Fixes**
   - Auto-detection triggers reliably
   - Improved navigation
   - Better state management
   - No breaking changes

#### ⚠️ Staging Only:
2. **Campaigns Database Schema**
   - Tables and views created
   - Ready for API development
   - No user-facing changes yet

#### ❌ Not Included:
- Campaign backend APIs
- Campaign frontend integration
- Token management system
- Notification system

### Feature Flags Recommended:

```typescript
// frontend/src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  ANALYSIS_WORKFLOW_V2: true, // ✅ Enable
  CAMPAIGNS_ENABLED: false,    // ❌ Keep disabled
  CAMPAIGN_CREATION: false,    // ❌ Keep disabled
  CAMPAIGN_ANALYTICS: false,   // ❌ Keep disabled
};
```

---

## ✅ Final Checklist Before Deploy

### Pre-Deploy:
- [ ] All code committed to Git
- [ ] Build passes locally
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Environment variables set in Vercel
- [ ] Database backup created
- [ ] Rollback plan documented

### Deploy:
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Verify data analysis workflow
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Get team approval

### Post-Deploy:
- [ ] Verify production deployment
- [ ] Test critical paths
- [ ] Monitor error rates
- [ ] Check analytics
- [ ] Update documentation
- [ ] Notify team

---

## 🎯 Success Criteria

### Data Analysis Workflow:
- ✅ Auto-detection triggers 100% of time
- ✅ No increase in error rates
- ✅ Page load time < 3 seconds
- ✅ No user complaints
- ✅ Positive user feedback

### Campaigns (Database Only):
- ✅ Migrations run successfully
- ✅ No impact on existing features
- ✅ Tables accessible for future development
- ✅ Views refresh correctly

---

## 📞 Support Contacts

**If Issues Arise:**
- Vercel Support: support@vercel.com
- Database Admin: [your-dba@email.com]
- Dev Team Lead: [lead@email.com]

**Monitoring Dashboards:**
- Vercel: https://vercel.com/dashboard
- Database: [your-db-dashboard-url]
- Error Tracking: [your-sentry-url]

---

## 📅 Timeline

**Recommended Deployment Schedule:**

1. **Day 1 (Today)**: Deploy to staging
   - Run database migrations
   - Deploy frontend changes
   - Test data analysis workflow

2. **Day 2**: Staging testing
   - Full QA testing
   - Performance testing
   - Bug fixes if needed

3. **Day 3**: Production deployment
   - Deploy during low-traffic hours
   - Monitor closely for 2-4 hours
   - Rollback if issues detected

4. **Day 4-7**: Monitoring period
   - Watch error rates
   - Collect user feedback
   - Plan Phase 2 completion

---

**Status**: 📋 Ready for staging deployment
**Next Step**: Deploy to staging and test
**Blocker**: None for Phase 1, Phase 2 needs API implementation

---

**Last Updated**: 2024-01-09
**Prepared By**: Kiro AI
**Approved By**: [Pending]
