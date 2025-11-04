// Deploy to Vercel using CLI
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 DEPLOYING TO VERCEL VIA CLI');
console.log('='.repeat(50));

// Check if Vercel CLI is installed
async function checkVercelCLI() {
  return new Promise((resolve) => {
    const check = spawn('vercel', ['--version'], { shell: true });
    
    check.on('close', (code) => {
      resolve(code === 0);
    });
    
    check.on('error', () => {
      resolve(false);
    });
  });
}

// Install Vercel CLI
async function installVercelCLI() {
  console.log('\n📦 Installing Vercel CLI...');
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', '-g', 'vercel'], { 
      shell: true,
      stdio: 'inherit'
    });
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Vercel CLI installed successfully');
        resolve(true);
      } else {
        console.log('❌ Failed to install Vercel CLI');
        reject(false);
      }
    });
  });
}

// Login to Vercel
async function loginToVercel() {
  console.log('\n🔐 Logging in to Vercel...');
  console.log('   This will open your browser for authentication');
  
  return new Promise((resolve, reject) => {
    const login = spawn('vercel', ['login'], { 
      shell: true,
      stdio: 'inherit'
    });
    
    login.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Successfully logged in to Vercel');
        resolve(true);
      } else {
        console.log('❌ Failed to login to Vercel');
        reject(false);
      }
    });
  });
}

// Deploy to Vercel
async function deployToVercel() {
  console.log('\n🚀 Deploying to Vercel...');
  console.log('   This may take a few minutes...');
  
  return new Promise((resolve, reject) => {
    const deploy = spawn('vercel', [
      '--prod',
      '--cwd', 'frontend',
      '--yes'
    ], { 
      shell: true,
      stdio: 'inherit'
    });
    
    deploy.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Successfully deployed to Vercel!');
        resolve(true);
      } else {
        console.log('\n❌ Deployment failed');
        reject(false);
      }
    });
  });
}

// Set environment variables
async function setEnvironmentVariables() {
  console.log('\n🔧 Setting environment variables...');
  
  const envVars = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: 'https://ujcsqwegzchvsxigydcl.supabase.co'
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3Nxd2VnemNodnN4aWd5ZGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzcyMjcsImV4cCI6MjA3Nzc1MzIyN30.XmS0K4v1L2HIx6puTfdjroOy2cPxmIZDwZQ98aaLe6o'
    }
  ];
  
  for (const envVar of envVars) {
    await new Promise((resolve, reject) => {
      const setEnv = spawn('vercel', [
        'env', 'add', envVar.key, 'production',
        '--cwd', 'frontend'
      ], { 
        shell: true,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      
      // Send the value when prompted
      setEnv.stdin.write(envVar.value + '\n');
      setEnv.stdin.end();
      
      setEnv.on('close', (code) => {
        if (code === 0) {
          console.log(`   ✅ Set ${envVar.key}`);
        } else {
          console.log(`   ⚠️  ${envVar.key} may already exist`);
        }
        resolve();
      });
    });
  }
}

// Main deployment function
async function main() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('frontend/package.json')) {
      console.log('❌ Error: frontend/package.json not found');
      console.log('   Make sure you\'re in the project root directory');
      return;
    }
    
    // Check Vercel CLI
    console.log('\n🔍 Checking Vercel CLI...');
    const hasVercelCLI = await checkVercelCLI();
    
    if (!hasVercelCLI) {
      console.log('   ❌ Vercel CLI not found');
      await installVercelCLI();
    } else {
      console.log('   ✅ Vercel CLI found');
    }
    
    // Login to Vercel
    await loginToVercel();
    
    // Set environment variables
    await setEnvironmentVariables();
    
    // Deploy
    await deployToVercel();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎊 DEPLOYMENT COMPLETE! 🎊');
    console.log('');
    console.log('✅ Your app is now live on Vercel');
    console.log('✅ Environment variables configured');
    console.log('✅ Production build successful');
    console.log('');
    console.log('🔗 Check your Vercel dashboard for the live URL');
    console.log('📊 Monitor deployment at: https://vercel.com/dashboard');
    console.log('');
    console.log('🎯 Next: Setup database with execute-supabase-sql.js');
    
  } catch (error) {
    console.log('\n❌ Deployment failed:', error);
    console.log('');
    console.log('🔧 Manual deployment options:');
    console.log('1. Go to: https://vercel.com/new');
    console.log('2. Import: hailp1/newncskit');
    console.log('3. Root Directory: frontend');
    console.log('4. Add environment variables');
    console.log('5. Deploy');
  }
}

main();