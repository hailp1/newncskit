# 🌐 DNS Configuration cho ncskit.org

## 📋 THÔNG TIN TUNNEL

### Tunnel ID
```
bce1d1b0-1f68-4b83-a7d8-6aa36095346f
```

### Tunnel Domain
```
bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

---

## 🔧 DNS RECORDS CẦN CONFIG

### Vào Cloudflare Dashboard:
**URL:** https://dash.cloudflare.com

**Steps:**
1. Login vào Cloudflare
2. Chọn domain: **ncskit.org**
3. Click: **DNS** → **Records**
4. Add/Verify 2 CNAME records:

---

## 📝 RECORD 1: Root Domain (@)

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | @ |
| **Target** | `bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com` |
| **Proxy status** | Proxied (🟠 Orange cloud) |
| **TTL** | Auto |

**Copy Target:**
```
bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

---

## 📝 RECORD 2: WWW Subdomain

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | www |
| **Target** | `bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com` |
| **Proxy status** | Proxied (🟠 Orange cloud) |
| **TTL** | Auto |

**Copy Target:**
```
bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

---

## 🔗 DIRECT LINKS

### Cloudflare Dashboard
```
https://dash.cloudflare.com
```

### DNS Management (Replace [ACCOUNT_ID])
```
https://dash.cloudflare.com/[ACCOUNT_ID]/ncskit.org/dns
```

### Tunnel Management
```
https://dash.cloudflare.com/[ACCOUNT_ID]/zero-trust/networks/tunnels
```

### Find Your Account ID:
1. Go to: https://dash.cloudflare.com
2. Select any domain
3. Look at URL, the long string after dash.cloudflare.com/ is your Account ID

---

## ✅ VERIFY DNS

### Check DNS Records
```powershell
# Check root domain
nslookup ncskit.org

# Check www subdomain
nslookup www.ncskit.org

# Check CNAME
nslookup -type=CNAME ncskit.org
nslookup -type=CNAME www.ncskit.org
```

### Online DNS Checker
```
https://dnschecker.org/#CNAME/ncskit.org
https://dnschecker.org/#CNAME/www.ncskit.org
```

---

## 📊 EXPECTED DNS RESULTS

### After Configuration:

**ncskit.org:**
```
Type: CNAME
Target: bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

**www.ncskit.org:**
```
Type: CNAME
Target: bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

---

## 🚀 AUTO CONFIGURATION (Already Done!)

DNS đã được config tự động bằng lệnh:

```powershell
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
```

**Status:** ✅ DNS records already exist!

---

## 🔍 VERIFY IN CLOUDFLARE DASHBOARD

### Steps:
1. Go to: https://dash.cloudflare.com
2. Select: **ncskit.org**
3. Click: **DNS** → **Records**
4. Look for these records:

```
Type: CNAME | Name: @ | Target: bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
Type: CNAME | Name: www | Target: bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com
```

**Proxy Status:** Both should be 🟠 Proxied (Orange cloud)

---

## 📱 MOBILE ACCESS

Scan QR code to access dashboard:
- Generate QR at: https://www.qr-code-generator.com/
- Input: https://dash.cloudflare.com

---

## 🎯 SUMMARY

### Tunnel Information:
- **Tunnel Name:** ncskit
- **Tunnel ID:** bce1d1b0-1f68-4b83-a7d8-6aa36095346f
- **Tunnel Domain:** bce1d1b0-1f68-4b83-a7d8-6aa36095346f.cfargotunnel.com

### DNS Records:
- **ncskit.org** → Tunnel (CNAME)
- **www.ncskit.org** → Tunnel (CNAME)

### Status:
- ✅ Tunnel created
- ✅ DNS routes configured
- ✅ Config file ready
- ⏳ Waiting for Docker to start services

---

## 📞 NEED HELP?

### Can't access Cloudflare Dashboard?
- Reset password: https://dash.cloudflare.com/forgot-password
- Contact support: https://support.cloudflare.com

### DNS not propagating?
- Wait 5-10 minutes
- Clear DNS cache: `ipconfig /flushdns`
- Check propagation: https://dnschecker.org

### Domain not in Cloudflare?
- Add domain: https://dash.cloudflare.com/sign-up
- Follow nameserver setup instructions
- Wait for verification (can take 24 hours)

---

**Created:** 2024-11-12
**Tunnel ID:** bce1d1b0-1f68-4b83-a7d8-6aa36095346f
**Domain:** ncskit.org
**Status:** ✅ Ready
