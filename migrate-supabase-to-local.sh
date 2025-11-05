#!/bin/bash

# NCSKIT Supabase to Local PostgreSQL Migration Script
echo "🔄 NCSKIT Supabase to Local PostgreSQL Migration"
echo "================================================"

# Configuration
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="ncskit"
LOCAL_DB_USER="user"
LOCAL_DB_PASSWORD="password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        print_error "psql not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    print_success "All required tools are available"
}

# Get Supabase connection details
get_supabase_details() {
    echo ""
    print_status "Please provide your Supabase connection details:"
    
    read -p "Supabase Project Reference (from URL): " SUPABASE_PROJECT_REF
    read -s -p "Supabase Database Password: " SUPABASE_PASSWORD
    echo ""
    
    SUPABASE_CONNECTION_STRING="postgresql://postgres:${SUPABASE_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"
    
    print_status "Testing Supabase connection..."
    if pg_dump "$SUPABASE_CONNECTION_STRING" --schema-only --schema=public -t users --no-owner --no-privileges > /dev/null 2>&1; then
        print_success "Supabase connection successful"
    else
        print_error "Failed to connect to Supabase. Please check your credentials."
        exit 1
    fi
}

# Test local PostgreSQL connection
test_local_connection() {
    print_status "Testing local PostgreSQL connection..."
    
    export PGPASSWORD="$LOCAL_DB_PASSWORD"
    
    if psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Local PostgreSQL connection successful"
    else
        print_error "Failed to connect to local PostgreSQL."
        print_status "Make sure PostgreSQL is running and database '$LOCAL_DB_NAME' exists."
        print_status "You can create it with: createdb -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER $LOCAL_DB_NAME"
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    BACKUP_DIR="supabase-migration-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    print_status "Created backup directory: $BACKUP_DIR"
}

# Export schema from Supabase
export_schema() {
    print_status "Exporting schema from Supabase..."
    
    pg_dump "$SUPABASE_CONNECTION_STRING" \
        --schema-only \
        --schema=public \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > "$BACKUP_DIR/supabase_schema.sql"
    
    if [ $? -eq 0 ]; then
        print_success "Schema exported successfully"
    else
        print_error "Failed to export schema"
        exit 1
    fi
}

