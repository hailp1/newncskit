@echo off
setlocal enabledelayedexpansion

REM NCSKIT Supabase to Local PostgreSQL Migration Script (Windows)
echo 🔄 NCSKIT Supabase to Local PostgreSQL Migration (Windows)
echo ========================================================

REM Configuration
set LOCAL_DB_HOST=localhost
set LOCAL_DB_PORT=5432
set LOCAL_DB_NAME=ncskit
set LOCAL_DB_USER=user
set LOCAL_DB_PASSWORD=password

echo [INFO] Checking requirements...

REM Check if pg_dump is available
pg_dump --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pg_dump not found. Please install PostgreSQL client tools.
    pause
    exit /b 1
)

REM Check if psql is available
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] psql not found. Please install PostgreSQL client tools.
    pause
    exit /b 1
)

echo [SUCCESS] All required tools are available

echo.
echo [INFO] Please provide your Supabase connection details:
set /p SUPABASE_PROJECT_REF="Supabase Project Reference (from URL): "

REM Get password securely (Windows doesn't have -s option, so we'll show a warning)
echo WARNING: Password will be visible on screen
set /p SUPABASE_PASSWORD="Supabase Database Password: "

set SUPABASE_CONNECTION_STRING=postgresql://postgres:!SUPABASE_PASSWORD!@db.!SUPABASE_PROJECT_REF!.supabase.co:5432/postgres

echo [INFO] Testing Supabase connection...
pg_dump "!SUPABASE_CONNECTION_STRING!" --schema-only --schema=public -t users --no-owner --no-privileges >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to connect to Supabase. Please check your credentials.
    pause
    exit /b 1
)
echo [SUCCESS] Supabase connection successful

echo [INFO] Testing local PostgreSQL connection...
set PGPASSWORD=!LOCAL_DB_PASSWORD!
psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to connect to local PostgreSQL.
    echo [INFO] Make sure PostgreSQL is running and database '!LOCAL_DB_NAME!' exists.
    echo [INFO] You can create it with: createdb -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! !LOCAL_DB_NAME!
    pause
    exit /b 1
)
echo [SUCCESS] Local PostgreSQL connection successful

REM Create backup directory
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "BACKUP_DIR=supabase-migration-!YYYY!!MM!!DD!-!HH!!Min!!Sec!"
mkdir "!BACKUP_DIR!"
echo [INFO] Created backup directory: !BACKUP_DIR!

echo.
echo [INFO] Choose migration option:
echo 1) Full migration (schema + data)
echo 2) Schema only
echo 3) Data only
set /p MIGRATION_CHOICE="Enter your choice (1-3): "

if "!MIGRATION_CHOICE!"=="1" goto full_migration
if "!MIGRATION_CHOICE!"=="2" goto schema_only
if "!MIGRATION_CHOICE!"=="3" goto data_only
echo [ERROR] Invalid choice
pause
exit /b 1

:full_migration
echo [INFO] Starting full migration...
call :export_schema
call :create_full_backup
call :import_schema
call :import_data
goto verify

:schema_only
echo [INFO] Starting schema-only migration...
call :export_schema
call :import_schema
goto verify

:data_only
echo [INFO] Starting data-only migration...
call :create_full_backup
call :import_data
goto verify

:export_schema
echo [INFO] Exporting schema from Supabase...
pg_dump "!SUPABASE_CONNECTION_STRING!" --schema-only --schema=public --no-owner --no-privileges --clean --if-exists > "!BACKUP_DIR!\supabase_schema.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to export schema
    pause
    exit /b 1
)
echo [SUCCESS] Schema exported successfully
goto :eof

:create_full_backup
echo [INFO] Creating full backup from Supabase...
pg_dump "!SUPABASE_CONNECTION_STRING!" --schema=public --no-owner --no-privileges --clean --if-exists --column-inserts > "!BACKUP_DIR!\supabase_full_backup.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create full backup
    pause
    exit /b 1
)
echo [SUCCESS] Full backup created successfully
goto :eof

:import_schema
echo [INFO] Importing schema to local PostgreSQL...
set PGPASSWORD=!LOCAL_DB_PASSWORD!

REM Try custom schema first
if exist "frontend\database\create-full-schema.sql" (
    echo [INFO] Using custom schema file...
    psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! < "frontend\database\create-full-schema.sql"
) else (
    echo [INFO] Using exported schema...
    psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! < "!BACKUP_DIR!\supabase_schema.sql"
)

if %errorlevel% neq 0 (
    echo [WARNING] Schema import had some issues, but continuing...
) else (
    echo [SUCCESS] Schema imported successfully
)
goto :eof

:import_data
echo [INFO] Importing data to local PostgreSQL...
set PGPASSWORD=!LOCAL_DB_PASSWORD!

psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! < "!BACKUP_DIR!\supabase_full_backup.sql" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Data import had some issues, but continuing...
) else (
    echo [SUCCESS] Data imported successfully
)
goto :eof

:verify
echo [INFO] Verifying migration...
set PGPASSWORD=!LOCAL_DB_PASSWORD!

REM Count tables
for /f %%i in ('psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"') do set LOCAL_TABLES=%%i
echo [INFO] Local database has !LOCAL_TABLES! tables

echo [INFO] Table row counts:
psql -h !LOCAL_DB_HOST! -p !LOCAL_DB_PORT! -U !LOCAL_DB_USER! -d !LOCAL_DB_NAME! -c "SELECT schemaname,tablename,n_tup_ins as \"rows\" FROM pg_stat_user_tables ORDER BY tablename;"

echo [SUCCESS] Migration verification completed

echo [INFO] Updating application configuration...

REM Update frontend config
if exist "frontend\.env.local" (
    copy "frontend\.env.local" "frontend\.env.local.backup" >nul
    echo. >> "frontend\.env.local"
    echo # Local PostgreSQL Configuration >> "frontend\.env.local"
    echo DATABASE_URL=postgresql://!LOCAL_DB_USER!:!LOCAL_DB_PASSWORD!@!LOCAL_DB_HOST!:!LOCAL_DB_PORT!/!LOCAL_DB_NAME! >> "frontend\.env.local"
    echo POSTGRES_HOST=!LOCAL_DB_HOST! >> "frontend\.env.local"
    echo POSTGRES_PORT=!LOCAL_DB_PORT! >> "frontend\.env.local"
    echo POSTGRES_DB=!LOCAL_DB_NAME! >> "frontend\.env.local"
    echo POSTGRES_USER=!LOCAL_DB_USER! >> "frontend\.env.local"
    echo POSTGRES_PASSWORD=!LOCAL_DB_PASSWORD! >> "frontend\.env.local"
    echo [SUCCESS] Frontend configuration updated
)

REM Update backend config
if exist "backend\.env" (
    copy "backend\.env" "backend\.env.backup" >nul
    echo. >> "backend\.env"
    echo # Local PostgreSQL Configuration >> "backend\.env"
    echo DATABASE_URL=postgresql://!LOCAL_DB_USER!:!LOCAL_DB_PASSWORD!@!LOCAL_DB_HOST!:!LOCAL_DB_PORT!/!LOCAL_DB_NAME! >> "backend\.env"
    echo [SUCCESS] Backend configuration updated
)

echo.
echo [SUCCESS] Migration completed successfully!
echo [INFO] Backup files are stored in: !BACKUP_DIR!
echo [INFO] Original config files backed up with .backup extension
echo.
echo [INFO] Next steps:
echo 1. Test your application with local PostgreSQL
echo 2. Update any hardcoded Supabase URLs in your code
echo 3. Consider setting up connection pooling for production
echo.
pause