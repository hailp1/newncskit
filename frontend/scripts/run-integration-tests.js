#!/usr/bin/env node

/**
 * Integration Test Runner
 * 
 * This script runs integration tests and provides a summary report.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Integration Tests...\n');

try {
  // Run vitest with integration tests
  execSync('npm run test -- src/__tests__/integration', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });

  console.log('\n✅ All integration tests passed!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Integration tests failed!\n');
  process.exit(1);
}
