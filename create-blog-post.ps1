# Script to create NCSKit introduction blog post

Write-Host "🚀 Creating NCSKit introduction blog post..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location backend

# Activate virtual environment if exists
if (Test-Path "venv/Scripts/Activate.ps1") {
    Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
    & venv/Scripts/Activate.ps1
}

# Run the management command
Write-Host "✍️ Creating blog post..." -ForegroundColor Yellow
python manage.py create_ncskit_intro_post

Write-Host ""
Write-Host "✅ Blog post created successfully!" -ForegroundColor Green
Write-Host "📝 You can view it at: https://app.ncskit.org/blog" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To create more sample posts, run:" -ForegroundColor Yellow
Write-Host "   python manage.py create_sample_blog_posts" -ForegroundColor White

# Return to root directory
Set-Location ..
