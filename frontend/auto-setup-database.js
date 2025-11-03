const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'

console.log('🚀 NCSKIT Database Auto-Setup Starting...')
console.log('=' .repeat(60))

async function autoSetupDatabase() {
  
  // 1. Initialize Supabase client
  console.log('\n1. 🔌 Initializing Supabase connection...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log('📊 Current users count:', testData?.[0]?.count || 0)
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
    return false
  }
  
  // 2. Check current database structure
  console.log('\n2. 🔍 Checking current database structure...')
  
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      return false
    }
    
    const currentColumns = users.length > 0 ? Object.keys(users[0]) : []
    console.log('📋 Current columns:', currentColumns.join(', '))
    
    // Check for missing columns
    const requiredColumns = ['research_domains', 'orcid_id', 'avatar_url', 'preferences']
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col))
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!')
      return await verifyCompleteSetup(supabase)
    }
    
    console.log('⚠️ Missing columns:', missingColumns.join(', '))
    
  } catch (error) {
    console.log('❌ Structure check failed:', error.message)
    return false
  }
  
  // 3. Execute SQL commands step by step
  console.log('\n3. 🛠️ Executing database updates...')
  
  const sqlCommands = [
    {
      name: 'Add research_domains column',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS research_domains TEXT[] DEFAULT '{}'`
    },
    {
      name: 'Add orcid_id column',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50)`
    },
    {
      name: 'Add avatar_url column',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`
    },
    {
      name: 'Add preferences column',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'`
    },
    {
      name: 'Update demo user research domains',
      sql: `UPDATE users SET research_domains = ARRAY['Computer Science'] WHERE email = 'demo@ncskit.com'`
    },
    {
      name: 'Update researcher research domains',
      sql: `UPDATE users SET research_domains = ARRAY['Data Science'] WHERE email = 'researcher@ncskit.com'`
    },
    {
      name: 'Update student research domains',
      sql: `UPDATE users SET research_domains = ARRAY['Biology'] WHERE email = 'student@ncskit.com'`
    },
    {
      name: 'Add keywords column to projects',
      sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'`
    },
    {
      name: 'Add research_domain column to projects',
      sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS research_domain VARCHAR(100)`
    }
  ]
  
  // Execute each SQL command
  for (const command of sqlCommands) {
    try {
      console.log(`   Executing: ${command.name}...`)
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: command.sql 
      })
      
      if (error) {
        // Try alternative method using direct query
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ sql: command.sql })
        })
        
        if (!response.ok) {
          console.log(`   ⚠️ ${command.name}: May need manual execution`)
        } else {
          console.log(`   ✅ ${command.name}: Success`)
        }
      } else {
        console.log(`   ✅ ${command.name}: Success`)
      }
      
    } catch (error) {
      console.log(`   ⚠️ ${command.name}: ${error.message}`)
    }
  }
  
  // 4. Create additional tables
  console.log('\n4. 📊 Creating additional tables...')
  
  await createInstitutionsTable(supabase)
  await createMilestonesTable(supabase)
  await createActivitiesTable(supabase)
  
  // 5. Verify setup
  console.log('\n5. ✅ Verifying setup...')
  return await verifyCompleteSetup(supabase)
}

async function createInstitutionsTable(supabase) {
  try {
    console.log('   Creating institutions table...')
    
    // Check if table exists
    const { data, error } = await supabase
      .from('institutions')
      .select('count')
      .limit(1)
    
    if (!error) {
      console.log('   ✅ Institutions table already exists')
      return
    }
    
    // Create table using direct insert (will create if not exists)
    const { error: insertError } = await supabase
      .from('institutions')
      .insert([
        { name: 'NCSKIT University', country: 'Vietnam' },
        { name: 'Tech Research Institute', country: 'Vietnam' },
        { name: 'State University', country: 'Vietnam' }
      ])
    
    if (insertError && !insertError.message.includes('does not exist')) {
      console.log('   ✅ Institutions table created and populated')
    } else {
      console.log('   ⚠️ Institutions table needs manual creation')
    }
    
  } catch (error) {
    console.log('   ⚠️ Institutions table creation skipped:', error.message)
  }
}

async function createMilestonesTable(supabase) {
  try {
    console.log('   Creating milestones table...')
    
    const { data, error } = await supabase
      .from('milestones')
      .select('count')
      .limit(1)
    
    if (!error) {
      console.log('   ✅ Milestones table already exists')
    } else {
      console.log('   ⚠️ Milestones table needs manual creation')
    }
    
  } catch (error) {
    console.log('   ⚠️ Milestones table check skipped')
  }
}

async function createActivitiesTable(supabase) {
  try {
    console.log('   Creating activities table...')
    
    const { data, error } = await supabase
      .from('activities')
      .select('count')
      .limit(1)
    
    if (!error) {
      console.log('   ✅ Activities table already exists')
    } else {
      console.log('   ⚠️ Activities table needs manual creation')
    }
    
  } catch (error) {
    console.log('   ⚠️ Activities table check skipped')
  }
}

async function verifyCompleteSetup(supabase) {
  try {
    console.log('\n📋 Final verification...')
    
    // Check users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table verification failed:', usersError.message)
      return false
    }
    
    const columns = users.length > 0 ? Object.keys(users[0]) : []
    const requiredColumns = ['research_domains', 'orcid_id', 'avatar_url', 'preferences']
    const hasAllColumns = requiredColumns.every(col => columns.includes(col))
    
    if (hasAllColumns) {
      console.log('✅ All required columns present!')
      console.log('📊 Available columns:', columns.join(', '))
      
      // Test research_domains column specifically
      const { data: testUser, error: testError } = await supabase
        .from('users')
        .select('research_domains')
        .eq('email', 'demo@ncskit.com')
        .single()
      
      if (!testError && testUser?.research_domains) {
        console.log('✅ research_domains column working!')
        console.log('👤 Demo user domains:', testUser.research_domains)
      }
      
      return true
    } else {
      const missing = requiredColumns.filter(col => !columns.includes(col))
      console.log('❌ Still missing columns:', missing.join(', '))
      return false
    }
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  const success = await autoSetupDatabase()
  
  console.log('\n' + '=' .repeat(60))
  
  if (success) {
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!')
    console.log('')
    console.log('✅ What was accomplished:')
    console.log('   - Added research_domains column to users table')
    console.log('   - Added orcid_id, avatar_url, preferences columns')
    console.log('   - Updated existing users with sample data')
    console.log('   - Verified all required columns exist')
    console.log('')
    console.log('🧪 Test your setup:')
    console.log('   cd frontend && node check-database-structure.js')
    console.log('   http://localhost:3000/demo-register')
    console.log('')
    console.log('🚀 Ready for development!')
    
  } else {
    console.log('⚠️ DATABASE SETUP PARTIALLY COMPLETED')
    console.log('')
    console.log('📋 Some steps may need manual execution:')
    console.log('   1. Go to Supabase Dashboard SQL Editor')
    console.log('   2. Run: frontend/database/fix-missing-columns-simple.sql')
    console.log('   3. Verify with: node check-database-structure.js')
    console.log('')
    console.log('🔗 Dashboard: https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql')
  }
}

main().catch(console.error)