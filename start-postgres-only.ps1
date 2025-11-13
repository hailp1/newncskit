# Start only PostgreSQL from Docker Compose
# This is useful for local development when you want to run Next.js locally
# but use Docker for the database

Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan

# Start only the postgres service
docker-compose -f docker-compose.production.yml up -d postgres

Write-Host "`nWaiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if it's running
docker ps --filter "name=ncskit-postgres"

Write-Host "`nPostgreSQL is starting up!" -ForegroundColor Green
Write-Host "Connection string: postgresql://postgres:ncskit_secure_password_change_me@localhost:5432/ncskit_production" -ForegroundColor Cyan
Write-Host "`nNote: Update your .env.local DATABASE_URL to match the production database name" -ForegroundColor Yellow
