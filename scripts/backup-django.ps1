# Django Backend Backup Script
# This script creates a backup archive of the Django backend before removal

$backupDate = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backend-backup-$backupDate.tar.gz"
$backupPath = "backups/$backupName"

Write-Host "Creating Django backend backup..." -ForegroundColor Yellow

# Create backups directory if it doesn't exist
if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

# Create tar.gz archive (requires tar command available in Windows 10+)
try {
    tar -czf $backupPath backend/
    Write-Host "✅ Backup created successfully: $backupPath" -ForegroundColor Green
    Write-Host "Backup size: $((Get-Item $backupPath).Length / 1MB) MB" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to create backup: $_" -ForegroundColor Red
    Write-Host "Note: You can still restore from Git history" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nBackup complete! You can now safely remove the backend directory." -ForegroundColor Green
Write-Host "To restore: tar -xzf $backupPath" -ForegroundColor Cyan
