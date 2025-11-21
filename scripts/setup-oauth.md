# 🔧 OAuth Setup Instructions

## 🎯 Quick Setup Guide

Follow these steps to configure OAuth providers for NCSKIT:

### 1. 🔍 Google OAuth Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `ncskit-oauth`
4. Click "Create"

#### Step 2: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - **Google+ API**
   - **People API** (recommended)

#### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill required fields:
   - App name: `NCSKIT`
   - User support email: `your-email@domain.com`
   - Developer contact: `your-email@domain.com`
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

#### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: `NCSKIT Web Client`
5. Authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   *(Replace `<your-project-ref>` with your Supabase project ID, e.g., `ujcsqwegzchvsxigydcl`)*
6. Click "Create"
7. **Copy the Client ID and Client Secret**

### 1.1 🔧 Supabase Configuration (Crucial)

1. Go to Supabase Dashboard -> Authentication -> Providers -> Google
2. Enable Google
3. Paste Client ID and Client Secret
4. Go to Authentication -> URL Configuration
5. Add the following to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://ncskit.org/auth/callback` (for production)

### 2. 💼 LinkedIn OAuth Setup

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill details:
   - App name: `NCSKIT`
   - LinkedIn Page: Select your company page (create if needed)
   - Privacy policy URL: `http://localhost:3000/privacy`
   - App logo: Upload a logo
4. Check agreement and create

#### Step 2: Configure OAuth Settings
1. Go to "Auth" tab in your app
2. Add "Authorized redirect URLs":
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   *(Replace `<your-project-ref>` with your Supabase project ID)*
3. In "OAuth 2.0 scopes", request:
   - `r_liteprofile` (Basic profile info)
   - `r_emailaddress` (Email address)
4. **Copy the Client ID and Client Secret**

### 3. 🎓 ORCID OAuth Setup

#### Step 1: Register ORCID Developer Account
1. Go to [ORCID Developer Tools](https://orcid.org/developer-tools)
2. Sign in with your ORCID account (create one if needed)
3. Click "Register for the free ORCID public API"

#### Step 2: Create Application
1. Click "Register a public API client"
2. Fill details:
   - Client name: `NCSKIT`
   - Website URL: `http://localhost:3000`
   - Description: `Academic survey and research collaboration platform`
   - Redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/orcid
     ```
3. Submit application
4. **Copy the Client ID and Client Secret**

## 🔧 Update Environment Variables

Replace the placeholder values in `frontend/.env.local`:

```env
# Google OAuth - Replace with your real credentials
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# LinkedIn OAuth - Replace with your real credentials  
LINKEDIN_CLIENT_ID=86abcdefghijklmn
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# ORCID OAuth - Replace with your real credentials
ORCID_CLIENT_ID=APP-ABCDEFGHIJKLMNOP
ORCID_CLIENT_SECRET=your-orcid-client-secret
```

## 🧪 Test OAuth Configuration

### Step 1: Restart Development Server
```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

### Step 2: Test Each Provider
1. Go to http://localhost:3000/login
2. Click "Continue with Google" - should redirect to Google
3. Click "Continue with LinkedIn" - should redirect to LinkedIn  
4. Click "Continue with ORCID" - should redirect to ORCID
5. Complete OAuth flow and verify login

### Step 3: Verify Database
```bash
# Check if OAuth users are created
psql -d ncskit -c "SELECT email, full_name, oauth_provider, oauth_id FROM users WHERE oauth_provider IS NOT NULL;"
```

## 🚨 Common Issues & Solutions

### Issue: "Invalid redirect URI"
**Solution**: Ensure redirect URIs in OAuth apps exactly match:
- Google: `http://localhost:3000/api/auth/callback/google`
- LinkedIn: `http://localhost:3000/api/auth/callback/linkedin`
- ORCID: `http://localhost:3000/api/auth/callback/orcid`

### Issue: "Client ID not found"
**Solution**: 
1. Double-check environment variables in `.env.local`
2. Restart development server
3. Ensure no extra spaces in credentials

### Issue: "Insufficient permissions"
**Solution**:
- Google: Enable People API
- LinkedIn: Request `r_liteprofile` and `r_emailaddress` scopes
- ORCID: Use `/authenticate` scope

### Issue: "OAuth consent screen not configured"
**Solution**: Complete OAuth consent screen setup in Google Cloud Console

## 🎉 Success Indicators

When properly configured:
- ✅ OAuth buttons redirect to provider login pages
- ✅ After login, users are redirected back to NCSKIT
- ✅ User accounts are created in database
- ✅ Profile information is synced (name, email, image)
- ✅ ORCID users have their ORCID ID stored

## 📞 Need Help?

If you encounter issues:
1. Check browser developer console for errors
2. Check server logs for authentication errors
3. Verify all redirect URIs are exactly correct
4. Ensure all required scopes are approved

---

**Ready to start? Begin with Google OAuth as it's the most straightforward!**