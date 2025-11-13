#!/bin/bash
# Export Local PostgreSQL Database
# Run this script to backup your local database before migration

echo "🔄 Exporting Local PostgreSQL Database..."
echo ""

timestamp=$(date +"%Y%m%d_%H%M%S")
backupDir="supabase/migration/backup_$timestamp"

# Create backup directory
mkdir -p "$backupDir"

# Database connection info
dbHost="localhost"
dbPort="5432"
dbName="ncskit"
dbUser="postgres"

echo "📦 Backup Directory: $backupDir"
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if pg_isready -h $dbHost -p $dbPort -U $dbUser > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
    echo ""
    echo "⚠️  Cannot connect to PostgreSQL"
    echo "Options:"
    echo "  1. Start PostgreSQL service"
    echo "  2. Skip migration if no local data exists"
    echo "  3. Manually export data if needed"
    echo ""
    read -p "Continue anyway? (y/n) " response
    if [ "$response" != "y" ]; then
        echo "Migration cancelled."
        exit 0
    fi
fi

# Export schema
echo ""
echo "📋 Exporting schema..."
schemaFile="$backupDir/schema.sql"
if pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --schema-only -f "$schemaFile" 2>/dev/null; then
    echo "✅ Schema exported: $schemaFile"
else
    echo "⚠️  Schema export failed (database might not exist)"
fi

# Export data
echo ""
echo "📊 Exporting data..."
dataFile="$backupDir/data.sql"
if pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --data-only -f "$dataFile" 2>/dev/null; then
    echo "✅ Data exported: $dataFile"
else
    echo "⚠️  Data export failed (database might be empty)"
fi

# Export full backup
echo ""
echo "💾 Creating full backup..."
fullBackupFile="$backupDir/full_backup.sql"
if pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "$fullBackupFile" 2>/dev/null; then
    echo "✅ Full backup created: $fullBackupFile"
else
    echo "⚠️  Full backup failed"
fi

echo ""
echo "✨ Export Complete!"
echo ""
echo "📁 Backup Location: $backupDir"
echo ""
echo "Next Steps:"
echo "  1. Review exported files in $backupDir"
echo "  2. Run Supabase SQL scripts (01-04) if not done yet"
echo "  3. Update .env.local with Supabase credentials"
echo "  4. Continue to Task 3"
echo ""
