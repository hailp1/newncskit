@echo off
echo 🔧 Khắc phục sự cố NCSKit...
echo ================================

:: Kiểm tra Node.js
echo Kiểm tra Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js không tìm thấy. Vui lòng cài đặt từ https://nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: %NODE_VERSION%
)

:: Kiểm tra Python
echo Kiểm tra Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python không tìm thấy. Vui lòng cài đặt từ https://python.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Python found: %PYTHON_VERSION%
)

:: Kiểm tra Docker
echo Kiểm tra Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker không tìm thấy. Vui lòng cài đặt Docker Desktop
    echo Tải từ: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo ✅ Docker found: %DOCKER_VERSION%
)

:: Dọn dẹp files cũ
echo.
echo 🧹 Dọn dẹp files cũ...
if exist "frontend\node_modules" (
    echo Xóa frontend\node_modules...
    rmdir /s /q "frontend\node_modules"
)
if exist "frontend\.next" (
    echo Xóa frontend\.next...
    rmdir /s /q "frontend\.next"
)
if exist "backend\venv" (
    echo Xóa backend\venv...
    rmdir /s /q "backend\venv"
)

:: Xóa Python cache
echo Xóa Python cache files...
for /d /r backend %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d"
del /s /q backend\*.pyc >nul 2>&1

:: Cài đặt frontend dependencies
echo.
echo 📦 Cài đặt frontend dependencies...
cd frontend
if exist "package-lock.json" (
    npm ci
) else (
    npm install
)
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi cài đặt frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

:: Cài đặt backend dependencies
echo.
echo 🐍 Cài đặt backend dependencies...
cd backend
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi tạo virtual environment
    cd ..
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi cài đặt Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

:: Kiểm tra Docker containers
echo.
echo 🐳 Kiểm tra Docker containers...
docker-compose ps >nul 2>nul
if %errorlevel% neq 0 (
    echo Khởi động Docker containers...
    docker-compose up -d postgres redis
    timeout /t 10 /nobreak >nul
)

:: Test database connection
echo.
echo 🔍 Kiểm tra kết nối database...
node test-database-connection.js
if %errorlevel% neq 0 (
    echo ⚠️ Không thể kết nối database. Hãy đảm bảo Docker đang chạy.
)

:: Chạy migrations
echo.
echo 🔄 Chạy database migrations...
cd backend
call venv\Scripts\activate.bat
python manage.py makemigrations
python manage.py migrate
cd ..

echo.
echo ✅ Khắc phục hoàn tất!
echo ========================
echo.
echo Bây giờ bạn có thể chạy:
echo 1. docker-compose up -d
echo 2. cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo 3. cd frontend ^&^& npm run dev
echo.
echo 🌐 Truy cập ứng dụng tại:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo - Admin: http://localhost:8000/admin
echo.
pause