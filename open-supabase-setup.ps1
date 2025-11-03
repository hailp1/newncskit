# NCSKIT Database Setup Script
Write-Host "🚀 Opening Supabase Dashboard for NCSKIT setup..." -ForegroundColor Green

# Open Supabase Dashboard
Start-Process "https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql/new"

Write-Host ""
Write-Host "📋 Setup Steps:" -ForegroundColor Yellow
Write-Host "1. Copy content from: frontend/database/complete-schema.sql"
Write-Host "2. Paste in SQL Editor and click Run"
Write-Host "3. Copy content from: frontend/database/seed-data.sql" 
Write-Host "4. Paste in new SQL Editor tab and click Run"
Write-Host ""
Write-Host "🧪 Test after setup: http://localhost:3000/test-supabase" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Demo users will be available:"
Write-Host "   - demo@ncskit.com"
Write-Host "   - researcher@ncskit.com" 
Write-Host "   - student@ncskit.com"
Write-Host "   - admin@ncskit.com"