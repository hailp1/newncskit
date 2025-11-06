# ĐỀ XUẤT CHỈNH SỬA - CẤU TRÚC & BẢO MẬT
## NCSKIT Project - Proposed Structure & Security Improvements

**Ngày:** 2024  
**Mục đích:** Đề xuất cải thiện cấu trúc file và bảo mật dự án  
**Phạm vi:** Toàn bộ dự án (Backend + Frontend + Infrastructure)

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### Cấu trúc hiện tại

#### ✅ Điểm mạnh
- Backend apps được tổ chức tốt (Django apps structure)
- Frontend components được nhóm theo feature
- Database files đã được move vào `backend/database/`
- Config files đã được move vào `config/`
- Deployment scripts đã được move vào `deployment/`

#### ❌ Vấn đề
1. **Root level clutter:** 30+ files ở root (bat, ps1, yml, md)
2. **Documentation scattered:** 39+ markdown files ở nhiều nơi
3. **Scripts duplication:** Scripts ở cả root và `deployment/`, `scripts/`
4. **Config files:** Một số ở root, một số ở `config/`
5. **Security issues:** 32 issues đã được identify

---

## 🏗️ PHẦN 1: ĐỀ XUẤT CẤU TRÚC MỚI

### 1.1 Cấu trúc Root Directory

**Hiện tại:**
```
newNCSkit/
├── *.bat (13 files)
├── *.ps1 (14 files)
├── *.yml (5 files)
├── *.md (39 files)
├── backend/
├── frontend/
├── config/
├── deployment/
├── docs/
└── scripts/
```

**Đề xuất:**
```
newNCSkit/
├── README.md                    # Main README only
├── LICENSE                      # License file
├── .gitignore                   # Git ignore
├── docker-compose.yml           # Main docker compose (dev)
├── Dockerfile                   # Main Dockerfile
├── package.json                 # Root package.json (if needed)
│
├── backend/                     # Backend application
│   ├── apps/
│   ├── database/
│   ├── r_analysis/
│   └── ...
│
├── frontend/                    # Frontend application
│   ├── src/
│   └── ...
│
├── config/                      # All configuration files
│   ├── nginx/
│   │   └── nginx.conf
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.production.yml
│   ├── cloudflare/
│   │   ├── cloudflared-config.yml
│   │   ├── ncskit-tunnel-config.yml
│   │   └── demo-tunnel-config.yml
│   └── environment/
│       ├── .env.example
│       ├── .env.development.example
│       └── .env.production.example
│
├── scripts/                     # All executable scripts
│   ├── setup/
│   │   ├── setup-cloudflare-tunnel.bat
│   │   ├── setup-ncskit-org.bat
│   │   ├── setup-tunnel-auto.ps1
│   │   └── setup-tunnel-elevated.ps1
│   ├── deployment/
│   │   ├── deploy.bat
│   │   ├── deploy.sh
│   │   ├── start-production.bat
│   │   └── start-ncskit-production.bat
│   ├── launch/
│   │   ├── launch-ncskit-org.bat
│   │   └── launch-ncskit-public.bat
│   ├── dns/
│   │   ├── update-dns-auto.ps1
│   │   ├── update-dns-curl.ps1
│   │   └── update-dns-wrangler.ps1
│   ├── oauth/
│   │   ├── update-oauth-credentials.ps1
│   │   ├── test-oauth.ps1
│   │   └── ...
│   └── utils/
│       ├── create-admin-user.js
│       └── verify-oauth.js
│
├── docs/                        # All documentation
│   ├── README.md                # Documentation index
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   └── deployment.md
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── api-documentation.md
│   │   └── database-schema.md
│   ├── guides/
│   │   ├── user-guide.md
│   │   ├── developer-guide.md
│   │   └── admin-guide.md
│   ├── security/
│   │   ├── security-audit.md
│   │   ├── security-best-practices.md
│   │   └── incident-response.md
│   ├── deployment/
│   │   ├── cloudflare-tunnel-guide.md
│   │   ├── oauth-setup-guide.md
│   │   └── production-deployment.md
│   └── evaluation/
│       ├── project-evaluation.md
│       ├── structure-evaluation.md
│       └── security-audit-report.md
│
├── tools/                       # Development tools
│   └── (existing tools)
│
└── tests/                       # Integration tests
    ├── e2e/
    └── integration/
```

