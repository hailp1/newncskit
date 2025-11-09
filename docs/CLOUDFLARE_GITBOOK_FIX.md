# Cloudflare Error 1014 Fix for GitBook

## Problem

**Error 1014**: CNAME Cross-User Banned when trying to access `docs.ncskit.org`

This happens when:
- Your domain (`ncskit.org`) is on Cloudflare
- You try to CNAME `docs` subdomain to GitBook (`hosting.gitbook.io`)
- Cloudflare blocks CNAME to external services on different accounts

## Solutions

### ✅ Solution 1: Use GitBook Subdomain (Recommended - Fastest)

Instead of custom domain, use GitBook's subdomain:

**URL**: `ncskit.gitbook.io/docs` or similar

**Steps**:
1. Go to GitBook Space Settings
2. Use the default GitBook subdomain
3. No DNS configuration needed
4. Works immediately

**Pros**:
- ✅ No DNS issues
- ✅ Works immediately
- ✅ Free SSL
- ✅ No Cloudflare conflicts

**Cons**:
- ❌ Not custom domain

---

### ✅ Solution 2: Disable Cloudflare Proxy (Recommended)

Keep custom domain but disable Cloudflare proxy:

**Steps**:

1. **Go to Cloudflare Dashboard**
   - Login to Cloudflare
   - Select domain: `ncskit.org`

2. **Go to DNS Settings**
   - Find the CNAME record for `docs`
   - Click on the **orange cloud** icon
   - Change to **gray cloud** (DNS only)
   - This disables Cloudflare proxy

3. **CNAME Configuration**
   ```
   Type: CNAME
   Name: docs
   Target: hosting.gitbook.io
   Proxy: OFF (gray cloud)
   TTL: Auto
   ```

4. **Save and Wait**
   - Wait 5-10 minutes for DNS propagation
   - Visit https://docs.ncskit.org
   - Should work now

**Pros**:
- ✅ Custom domain works
- ✅ Simple fix
- ✅ GitBook SSL still works

**Cons**:
- ⚠️ No Cloudflare CDN for docs
- ⚠️ No Cloudflare DDoS protection for docs

---

### ✅ Solution 3: Use Cloudflare Pages (Alternative)

Host documentation on Cloudflare Pages instead of GitBook:

**Steps**:

1. **Create Cloudflare Pages Project**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect to GitHub: `hailp1/newncskit`
   - Set build directory: `docs/`

2. **Configure Build**
   ```
   Build command: npm run build
   Build output: _site
   Root directory: docs/
   ```

3. **Add Custom Domain**
   - In Pages project settings
   - Add custom domain: `docs.ncskit.org`
   - Cloudflare auto-configures DNS

4. **Use Static Site Generator**
   - Install: `npm install -g gitbook-cli` or use VitePress/Docusaurus
   - Build static site from markdown
   - Deploy to Cloudflare Pages

**Pros**:
- ✅ Custom domain works
- ✅ Cloudflare CDN
- ✅ Free hosting
- ✅ Auto-deploy from GitHub

**Cons**:
- ⚠️ Need to build static site
- ⚠️ No GitBook editor UI

---

### ✅ Solution 4: Use A Record (Advanced)

If GitBook provides IP addresses:

**Steps**:

1. **Contact GitBook Support**
   - Ask for dedicated IP addresses
   - Usually available on paid plans

2. **Add A Records**
   ```
   Type: A
   Name: docs
   Value: [GitBook IP]
   Proxy: ON (orange cloud)
   ```

3. **Configure in GitBook**
   - Add custom domain
   - Verify ownership

**Pros**:
- ✅ Custom domain
- ✅ Cloudflare proxy works

**Cons**:
- ❌ Requires paid GitBook plan
- ❌ More complex setup

---

## Recommended Approach

### For Quick Setup (Today)
**Use Solution 1**: GitBook subdomain
- URL: `ncskit.gitbook.io/docs`
- No configuration needed
- Works immediately

### For Production (Long-term)
**Use Solution 2**: Disable Cloudflare proxy
- URL: `docs.ncskit.org`
- Simple DNS change
- Works in 10 minutes

### For Best Performance
**Use Solution 3**: Cloudflare Pages
- URL: `docs.ncskit.org`
- Full Cloudflare benefits
- Requires static site setup

---

## Implementation Guide

### Quick Fix (Solution 2)

1. **Cloudflare Dashboard**
   ```
   1. Login to Cloudflare
   2. Select ncskit.org domain
   3. Go to DNS
   4. Find CNAME record: docs → hosting.gitbook.io
   5. Click orange cloud to make it gray
   6. Save
   ```

2. **Verify**
   ```bash
   # Check DNS
   nslookup docs.ncskit.org
   
   # Should show:
   # docs.ncskit.org canonical name = hosting.gitbook.io
   ```

3. **Test**
   - Wait 5-10 minutes
   - Visit https://docs.ncskit.org
   - Should load GitBook docs

---

## Alternative: Use Subdirectory

Instead of subdomain, use subdirectory:

**URL**: `app.ncskit.org/docs`

**Implementation**:
1. Create `/docs` route in Next.js app
2. Embed GitBook content via iframe or API
3. No DNS issues
4. Unified domain

**Code Example**:
```typescript
// frontend/src/app/docs/page.tsx
export default function DocsPage() {
  return (
    <iframe 
      src="https://ncskit.gitbook.io/docs"
      className="w-full h-screen border-0"
      title="Documentation"
    />
  );
}
```

---

## Summary

| Solution | Time | Difficulty | Custom Domain | Cloudflare |
|----------|------|------------|---------------|------------|
| GitBook Subdomain | 0 min | Easy | ❌ | N/A |
| Disable Proxy | 10 min | Easy | ✅ | ❌ |
| Cloudflare Pages | 30 min | Medium | ✅ | ✅ |
| A Record | 1 hour | Hard | ✅ | ✅ |
| Subdirectory | 15 min | Easy | ✅ | ✅ |

---

## Recommended Action

**For immediate deployment**:
1. Use **Solution 2** (Disable Cloudflare Proxy)
2. Takes 10 minutes
3. Custom domain works
4. Can switch to Solution 3 later if needed

**Steps**:
```
1. Cloudflare → DNS → docs CNAME
2. Click orange cloud → gray cloud
3. Save
4. Wait 10 minutes
5. Visit docs.ncskit.org
```

---

**Status**: Ready to implement  
**Recommended**: Solution 2 (Disable Proxy)  
**Time**: 10 minutes
