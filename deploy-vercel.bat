@echo off
echo ========================================
echo Deploying to Vercel - New Version
echo ========================================
echo.

cd frontend

echo Checking for uncommitted changes...
git status

echo.
echo ========================================
echo Step 1: Add all changes
echo ========================================
git add .

echo.
echo ========================================
echo Step 2: Commit changes
echo ========================================
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=feat: Update admin blog system types

git commit -m "%commit_msg%"

echo.
echo ========================================
echo Step 3: Push to repository
echo ========================================
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo Your changes have been pushed to the repository.
echo If your project is connected to Vercel, it will automatically deploy.
echo.
echo You can monitor the deployment at:
echo https://vercel.com/dashboard
echo.
echo Or deploy manually using Vercel CLI:
echo   vercel --prod
echo.
pause
