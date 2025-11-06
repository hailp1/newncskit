#!/usr/bin/env node

/**
 * OAuth Credentials Update Helper
 * Interactive script to help update OAuth credentials in .env.local
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 NCSKIT OAuth Credentials Update Helper\n');

const envPath = path.join(__dirname, '../frontend/.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found in frontend directory');
  process.exit(1);
}

console.log('This script will help you update your OAuth credentials.');
console.log('Press Enter to skip any provider you don\'t want to configure now.\n');

async function updateCredentials() {
  const credentials = {};
  
  console.log('📧 Google OAuth Configuration:');
  credentials.GOOGLE_CLIENT_ID = await askQuestion('Google Client ID (ends with .apps.googleusercontent.com): ');
  if (credentials.GOOGLE_CLIENT_ID) {
    credentials.GOOGLE_CLIENT_SECRET = await askQuestion('Google Client Secret: ');
  }
  
  console.log('\n💼 LinkedIn OAuth Configuration:');
  credentials.LINKEDIN_CLIENT_ID = await askQuestion('LinkedIn Client ID: ');
  if (credentials.LINKEDIN_CLIENT_ID) {
    credentials.LINKEDIN_CLIENT_SECRET = await askQuestion('LinkedIn Client Secret: ');
  }
  
  console.log('\n🎓 ORCID OAuth Configuration:');
  credentials.ORCID_CLIENT_ID = await askQuestion('ORCID Client ID (starts with APP-): ');
  if (credentials.ORCID_CLIENT_ID) {
    credentials.ORCID_CLIENT_SECRET = await askQuestion('ORCID Client Secret: ');
  }
  
  // Update .env.local file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  Object.entries(credentials).forEach(([key, value]) => {
    if (value && value.trim()) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value.trim()}`);
      } else {
        envContent += `\n${key}=${value.trim()}`;
      }
    }
  });
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Credentials updated successfully!');
  console.log('\n🧪 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test OAuth login at: http://localhost:3000/login');
  console.log('3. Verify configuration: node scripts/verify-oauth.js');
  
  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

updateCredentials().catch(console.error);