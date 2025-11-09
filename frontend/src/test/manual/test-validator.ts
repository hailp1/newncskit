/**
 * Manual Test Script for Validator
 * Run with: npx tsx frontend/src/test/manual/test-validator.ts
 */

import { Validator } from '../../services/validator';

console.log('=== Testing Validator Utility ===\n');

// Test 1: Email Validation
console.log('--- Test 1: Email Validation ---');
const emailTests = [
  { email: 'test@example.com', expected: true },
  { email: 'user.name+tag@example.co.uk', expected: true },
  { email: 'invalid.email', expected: false },
  { email: 'test@', expected: false },
  { email: '@example.com', expected: false },
  { email: 'test..user@example.com', expected: false },
  { email: '', expected: false },
  { email: 'a'.repeat(65) + '@example.com', expected: false }, // Local part too long
];

emailTests.forEach(({ email, expected }) => {
  const result = Validator.validateEmail(email);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} Email: "${email}" => ${result} (expected: ${expected})`);
});

// Test 2: ORCID Validation
console.log('\n--- Test 2: ORCID Validation ---');
const orcidTests = [
  { orcid: '0000-0002-1825-0097', expected: true }, // Valid ORCID
  { orcid: '0000-0001-5109-3700', expected: true }, // Valid ORCID
  { orcid: '0000-0002-1694-233X', expected: true }, // Valid ORCID with X
  { orcid: '0000-0000-0000-0000', expected: false }, // Invalid checksum
  { orcid: '1234-5678-9012-3456', expected: false }, // Invalid checksum
  { orcid: '0000-0002-1825-009', expected: false }, // Too short
  { orcid: 'invalid-orcid', expected: false },
  { orcid: '', expected: false },
];

orcidTests.forEach(({ orcid, expected }) => {
  const result = Validator.validateOrcidId(orcid);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} ORCID: "${orcid}" => ${result} (expected: ${expected})`);
});

// Test 3: Password Validation
console.log('\n--- Test 3: Password Validation ---');
const passwordTests = [
  { password: 'StrongPass1', expected: true },
  { password: 'MyP@ssw0rd', expected: true },
  { password: 'weak', expected: false }, // Too short
  { password: 'nouppercase1', expected: false }, // No uppercase
  { password: 'NOLOWERCASE1', expected: false }, // No lowercase
  { password: 'NoNumbers', expected: false }, // No numbers
  { password: 'Password123', expected: false }, // Common password
  { password: 'Abc12345', expected: false }, // Sequential characters
  { password: 'Aaa11111', expected: false }, // Repeated characters
  { password: '', expected: false },
];

