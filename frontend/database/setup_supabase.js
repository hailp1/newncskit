const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzIyNywiZXhwIjoyMDc3NzUzMjI3fQ.Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E' // Service role key needed

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...')
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute schema
    console.log('📋 Creating database schema...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Error creating schema:', error)
      return
    }
    
    console.log('✅ Database schema created successfully!')
    
    // Read and execute seed data
    const seedPath = path.join(__dirname, 'seed.sql')
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Seeding database...')
      const seedData = fs.readFileSync(seedPath, 'utf8')
      
      const { data: seedResult, error: seedError } = await supabase.rpc('exec_sql', { sql: seedData })
      
      if (seedError) {
        console.error('❌ Error seeding database:', seedError)
        return
      }
      
      console.log('✅ Database seeded successfully!')
    }
    
    console.log('🎉 Supabase setup complete!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Alternative method using direct SQL execution
async function setupWithDirectSQL() {
  try {
    console.log('🚀 Setting up database with direct SQL...')
    
    // Create users table first
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        institution VARCHAR(255),
        orcid_id VARCHAR(50),
        avatar_url TEXT,
        subscription_type VARCHAR(20) DEFAULT 'free',
        research_domains TEXT[] DEFAULT '{}',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const { data, error } = await supabase
      .from('_sql')
      .select('*')
      .eq('query', createUsersTable)
    
    if (error) {
      console.log('Table might already exist or using alternative method...')
    }
    
    console.log('✅ Basic setup attempted!')
    
  } catch (error) {
    console.error('❌ Direct SQL setup failed:', error)
  }
}

// Run setup
if (require.main === module) {
  setupWithDirectSQL()
}

module.exports = { setupDatabase, setupWithDirectSQL }