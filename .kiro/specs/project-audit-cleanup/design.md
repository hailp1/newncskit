# Design Document - Project Audit & Cleanup

## Overview

Sau khi audit toàn diện dự án, tôi đã phát hiện nhiều vấn đề nghiêm trọng cần xử lý ngay:

### Critical Findings

1. **SECURITY RISK - Hardcoded API Key**: Gemini API key bị hardcode trong `frontend/src/services/gemini.ts`
2. **SECURITY RISK - Exposed Supabase Credentials**: Supabase keys vẫn còn trong .env files
3. **Legacy Code Pollution**: Supabase client vẫn được sử dụng trong nhiều services
4. **Vulnerabilities**: 8 npm vulnerabilities (1 high, 7 moderate)
5. **Documentation Chaos**: 50+ file .md trùng lặp ở root directory
6. **Django Backend**: Backend Django hoàn toàn không được sử dụng nhưng vẫn tồn tại

## Architecture

### Cleanup Strategy

```
Phase 1: Security Fixes (URGENT)
├── Remove hardcoded Gemini API key
├── Move to environment variables
└── Remove exposed Supabase credentials

Phase 2: Legacy Code Removal
├── Remove Supabase client usage
├── Archive Django backend
└── Clean Supabase directory

Phase 3: Documentation Consolidation
├── Categorize 50+ .md files
├── Keep essential docs
├── Archive obsolete docs
└── Create clean docs/ structure

Phase 4: Dependency Updates
├── Fix npm vulnerabilities
└── Update packages

Phase 5: Final Verification
├── Test build
├── Test authentication
└── Verify all features work
```

## Components and Interfaces

### 1. Security Fixes Module

**Purpose**: Fix immediate security risks

**Files to Fix**:
- `frontend/src/services/gemini.ts` - Remove hardcoded API key
- `frontend/.env.local` - Remove Supabase credentials
- `frontend/.env.example` - Update template
- `.env.production` - Remove Supabase credentials

**Implementation**:
```typescript
// Before (INSECURE):
const GEMINI_API_KEY = 'AIzaSyCo8p2IapVdrr03Ed4Aforvd68mdUg7RDI'

// After (SECURE):
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required')
}
```

### 2. Legacy Code Removal Module

**Purpose**: Remove all Supabase dependencies

**Files with Supabase Usage**:
- `frontend/src/lib/supabase/client.ts` - DELETE
- `frontend/src/lib/supabase/auth.ts` - DELETE
- `frontend/src/services/user.service.ts` - REFACTOR to use Prisma
- `frontend/src/services/user.service.client.ts` - REFACTOR to use Prisma
- `frontend/src/store/auth-supabase.backup.ts` - DELETE
- `frontend/src/types/supabase.ts` - DELETE
- `frontend/src/types/supabase-analysis-types.ts` - DELETE

**Directories to Archive**:
- `backend/` - Move to `.backup/django-backend/`
- `supabase/` - Move to `.backup/supabase-config/`

### 3. Documentation Consolidation Module

**Purpose**: Organize documentation into clean structure

**Documentation Categories**:

**KEEP (Essential)**:
- `README.md` - Main project readme
- `LOCAL_SETUP_GUIDE.md` - Setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `KNOWN_ISSUES.md` - Current issues

**CONSOLIDATE (Merge into docs/)**:
- All admin fix guides → `docs/troubleshooting/admin-issues.md`
- All migration guides → `docs/migration/`
- All testing guides → `docs/testing/`
- All performance guides → `docs/performance/`

**DELETE (Obsolete/Duplicate)**:
- `ADMIN_FIX_*.md` (15+ files)
- `CURRENT_STATUS*.md` (5+ files)
- `FINAL_*.md` (10+ files)
- `*_SUMMARY.md` (8+ files)
- Cleanup scripts: `cleanup-legacy.ps1`, `cleanup-legacy.sh`
- SQL scripts: `UPDATE_ADMIN_ROLE.sql`, `enable-uuid.sql`

**Target Structure**:
```
docs/
├── README.md (index)
├── setup/
│   ├── local-setup.md
│   └── deployment.md
├── troubleshooting/
│   ├── admin-issues.md
│   ├── authentication.md
│   └── performance.md
├── migration/
│   ├── django-to-nodejs.md
│   └── supabase-to-nextauth.md
├── testing/
│   └── testing-guide.md
└── api/
    └── api-documentation.md
```

### 4. Service Refactoring Module

**Purpose**: Replace Supabase with Prisma in services

**user.service.ts Refactoring**:

```typescript
// Before (Supabase):
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data, error } = await supabase.from('profiles').select('*')

// After (Prisma):
import { prisma } from '@/lib/prisma'
const users = await prisma.user.findMany()
```

**Files to Refactor**:
1. `frontend/src/services/user.service.ts`
2. `frontend/src/services/user.service.client.ts`
3. Any other services using Supabase client

### 5. Dependency Update Module

**Purpose**: Fix npm vulnerabilities

**Vulnerabilities Found**:
- `xlsx` - HIGH severity (Prototype Pollution, ReDoS) - NO FIX AVAILABLE
- `vitest` - MODERATE severity - Fix available (upgrade to 4.0.8)
- `esbuild` - MODERATE severity - Fix available

**Strategy**:
1. Update vitest and related packages
2. Consider replacing `xlsx` with safer alternative (e.g., `exceljs`)
3. Update esbuild through vite update

## Data Models

### Backup Structure

