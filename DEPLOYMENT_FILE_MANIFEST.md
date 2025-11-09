# Deployment File Manifest - Data Analysis & Campaigns v2

## 📦 Complete List of Changed/New Files

### ✅ Phase 1: Data Analysis Workflow (READY FOR DEPLOYMENT)

#### Modified Files:

**1. `frontend/src/stores/workflowStore.ts`**
- **Status**: ✅ Modified
- **Changes**: Added event system, helper methods, step change listeners
- **Impact**: Core workflow state management
- **Breaking**: No
- **Testing**: Required

**2. `frontend/src/components/analysis/VariableGroupingPanel.tsx`**
- **Status**: ✅ Modified (minor)
- **Changes**: Added comments explaining detection logic
- **Impact**: Documentation only
- **Breaking**: No
- **Testing**: Verify auto-detection still works

**3. `frontend/src/components/analysis/DemographicSelectionPanel.tsx`**
- **Status**: ✅ Modified (minor)
- **Changes**: Added comments explaining detection logic
- **Impact**: Documentation only
- **Breaking**: No
- **Testing**: Verify auto-detection still works

#### New Files:

**4. `frontend/src/app/analysis/[projectId]/page.tsx`**
- **Status**: ✅ New file
- **Purpose**: Workflow container page
- **Dependencies**: 
  - `@/stores/workflowStore`
  - `@/components/workflow/WorkflowStepper`
  - `@/components/analysis/VariableGroupingPanel`
  - `@/components/analysis/DemographicSelectionPanel`
  - `@/types/analysis`
- **Impact**: New route `/analysis/[projectId]`
- **Breaking**: No (new route)
- **Testing**: Full workflow testing required

**5. `frontend/src/test/workflow-integration.test.ts`**
- **Status**: ✅ New file
- **Purpose**: Integration tests for workflow store
- **Dependencies**: `vitest`, `@/stores/workflowStore`
- **Impact**: Testing only
- **Breaking**: No
- **Testing**: Run test suite

**6. `.kiro/specs/data-analysis-campaigns-v2/PHASE1_COMPLETE.md`**
- **Status**: ✅ New file
- **Purpose**: Documentation
- **Impact**: None (documentation)

---

### ⚠️ Phase 2: Campaigns Feature (DATABASE ONLY - NOT READY FOR FULL DEPLOYMENT)

#### Database Migration Files:

**7. `backend/database/migrations/003-create-survey-campaigns.sql`**
- **Status**: ✅ New file
- **Purpose**: Create campaigns tables
- **Tables Created**:
  - `survey_campaigns`
  - `campaign_participants`
  - `campaign_analytics`
  - `campaign_templates`
- **Impact**: Database schema changes
- **Breaking**: No (new tables)
- **Testing**: Run on staging first
- **Rollback**: Available (see VERCEL_DEPLOYMENT_CHECKLIST.md)

**8. `backend/database/migrations/004-create-campaign-views.sql`**
- **Status**: ✅ New file
- **Purpose**: Create performance views
- **Views Created**:
  - `campaign_stats` (materialized)
  - `campaign_performance` (materialized)
  - `campaign_analytics_summary` (view)
  - `recent_campaign_activity` (view)
- **Functions Created**:
  - `refresh_campaign_views()`
- **Impact**: Database performance optimization
- **Breaking**: No (new views)
- **Testing**: Verify views refresh correctly

#### Documentation Files:

**9. `.kiro/specs/data-analysis-campaigns-v2/requirements.md`**
- **Status**: ✅ New file
- **Purpose**: Requirements specification
- **Impact**: None (documentation)

**10. `.kiro/specs/data-analysis-campaigns-v2/design.md`**
- **Status**: ✅ New file
- **Purpose**: Technical design document
- **Impact**: None (documentation)

**11. `.kiro/specs/data-analysis-campaigns-v2/tasks.md`**
- **Status**: ✅ New file
- **Purpose**: Implementation task list
- **Impact**: None (documentation)

**12. `.kiro/specs/data-analysis-campaigns-v2/PHASE2_PROGRESS.md`**
- **Status**: ✅ New file
- **Purpose**: Progress tracking
- **Impact**: None (documentation)

**13. `VERCEL_DEPLOYMENT_CHECKLIST.md`**
- **Status**: ✅ New file
- **Purpose**: Deployment guide
- **Impact**: None (documentation)

