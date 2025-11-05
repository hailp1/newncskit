@echo off
echo 📦 Đóng gói dự án NCSKit...
echo ==========================

:: Tạo thư mục backup
if not exist backup mkdir backup

:: Backup database nếu đang chạy
echo 💾 Backing up database...
docker-compose ps | findstr postgres >nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker-compose ps -q postgres') do set POSTGRES_CONTAINER=%%i
    docker exec -t %POSTGRES_CONTAINER% pg_dump -U postgres ncskit > backup\database_backup.sql
    echo ✅ Database backup created: backup\database_backup.sql
) else (
    echo ⚠️ PostgreSQL container not running, skipping database backup
)

:: Dọn dẹp files không cần thiết
echo 🧹 Cleaning up unnecessary files...

:: Frontend cleanup
if exist "frontend\node_modules" (
    echo Removing frontend\node_modules...
    rmdir /s /q "frontend\node_modules"
)

if exist "frontend\.next" (
    echo Removing frontend\.next...
    rmdir /s /q "frontend\.next"
)

if exist "frontend\.turbo" (
    echo Removing frontend\.turbo...
    rmdir /s /q "frontend\.turbo"
)

:: Backend cleanup
if exist "backend\venv" (
    echo Removing backend\venv...
    rmdir /s /q "backend\venv"
)

echo Removing Python cache files...
for /d /r backend %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d"
del /s /q backend\*.pyc >nul 2>&1

if exist "backend\logs" (
    echo Removing backend\logs...
    rmdir /s /q "backend\logs"
)

:: Tạo archive
echo 📁 Creating project archive...

:: Tạo tên file với timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

:: Sử dụng PowerShell để tạo zip
echo Using PowerShell to create archive...
powershell -command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; $excludePatterns = @('frontend\\node_modules', 'frontend\\.next', 'frontend\\.turbo', 'backend\\venv', 'backend\\__pycache__', 'backend\\logs', '.git'); $source = Get-Location; $destination = Join-Path $source 'ncskit-project-%timestamp%.zip'; $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal; $zip = [System.IO.Compression.ZipFile]::Open($destination, 'Create'); Get-ChildItem -Path $source -Recurse | Where-Object { $file = $_.FullName; $shouldExclude = $false; foreach ($pattern in $excludePatterns) { if ($file -like \"*$pattern*\") { $shouldExclude = $true; break } }; if ($file -like '*.zip') { $shouldExclude = $true }; !$shouldExclude -and !$_.PSIsContainer } | ForEach-Object { $relativePath = $_.FullName.Substring($source.Path.Length + 1); [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relativePath, $compressionLevel) }; $zip.Dispose()}"

:: Tạo file thông tin
echo 📋 Creating project info file...
(
echo NCSKit Project Package
echo =====================
echo.
echo Packaged on: %date% %time%
echo Packaged by: %username%
echo Machine: %computername%
echo.
echo Project Structure:
echo - Frontend: Next.js application
echo - Backend: Django REST API
echo - Database: PostgreSQL ^(via Docker^)
echo - R Analysis: Statistical analysis server
echo - Documentation: Comprehensive docs
echo.
echo Setup Instructions:
echo 1. Extract the archive
echo 2. Run setup-new-machine.bat ^(Windows^) or setup-new-machine.sh ^(Linux/Mac^)
echo 3. Follow the TRANSFER_CHECKLIST.md
echo.
echo Requirements:
echo - Node.js 18+
echo - Python 3.8+
echo - Docker ^& Docker Compose
echo - R 4.0+ ^(optional^)
echo.
echo Support Files:
echo - setup-new-machine.sh/bat: Automated setup script
echo - TRANSFER_CHECKLIST.md: Step-by-step checklist
echo - PROJECT_PACKAGING_GUIDE.md: Detailed packaging guide
echo - backup/database_backup.sql: Database backup ^(if available^)
echo.
echo For support, check the docs/ folder or README.md
) > PROJECT_INFO.txt

:: Hiển thị kết quả
echo.
echo ✅ Đóng gói hoàn thành!
echo ======================
echo.
echo 📁 Files created:
dir *.zip 2>nul
dir PROJECT_INFO.txt
dir setup-new-machine.*
dir TRANSFER_CHECKLIST.md
dir PROJECT_PACKAGING_GUIDE.md

if exist "backup\database_backup.sql" (
    echo 💾 Database backup: backup\database_backup.sql
)

echo.
echo 📋 Next steps:
echo 1. Copy the .zip file to your new machine
echo 2. Extract the archive
echo 3. Run the setup script for your OS
echo 4. Follow the TRANSFER_CHECKLIST.md
echo.
echo 🎉 Ready for transfer!
pause