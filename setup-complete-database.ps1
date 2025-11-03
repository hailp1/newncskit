# =====================================================
# NCSKIT Complete Database Setup Script
# =====================================================

Write-Host "🚀 NCSKIT Database Setup Starting..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

# Configuration
$supabaseUrl = "https://ujcsqwegzchvsxigydcl.supabase.co"
$projectId = "ujcsqwegzchvsxigydcl"

Write-Host ""
Write-Host "📋 Setup Overview:" -ForegroundColor Cyan
Write-Host "   - Complete database schema (20+ tables)"
Write-Host "   - User management system"
Write-Host "   - Project management features"
Write-Host "   - Document collaboration"
Write-Host "   - Reference management"
Write-Host "   - Analytics and notifications"
Write-Host "   - Sample data for testing"

Write-Host ""
Write-Host "🔧 Files to be executed:" -ForegroundColor Yellow
Write-Host "   1. frontend/database/complete-schema.sql (Main schema)"
Write-Host "   2. frontend/database/seed-data.sql (Sample data)"

Write-Host ""
Write-Host "📊 What you'll get:" -ForegroundColor Green
Write-Host "   ✅ 4 demo users with different roles"
Write-Host "   ✅ 3 sample research projects"
Write-Host "   ✅ Project collaborations and milestones"
Write-Host "   ✅ Documents and references"
Write-Host "   ✅ Journals and institutions"
Write-Host "   ✅ Activities and notifications"
Write-Host "   ✅ Complete Row Level Security (RLS)"

Write-Host ""
Write-Host "🌐 Opening Supabase Dashboard..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/$projectId/sql/new"

Write-Host ""
Write-Host "📝 Manual Steps Required:" -ForegroundColor Yellow
Write-Host ""
Write-Host "STEP 1: Create Complete Schema"
Write-Host "   1. In Supabase SQL Editor, create a new query"
Write-Host "   2. Copy content from: frontend/database/complete-schema.sql"
Write-Host "   3. Paste and click 'Run' (this may take 30-60 seconds)"
Write-Host ""
Write-Host "STEP 2: Add Sample Data"
Write-Host "   1. Create another new query"
Write-Host "   2. Copy content from: frontend/database/seed-data.sql"
Write-Host "   3. Paste and click 'Run'"
Write-Host ""

Write-Host "🧪 After Setup - Test Your Database:" -ForegroundColor Green
Write-Host "   • Frontend Test: http://localhost:3000/test-supabase"
Write-Host "   • Demo Users Available:"
Write-Host "     - demo@ncskit.com (Premium researcher)"
Write-Host "     - researcher@ncskit.com (Professor)"
Write-Host "     - student@ncskit.com (PhD student)"
Write-Host "     - admin@ncskit.com (System admin)"

Write-Host ""
Write-Host "📊 Database Features:" -ForegroundColor Magenta
Write-Host "   • User Management: Profiles, institutions, roles"
Write-Host "   • Project Management: Collaboration, milestones, tasks"
Write-Host "   • Document System: Version control, comments, sharing"
Write-Host "   • Reference Manager: Citations, tags, import/export"
Write-Host "   • Journal Database: Impact factors, submission tracking"
Write-Host "   • Analytics: Activity tracking, notifications"
Write-Host "   • Security: Row Level Security, role-based access"

Write-Host ""
Write-Host "⚡ Quick Commands:" -ForegroundColor Yellow
Write-Host "   # Test connection"
Write-Host "   cd frontend && node test-supabase-connection.js"
Write-Host ""
Write-Host "   # Open test page"
Write-Host "   start http://localhost:3000/test-supabase"

Write-Host ""
Write-Host "🎯 Next Development Steps:" -ForegroundColor Cyan
Write-Host "   1. Complete database setup (now)"
Write-Host "   2. Test all connections"
Write-Host "   3. Integrate frontend with new schema"
Write-Host "   4. Add advanced features (AI, analytics)"
Write-Host "   5. Deploy to production"

Write-Host ""
Write-Host "✨ Ready to build the future of research management!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

# Keep window open
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")