**14. `DEPLOYMENT_FILE_MANIFEST.md`**
- **Status**: ✅ New file (this file)
- **Purpose**: File inventory
- **Impact**: None (documentation)

---

## 📊 Deployment Summary

### Files to Deploy to Vercel:

#### ✅ Safe to Deploy (Phase 1):
```
frontend/src/stores/workflowStore.ts
frontend/src/app/analysis/[projectId]/page.tsx
frontend/src/components/analysis/VariableGroupingPanel.tsx
frontend/src/components/analysis/DemographicSelectionPanel.tsx
frontend/src/test/workflow-integration.test.ts
```

**Total**: 5 files
**Risk Level**: 🟢 Low
**Testing Required**: Yes
**Rollback Available**: Yes

#### ⚠️ Database Only (Phase 2):
```
backend/database/migrations/003-create-survey-campaigns.sql
backend/database/migrations/004-create-campaign-views.sql
```

**Total**: 2 files
**Risk Level**: 🟡 Medium
**Testing Required**: Yes (staging first)
**Rollback Available**: Yes

#### 📄 Documentation Only:
```
.kiro/specs/data-analysis-campaigns-v2/*.md
VERCEL_DEPLOYMENT_CHECKLIST.md
DEPLOYMENT_FILE_MANIFEST.md
```

**Total**: 7 files
**Risk Level**: 🟢 None
**Impact**: Documentation only

---

## 🔗 File Dependencies

### Dependency Graph:

```
workflowStore.ts
    ↓
analysis/[projectId]/page.tsx
    ↓
    ├── VariableGroupingPanel.tsx
    ├── DemographicSelectionPanel.tsx
    └── WorkflowStepper.tsx (existing)
```

### External Dependencies:

**Phase 1 Dependencies** (all already installed):
- `zustand` - State management
- `react` - UI framework
- `next` - Framework
- `lucide-react` - Icons
- `@/types/analysis` - Type definitions (existing)
- `@/types/workflow` - Type definitions (existing)
- `@/services/*` - Services (existing)

**Phase 2 Dependencies** (for future):
- PostgreSQL/Supabase - Database
- Email service (SendGrid/AWS SES/Resend)
- Job queue (BullMQ/pg-boss)

---

## 🧪 Testing Requirements

### Phase 1 Testing:

#### Unit Tests:
```bash
cd frontend
npm test -- workflow-integration.test.ts
```

**Expected**: All tests pass

#### Build Test:
```bash
cd frontend
npm run build
```

**Expected**: Build succeeds, no errors

#### Type Check:
```bash
cd frontend
npm run type-check
```

**Expected**: No TypeScript errors

#### Manual Testing:
1. Navigate to `/analysis/test-project-123`
2. Click through workflow steps
3. Verify auto-detection triggers
4. Verify navigation works
5. Verify auto-save works

### Phase 2 Testing:

#### Database Migration Test:
```sql
-- On staging database
BEGIN;
\i backend/database/migrations/003-create-survey-campaigns.sql
\i backend/database/migrations/004-create-campaign-views.sql

-- Verify
SELECT COUNT(*) FROM campaign_templates;
-- Expected: 4

SELECT COUNT(*) FROM pg_matviews WHERE matviewname LIKE 'campaign%';
-- Expected: 2

ROLLBACK; -- or COMMIT if all good
```

---

## 📋 Deployment Order

### Recommended Deployment Sequence:

**Step 1: Staging Database** (if deploying Phase 2)
```bash
# Connect to staging database
psql $STAGING_DATABASE_URL

# Run migrations
\i backend/database/migrations/003-create-survey-campaigns.sql
\i backend/database/migrations/004-create-campaign-views.sql

# Verify
SELECT * FROM campaign_templates;
```

**Step 2: Staging Frontend**
```bash
cd frontend

# Deploy to staging
vercel --prod=false

# Or
vercel deploy
```

**Step 3: Test Staging**
- Test all Phase 1 features
- Verify database tables exist (Phase 2)
- Check error logs
- Performance testing

**Step 4: Production Database** (if Phase 2 approved)
```bash
# Backup first!
pg_dump $PROD_DATABASE_URL > backup_$(date +%Y%m%d).sql

# Connect to production
psql $PROD_DATABASE_URL

# Run migrations in transaction
BEGIN;
\i backend/database/migrations/003-create-survey-campaigns.sql
\i backend/database/migrations/004-create-campaign-views.sql
COMMIT;
```

