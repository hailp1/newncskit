# GitBook Setup Guide for NCSKIT Documentation

## Overview

This guide explains how to connect your NCSKIT documentation to GitBook and deploy it to `docs.ncskit.org`.

## Prerequisites

- GitHub repository: `github.com/hailp1/newncskit`
- GitBook account (free or paid)
- Domain: `docs.ncskit.org`

---

## Step 1: Create GitBook Space

### 1.1 Sign Up / Login to GitBook
1. Go to [gitbook.com](https://www.gitbook.com)
2. Sign up or login with GitHub account
3. Create a new organization (if needed)

### 1.2 Create New Space
1. Click **"New Space"**
2. Choose **"Import from GitHub"**
3. Select repository: `hailp1/newncskit`
4. Choose branch: `main`
5. Set root directory: `docs/`
6. Click **"Import"**

---

## Step 2: Configure GitBook

### 2.1 Space Settings
1. Go to **Space Settings**
2. Set **Space Name**: "NCSKIT Documentation"
3. Set **Description**: "AI-Powered Vietnamese Marketing Research Platform"
4. Set **Visibility**: Public or Private (your choice)

### 2.2 GitHub Integration
1. Go to **Integrations** → **GitHub**
2. Enable **GitHub Sync**
3. Configure sync settings:
   - **Auto-sync**: Enabled
   - **Branch**: main
   - **Directory**: docs/
   - **Sync on push**: Enabled

### 2.3 Custom Domain
1. Go to **Settings** → **Domain**
2. Click **"Add custom domain"**
3. Enter: `docs.ncskit.org`
4. Follow DNS configuration instructions

---

## Step 3: DNS Configuration

### 3.1 Add CNAME Record
Add this CNAME record to your DNS provider:

```
Type: CNAME
Name: docs
Value: hosting.gitbook.io
TTL: 3600
```

### 3.2 Verify Domain
1. Wait 5-10 minutes for DNS propagation
2. Click **"Verify"** in GitBook
3. Enable **SSL/TLS** (automatic)

---

## Step 4: Configure GitHub Repository

### 4.1 Update .gitbook.yaml
File already created at `docs/.gitbook.yaml`:

```yaml
root: ./

structure:
  readme: README.md
  summary: SUMMARY.md

redirects:
  previous/page: new-folder/page.md
```

### 4.2 Commit and Push
```bash
git add docs/
git commit -m "docs: Add GitBook documentation structure"
git push origin main
```

---

## Step 5: GitBook API Integration (Optional)

### 5.1 Get API Token
1. Go to **Settings** → **API**
2. Click **"Create new token"**
3. Copy the token (save securely)

### 5.2 Add to Vercel Environment Variables
```
GITBOOK_API_TOKEN=your_token_here
GITBOOK_SPACE_ID=your_space_id
```

### 5.3 Use GitBook API
```typescript
// Example: Fetch documentation
const response = await fetch(
  `https://api.gitbook.com/v1/spaces/${spaceId}/content`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## Step 6: Customize GitBook

### 6.1 Branding
1. Go to **Customize** → **Branding**
2. Upload logo
3. Set primary color: `#3B82F6` (blue)
4. Set favicon

### 6.2 Navigation
1. Configure sidebar navigation
2. Add search functionality
3. Enable table of contents

### 6.3 Integrations
Enable useful integrations:
- **Google Analytics**: Track visitors
- **Intercom**: Live chat support
- **Slack**: Notifications
- **GitHub**: Auto-sync

---

## Step 7: Content Organization

### 7.1 Documentation Structure
```
docs/
├── README.md                 # Home page
├── SUMMARY.md               # Table of contents
├── .gitbook.yaml            # GitBook config
├── getting-started/         # Getting started guides
├── features/                # Feature documentation
├── guides/                  # User guides
├── technical/               # Technical docs
├── api/                     # API reference
├── developer/               # Developer guides
├── deployment/              # Deployment guides
├── security/                # Security docs
└── appendix/                # Additional resources
```

### 7.2 Writing Guidelines
- Use Markdown format
- Include code examples
- Add screenshots/diagrams
- Keep content up-to-date
- Use consistent formatting

---

## Step 8: Automation

### 8.1 Auto-Deploy on Push
GitBook automatically syncs when you push to GitHub:

```bash
# Make changes to docs
vim docs/features/new-feature.md

# Commit and push
git add docs/
git commit -m "docs: Add new feature documentation"
git push origin main

# GitBook auto-deploys in ~2 minutes
```

### 8.2 GitHub Actions (Optional)
Create `.github/workflows/docs.yml`:

```yaml
name: Update Documentation

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify GitBook
        run: |
          curl -X POST https://api.gitbook.com/v1/spaces/${{ secrets.GITBOOK_SPACE_ID }}/sync \
            -H "Authorization: Bearer ${{ secrets.GITBOOK_API_TOKEN }}"
```

---

## Step 9: Testing

### 9.1 Test Local Preview
```bash
# Install GitBook CLI (optional)
npm install -g gitbook-cli

# Serve locally
cd docs
gitbook serve

# Open http://localhost:4000
```

### 9.2 Test Live Site
1. Visit: https://docs.ncskit.org
2. Check all pages load correctly
3. Test search functionality
4. Verify navigation works
5. Check mobile responsiveness

---

## Step 10: Maintenance

### 10.1 Regular Updates
- Update documentation with new features
- Fix broken links
- Update screenshots
- Review and improve content

### 10.2 Version Control
- Tag documentation versions
- Maintain changelog
- Archive old versions

### 10.3 Analytics
- Monitor page views
- Track search queries
- Identify popular content
- Find gaps in documentation

---

## Troubleshooting

### Issue: GitBook not syncing
**Solution**:
1. Check GitHub integration is enabled
2. Verify webhook is active
3. Check branch and directory settings
4. Manually trigger sync in GitBook

### Issue: Custom domain not working
**Solution**:
1. Verify DNS CNAME record
2. Wait for DNS propagation (up to 24 hours)
3. Check SSL certificate status
4. Contact GitBook support if needed

### Issue: Content not updating
**Solution**:
1. Clear GitBook cache
2. Force sync from GitHub
3. Check file paths in SUMMARY.md
4. Verify .gitbook.yaml configuration

---

## Resources

- **GitBook Documentation**: https://docs.gitbook.com
- **GitBook API**: https://developer.gitbook.com
- **GitHub Integration**: https://docs.gitbook.com/integrations/github
- **Custom Domains**: https://docs.gitbook.com/publishing/custom-domain

---

## Quick Reference

### GitBook URLs
- **Dashboard**: https://app.gitbook.com
- **Your Space**: https://app.gitbook.com/o/your-org/s/your-space
- **Public Docs**: https://docs.ncskit.org

### Important Files
- `docs/README.md` - Home page
- `docs/SUMMARY.md` - Navigation structure
- `docs/.gitbook.yaml` - GitBook configuration

### Commands
```bash
# Update docs
git add docs/
git commit -m "docs: Update documentation"
git push origin main

# GitBook syncs automatically
```

---

**Status**: Ready to implement  
**Time Required**: ~30 minutes  
**Difficulty**: Easy
