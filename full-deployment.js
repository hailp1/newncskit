// Complete deployment script - Database + Vercel
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 COMPLETE DEPLOYMENT AUTOMATION');
console.log('='.repeat(60));
console.log('This script will:');
console.log('1. 🗄️ Setup Supabase database');
console.log('2. 🚀 Deploy to Vercel');
console.log('3. 🧪 Test the deployment');
console.log('='.repeat(60));

// Execute a script and return promise
function executeScript(scriptName, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`);
    console.log(`   Running: node ${scriptName}`);
    
    const process = spawn('node', [scriptName], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve(true);
      } else {
        console.log(`❌ ${description} failed with code ${code}`);
        resolve(false);
      }
    });
    
    process.on('error', (error) => {
      console.log(`❌ ${description} error: ${error.message}`);
      resolve(false);
    });
  });
}

// Test deployment
async function testDeployment() {
  console.log('\n🧪 Testing deployment...');
  
  // Test local development
  console.log('\n1. Testing local development server...');
  console.log('   Starting dev server for 10 seconds...');
  
  return new Promise((resolve) => {
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: 'frontend',
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    devServer.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    devServer.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Stop after 10 seconds
    setTimeout(() => {
      devServer.kill();
      
      if (output.includes('Ready') || output.includes('localhost:3000')) {
        console.log('   ✅ Local development server starts successfully');
        resolve(true);
      } else {
        console.log('   ❌ Local development server failed to start');
        console.log('   Output:', output.substring(0, 200));
        resolve(false);
      }
    }, 10000);
  });
}

// Main deployment function
async function main() {
  console.log('\n🚀 STARTING COMPLETE DEPLOYMENT');
  
  let step = 1;
  let totalSteps = 4;
  
  // Step 1: Setup Database
  console.log(`\n📊 STEP ${step}/${totalSteps}: DATABASE SETUP`);
  console.log('-'.repeat(40));
  
  const dbSuccess = await executeScript('execute-supabase-sql.js', 'Database Setup');
  
  if (!dbSuccess) {
    console.log('\n⚠️  Database setup failed, but continuing with deployment...');
    console.log('   You can setup database manually later');
  }
  
  step++;
  
  // Step 2: Deploy to Vercel
  console.log(`\n📊 STEP ${step}/${totalSteps}: VERCEL DEPLOYMENT`);
  console.log('-'.repeat(40));
  
  const deploySuccess = await executeScript('deploy-to-vercel.js', 'Vercel Deployment');
  
  if (!deploySuccess) {
    console.log('\n❌ Vercel deployment failed');
    console.log('   Try manual deployment at: https://vercel.com/new');
    return;
  }
  
  step++;
  
  // Step 3: Test Local Development
  console.log(`\n📊 STEP ${step}/${totalSteps}: LOCAL TESTING`);
  console.log('-'.repeat(40));
  
  const testSuccess = await testDeployment();
  
  step++;
  
  // Step 4: Final Summary
  console.log(`\n📊 STEP ${step}/${totalSteps}: DEPLOYMENT SUMMARY`);
  console.log('-'.repeat(40));
  
  console.log('\n' + '='.repeat(60));
  console.log('🎊 DEPLOYMENT AUTOMATION COMPLETE! 🎊');
  console.log('');
  
  console.log('📊 RESULTS:');
  console.log(`   🗄️ Database Setup: ${dbSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   🚀 Vercel Deploy: ${deploySuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   🧪 Local Testing: ${testSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (deploySuccess) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. 🌐 Check your Vercel dashboard for live URL');
    console.log('   2. 🧪 Test the live application');
    console.log('   3. 🔑 Add Gemini API key for AI features');
    console.log('   4. 📊 Monitor performance and usage');
    
    if (!dbSuccess) {
      console.log('\n⚠️  DATABASE SETUP NEEDED:');
      console.log('   1. Go to: https://supabase.com/dashboard');
      console.log('   2. Execute SQL files manually');
      console.log('   3. Test user registration and project creation');
    }
    
    console.log('\n🎊 NCSKIT IS NOW LIVE! 🎊');
    console.log('   Repository: https://github.com/hailp1/newncskit.git');
    console.log('   Database: https://supabase.com/dashboard');
    console.log('   Deployment: https://vercel.com/dashboard');
    
  } else {
    console.log('\n❌ DEPLOYMENT INCOMPLETE');
    console.log('   Follow manual deployment guides:');
    console.log('   - LOCAL_TESTING_GUIDE.md');
    console.log('   - VERCEL_DEPLOYMENT_CHECKLIST.md');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Deployment interrupted by user');
  process.exit(0);
});

main().catch(error => {
  console.log('\n❌ Deployment automation failed:', error.message);
  console.log('   Try manual deployment steps');
});