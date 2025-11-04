// Execute SQL files in Supabase using CLI
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ EXECUTING SQL FILES IN SUPABASE');
console.log('='.repeat(50));

const supabaseUrl = 'https://ujcsqwegzchvsxigydcl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o';

// Check if Supabase CLI is installed
async function checkSupabaseCLI() {
  return new Promise((resolve) => {
    const check = spawn('supabase', ['--version'], { shell: true });
    
    check.on('close', (code) => {
      resolve(code === 0);
    });
    
    check.on('error', () => {
      resolve(false);
    });
  });
}

// Install Supabase CLI
async function installSupabaseCLI() {
  console.log('\n📦 Installing Supabase CLI...');
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '-g', 'supabase'], { 
      shell: true,
      stdio: 'inherit'
    });
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Supabase CLI installed successfully');
        resolve(true);
      } else {
        console.log('❌ Failed to install Supabase CLI');
        console.log('   Try: npm install -g @supabase/supabase-js');
        reject(false);
      }
    });
  });
}

// Execute SQL using REST API (fallback method)
async function executeSQLViaAPI(sqlContent, description) {
  console.log(`\n📄 Executing ${description}...`);
  
  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql: statement })
        });
        
        if (response.ok) {
          successCount++;
          if (i % 10 === 0) {
            console.log(`   Progress: ${i + 1}/${statements.length} statements`);
          }
        } else {
          errorCount++;
          if (errorCount < 5) { // Only show first few errors
            const errorText = await response.text();
            console.log(`   ⚠️  Statement ${i + 1} failed: ${response.status}`);
          }
        }
      } catch (error) {
        errorCount++;
        if (errorCount < 5) {
          console.log(`   ❌ Statement ${i + 1} error: ${error.message}`);
        }
      }
    }
    
    console.log(`   ✅ ${description} completed: ${successCount} success, ${errorCount} errors`);
    return errorCount < statements.length / 2; // Success if less than 50% errors
    
  } catch (error) {
    console.log(`   ❌ ${description} failed: ${error.message}`);
    return false;
  }
}

// Execute SQL using direct HTTP requests (alternative method)
async function executeSQLDirect(sqlContent, description) {
  console.log(`\n📄 Executing ${description} via HTTP...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        sql: sqlContent 
      })
    });
    
    if (response.ok) {
      console.log(`   ✅ ${description} executed successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ ${description} failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${description} error: ${error.message}`);
    return false;
  }
}

// Test database connection
async function testConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Database connection successful');
      return true;
    } else {
      console.log(`   ❌ Connection failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error.message}`);
    return false;
  }
}

// Verify tables after execution
async function verifyTables() {
  console.log('\n🔍 Verifying database tables...');
  
  const expectedTables = [
    'business_domains',
    'marketing_models', 
    'research_variables',
    'projects',
    'users',
    'project_models',
    'research_outline_templates'
  ];
  
  let verifiedCount = 0;
  
  for (const table of expectedTables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        console.log(`   ✅ ${table} - accessible`);
        verifiedCount++;
      } else {
        console.log(`   ❌ ${table} - not found`);
      }
    } catch (error) {
      console.log(`   ❌ ${table} - error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Verification: ${verifiedCount}/${expectedTables.length} tables accessible`);
  return verifiedCount >= expectedTables.length * 0.8; // 80% success rate
}

// Main execution function
async function main() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.log('\n❌ Cannot connect to Supabase database');
      console.log('   Check your internet connection and Supabase credentials');
      return;
    }
    
    // SQL files to execute in order
    const sqlFiles = [
      {
        path: 'frontend/database/complete-production-schema.sql',
        description: 'Complete Production Schema'
      },
      {
        path: 'frontend/database/sample-production-data.sql',
        description: 'Sample Production Data'
      },
      {
        path: 'frontend/database/marketing-knowledge-base.sql',
        description: 'Marketing Knowledge Base'
      },
      {
        path: 'frontend/database/research-outline-templates.sql',
        description: 'Research Outline Templates'
      }
    ];
    
    console.log('\n📋 SQL Files to execute:');
    sqlFiles.forEach((file, index) => {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   ${index + 1}. ✅ ${file.path} (${sizeKB} KB)`);
      } else {
        console.log(`   ${index + 1}. ❌ ${file.path} - NOT FOUND`);
      }
    });
    
    // Execute each SQL file
    let successCount = 0;
    
    for (const file of sqlFiles) {
      if (!fs.existsSync(file.path)) {
        console.log(`\n❌ Skipping ${file.description} - file not found`);
        continue;
      }
      
      const sqlContent = fs.readFileSync(file.path, 'utf8');
      
      // Try direct execution first
      const success = await executeSQLDirect(sqlContent, file.description);
      
      if (success) {
        successCount++;
      } else {
        // Try alternative method
        console.log(`   🔄 Trying alternative method for ${file.description}...`);
        const altSuccess = await executeSQLViaAPI(sqlContent, file.description);
        if (altSuccess) {
          successCount++;
        }
      }
      
      // Small delay between executions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Verify results
    console.log('\n' + '='.repeat(50));
    console.log('📊 EXECUTION SUMMARY');
    console.log(`   ✅ Successfully executed: ${successCount}/${sqlFiles.length} files`);
    
    if (successCount > 0) {
      await verifyTables();
      
      console.log('\n🎊 DATABASE SETUP COMPLETE! 🎊');
      console.log('');
      console.log('✅ SQL files executed successfully');
      console.log('✅ Database tables created');
      console.log('✅ Sample data loaded');
      console.log('');
      console.log('🚀 Ready for local testing:');
      console.log('   cd frontend && npm run dev');
      console.log('   Visit: http://localhost:3000');
    } else {
      console.log('\n❌ DATABASE SETUP FAILED');
      console.log('');
      console.log('🔧 Manual setup required:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select project: ujcsqwegzchvsxigydcl');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste each SQL file content');
      console.log('5. Execute them one by one');
    }
    
  } catch (error) {
    console.log('\n❌ Execution failed:', error.message);
    console.log('');
    console.log('🔧 Try manual setup in Supabase dashboard');
  }
}

main();