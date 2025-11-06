# 🌐 NCSKIT.ORG - Cloudflare Tunnel Manual Setup

## ⚠️ Windows Defender Issue
Windows Defender đang block `cloudflared.exe`. Cần thực hiện các bước sau:

## 🔧 Bước 1: Add Windows Defender Exception

1. Mở **Windows Security** (Windows Defender)
2. Vào **Virus & threat protection**
3. Click **Manage settings** under **Virus & threat protection settings**
4. Scroll xuống **Exclusions** và click **Add or remove exclusions**
5. Click **Add an exclusion** → **File**
6. Browse và chọn file `cloudflared.exe` trong thư mục dự án

## 🚀 Bước 2: Manual Setup Commands

Sau khi add exception, chạy các lệnh sau theo thứ tự:

### 2.1 Login to Cloudflare
```bash
.\cloudflared.exe tunnel login
```
- Browser sẽ mở, login vào Cloudflare account
- Chọn domain `ncskit.org`
- Authorize cloudflared

### 2.2 Create Tunnel
```bash
.\cloudflared.exe tunnel create ncskit
```
- Ghi lại **Tunnel ID** được tạo (dạng: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### 2.3 List Tunnels (để confirm)
```bash
.\cloudflared.exe tunnel list
```

### 2.4 Create DNS Records
```bash
.\cloudflared.exe tunnel route dns ncskit ncskit.org
.\cloudflared.exe tunnel route dns ncskit www.ncskit.org
.\cloudflared.exe tunnel route dns ncskit api.ncskit.org
.\cloudflared.exe tunnel route dns ncskit admin.ncskit.org
.\cloudflared.exe tunnel route dns ncskit health.ncskit.org
```

## 🔧 Bước 3: Update Configuration

1. Mở file `ncskit-tunnel-config.yml`
2. Thay `YOUR_TUNNEL_ID` bằng Tunnel ID thực tế từ bước 2.2
3. Thay `YOUR_TUNNEL_ID` trong credentials-file path

## ✅ Bước 4: Validate & Run

### 4.1 Validate Configuration
```bash
.\cloudflared.exe tunnel --config ncskit-tunnel-config.yml validate
```

### 4.2 Run Tunnel
```bash
.\cloudflared.exe tunnel --config ncskit-tunnel-config.yml run
```

## 🎯 Expected Results

Sau khi setup thành công:
- ✅ **https://ncskit.org** → Frontend (port 3000)
- ✅ **https://www.ncskit.org** → Frontend (port 3000)
- ✅ **https://api.ncskit.org** → Backend API (port 8000)
- ✅ **https://admin.ncskit.org** → Admin Panel (port 8000)
- ✅ **https://health.ncskit.org** → Health Check (port 8000)

## 🔄 Auto-Start Script

Sau khi setup thành công, có thể dùng script tự động:

```bash
# File: start-ncskit-production.bat
@echo off
echo 🚀 Starting NCSKIT Production...

echo 📱 Starting Backend...
start "NCSKIT Backend" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

echo 🎨 Starting Frontend...
start "NCSKIT Frontend" cmd /k "cd frontend && npm run dev"

echo 🌐 Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared.exe tunnel --config ncskit-tunnel-config.yml run"

echo ✅ NCSKIT Production Started!
echo 🌐 Access: https://ncskit.org
pause
```

## 📞 Support

Nếu gặp vấn đề:
1. Check Windows Defender exclusions
2. Verify domain DNS settings tại Cloudflare
3. Check tunnel status: `.\cloudflared.exe tunnel list`
4. Check logs trong `cloudflared.log`