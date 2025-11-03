const https = require('https')

// Supabase configuration
const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'

console.log('🚀 Direct SQL Database Setup')
console.log('=' .repeat(50))

// SQL commands to execute
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
    name: 'Update demo user',
    sql: `UPDATE users SET research_domains = ARRAY['Computer Science'] WHERE email = 'demo@ncskit.com'`
  },
  {
    name: 'Update researcher user',
    sql: `UPDATE users SET research_domains = ARRAY['Data Science'] WHERE email = 'researcher@ncskit.com'`
  },
  {
    name: 'Update student user',
    sql: `UPDATE users SET research_domains = ARRAY['Biology'] WHERE email = 'student@ncskit.com'`
  }
]

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql })
    
    const options = {
      hostname: 'ujcsqwegzchvsxigydcl.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data })
        } else {
          resolve({ success: false, error: data, status: res.statusCode })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.write(postData)
    req.end()
  })
}

async function executeSQLDirect(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ query: sql })
    })
    
    const result = await response.text()
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function setupDatabase() {
  console.log('\n1. 🔍 Testing connection...')
  
  try {
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    if (testResponse.ok) {
      console.log('✅ Connection successful')
    } else {
      console.log('❌ Connection failed:', testResponse.status)
      return
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message)
    return
  }
  
  console.log('\n2. 🛠️ Executing SQL commands...')
  
  // Try different approaches
  for (const command of sqlCommands) {
    console.log(`\n   Executing: ${command.name}`)
    
    // Method 1: Try exec_sql RPC
    try {
      const result1 = await executeSQLDirect(command.sql)
      if (result1.success) {
        console.log('   ✅ Success via RPC')
        continue
      } else {
        console.log('   ⚠️ RPC failed:', result1.status)
      }
    } catch (error) {
      console.log('   ⚠️ RPC error:', error.message)
    }
    
    // Method 2: Try direct REST API (for simple operations)
    if (command.sql.includes('UPDATE')) {
      try {
        // Extract update logic for REST API
        if (command.sql.includes('demo@ncskit.com')) {
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.demo@ncskit.com`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ research_domains: ['Computer Science'] })
          })
          
          if (updateResponse.ok) {
            console.log('   ✅ Success via REST API')
            continue
          }
        }
      } catch (error) {
        console.log('   ⚠️ REST API failed')
      }
    }
    
    console.log('   ❌ All methods failed - needs manual execution')
  }
  
  console.log('\n3. ✅ Verification...')
  
  try {
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    if (verifyResponse.ok) {
      const users = await verifyResponse.json()
      if (users.length > 0) {
        const columns = Object.keys(users[0])
        console.log('📋 Current columns:', columns.join(', '))
        
        const requiredColumns = ['research_domains', 'orcid_id', 'avatar_url', 'preferences']
        const missingColumns = requiredColumns.filter(col => !columns.includes(col))
        
        if (missingColumns.length === 0) {
          console.log('✅ All required columns present!')
          return true
        } else {
          console.log('❌ Missing columns:', missingColumns.join(', '))
          return false
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message)
  }
  
  return false
}

async function main() {
  const success = await setupDatabase()
  
  console.log('\n' + '=' .repeat(50))
  
  if (success) {
    console.log('🎉 DATABASE SETUP COMPLETED!')
    console.log('\n🧪 Test your setup:')
    console.log('   node check-database-structure.js')
    console.log('   http://localhost:3000/demo-register')
  } else {
    console.log('⚠️ MANUAL SETUP REQUIRED')
    console.log('\n📋 Next steps:')
    console.log('1. Open Supabase Dashboard:')
    console.log('   https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql')
    console.log('2. Run SQL file:')
    console.log('   frontend/database/fix-missing-columns-simple.sql')
    console.log('3. Verify setup:')
    console.log('   node check-database-structure.js')
  }
}

main().catch(console.error)