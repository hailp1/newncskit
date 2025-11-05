@echo off
echo 🚀 Setting up NCSKit on new Windows machine...
echo ======================================

:: Check if required tools are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is available
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo ✅ Python is available
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo ✅ Docker is available
)

:: Get versions
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo 📋 Node.js version: %NODE_VERSION%
echo 📋 Python version: %PYTHON_VERSION%

:: Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd frontend
if exist "package-lock.json" (
    npm ci
) else (
    npm install
)
cd ..

:: Setup Python virtual environment
echo.
echo 🐍 Setting up Python environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

:: Setup database with Docker
echo.
echo 🐘 Setting up PostgreSQL database...
docker-compose up -d postgres
echo ⏳ Waiting for database to be ready...
timeout /t 15 /nobreak >nul

:: Test database connection
echo 🔍 Testing database connection...
node test-database-connection.js
if %errorlevel% neq 0 (
    echo ❌ Database connection failed. Please check Docker and try again.
    pause
    exit /b 1
) else (
    echo ✅ Database connection successful
)

:: Setup database schema
echo.
echo 🗄️ Setting up database schema...
node setup-local-database.js

:: Run Django migrations
echo.
echo 🔄 Running Django migrations...
cd backend
call venv\Scripts\activate.bat
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
cd ..

:: Setup R environment
echo.
echo 📊 Setting up R environment...
where R >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ R is not installed. R analysis features will not work.
) else (
    echo ✅ R is available
    cd backend\r_analysis
    R -e "source('setup.R')"
    cd ..\..
)

echo.
echo 🎉 Setup completed successfully!
echo ======================================
echo.
echo Next steps:
echo 1. Start the database: docker-compose up -d
echo 2. Start the backend:
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python manage.py runserver
echo.
echo 3. Start the frontend (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Start R server (optional, in another terminal):
echo    node start-r-server.js
echo.
echo 🌐 Access the application at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    Admin Panel: http://localhost:8000/admin
echo.
echo 📚 Check the documentation in the docs/ folder for more information.
pause