passwordTests.forEach(({ password, expected }) => {
  const result = Validator.validatePassword(password);
  const status = result.isValid === expected ? '✓' : '✗';
  console.log(`${status} Password: "${password}" => ${result.isValid} (expected: ${expected})`);
  if (!result.isValid && result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

// Test 4: Input Sanitization
console.log('\n--- Test 4: Input Sanitization ---');
const sanitizeTests = [
  { input: '<script>alert("XSS")</script>', expected: '' },
  { input: 'Hello <b>World</b>', expected: 'Hello World' },
  { input: 'Test & "quotes"', expected: 'Test &amp; &quot;quotes&quot;' },
  { input: "It's a test", expected: "It&#x27;s a test" },
  { input: 'Normal text', expected: 'Normal text' },
  { input: '<img src=x onerror=alert(1)>', expected: '' },
];

sanitizeTests.forEach(({ input, expected }) => {
  const result = Validator.sanitizeInput(input);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} Input: "${input}"`);
  console.log(`   Result: "${result}"`);
  console.log(`   Expected: "${expected}"`);
});

// Test 5: SQL Injection Prevention
console.log('\n--- Test 5: SQL Injection Prevention ---');
const sqlTests = [
  { input: 'Normal text', expected: true },
  { input: "SELECT * FROM users", expected: false },
  { input: "'; DROP TABLE users--", expected: false },
  { input: "1' OR '1'='1", expected: false },
  { input: "admin'--", expected: false },
  { input: "user@example.com", expected: true },
];

sqlTests.forEach(({ input, expected }) => {
  const result = Validator.isSqlSafe(input);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} SQL Safe: "${input}" => ${result} (expected: ${expected})`);
});

// Test 6: Name Validation
console.log('\n--- Test 6: Name Validation ---');
const nameTests = [
  { name: 'John Doe', expected: true },
  { name: "O'Brien", expected: true },
  { name: 'Mary-Jane', expected: true },
  { name: 'Nguyễn Văn A', expected: true },
  { name: 'John123', expected: false }, // Contains numbers
  { name: '', expected: false },
  { name: '   ', expected: false },
  { name: 'A'.repeat(256), expected: false }, // Too long
];

nameTests.forEach(({ name, expected }) => {
  const result = Validator.validateName(name);
  const status = result.isValid === expected ? '✓' : '✗';
  console.log(`${status} Name: "${name}" => ${result.isValid} (expected: ${expected})`);
  if (!result.isValid && result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

// Test 7: URL Validation
console.log('\n--- Test 7: URL Validation ---');
const urlTests = [
  { url: 'https://example.com', expected: true },
  { url: 'http://test.org/path', expected: true },
  { url: 'ftp://example.com', expected: false }, // Not http/https
  { url: 'javascript:alert(1)', expected: false },
  { url: 'not-a-url', expected: false },
  { url: '', expected: false },
];

urlTests.forEach(({ url, expected }) => {
  const result = Validator.validateUrl(url);
  const status = result === expected ? '✓' : '✗';
  console.log(`${status} URL: "${url}" => ${result} (expected: ${expected})`);
});

// Test 8: Research Domains Validation
console.log('\n--- Test 8: Research Domains Validation ---');
const domainTests = [
  { domains: ['AI', 'Machine Learning'], expected: true },
  { domains: [], expected: true }, // Empty is valid
  { domains: ['A'.repeat(101)], expected: false }, // Too long
  { domains: Array(11).fill('Domain'), expected: false }, // Too many
  { domains: ['Valid', ''], expected: false }, // Empty string in array
];

domainTests.forEach(({ domains, expected }) => {
  const result = Validator.validateResearchDomains(domains);
  const status = result.isValid === expected ? '✓' : '✗';
  console.log(`${status} Domains: [${domains.length} items] => ${result.isValid} (expected: ${expected})`);
  if (!result.isValid && result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

// Test 9: HTML Sanitization
console.log('\n--- Test 9: HTML Sanitization ---');
const htmlTests = [
  { 
    html: '<p>Hello <b>World</b></p>', 
    allowedTags: ['p', 'b'],
    shouldContain: ['<p>', '<b>', 'Hello', 'World']
  },
  { 
    html: '<script>alert(1)</script><p>Safe</p>', 
    allowedTags: ['p'],
    shouldContain: ['<p>', 'Safe'],
    shouldNotContain: ['<script>', 'alert']
  },
  { 
    html: '<div onclick="alert(1)">Click</div>', 
    allowedTags: [],
    shouldContain: ['Click'],
    shouldNotContain: ['onclick', 'alert', '<div>']
  },
];

htmlTests.forEach(({ html, allowedTags, shouldContain, shouldNotContain }) => {
  const result = Validator.sanitizeHtml(html, allowedTags);
  console.log(`Input: "${html}"`);
  console.log(`Result: "${result}"`);
  
  let allPassed = true;
  if (shouldContain) {
    shouldContain.forEach(text => {
      if (!result.includes(text)) {
        console.log(`  ✗ Should contain: "${text}"`);
        allPassed = false;
      }
    });
  }
  if (shouldNotContain) {
    shouldNotContain.forEach(text => {
      if (result.includes(text)) {
        console.log(`  ✗ Should NOT contain: "${text}"`);
        allPassed = false;
      }
    });
  }
  
  if (allPassed) {
    console.log('  ✓ All checks passed');
  }
});

// Test 10: Comprehensive Validation and Sanitization
console.log('\n--- Test 10: Comprehensive Validation and Sanitization ---');
const comprehensiveTests = [
  { input: 'test@example.com', type: 'email' as const, shouldPass: true },
  { input: '<script>test@example.com</script>', type: 'email' as const, shouldPass: false },
  { input: '0000-0002-1825-0097', type: 'orcid' as const, shouldPass: true },
  { input: 'John Doe', type: 'name' as const, shouldPass: true },
  { input: 'https://example.com', type: 'url' as const, shouldPass: true },
  { input: 'Normal text', type: 'text' as const, shouldPass: true },
  { input: "SELECT * FROM users", type: 'text' as const, shouldPass: false },
];

comprehensiveTests.forEach(({ input, type, shouldPass }) => {
  const result = Validator.validateAndSanitize(input, type);
  const passed = shouldPass ? result !== null : result === null;
  const status = passed ? '✓' : '✗';
  console.log(`${status} Type: ${type}, Input: "${input}" => ${result !== null ? 'Valid' : 'Invalid'} (expected: ${shouldPass ? 'Valid' : 'Invalid'})`);
});

console.log('\n=== All Tests Complete ===');