**Step 5: Production Frontend**
```bash
# Deploy to production
vercel --prod

# Or via Git
git push origin main
```

---

## 🔄 Git Workflow

### Commit Strategy:

```bash
# Phase 1 commits
git add frontend/src/stores/workflowStore.ts
git commit -m "feat(workflow): add event system and helper methods"

git add frontend/src/app/analysis/[projectId]/page.tsx
git commit -m "feat(workflow): add analysis workflow container page"

git add frontend/src/components/analysis/*.tsx
git commit -m "docs(workflow): add comments explaining auto-detection"

git add frontend/src/test/workflow-integration.test.ts
git commit -m "test(workflow): add integration tests for workflow store"

# Phase 2 commits
git add backend/database/migrations/003-create-survey-campaigns.sql
git commit -m "feat(campaigns): add database schema for campaigns"

git add backend/database/migrations/004-create-campaign-views.sql
git commit -m "feat(campaigns): add materialized views for performance"

# Documentation commits
git add .kiro/specs/data-analysis-campaigns-v2/*.md
git commit -m "docs: add Phase 1 & 2 specifications"

git add VERCEL_DEPLOYMENT_CHECKLIST.md DEPLOYMENT_FILE_MANIFEST.md
git commit -m "docs: add deployment documentation"

# Push to remote
git push origin main
```

### Branch Strategy (if using):

```bash
# Create feature branch
git checkout -b feature/data-analysis-campaigns-v2

# Make changes and commit
git add .
git commit -m "feat: implement data analysis workflow fixes and campaigns schema"

# Push to remote
git push origin feature/data-analysis-campaigns-v2

# Create PR and merge to main
```

---

## 🚨 Critical Files - Do Not Modify

These files are used by Phase 1 but should NOT be modified:

```
frontend/src/types/analysis.ts
frontend/src/types/workflow.ts
frontend/src/services/variable-grouping.service.ts
frontend/src/services/demographic.service.ts
frontend/src/hooks/useVariableGroupingAutoSave.ts
frontend/src/components/workflow/WorkflowStepper.tsx
frontend/src/components/analysis/SuggestionCard.tsx
frontend/src/components/analysis/VariableChip.tsx
frontend/src/components/analysis/UngroupedVariables.tsx
frontend/src/components/analysis/DemographicVariableRow.tsx
frontend/src/components/analysis/DemographicConfigCard.tsx
```

**Why**: These are existing, working files that Phase 1 depends on.

---

## 📈 Monitoring After Deployment

### Metrics to Watch:

**Phase 1 Metrics**:
- Page load time for `/analysis/[projectId]`
- Error rate on workflow pages
- Auto-detection success rate
- User navigation patterns
- Auto-save success rate

**Phase 2 Metrics** (database only):
- Database query performance
- Materialized view refresh time
- Table size growth
- Index usage

### Alerts to Set Up:

```javascript
// Vercel Analytics
- Error rate > 5%
- Page load time > 3 seconds
- Build failures

// Database
- Query time > 1 second
- Connection pool exhaustion
- Disk space < 20%
```

---

## ✅ Final Verification

Before deploying, verify:

- [ ] All files listed above are committed
- [ ] Build passes locally
- [ ] Tests pass (if applicable)
- [ ] No TypeScript errors
- [ ] No console errors in dev mode
- [ ] Environment variables set in Vercel
- [ ] Database backup created (if Phase 2)
- [ ] Team notified of deployment
- [ ] Rollback plan documented
- [ ] Monitoring set up

---

## 📞 Emergency Contacts

**If deployment fails:**

1. **Immediate**: Rollback via Vercel dashboard
2. **Database issues**: Contact DBA
3. **Critical bugs**: Create hotfix branch
4. **User impact**: Post status update

**Rollback Commands**:
```bash
# Vercel rollback
vercel rollback

# Git revert
git revert HEAD
git push origin main

# Database rollback
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

---

**Manifest Version**: 1.0
**Last Updated**: 2024-01-09
**Total Files**: 14 (5 code, 2 database, 7 documentation)
**Deployment Status**: ✅ Ready for staging
