#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * Checks if the project is ready for deployment to Vercel
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const ROOT_DIR = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - Missing: ${filePath}`, 'red');
    return false;
  }
}

function checkEnvExample() {
  const envExamplePath = path.join(FRONTEND_DIR, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    log('✗ .env.example not found', 'red');
    return false;
  }

  const content = fs.readFileSync(envExamplePath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_ANALYTICS_URL',
    'ANALYTICS_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (!content.includes(varName)) {
      log(`  ✗ Missing variable: ${varName}`, 'red');
      allPresent = false;
    }
  });

  if (allPresent) {
    log('✓ .env.example contains all required variables', 'green');
  }
  return allPresent;
}

function checkPackageJson() {
  const packagePath = path.join(FRONTEND_DIR, 'package.json');
  if (!fs.existsSync(packagePath)) {
    log('✗ package.json not found', 'red');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  let allPresent = true;

  requiredScripts.forEach(script => {
    if (!pkg.scripts || !pkg.scripts[script]) {
      log(`  ✗ Missing script: ${script}`, 'red');
      allPresent = false;
    }
  });

  if (allPresent) {
    log('✓ package.json has all required scripts', 'green');
  }
  return allPresent;
}

function checkGitignore() {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    log('✗ .gitignore not found', 'red');
    return false;
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    '.env',
    '.env.local',
    'node_modules',
    '.next',
  ];

  let allPresent = true;
  requiredPatterns.forEach(pattern => {
    if (!content.includes(pattern)) {
      log(`  ✗ Missing pattern: ${pattern}`, 'red');
      allPresent = false;
    }
  });

  if (allPresent) {
    log('✓ .gitignore contains all required patterns', 'green');
  }
  return allPresent;
}

function checkVercelJson() {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    log('✗ vercel.json not found', 'red');
    return false;
  }

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  
  if (!config.buildCommand || !config.buildCommand.includes('frontend')) {
    log('  ✗ buildCommand not configured correctly', 'red');
    return false;
  }

  if (!config.outputDirectory || !config.outputDirectory.includes('.next')) {
    log('  ✗ outputDirectory not configured correctly', 'red');
    return false;
  }

  log('✓ vercel.json configured correctly', 'green');
  return true;
}

function checkTests() {
  const testFiles = [
    'frontend/src/services/__tests__/role-suggestion.service.test.ts',
    'frontend/src/services/__tests__/role-validation.service.test.ts',
    'frontend/src/app/(dashboard)/analysis/new/__tests__/auto-continue.test.tsx',
  ];

  let allPresent = true;
  testFiles.forEach(file => {
    if (!fs.existsSync(path.join(ROOT_DIR, file))) {
      log(`  ✗ Missing test file: ${file}`, 'red');
      allPresent = false;
    }
  });

  if (allPresent) {
    log('✓ All required test files present', 'green');
  }
  return allPresent;
}

function checkMigrations() {
  const migrationFile = 'supabase/migrations/20241110_variable_role_tags.sql';
  if (!fs.existsSync(path.join(ROOT_DIR, migrationFile))) {
    log('✗ Database migration file missing', 'red');
    return false;
  }

  log('✓ Database migration file present', 'green');
  return true;
}

function main() {
  log('\n🚀 NCSKIT v2.0 - Deployment Verification\n', 'blue');

  let allChecks = true;

  // Configuration Files
  log('📋 Configuration Files:', 'yellow');
  allChecks &= checkFile('vercel.json', 'vercel.json');
  allChecks &= checkFile('frontend/next.config.ts', 'next.config.ts');
  allChecks &= checkFile('frontend/package.json', 'package.json');
  allChecks &= checkFile('.gitignore', '.gitignore');
  console.log();

  // Environment Variables
  log('🔐 Environment Variables:', 'yellow');
  allChecks &= checkEnvExample();
  console.log();

  // Package Configuration
  log('📦 Package Configuration:', 'yellow');
  allChecks &= checkPackageJson();
  console.log();

  // Security
  log('🛡️ Security:', 'yellow');
  allChecks &= checkGitignore();
  console.log();

  // Vercel Configuration
  log('☁️ Vercel Configuration:', 'yellow');
  allChecks &= checkVercelJson();
  console.log();

  // Tests
  log('🧪 Tests:', 'yellow');
  allChecks &= checkTests();
  console.log();

  // Database
  log('🗄️ Database:', 'yellow');
  allChecks &= checkMigrations();
  console.log();

  // Documentation
  log('📚 Documentation:', 'yellow');
  allChecks &= checkFile('DEPLOYMENT_GUIDE.md', 'Deployment Guide');
  allChecks &= checkFile('DEPLOYMENT_CHECKLIST.md', 'Deployment Checklist');
  allChecks &= checkFile('RELEASE_NOTES_v2.0.md', 'Release Notes');
  console.log();

  // Final Result
  if (allChecks) {
    log('✅ All checks passed! Ready for deployment.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Review DEPLOYMENT_CHECKLIST.md');
    log('2. Configure environment variables in Vercel');
    log('3. Push to GitHub');
    log('4. Deploy to Vercel');
    process.exit(0);
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

main();
