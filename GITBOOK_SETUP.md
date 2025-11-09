# 📚 GitBook Setup Guide - docs.ncskit.org

## ✅ DNS Configuration

### Current Setup:
```
Type: CNAME
Name: docs
Value: hosting.gitbook.io
TTL: Auto
Status: ✅ Configured
```

### Verification:
```bash
# Check DNS propagation
nslookup docs.ncskit.org

# Should return:
# docs.ncskit.org canonical name = hosting.gitbook.io
```

---

## 🔧 GitBook Configuration

### 1. **Login to GitBook**
- Go to: https://app.gitbook.com
- Login with your account

### 2. **Create/Select Space**
- Create new space or select existing
- Name: "NCSKit Documentation"

### 3. **Configure Custom Domain**

#### Step 1: Go to Space Settings
```
Space → Settings → Domain
```

#### Step 2: Add Custom Domain
```
Domain: docs.ncskit.org
```

#### Step 3: Verify Domain
GitBook will check DNS records:
- ✅ CNAME record pointing to hosting.gitbook.io
- ✅ SSL certificate (auto-generated)

#### Step 4: Wait for Propagation
- DNS propagation: 5-30 minutes
- SSL certificate: 10-60 minutes

---

## 📝 Documentation Structure

### Recommended Structure:
```
docs.ncskit.org/
├── Getting Started
│   ├── Introduction
│   ├── Quick Start
│   └── Installation
├── Features
│   ├── Data Analysis
│   ├── Survey Campaigns
│   ├── Projects
│   └── Smart Editor
├── User Guides
│   ├── Upload CSV
│   ├── Create Campaign
│   ├── Run Analysis
│   └── Export Results
├── API Reference
│   ├── Authentication
│   ├── Analysis API
│   ├── Campaign API
│   └── Projects API
├── Advanced
│   ├── Custom Analysis
│   ├── Integrations
│   └── Webhooks
└── Support
    ├── FAQ
    ├── Troubleshooting
    └── Contact
```

---

## 🔗 Links Updated in Project

### Frontend Components:

#### 1. **Sidebar** (`frontend/src/components/layout/sidebar.tsx`)
```typescript
{ 
  name: 'Documentation', 
  href: 'https://docs.ncskit.org', 
  icon: BookOpenIcon,
  description: 'User guides, API docs, and system architecture',
  external: true
}
```

#### 2. **Footer** (`frontend/src/components/layout/footer.tsx`)
```typescript
product: [
  { name: 'Documentation', href: 'https://docs.ncskit.org', external: true },
]
```

#### 3. **Contact Page** (`frontend/src/app/contact/page.tsx`)
```typescript
<a href="https://docs.ncskit.org" target="_blank" rel="noopener noreferrer">
  documentation
</a>
```

---

## ✅ Verification Checklist

### DNS & Domain:
- [ ] CNAME record configured
- [ ] DNS propagated (check with nslookup)
- [ ] Domain added in GitBook
- [ ] Domain verified in GitBook
- [ ] SSL certificate active

### GitBook Content:
- [ ] Space created
- [ ] Documentation structure set up
- [ ] Content added
- [ ] Published to custom domain

### Frontend Links:
- [ ] Sidebar link updated
- [ ] Footer link updated
- [ ] Contact page link updated
- [ ] External link handling working
- [ ] Links open in new tab

---

## 🧪 Testing

### Test Links:
```bash
# Test from different locations
curl -I https://docs.ncskit.org

# Should return:
# HTTP/2 200
# server: GitBook
```

### Browser Test:
1. Go to https://app.ncskit.org
2. Click "Documentation" in sidebar
3. Should open docs.ncskit.org in new tab
4. Verify SSL certificate (🔒 icon)

---

## 🎨 GitBook Customization

### Branding:
- **Logo**: Upload NCSKit logo
- **Favicon**: Upload favicon.ico
- **Colors**: 
  - Primary: #3B82F6 (Blue)
  - Secondary: #10B981 (Green)

### Settings:
- **Public Access**: Yes
- **Search**: Enabled
- **Table of Contents**: Enabled
- **Page Rating**: Enabled
- **Feedback**: Enabled

---

## 📊 Analytics

### Google Analytics:
```javascript
// Add to GitBook settings
GA_TRACKING_ID: UA-XXXXXXXXX-X
```

### GitBook Insights:
- Page views
- Popular pages
- Search queries
- User feedback

---

## 🔄 Content Sync

### Option 1: Manual Update
- Edit directly in GitBook UI
- Publish changes

### Option 2: GitHub Sync
```yaml
# .gitbook.yaml
root: ./docs

structure:
  readme: README.md
  summary: SUMMARY.md

redirects:
  previous/page: new-page
```

### Option 3: API Integration
```bash
# GitBook API
POST https://api.gitbook.com/v1/spaces/{spaceId}/content
```

---

## 🚨 Troubleshooting

### Issue 1: Domain not working
```bash
# Check DNS
nslookup docs.ncskit.org

# Clear DNS cache
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac
```

### Issue 2: SSL Certificate Error
- Wait 30-60 minutes for certificate generation
- Check GitBook domain settings
- Verify CNAME record

### Issue 3: 404 Error
- Ensure space is published
- Check domain configuration in GitBook
- Verify content is not in draft mode

---

## 📞 Support

### GitBook Support:
- Email: support@gitbook.com
- Docs: https://docs.gitbook.com
- Community: https://community.gitbook.com

### NCSKit Support:
- Email: support@ncskit.org
- Internal: Check GitBook dashboard

---

## 🎯 Next Steps

1. **Verify DNS** (5-30 minutes)
   ```bash
   nslookup docs.ncskit.org
   ```

2. **Configure GitBook** (10 minutes)
   - Add custom domain
   - Verify domain
   - Wait for SSL

3. **Create Content** (1-2 hours)
   - Set up structure
   - Add initial pages
   - Publish

4. **Test Links** (5 minutes)
   - Test from app.ncskit.org
   - Verify new tab opens
   - Check SSL

5. **Deploy Frontend** (5 minutes)
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

---

## ✅ Status

- [x] DNS CNAME configured
- [ ] GitBook domain verified
- [ ] SSL certificate active
- [x] Frontend links updated
- [ ] Content created
- [ ] Published to production

---

**Expected Timeline:**
- DNS propagation: 5-30 minutes
- SSL certificate: 10-60 minutes
- Content creation: 1-2 hours
- **Total**: 1.5-3 hours

**Current Status:** DNS configured, waiting for GitBook setup

---

*Last Updated: 2024*
*Version: 1.0*
