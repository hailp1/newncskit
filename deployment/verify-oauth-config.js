#!/usr/bin/env node

/**
 * OAuth Configuration Verification Script
 * Verifies that all OAuth settings are correctly configured for app.ncskit.org
 */

const https = require('https');
const dns = require('dns').promises;

const DOMAIN = 'app.ncskit.org';
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
];

const EXPECTED_URLS = {
  google: `https://${DOMAIN}/api/auth/callback/google`,
  linkedin: `https://${DOMAIN}/api/auth/callback/linkedin`,
};

console.log('🔍 OAuth Configuration Verification\n');
console.log(`Domain: ${DOMAIN}\n`);

// Check 1: DNS Resolution
async function checkDNS() {
  console.log('1️⃣  Checking DNS resolution...');
  try {
    const addresses = await dns.resolve4(DOMAIN);
    console.log(`   ✅ DNS resolved: ${addresses.join(', ')}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ DNS resolution failed: ${error.message}\n`);
    return false;
  }
}

// Check 2: SSL Certificate
async function checkSSL() {
  console.log('2️⃣  Checking SSL certificate...');
  return new Promise((resolve) => {
    const options = {
      hostname: DOMAIN,
      port: 443,
      path: '/',
      method: 'HEAD',
    };

    const req = https.request(options, (res) => {
      if (res.socket.authorized) {
        console.log(`   ✅ SSL certificate is valid\n`);
        resolve(true);
      } else {
        console.log(`   ❌ SSL certificate issue: ${res.socket.authorizationError}\n`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ SSL check failed: ${error.message}\n`);
      resolve(false);
    });

    req.end();
  });
}

// Check 3: Environment Variables
function checkEnvVars() {
  console.log('3️⃣  Checking environment variables...');
  let allPresent = true;

  REQUIRED_ENV_VARS.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
      allPresent = false;
    }
  });

  console.log();
  return allPresent;
}

// Check 4: URL Configuration
function checkURLs() {
  console.log('4️⃣  Checking URL configuration...');
  let correct = true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (appUrl === `https://${DOMAIN}`) {
    console.log(`   ✅ NEXT_PUBLIC_APP_URL is correct: ${appUrl}`);
  } else {
    console.log(`   ❌ NEXT_PUBLIC_APP_URL should be: https://${DOMAIN}`);
    console.log(`      Current value: ${appUrl || 'not set'}`);
    correct = false;
  }

  if (nextAuthUrl === `https://${DOMAIN}`) {
    console.log(`   ✅ NEXTAUTH_URL is correct: ${nextAuthUrl}`);
  } else {
    console.log(`   ❌ NEXTAUTH_URL should be: https://${DOMAIN}`);
    console.log(`      Current value: ${nextAuthUrl || 'not set'}`);
    correct = false;
  }

  console.log();
  return correct;
}

// Check 5: OAuth Endpoints
async function checkOAuthEndpoints() {
  console.log('5️⃣  Checking OAuth endpoints...');
  
  const checkEndpoint = (provider, url) => {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 404) {
          console.log(`   ✅ ${provider} endpoint accessible: ${url}`);
          resolve(true);
        } else {
          console.log(`   ⚠️  ${provider} endpoint returned ${res.statusCode}: ${url}`);
          resolve(false);
        }
      }).on('error', (error) => {
        console.log(`   ❌ ${provider} endpoint error: ${error.message}`);
        resolve(false);
      });
    });
  };

  await checkEndpoint('Google', EXPECTED_URLS.google);
  await checkEndpoint('LinkedIn', EXPECTED_URLS.linkedin);
  console.log();
}

// Summary
function printSummary(results) {
  console.log('📊 Summary\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const allPassed = Object.values(results).every(v => v);
  
  if (allPassed) {
    console.log('✅ All checks passed! OAuth is ready to use.\n');
  } else {
    console.log('❌ Some checks failed. Please review the issues above.\n');
  }

  console.log('Next steps:');
  console.log('1. Configure OAuth providers:');
  console.log(`   - Google: https://console.cloud.google.com/`);
  console.log(`   - LinkedIn: https://www.linkedin.com/developers/apps`);
  console.log('\n2. Add these redirect URLs:');
  console.log(`   - Google: ${EXPECTED_URLS.google}`);
  console.log(`   - LinkedIn: ${EXPECTED_URLS.linkedin}`);
  console.log('\n3. Set environment variables in Vercel');
  console.log('\n4. Redeploy your application');
  console.log('\n5. Test OAuth flows at: https://app.ncskit.org/login');
  console.log('\n═══════════════════════════════════════════════════\n');
}

// Main execution
async function main() {
  const results = {
    dns: await checkDNS(),
    ssl: await checkSSL(),
    env: checkEnvVars(),
    urls: checkURLs(),
  };

  await checkOAuthEndpoints();
  printSummary(results);
}

main().catch(console.error);
