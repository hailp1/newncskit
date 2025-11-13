# 🚀 START HERE - Deploy NCSKIT lên ncskit.org

## ⚡ Quick Start (12 phút)

### Bước 1: Config (5 phút)
```powershell
# Mở file template
notepad QUICK-CONFIG-TEMPLATE.txt

# Điền thông tin:
# - Database URL
# - NEXTAUTH_SECRET (generate mới)
# - GEMINI_API_KEY
# - Google OAuth (nếu dùng)

# Copy vào file production
notepad frontend\.env.production
```

### Bước 2: Setup Tunnel (5 phút)
```powershell
.\setup-tunnel.ps1
```

### Bước 3: Deploy (2 phút)
```powershell
# Chạy PowerShell as Administrator
.\deploy-production.ps1 -ServiceMode
```

### ✅ Done!
Truy cập: https://ncskit.org

---

## 📚 Chi Tiết Hơn?

Đọc file: **`CONFIG-GUIDE.md`**

---

## 🎯 Tất Cả Files Quan Trọng

1. **`CONFIG-GUIDE.md`** ← Đọc file này để hiểu chi tiết
2. **`QUICK-CONFIG-TEMPLATE.txt`** ← Copy config từ đây
3. **`DEPLOYMENT-READY-SUMMARY.md`** ← Tổng quan tất cả
4. **`deploy-production.ps1`** ← Script deploy
5. **`setup-tunnel.ps1`** ← Script setup tunnel

---

## ❓ Cần Giúp?

- Config: Xem `CONFIG-GUIDE.md`
- DNS: Xem `DNS-CONFIG-GUIDE.md`
- Tunnel: Xem `CLOUDFLARE_TUNNEL_SETUP.md`
- Troubleshooting: Xem `PRODUCTION-DEPLOYMENT-CHECKLIST.md`

---

**Prepared:** ✅ All ready!
**Your task:** Config 3 values → Run 2 scripts → Done!
