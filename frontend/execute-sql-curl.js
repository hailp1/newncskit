const { execSync } = require('child_process')
const fs = require('fs')

console.log('🚀 Execute SQL via curl')
console.log('=' .repeat(40))

// Read the SQL file
const sqlFile = 'database/fix-missing-columns-simple.sql'
let sqlContent = ''

try {
  sqlContent = fs.readFileSync(sqlFile, 'utf8')
  console.log('✅ SQL file loaded:', sqlFile)
} catch (error) {
  console.log('❌ Could not read SQL file:', error.message)
  process.exit(1)
}

// Supabase configuration
const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'

// Split SQL into individual commands
const sqlCommands = sqlContent
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

console.log(`\n📋 Found ${sqlCommands.length} SQL commands to execute`)

// Execute each command
let successCount = 0
let failCount = 0

for (let i = 0; i < sqlCommands.length; i++) {
  const command = sqlCommands[i]
  
  if (command.length < 10) continue // Skip very short commands
  
  console.log(`\n${i + 1}. Executing: ${command.substring(0, 50)}...`)
  
  try {
    // Create curl command
    const curlCommand = `curl -X POST "${supabaseUrl}/rest/v1/rpc/exec_sql" ` +
      `-H "Content-Type: application/json" ` +
      `-H "apikey: ${supabaseAnonKey}" ` +
      `-H "Authorization: Bearer ${supabaseAnonKey}" ` +
      `-d "{\\"sql\\": \\"${command.replace(/"/g, '\\"')}\\"}" ` +
      `--silent --show-error`
    
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 10000 })
    
    if (result.includes('error') || result.includes('Error')) {
      console.log('   ❌ Failed:', result.substring(0, 100))
      failCount++
    } else {
      console.log('   ✅ Success')
      successCount++
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message.substring(0, 100))
    failCount++
  }
}

console.log('\n' + '=' .repeat(40))
console.log(`📊 Results: ${successCount} success, ${failCount} failed`)

if (successCount > 0) {
  console.log('\n🧪 Verifying setup...')
  
  try {
    const verifyCommand = `curl -X GET "${supabaseUrl}/rest/v1/users?select=*&limit=1" ` +
      `-H "apikey: ${supabaseAnonKey}" ` +
      `-H "Authorization: Bearer ${supabaseAnonKey}" ` +
      `--silent`
    
    const verifyResult = execSync(verifyCommand, { encoding: 'utf8' })
    const users = JSON.parse(verifyResult)
    
    if (users.length > 0) {
      const columns = Object.keys(users[0])
      console.log('📋 Available columns:', columns.join(', '))
      
      const requiredColumns = ['research_domains', 'orcid_id', 'avatar_url', 'preferences']
      const missingColumns = requiredColumns.filter(col => !columns.includes(col))
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns present!')
        console.log('\n🎉 DATABASE SETUP COMPLETED!')
        console.log('\n🧪 Test your setup:')
        console.log('   node check-database-structure.js')
        console.log('   http://localhost:3000/demo-register')
      } else {
        console.log('❌ Still missing:', missingColumns.join(', '))
        showManualInstructions()
      }
    }
    
  } catch (error) {
    console.log('⚠️ Verification failed:', error.message)
    showManualInstructions()
  }
} else {
  showManualInstructions()
}

function showManualInstructions() {
  console.log('\n⚠️ MANUAL SETUP REQUIRED')
  console.log('\n📋 Please follow these steps:')
  console.log('1. Open Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard/project/ujcsqwegzchvsxigydcl/sql')
  console.log('2. Copy and paste content from:')
  console.log('   frontend/database/fix-missing-columns-simple.sql')
  console.log('3. Click "Run" to execute the SQL')
  console.log('4. Verify with: node check-database-structure.js')
}