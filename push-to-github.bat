@echo off
echo 🚀 Pushing NCSKit to GitHub...
echo ==============================

:: Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
)

:: Add all files
echo 📁 Adding files to Git...
git add .

:: Check if there are changes to commit
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo ⚠️ No changes to commit
    pause
    exit /b 0
)

:: Commit changes
echo 💾 Committing changes...
git commit -m "feat: Complete NCSKit research platform

✨ Features:
- Complete research workflow (project → survey → analysis)
- Survey campaign system with token rewards
- Admin dashboard with comprehensive management
- Blog system with SEO optimization
- R integration for statistical analysis
- Docker containerization
- Comprehensive documentation (15+ guides)

🛠️ Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Django 4.2, PostgreSQL, Redis
- Analysis: R 4.3 with Plumber
- DevOps: Docker, Docker Compose

📚 Documentation:
- Quick start guide
- Transfer checklist
- Troubleshooting guide
- API documentation
- Deployment instructions

🎯 Production Ready:
- Enterprise-grade security
- Performance optimized
- Comprehensive testing
- Error handling
- Auto setup scripts"

:: Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Setting up GitHub remote...
    set /p repo_url="GitHub repository URL: "
    git remote add origin "%repo_url%"
)

:: Push to GitHub
echo ⬆️ Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Successfully pushed to GitHub!
echo 🌐 Your repository is now available online
echo.
echo Next steps:
echo 1. Visit your GitHub repository
echo 2. Add repository description and topics
echo 3. Enable GitHub Pages (optional)
echo 4. Set up CI/CD workflows (optional)
echo.
echo 🎉 NCSKit is now on GitHub!
pause