#!/usr/bin/env node

/**
 * OAuth Configuration Verification Script
 * Run this to check if your OAuth environment variables are properly set
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 NCSKIT OAuth Configuration Verification\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '../frontend/.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found in frontend directory');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 Environment Variables Check:\n');

// Check NextAuth configuration
console.log('🔐 NextAuth Configuration:');
checkVar('NEXTAUTH_URL', envVars.NEXTAUTH_URL, 'http://localhost:3000');
checkVar('NEXTAUTH_SECRET', envVars.NEXTAUTH_SECRET, null, true);

console.log('\n🌐 OAuth Providers:');

// Check Google OAuth
console.log('\n  📧 Google OAuth:');
checkVar('GOOGLE_CLIENT_ID', envVars.GOOGLE_CLIENT_ID, null, false, '.apps.googleusercontent.com');
checkVar('GOOGLE_CLIENT_SECRET', envVars.GOOGLE_CLIENT_SECRET, null, true);

// Check LinkedIn OAuth
console.log('\n  💼 LinkedIn OAuth:');
checkVar('LINKEDIN_CLIENT_ID', envVars.LINKEDIN_CLIENT_ID);
checkVar('LINKEDIN_CLIENT_SECRET', envVars.LINKEDIN_CLIENT_SECRET, null, true);

// Check ORCID OAuth
console.log('\n  🎓 ORCID OAuth:');
checkVar('ORCID_CLIENT_ID', envVars.ORCID_CLIENT_ID, null, false, 'APP-');
checkVar('ORCID_CLIENT_SECRET', envVars.ORCID_CLIENT_SECRET, null, true);

console.log('\n📊 Configuration Status:');

// Count configured providers
let configuredProviders = 0;
let totalProviders = 3;

if (isRealCredential(envVars.GOOGLE_CLIENT_ID) && isRealCredential(envVars.GOOGLE_CLIENT_SECRET)) {
  configuredProviders++;
  console.log('  ✅ Google OAuth: Configured');
} else {
  console.log('  ⚠️  Google OAuth: Using placeholder credentials');
}

if (isRealCredential(envVars.LINKEDIN_CLIENT_ID) && isRealCredential(envVars.LINKEDIN_CLIENT_SECRET)) {
  configuredProviders++;
  console.log('  ✅ LinkedIn OAuth: Configured');
} else {
  console.log('  ⚠️  LinkedIn OAuth: Using placeholder credentials');
}

if (isRealCredential(envVars.ORCID_CLIENT_ID) && isRealCredential(envVars.ORCID_CLIENT_SECRET)) {
  configuredProviders++;
  console.log('  ✅ ORCID OAuth: Configured');
} else {
  console.log('  ⚠️  ORCID OAuth: Using placeholder credentials');
}

console.log(`\n🎯 Summary: ${configuredProviders}/${totalProviders} OAuth providers configured`);

if (configuredProviders === 0) {
  console.log('\n🚀 Next Steps:');
  console.log('1. Follow the setup guide in scripts/setup-oauth.md');
  console.log('2. Configure at least one OAuth provider');
  console.log('3. Update the credentials in frontend/.env.local');
  console.log('4. Run this script again to verify');
} else if (configuredProviders < totalProviders) {
  console.log('\n✨ Good progress! Consider configuring the remaining providers for better user experience.');
} else {
  console.log('\n🎉 All OAuth providers configured! Your users can sign in with Google, LinkedIn, and ORCID.');
}

console.log('\n📖 For detailed setup instructions, see: scripts/setup-oauth.md');

function checkVar(name, value, expected = null, isSecret = false, shouldContain = null) {
  const status = value ? '✅' : '❌';
  const displayValue = isSecret && value ? '***hidden***' : (value || 'Not set');
  
  let message = `    ${status} ${name}: ${displayValue}`;
  
  if (expected && value !== expected) {
    message += ` (expected: ${expected})`;
  }
  
  if (shouldContain && value && !value.includes(shouldContain)) {
    message += ` ⚠️  Should contain "${shouldContain}"`;
  }
  
  console.log(message);
}

function isRealCredential(value) {
  if (!value) return false;
  
  // Check if it's a placeholder value
  const placeholders = [
    'your-google-client-id',
    'your-linkedin-client-id', 
    'your-orcid-client-id',
    'your-google-client-secret',
    'your-linkedin-client-secret',
    'your-orcid-client-secret'
  ];
  
  return !placeholders.some(placeholder => value.includes(placeholder));
}