### 1.2 Migration Plan - Cấu trúc

#### Phase 1: Organize Scripts
```bash
# Move all .bat files
mv *.bat scripts/deployment/  # (except root level essential ones)
mv setup-*.bat scripts/setup/
mv launch-*.bat scripts/launch/
mv test-*.bat scripts/testing/

# Move all .ps1 files
mv *.ps1 scripts/oauth/  # OAuth related
mv update-*.ps1 scripts/oauth/
mv test-*.ps1 scripts/oauth/
mv setup-*.ps1 scripts/setup/
mv update-dns-*.ps1 scripts/dns/
```

#### Phase 2: Organize Config Files
```bash
# Move config files
mv cloudflared-config.yml config/cloudflare/
mv ncskit-tunnel-config.yml config/cloudflare/
mv demo-tunnel-config.yml config/cloudflare/
mv docker-compose.production.yml config/docker/
```

#### Phase 3: Organize Documentation
```bash
# Move documentation
mv *GUIDE.md docs/deployment/
mv *SETUP*.md docs/deployment/
mv *AUDIT*.md docs/security/
mv *EVALUATION*.md docs/evaluation/
mv *STATUS*.md docs/evaluation/
mv *COMPLETED.md docs/evaluation/
```

#### Phase 4: Create .env.example Files
```bash
# Create example env files
touch config/environment/.env.example
touch config/environment/.env.development.example
touch config/environment/.env.production.example
```

---

## 🔒 PHẦN 2: ĐỀ XUẤT BẢO MẬT

### 2.1 Critical Security Fixes (P0)

#### Fix 1: Remove All Hardcoded Secrets

**Files cần sửa:**
1. `frontend/src/app/api/auth/session/route.ts`
2. `frontend/src/lib/admin-auth.ts`
3. `frontend/src/lib/postgres-server.ts`
4. `frontend/src/app/api/auth/login/route.ts`
5. `frontend/src/app/api/auth/register/route.ts`

**Action:**
```typescript
// ❌ BEFORE:
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// ✅ AFTER:
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

#### Fix 2: Secure Test Endpoints

**File:** `frontend/src/app/api/test/connection/route.ts`

**Action:**
```typescript
// Add authentication
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const adminUser = await verifyAdminAuth(request);
  if (!adminUser) {
    return createUnauthorizedResponse();
  }
  // ... rest of code
}
```

#### Fix 3: Implement Missing Analytics Views

**File:** `backend/apps/analytics/views.py`

**Action:**
- Implement all 20+ views referenced in `urls.py`
- Add authentication/authorization
- Add input validation
- Add error handling

#### Fix 4: Fix XSS Vulnerabilities

**Files:**
- `frontend/src/components/blog/blog-editor.tsx`
- `frontend/src/components/blog/blog-seo.tsx`
- `frontend/src/services/visualization.ts`

**Action:**
```typescript
// Install DOMPurify
npm install dompurify @types/dompurify

// Use in components
import DOMPurify from 'dompurify';

dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(content)
}}
```

### 2.2 High Priority Security Fixes (P1)

#### Fix 5: Strengthen CSP Policy

**File:** `config/nginx/nginx.conf`

**Action:**
```nginx
# Remove unsafe-inline and unsafe-eval
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-{random}'; ..." always;
```

#### Fix 6: Implement Rate Limiting

**Backend:**
```python
# Install django-ratelimit
pip install django-ratelimit

# Add to settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '5/15min',
    }
}
```

#### Fix 7: Fix Error Message Disclosure

**Action:**
```typescript
// Return generic errors in production
catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json({
    error: 'Internal server error. Please try again later.'
  }, { status: 500 });
}
```

#### Fix 8: Add Input Validation

**Action:**
- Use Django REST Framework serializers
- Add Zod validation for frontend
- Validate file uploads (type, size, content)

#### Fix 9: Implement 2FA

**Action:**
- Install `django-otp` for backend
- Implement TOTP (Time-based One-Time Password)
- Add backup codes
- Add recovery flow

### 2.3 Security Best Practices

#### Environment Variables Management
```bash
# Create .env.example files
# Never commit .env files
# Use secrets management (AWS Secrets Manager, HashiCorp Vault)
# Rotate secrets regularly
```

#### Dependency Security
```bash
# Regular audits
npm audit
pip check

