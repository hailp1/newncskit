#!/usr/bin/env node

/**
 * Setup Local PostgreSQL Database for NCSKIT
 * This script creates the database and runs all required SQL scripts
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  // Don't specify database initially to create it
};

const dbName = process.env.POSTGRES_DB || 'ncskit';

async function setupDatabase() {
  console.log('🚀 Setting up NCSKIT Local PostgreSQL Database...');
  
  // Connect to PostgreSQL server (not specific database)
  const adminPool = new Pool(config);
  
  try {
    // 1. Create database if it doesn't exist
    console.log('📦 Creating database...');
    try {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`ℹ️ Database '${dbName}' already exists`);
      } else {
        throw error;
      }
    }
    
    await adminPool.end();
    
    // 2. Connect to the specific database
    const dbPool = new Pool({
      ...config,
      database: dbName
    });
    
    // 3. Run SQL setup scripts in order
    const sqlScripts = [
      'frontend/database/setup-complete.sql',
      'frontend/database/permission-system.sql', 
      'frontend/database/update-token-system.sql'
    ];
    
    for (const scriptPath of sqlScripts) {
      if (fs.existsSync(scriptPath)) {
        console.log(`📄 Running ${path.basename(scriptPath)}...`);
        const sql = fs.readFileSync(scriptPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await dbPool.query(statement);
            } catch (error) {
              // Ignore "already exists" errors
              if (!error.message.includes('already exists') && 
                  !error.message.includes('duplicate key')) {
                console.warn(`⚠️ Warning in ${scriptPath}:`, error.message);
              }
            }
          }
        }
        
        console.log(`✅ ${path.basename(scriptPath)} completed`);
      } else {
        console.log(`⚠️ Script not found: ${scriptPath}`);
      }
    }
    
    // 4. Verify database setup
    console.log('🔍 Verifying database setup...');
    
    const tableCheck = await dbPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tableCheck.rows.length} tables:`);
    tableCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // 5. Create a test admin user
    console.log('👤 Creating test admin user...');
    try {
      await dbPool.query(`
        INSERT INTO users (
          id, email, full_name, role, status, 
          subscription_type, token_balance, created_at, updated_at
        ) VALUES (
          'admin-test-001', 
          'admin@ncskit.local', 
          'Test Admin', 
          'super_admin', 
          'active',
          'institutional', 
          1000, 
          NOW(), 
          NOW()
        ) ON CONFLICT (email) DO NOTHING
      `);
      console.log('✅ Test admin user created: admin@ncskit.local');
    } catch (error) {
      console.log('ℹ️ Admin user may already exist');
    }
    
    await dbPool.end();
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Connection Details:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${config.user}`);
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('   Admin: admin@ncskit.local');
    console.log('   Password: Use your auth system');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Test database connection
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const testPool = new Pool({
    ...config,
    database: dbName
  });
  
  try {
    const result = await testPool.query('SELECT NOW() as timestamp, version() as version');
    console.log('✅ Connection successful!');
    console.log(`   Timestamp: ${result.rows[0].timestamp}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
    
    await testPool.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    await testPool.end();
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await testConnection();
  } else {
    await setupDatabase();
    await testConnection();
  }
}

main().catch(console.error);