# 🔧 Khắc Phục Sự Cố Command Line

## 🚨 Các Vấn Đề Thường Gặp

### 1. Không Thể Chạy Script Files (.sh, .bat)

#### Trên Windows:
```cmd
# Lỗi: 'package-project.sh' is not recognized
# Giải pháp: Sử dụng file .bat thay vì .sh
package-project.bat

# Hoặc chạy qua Git Bash
bash package-project.sh
```

#### Trên Linux/Mac:
```bash
# Lỗi: Permission denied
# Giải pháp: Cấp quyền execute
chmod +x package-project.sh
chmod +x setup-new-machine.sh

# Sau đó chạy
./package-project.sh
./setup-new-machine.sh
```

### 2. Node.js Commands Không Hoạt Động

```bash
# Kiểm tra Node.js đã cài đặt chưa
node --version
npm --version

# Nếu chưa có, cài đặt Node.js
# Windows: Tải từ https://nodejs.org
# Mac: brew install node
# Ubuntu: sudo apt install nodejs npm
```

### 3. Python Commands Không Hoạt Động

```bash
# Kiểm tra Python
python --version
python3 --version

# Nếu chưa có, cài đặt Python
# Windows: Tải từ https://python.org
# Mac: brew install python
# Ubuntu: sudo apt install python3 python3-pip
```

### 4. Docker Commands Không Hoạt Động

```bash
# Kiểm tra Docker
docker --version
docker-compose --version

# Khởi động Docker Desktop (Windows/Mac)
# Hoặc start Docker service (Linux)
sudo systemctl start docker
```

## 🛠️ Các Lệnh Khắc Phục Cụ Thể

### Khởi Động Dự Án

#### Windows:
```cmd
# Chạy setup
setup-new-machine.bat

# Khởi động database
docker-compose up -d

# Khởi động backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Khởi động frontend (terminal mới)
cd frontend
npm run dev
```

#### Linux/Mac:
```bash
# Chạy setup
chmod +x setup-new-machine.sh
./setup-new-machine.sh

# Khởi động database
docker-compose up -d

# Khởi động backend
cd backend
source venv/bin/activate
python manage.py runserver

# Khởi động frontend (terminal mới)
cd frontend
npm run dev
```

### Đóng Gói Dự Án

#### Windows:
```cmd
# Chạy script đóng gói
package-project.bat

# Hoặc thủ công
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\.next
rmdir /s /q backend\venv
powershell Compress-Archive -Path * -DestinationPath ncskit-project.zip
```

#### Linux/Mac:
```bash
# Chạy script đóng gói
chmod +x package-project.sh
./package-project.sh

# Hoặc thủ công
rm -rf frontend/node_modules frontend/.next backend/venv
zip -r ncskit-project.zip . -x "*.git*"
```

## 🔍 Chẩn Đoán Vấn Đề

### Kiểm Tra Môi Trường
```bash
# Kiểm tra tất cả tools cần thiết
echo "=== System Check ==="
echo "Node.js: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "NPM: $(npm --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Python: $(python --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Python3: $(python3 --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Docker: $(docker --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "Git: $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
```

### Kiểm Tra Ports
```bash
# Kiểm tra ports đang sử dụng
netstat -tulpn | grep :3000  # Frontend
netstat -tulpn | grep :8000  # Backend
netstat -tulpn | grep :5432  # PostgreSQL
```

### Kiểm Tra Docker
```bash
# Kiểm tra Docker containers
docker ps
docker-compose ps

# Kiểm tra logs
docker-compose logs postgres
docker-compose logs
```

## 🚀 Script Tự Động Khắc Phục

### Windows (fix-issues.bat)
```cmd
@echo off
echo Fixing common issues...

echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

echo Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python not found. Please install from https://python.org
    pause
    exit /b 1
)

echo Checking Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker not found. Please install Docker Desktop
    pause
    exit /b 1
)

echo Cleaning up...
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"
if exist "frontend\.next" rmdir /s /q "frontend\.next"
if exist "backend\venv" rmdir /s /q "backend\venv"

echo Installing dependencies...
cd frontend
npm install
cd ..\backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo Setup complete!
pause
```

### Linux/Mac (fix-issues.sh)
```bash
#!/bin/bash
echo "Fixing common issues..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip python3-venv
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Clean up
echo "Cleaning up..."
rm -rf frontend/node_modules frontend/.next backend/venv

# Install dependencies
echo "Installing dependencies..."
cd frontend
npm install
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "Setup complete!"
```

## 📞 Hỗ Trợ Cụ Thể

### Nếu Vẫn Không Chạy Được:

1. **Kiểm tra PATH Environment**:
   - Windows: System Properties → Environment Variables
   - Linux/Mac: `echo $PATH`

2. **Restart Terminal/Command Prompt**:
   - Đóng và mở lại terminal
   - Hoặc reload shell: `source ~/.bashrc`

3. **Chạy với quyền Admin**:
   - Windows: Run as Administrator
   - Linux/Mac: `sudo` command

4. **Kiểm tra Antivirus**:
   - Tạm thời tắt antivirus
   - Thêm project folder vào whitelist

### Liên Hệ Hỗ Trợ:
- Gửi screenshot lỗi cụ thể
- Thông tin hệ điều hành
- Kết quả của system check commands
- Log files nếu có

---

**Lưu ý**: Hầu hết các vấn đề command line đều do thiếu dependencies hoặc permission issues. Hãy kiểm tra từng bước một cách cẩn thận.