# Export data from Supabase
export_data() {
    print_status "Exporting data from Supabase..."
    
    # Get list of tables
    TABLES=$(psql "$SUPABASE_CONNECTION_STRING" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE 'pg_%' AND tablename NOT LIKE 'sql_%';" | tr -d ' ')
    
    for table in $TABLES; do
        if [ ! -z "$table" ]; then
            print_status "Exporting table: $table"
            pg_dump "$SUPABASE_CONNECTION_STRING" \
                --data-only \
                --table="public.$table" \
                --no-owner \
                --no-privileges \
                --column-inserts \
                > "$BACKUP_DIR/${table}_data.sql"
        fi
    done
    
    print_success "Data export completed"
}

# Create full backup
create_full_backup() {
    print_status "Creating full backup from Supabase..."
    
    pg_dump "$SUPABASE_CONNECTION_STRING" \
        --schema=public \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --column-inserts \
        > "$BACKUP_DIR/supabase_full_backup.sql"
    
    if [ $? -eq 0 ]; then
        print_success "Full backup created successfully"
    else
        print_error "Failed to create full backup"
        exit 1
    fi
}

# Import schema to local PostgreSQL
import_schema() {
    print_status "Importing schema to local PostgreSQL..."
    
    export PGPASSWORD="$LOCAL_DB_PASSWORD"
    
    # First, try to use our custom schema
    if [ -f "frontend/database/create-full-schema.sql" ]; then
        print_status "Using custom schema file..."
        psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
            < frontend/database/create-full-schema.sql
    else
        print_status "Using exported schema..."
        psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
            < "$BACKUP_DIR/supabase_schema.sql"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Schema imported successfully"
    else
        print_warning "Schema import had some issues, but continuing..."
    fi
}

# Import data to local PostgreSQL
import_data() {
    print_status "Importing data to local PostgreSQL..."
    
    export PGPASSWORD="$LOCAL_DB_PASSWORD"
    
    # Import full backup
    psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        < "$BACKUP_DIR/supabase_full_backup.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Data imported successfully"
    else
        print_warning "Data import had some issues, trying individual tables..."
        
        # Try importing individual table data files
        for data_file in "$BACKUP_DIR"/*_data.sql; do
            if [ -f "$data_file" ]; then
                table_name=$(basename "$data_file" _data.sql)
                print_status "Importing data for table: $table_name"
                psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
                    < "$data_file" 2>/dev/null
            fi
        done
    fi
}

# Verify migration
verify_migration() {
    print_status "Verifying migration..."
    
    export PGPASSWORD="$LOCAL_DB_PASSWORD"
    
    # Count tables
    LOCAL_TABLES=$(psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" | tr -d ' ')
    
    print_status "Local database has $LOCAL_TABLES tables"
    
    # List tables with row counts
    print_status "Table row counts:"
    psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
        -c "SELECT schemaname,tablename,n_tup_ins as \"rows\" FROM pg_stat_user_tables ORDER BY tablename;"
    
    print_success "Migration verification completed"
}

# Update application configuration
update_config() {
    print_status "Updating application configuration..."
    
    # Update environment files to use local PostgreSQL
    if [ -f "frontend/.env.local" ]; then
        # Backup original
        cp frontend/.env.local frontend/.env.local.backup
        
        # Update database URL
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co|g" frontend/.env.local
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key|g" frontend/.env.local
        
        # Add local PostgreSQL config
        echo "" >> frontend/.env.local
        echo "# Local PostgreSQL Configuration" >> frontend/.env.local
        echo "DATABASE_URL=postgresql://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@$LOCAL_DB_HOST:$LOCAL_DB_PORT/$LOCAL_DB_NAME" >> frontend/.env.local
        echo "POSTGRES_HOST=$LOCAL_DB_HOST" >> frontend/.env.local
        echo "POSTGRES_PORT=$LOCAL_DB_PORT" >> frontend/.env.local
        echo "POSTGRES_DB=$LOCAL_DB_NAME" >> frontend/.env.local
        echo "POSTGRES_USER=$LOCAL_DB_USER" >> frontend/.env.local
        echo "POSTGRES_PASSWORD=$LOCAL_DB_PASSWORD" >> frontend/.env.local
        
        print_success "Frontend configuration updated"
    fi
    
    if [ -f "backend/.env" ]; then
        # Backup original
        cp backend/.env backend/.env.backup
        
        # Update Django database settings
        echo "" >> backend/.env
        echo "# Local PostgreSQL Configuration" >> backend/.env
        echo "DATABASE_URL=postgresql://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@$LOCAL_DB_HOST:$LOCAL_DB_PORT/$LOCAL_DB_NAME" >> backend/.env
        
        print_success "Backend configuration updated"
    fi
}

# Main execution
main() {
    echo ""
    print_status "Starting Supabase to Local PostgreSQL migration..."
    echo ""
    
    check_requirements
    get_supabase_details
    test_local_connection
    create_backup_dir
    
    echo ""
    print_status "Choose migration option:"
    echo "1) Full migration (schema + data)"
    echo "2) Schema only"
    echo "3) Data only"
    read -p "Enter your choice (1-3): " MIGRATION_CHOICE
    
    case $MIGRATION_CHOICE in
        1)
            export_schema
            export_data
            create_full_backup
            import_schema
            import_data
            ;;
        2)
            export_schema
            import_schema
            ;;
        3)
            export_data
            import_data
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    verify_migration
    update_config
    
    echo ""
    print_success "Migration completed successfully!"
    print_status "Backup files are stored in: $BACKUP_DIR"
    print_status "Original config files backed up with .backup extension"
    echo ""
    print_status "Next steps:"
    echo "1. Test your application with local PostgreSQL"
    echo "2. Update any hardcoded Supabase URLs in your code"
    echo "3. Consider setting up connection pooling for production"
    echo ""
}

# Run main function
main "$@"