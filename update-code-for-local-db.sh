#!/bin/bash

# Update NCSKIT code to use local PostgreSQL instead of Supabase
echo "🔧 Updating NCSKIT code for local PostgreSQL"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create PostgreSQL client service
create_postgres_service() {
    print_status "Creating PostgreSQL client service..."
    
    mkdir -p frontend/src/lib
    
    cat > frontend/src/lib/postgres.ts << 'EOF'
import { Pool, PoolClient } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'ncskit',
  user: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database query function
export async function query(text: string, params?: any[]): Promise<any> {
  const client: PoolClient = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Database transaction function
export async function transaction(callback: (client: PoolClient) => Promise<any>): Promise<any> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to convert Supabase-style queries
export class PostgresQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: string[] = [];
  private orderByClause: string = '';
  private limitClause: string = '';
  private params: any[] = [];
  private paramIndex: number = 1;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push(`${column} = $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push(`${column} != $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push(`${column} > $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push(`${column} >= $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push(`${column} < $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push(`${column} <= $${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  like(column: string, pattern: string) {
    this.whereConditions.push(`${column} LIKE $${this.paramIndex}`);
    this.params.push(pattern);
    this.paramIndex++;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions.push(`${column} ILIKE $${this.paramIndex}`);
    this.params.push(pattern);
    this.paramIndex++;
    return this;
  }

  in(column: string, values: any[]) {
    const placeholders = values.map(() => `$${this.paramIndex++}`).join(', ');
    this.whereConditions.push(`${column} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  order(column: string, ascending: boolean = true) {
    this.orderByClause = `ORDER BY ${column} ${ascending ? 'ASC' : 'DESC'}`;
    return this;
  }

  limit(count: number) {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }

  async execute() {
    let sql = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }
    
    if (this.limitClause) {
      sql += ` ${this.limitClause}`;
    }

    const result = await query(sql, this.params);
    return { data: result.rows, error: null };
  }

  async insert(data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    try {
      const result = await query(sql, values);
      return { data: result.rows[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async update(data: Record<string, any>) {
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${this.params.length + index + 1}`)
      .join(', ');
    
    const updateParams = [...this.params, ...Object.values(data)];
    
    let sql = `UPDATE ${this.tableName} SET ${setClause}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    sql += ' RETURNING *';

    try {
      const result = await query(sql, updateParams);
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete() {
    let sql = `DELETE FROM ${this.tableName}`;
    
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    sql += ' RETURNING *';

    try {
      const result = await query(sql, this.params);
      return { data: result.rows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Factory function to create query builder (similar to Supabase)
export function from(tableName: string) {
  return new PostgresQueryBuilder(tableName);
}

export default pool;
EOF

    print_success "PostgreSQL client service created"
}

# Update package.json to include pg dependency
update_package_json() {
    print_status "Updating package.json dependencies..."
    
    cd frontend
    
    # Add PostgreSQL client
    if command -v npm &> /dev/null; then
        npm install pg @types/pg
        print_success "PostgreSQL dependencies installed"
    else
        print_warning "npm not found, please install pg and @types/pg manually"
    fi
    
    cd ..
}

# Create database service replacement
create_db_service() {
    print_status "Creating database service replacement..."
    
    cat > frontend/src/lib/database.ts << 'EOF'
// Database service - PostgreSQL replacement for Supabase
import { from, query, transaction } from './postgres';
import type { Database } from '@/types/database';

// Type helpers
type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type TableRow<T extends TableName> = Tables[T]['Row'];
type TableInsert<T extends TableName> = Tables[T]['Insert'];
type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Database client class
export class DatabaseClient {
  // Generic table access
  from<T extends TableName>(table: T) {
    return from(table);
  }

  // Direct query access
  async query(sql: string, params?: any[]) {
    return await query(sql, params);
  }

  // Transaction support
  async transaction(callback: (client: any) => Promise<any>) {
    return await transaction(callback);
  }

  // Auth methods (placeholder - implement based on your auth system)
  auth = {
    getUser: async () => {
      // Implement your user authentication logic
      return { data: { user: null }, error: null };
    },
    signIn: async (credentials: any) => {
      // Implement sign in logic
      return { data: null, error: null };
    },
    signOut: async () => {
      // Implement sign out logic
      return { error: null };
    },
    signUp: async (credentials: any) => {
      // Implement sign up logic
      return { data: null, error: null };
    }
  };
}

// Create and export database client instance
export const db = new DatabaseClient();

// Export for backward compatibility
export default db;
EOF

    print_success "Database service created"
}

# Update services to use local PostgreSQL
update_services() {
    print_status "Updating service files..."
    
    # Find all service files that import from Supabase
    find frontend/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase" | while read file; do
        print_status "Updating $file"
        
        # Backup original file
        cp "$file" "$file.backup"
        
        # Replace Supabase imports with local database
        sed -i.tmp 's|from.*supabase.*|from "@/lib/database"|g' "$file"
        sed -i.tmp 's|import.*supabase.*|import { db } from "@/lib/database"|g' "$file"
        sed -i.tmp 's|supabase\.from|db.from|g' "$file"
        sed -i.tmp 's|supabase\.auth|db.auth|g' "$file"
        
        # Clean up temporary files
        rm -f "$file.tmp"
    done
    
    print_success "Service files updated"
}

# Update environment configuration
update_env_config() {
    print_status "Updating environment configuration..."
    
    # Update Next.js config
    if [ -f "frontend/next.config.ts" ]; then
        cp "frontend/next.config.ts" "frontend/next.config.ts.backup"
        
        cat >> frontend/next.config.ts << 'EOF'

// PostgreSQL environment variables
const postgresConfig = {
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
};

// Add to existing config
EOF
        
        print_success "Next.js config updated"
    fi
    
    # Create example environment file
    cat > frontend/.env.example << 'EOF'
# Local PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ncskit
POSTGRES_USER=user
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql://user:password@localhost:5432/ncskit

# Application Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Keep Supabase config commented for reference
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

    print_success "Environment configuration updated"
}

# Create migration verification script
create_verification_script() {
    print_status "Creating verification script..."
    
    cat > verify-local-db.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'ncskit',
  user: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
});

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying local PostgreSQL database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // Check sample data
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    const projectsResult = await client.query('SELECT COUNT(*) FROM projects');
    
    console.log(`👥 Users: ${usersResult.rows[0].count}`);
    console.log(`📁 Projects: ${projectsResult.rows[0].count}`);
    
    client.release();
    console.log('✅ Database verification completed successfully');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
EOF

    print_success "Verification script created"
}

# Main execution
main() {
    echo ""
    print_status "Starting code update for local PostgreSQL..."
    echo ""
    
    create_postgres_service
    update_package_json
    create_db_service
    update_services
    update_env_config
    create_verification_script
    
    echo ""
    print_success "Code update completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Update your .env.local file with PostgreSQL credentials"
    echo "2. Run: node verify-local-db.js (to test database connection)"
    echo "3. Start your application: npm run dev"
    echo "4. Test all functionality to ensure everything works"
    echo ""
    print_warning "Note: Original files are backed up with .backup extension"
    echo ""
}

# Run main function
main "$@"