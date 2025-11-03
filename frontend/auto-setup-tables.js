const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTables() {
  console.log('🚀 Auto-creating Supabase tables...')
  
  try {
    // Try to create a simple test user first
    console.log('📝 Creating test user...')
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@ncskit.com',
      password: 'admin123456'
    })
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('⚠️ Signup error:', signUpError.message)
    } else {
      console.log('✅ Test user created or exists')
    }
    
    // Test if we can access any table
    console.log('🔍 Testing table access...')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Tables not accessible:', error.message)
      console.log('\n📋 Manual Setup Required:')
      console.log('1. Go to: https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Run the SQL from create-basic-tables.sql')
      console.log('4. Or copy this SQL:')
      console.log(`
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    subscription_type VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (email, first_name, last_name, institution) VALUES
('demo@ncskit.com', 'Demo', 'User', 'NCSKIT University'),
('researcher@ncskit.com', 'Research', 'Scientist', 'Tech Institute'),
('student@ncskit.com', 'Graduate', 'Student', 'State University')
ON CONFLICT (email) DO NOTHING;
      `)
    } else {
      console.log('✅ Tables already exist and accessible!')
      console.log('👥 Found users:', data?.length || 0)
    }
    
  } catch (err) {
    console.log('❌ Setup failed:', err.message)
  }
}

createTables()