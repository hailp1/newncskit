const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseStructure() {
  console.log('🔍 Checking Supabase Database Structure...')
  
  try {
    // Check users table structure
    console.log('\n1. Checking users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
    } else {
      console.log('✅ Users table accessible')
      if (users && users.length > 0) {
        console.log('📋 Available columns:', Object.keys(users[0]))
        console.log('👤 Sample user:', users[0])
      } else {
        console.log('📋 Table exists but no data')
      }
    }
    
    // Check if research_domains column exists
    console.log('\n2. Testing research_domains column...')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('research_domains')
        .limit(1)
      
      if (error) {
        console.log('❌ research_domains column missing:', error.message)
        console.log('💡 Need to run complete database schema')
      } else {
        console.log('✅ research_domains column exists')
      }
    } catch (err) {
      console.log('❌ research_domains test failed:', err.message)
    }
    
    // Check projects table
    console.log('\n3. Checking projects table...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (projectsError) {
      console.log('❌ Projects table error:', projectsError.message)
    } else {
      console.log('✅ Projects table accessible')
      if (projects && projects.length > 0) {
        console.log('📋 Available columns:', Object.keys(projects[0]))
      }
    }
    
    // List all tables
    console.log('\n4. Checking available tables...')
    try {
      // This is a workaround to check table existence
      const tableChecks = [
        'users', 'projects', 'institutions', 'documents', 
        'references', 'milestones', 'activities'
      ]
      
      for (const table of tableChecks) {
        try {
          const { error } = await supabase
            .from(table)
            .select('count')
            .limit(1)
          
          if (error) {
            console.log(`❌ ${table}: ${error.message}`)
          } else {
            console.log(`✅ ${table}: exists`)
          }
        } catch (err) {
          console.log(`❌ ${table}: not accessible`)
        }
      }
    } catch (err) {
      console.log('❌ Table check failed:', err.message)
    }
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message)
  }
  
  console.log('\n🎯 Database Status Summary:')
  console.log('If research_domains column is missing, you need to:')
  console.log('1. Go to Supabase Dashboard SQL Editor')
  console.log('2. Run the complete-schema.sql file')
  console.log('3. Then run the seed-data.sql file')
  console.log('')
  console.log('📂 Files to run:')
  console.log('   - frontend/database/complete-schema.sql')
  console.log('   - frontend/database/seed-data.sql')
}

checkDatabaseStructure()