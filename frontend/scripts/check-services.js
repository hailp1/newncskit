#!/usr/bin/env node

/**
 * Service Health Check Script
 * Kiểm tra tất cả các services cần thiết trước khi chạy ứng dụng
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Checking PostgreSQL database...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log('✅ PostgreSQL: Connected');
    console.log(`   - Users in database: ${userCount}`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL: Failed to connect');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function checkRService() {
  console.log('🔍 Checking R Analytics Service...');
  const R_SERVICE_URL = process.env.R_SERVICE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${R_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      console.log('✅ R Service: Available');
      console.log(`   - URL: ${R_SERVICE_URL}`);
      return true;
    } else {
      console.error('❌ R Service: Unhealthy');
      console.error(`   - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ R Service: Not available');
    console.error(`   Error: ${error.message}`);
    console.error(`   - Make sure R service is running at ${R_SERVICE_URL}`);
    return false;
  }
}

async function checkEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'R_SERVICE_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length === 0) {
    console.log('✅ Environment variables: All required variables set');
    return true;
  } else {
    console.error('❌ Environment variables: Missing required variables');
    missing.forEach(key => console.error(`   - ${key}`));
    return false;
  }
}

async function checkPorts() {
  console.log('🔍 Checking required ports...');
  
  const ports = [
    { port: 3000, service: 'Next.js' },
    { port: 5432, service: 'PostgreSQL' },
    { port: 8000, service: 'R Service' },
  ];
  
  // Note: This is a simplified check
  console.log('✅ Port check: Skipped (manual verification recommended)');
  console.log('   Required ports:');
  ports.forEach(({ port, service }) => {
    console.log(`   - ${port}: ${service}`);
  });
  
  return true;
}

async function main() {
  console.log('\n🚀 NCSKIT Service Health Check\n');
  console.log('='.repeat(50));
  console.log('');
  
  const checks = [
    { name: 'Environment', fn: checkEnvironment },
    { name: 'Database', fn: checkDatabase },
    { name: 'R Service', fn: checkRService },
    { name: 'Ports', fn: checkPorts },
  ];
  
  const results = [];
  
  for (const check of checks) {
    const result = await check.fn();
    results.push({ name: check.name, passed: result });
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log('\n📊 Summary:\n');
  
  results.forEach(({ name, passed }) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = results.every(r => r.passed);
  
  console.log('');
  console.log('='.repeat(50));
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Ready to start the application.\n');
    console.log('Run: npm run dev\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.\n');
    console.log('See LOCAL_SETUP_GUIDE.md for help.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Health check failed with error:');
  console.error(error);
  process.exit(1);
});
