# ============================================
# NCSKIT Docker Compose Stop Script
# ============================================

Write-Host "🛑 Stopping NCSKIT Docker Stack" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

docker-compose -f docker-compose.production.yml down

Write-Host ""
Write-Host "✅ All services stopped" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To remove volumes (delete data):" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.production.yml down -v" -ForegroundColor White
Write-Host ""