# Update dependencies
npm update
pip install --upgrade
```

#### Code Security
- Use parameterized queries (already done ✅)
- Sanitize user inputs
- Validate file uploads
- Use HTTPS everywhere
- Implement proper logging

---

## 📋 PHẦN 3: ACTION ITEMS CỤ THỂ

### Phase 1: Structure Organization (Week 1)

#### Day 1-2: Organize Scripts
- [ ] Move all `.bat` files to `scripts/` subfolders
- [ ] Move all `.ps1` files to `scripts/` subfolders
- [ ] Update references in documentation
- [ ] Test scripts after moving

#### Day 3-4: Organize Config Files
- [ ] Move config files to `config/` subfolders
- [ ] Update docker-compose references
- [ ] Update nginx references
- [ ] Test configurations

#### Day 5: Organize Documentation
- [ ] Move documentation to `docs/` subfolders
- [ ] Create documentation index
- [ ] Update internal links
- [ ] Create README for each section

#### Day 6-7: Create .env.example Files
- [ ] Create `backend/.env.example`
- [ ] Create `frontend/.env.example`
- [ ] Create `config/environment/.env.example`
- [ ] Document all required variables

### Phase 2: Critical Security Fixes (Week 2)

#### Day 1-2: Remove Hardcoded Secrets
- [ ] Fix `frontend/src/app/api/auth/session/route.ts`
- [ ] Fix `frontend/src/lib/admin-auth.ts`
- [ ] Fix `frontend/src/lib/postgres-server.ts`
- [ ] Fix `frontend/src/app/api/auth/login/route.ts`
- [ ] Fix `frontend/src/app/api/auth/register/route.ts`
- [ ] Test all auth endpoints

#### Day 3: Secure Test Endpoints
- [ ] Add authentication to test endpoints
- [ ] Remove sensitive information exposure
- [ ] Test endpoints

#### Day 4-5: Implement Analytics Views
- [ ] Implement all analytics views
- [ ] Add authentication/authorization
- [ ] Add input validation
- [ ] Test endpoints

#### Day 6: Fix XSS Vulnerabilities
- [ ] Install DOMPurify
- [ ] Fix blog-editor.tsx
- [ ] Fix blog-seo.tsx
- [ ] Fix visualization.ts
- [ ] Test all components

#### Day 7: Testing & Validation
- [ ] Run security tests
- [ ] Test all endpoints
- [ ] Verify no secrets in code
- [ ] Code review

### Phase 3: High Priority Security (Week 3)

#### Day 1-2: CSP & Security Headers
- [ ] Fix CSP policy
- [ ] Add security headers
- [ ] Test headers

#### Day 3-4: Rate Limiting
- [ ] Install django-ratelimit
- [ ] Configure rate limiting
- [ ] Test rate limiting

#### Day 5: Error Handling
- [ ] Fix error message disclosure
- [ ] Add proper error logging
- [ ] Test error handling

#### Day 6-7: Input Validation & 2FA
- [ ] Add input validation
- [ ] Implement 2FA (if time permits)
- [ ] Test validation

### Phase 4: Code Quality & Documentation (Week 4)

#### Day 1-3: Code Quality
- [ ] Fix TypeScript types
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Code cleanup

#### Day 4-5: Documentation
- [ ] Update README
- [ ] Update API documentation
- [ ] Create security guide
- [ ] Create deployment guide

#### Day 6-7: Testing & Final Review
- [ ] Run all tests
- [ ] Security audit
- [ ] Performance testing
- [ ] Final review

---

## 🎯 PRIORITY MATRIX

### Must Do (P0) - Critical
1. ✅ Remove hardcoded secrets (5 files)
2. ✅ Secure test endpoints
3. ✅ Implement analytics views
4. ✅ Fix XSS vulnerabilities

### Should Do (P1) - High Priority
5. ✅ Fix CSP policy
6. ✅ Implement rate limiting
7. ✅ Fix error disclosure
8. ✅ Add input validation
9. ✅ Implement 2FA

### Nice to Have (P2) - Medium Priority
10. ✅ Organize file structure
11. ✅ Create .env.example files
12. ✅ Update documentation
13. ✅ Code quality improvements

---

## 📝 CHECKLIST TỔNG HỢP

### Structure (P2)
- [ ] Organize scripts into subfolders
- [ ] Organize config files
- [ ] Organize documentation
- [ ] Create .env.example files
- [ ] Update .gitignore
- [ ] Update README

### Security - Critical (P0)
- [ ] Remove hardcoded secrets (5 files)
- [ ] Secure test endpoints
- [ ] Implement analytics views
- [ ] Fix XSS vulnerabilities (3 files)

### Security - High (P1)
- [ ] Fix CSP policy
- [ ] Implement rate limiting
- [ ] Fix error disclosure
- [ ] Add input validation
- [ ] Implement 2FA
- [ ] Add audit logging
- [ ] Secure file uploads

### Code Quality (P2)
- [ ] Fix TypeScript types
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Code cleanup

---

## 🔄 MIGRATION CHECKLIST

### Before Migration
- [ ] Backup current structure
- [ ] Create git branch: `refactor/structure-organization`
- [ ] Document current file locations
- [ ] Test all scripts/configs

### During Migration
- [ ] Move files incrementally
- [ ] Update references
- [ ] Test after each move
- [ ] Commit frequently

### After Migration
- [ ] Update all documentation
- [ ] Update CI/CD scripts
- [ ] Update deployment guides
- [ ] Test everything
- [ ] Merge to main

---

## 📚 DOCUMENTATION UPDATES NEEDED

### Files to Update
1. `README.md` - Update structure section
2. `docs/DEVELOPER_GUIDE.md` - Update paths
3. `docs/DEPLOYMENT_GUIDE.md` - Update scripts paths
4. `docs/SECURITY_GUIDE.md` - New file
5. All script references in docs

---

## 🎓 BEST PRACTICES

### File Organization
- ✅ Group related files together
- ✅ Use descriptive folder names
- ✅ Keep root directory clean
- ✅ Separate concerns (config, scripts, docs)

### Security
- ✅ Never hardcode secrets
- ✅ Use environment variables
- ✅ Validate all inputs
- ✅ Sanitize user-generated content
- ✅ Implement proper authentication
- ✅ Use HTTPS everywhere
- ✅ Regular security audits

### Code Quality
- ✅ Use TypeScript
- ✅ Add proper error handling
- ✅ Add loading states
- ✅ Use proper types
- ✅ Follow coding standards

---

## 📊 EXPECTED BENEFITS

### Structure Improvements
- ✅ Easier navigation
- ✅ Better organization
- ✅ Easier maintenance
- ✅ Clearer project structure
- ✅ Better onboarding

### Security Improvements
- ✅ Reduced attack surface
- ✅ Better secret management
- ✅ Improved authentication
- ✅ Better input validation
- ✅ Compliance ready

### Code Quality
- ✅ Better maintainability
- ✅ Fewer bugs
- ✅ Better error handling
- ✅ Improved user experience

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: Structure Organization
- Organize scripts, configs, docs
- Create .env.example files

### Week 2: Critical Security Fixes
- Remove hardcoded secrets
- Secure endpoints
- Fix XSS vulnerabilities

### Week 3: High Priority Security
- CSP, rate limiting, error handling
- Input validation, 2FA

### Week 4: Code Quality & Documentation
- Code cleanup
- Documentation updates
- Testing & validation

---

## ✅ SUCCESS CRITERIA

### Structure
- [ ] Root directory has < 10 files
- [ ] All scripts organized in subfolders
- [ ] All configs in config/ folder
- [ ] All docs in docs/ folder
- [ ] .env.example files created

### Security
- [ ] No hardcoded secrets
- [ ] All endpoints authenticated
- [ ] XSS vulnerabilities fixed
- [ ] Rate limiting implemented
- [ ] Error disclosure fixed

### Code Quality
- [ ] TypeScript types fixed
- [ ] Error boundaries added
- [ ] Loading states added
- [ ] Code reviewed

---

**Status:** 📋 Đề xuất đã được tạo  
**Next Steps:** Review và approve đề xuất, sau đó bắt đầu implementation  
**Priority:** Focus on P0 (Critical) security fixes first

---

*Đề xuất này được tạo dựa trên phân tích toàn bộ dự án và best practices*