```
.backup/
├── django-backend-{timestamp}/
│   └── backend/
├── supabase-config-{timestamp}/
│   └── supabase/
├── legacy-docs-{timestamp}/
│   ├── admin-fixes/
│   ├── status-reports/
│   └── summaries/
└── legacy-code-{timestamp}/
    ├── supabase-lib/
    └── supabase-services/
```

## Error Handling

### Backup Before Delete

```typescript
function createBackup(source: string, category: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `.backup/${category}-${timestamp}`
  // Copy source to backupPath
  return backupPath
}
```

### Rollback Strategy

1. All deletions are preceded by backup
2. Backup paths are logged
3. Rollback script provided if needed

### Validation Checks

After each phase:
- ✅ Project builds successfully
- ✅ Tests pass
- ✅ Dev server starts
- ✅ Authentication works
- ✅ No TypeScript errors

## Testing Strategy

### Pre-Cleanup Tests

```bash
# 1. Verify current state
npm run build
npm run test

# 2. Test authentication
# - Login with admin account
# - Check session persistence
# - Verify role-based access

# 3. Test core features
# - Dataset upload
# - R analytics
# - Project management
```

### Post-Cleanup Tests

```bash
# 1. Build verification
npm run build

# 2. Type checking
npm run type-check

# 3. Test suite
npm run test

# 4. Manual testing
# - Authentication flow
# - Admin panel access
# - Dataset operations
# - R analytics execution
```

### Rollback Procedure

If any test fails:
```bash
# 1. Stop all processes
# 2. Restore from backup
cp -r .backup/[category]-[timestamp]/* ./
# 3. Reinstall dependencies
npm install
# 4. Rebuild
npm run build
```

## Implementation Phases

### Phase 1: Security Fixes (CRITICAL - Do First)

**Priority**: URGENT
**Risk**: HIGH if not fixed
**Time**: 15 minutes

1. Fix Gemini API key
2. Remove Supabase credentials from .env files
3. Update .env.example
4. Verify no other hardcoded secrets

### Phase 2: Backup Creation

**Priority**: HIGH
**Risk**: LOW (safety measure)
**Time**: 10 minutes

1. Create backup of Django backend
2. Create backup of Supabase directory
3. Create backup of legacy docs
4. Create backup of Supabase code

### Phase 3: Legacy Code Removal

**Priority**: HIGH
**Risk**: MEDIUM (requires testing)
**Time**: 45 minutes

1. Remove Supabase lib files
2. Refactor user.service.ts to use Prisma
3. Remove Supabase types
4. Update imports across codebase
5. Test authentication still works

### Phase 4: Documentation Cleanup

**Priority**: MEDIUM
**Risk**: LOW
**Time**: 30 minutes

1. Create docs/ structure
2. Consolidate essential docs
3. Move obsolete docs to backup
4. Delete duplicate files
5. Update README with new structure

### Phase 5: Dependency Updates

**Priority**: MEDIUM
**Risk**: MEDIUM (breaking changes possible)
**Time**: 20 minutes

1. Update vitest to 4.0.8
2. Consider replacing xlsx
3. Test after each update

### Phase 6: Final Verification

**Priority**: HIGH
**Risk**: N/A (validation)
**Time**: 20 minutes

1. Run full test suite
2. Build production bundle
3. Test all critical paths
4. Document any remaining issues

## Risk Assessment

### High Risk Items

1. **Refactoring user.service.ts**: Currently uses Supabase, needs Prisma
   - Mitigation: Keep backup, test thoroughly
   
2. **Removing Supabase types**: May break type checking
   - Mitigation: Fix TypeScript errors incrementally

3. **Dependency updates**: May introduce breaking changes
   - Mitigation: Update one at a time, test after each

### Medium Risk Items

1. **Documentation deletion**: May lose important info
   - Mitigation: Backup everything first

2. **Backend removal**: May have hidden dependencies
   - Mitigation: Search for references first

### Low Risk Items

1. **Security fixes**: Straightforward env var changes
2. **Backup creation**: No code changes
3. **Documentation reorganization**: Reversible

## Success Criteria

### Must Have
- ✅ No hardcoded secrets in code
- ✅ No Supabase client usage
- ✅ All tests pass
- ✅ Project builds successfully
- ✅ Authentication works
- ✅ Less than 10 documentation files in root

### Should Have
- ✅ No HIGH severity vulnerabilities
- ✅ Clean docs/ structure
- ✅ Django backend archived
- ✅ Supabase directory archived

### Nice to Have
- ✅ No MODERATE vulnerabilities
- ✅ Updated dependencies
- ✅ Performance improvements

## Rollback Plan

If anything goes wrong:

1. **Stop immediately**
2. **Restore from backup**:
   ```bash
   # Restore specific component
   cp -r .backup/[component]-[timestamp]/* ./[target]/
   ```
3. **Reinstall dependencies**: `npm install`
4. **Rebuild**: `npm run build`
5. **Document what went wrong**
6. **Plan alternative approach**

## Post-Cleanup Maintenance

### Regular Audits

- Monthly: Check for new vulnerabilities
- Quarterly: Review documentation relevance
- Yearly: Full codebase audit

### Documentation Standards

- Keep root directory clean (max 5 .md files)
- All guides go in docs/
- Update docs/ README when adding new docs
- Delete obsolete docs promptly

### Security Standards

- No hardcoded secrets
- All sensitive data in .env
- Regular dependency updates
- Security audit before each release
