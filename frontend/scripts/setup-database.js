#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the database for the NCSKIT application.
 * It checks if the database exists and creates it if necessary.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.log('\nPlease set DATABASE_URL in your .env.local file:');
  console.log('DATABASE_URL="postgresql://user:password@localhost:5432/ncskit"\n');
  process.exit(1);
}

// Parse DATABASE_URL
const parseConnectionString = (url) => {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  
  if (!match) {
    console.error('❌ Invalid DATABASE_URL format');
    console.log('Expected format: postgresql://user:password@host:port/database\n');
    process.exit(1);
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
};

const config = parseConnectionString(DATABASE_URL);

console.log('🔍 Checking database configuration...\n');
console.log(`Host: ${config.host}`);
console.log(`Port: ${config.port}`);
console.log(`User: ${config.user}`);
console.log(`Database: ${config.database}\n`);

// Check if database exists
const checkDatabase = () => {
  try {
    const command = process.platform === 'win32'
      ? `psql -h ${config.host} -p ${config.port} -U ${config.user} -lqt | findstr /C:"${config.database}"`
      : `psql -h ${config.host} -p ${config.port} -U ${config.user} -lqt | cut -d \\| -f 1 | grep -qw ${config.database}`;
    
    execSync(command, { 
      stdio: 'ignore',
      env: { ...process.env, PGPASSWORD: config.password }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Create database
const createDatabase = () => {
  try {
    console.log(`📦 Creating database "${config.database}"...`);
    
    const command = `createdb -h ${config.host} -p ${config.port} -U ${config.user} ${config.database}`;
    
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: config.password }
    });
    
    console.log('✅ Database created successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to create database');
    console.error(error.message);
    return false;
  }
};

// Run Prisma migrations
const runMigrations = () => {
  try {
    console.log('🔄 Running Prisma migrations...\n');
    
    execSync('npx prisma migrate dev --name init', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('\n✅ Migrations completed successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to run migrations');
    console.error(error.message);
    return false;
  }
};

// Generate Prisma Client
const generateClient = () => {
  try {
    console.log('⚙️  Generating Prisma Client...\n');
    
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('\n✅ Prisma Client generated successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client');
    console.error(error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting database setup...\n');
  
  // Check if database exists
  const dbExists = checkDatabase();
  
  if (dbExists) {
    console.log(`✅ Database "${config.database}" already exists\n`);
  } else {
    console.log(`⚠️  Database "${config.database}" does not exist\n`);
    
    // Create database
    const created = createDatabase();
    if (!created) {
      console.log('\n💡 You may need to create the database manually:');
      console.log(`   createdb -U ${config.user} ${config.database}\n`);
      process.exit(1);
    }
  }
  
  // Generate Prisma Client first
  const clientGenerated = generateClient();
  if (!clientGenerated) {
    process.exit(1);
  }
  
  // Run migrations
  const migrationsRun = runMigrations();
  if (!migrationsRun) {
    process.exit(1);
  }
  
  console.log('🎉 Database setup completed successfully!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run db:seed (to add sample data)');
  console.log('  2. Run: npm run dev (to start the development server)');
  console.log('  3. Visit: http://localhost:3000\n');
};

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
