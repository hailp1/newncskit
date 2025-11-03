# Script to open Supabase Dashboard for table creation
Write-Host "🚀 Opening Supabase Dashboard..." -ForegroundColor Green
Write-Host "Project: ujcsqwegzchvsxigydcl" -ForegroundColor Yellow

# Open Supabase Dashboard
Start-Process "https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl"

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to 'SQL Editor' in the dashboard"
Write-Host "2. Copy the SQL from 'frontend/create-basic-tables.sql'"
Write-Host "3. Paste and run the SQL to create tables"
Write-Host "4. Test connection at: http://localhost:3000/test-supabase"
Write-Host ""
Write-Host "✅ After setup, you'll have:" -ForegroundColor Green
Write-Host "   - Users table with 3 demo accounts"
Write-Host "   - Projects table with sample data"
Write-Host "   - Full Supabase integration working"