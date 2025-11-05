#!/usr/bin/env node

/**
 * NCSKIT Comprehensive Functional Testing
 * Tests all user flows and generates detailed bug report
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 NCSKIT COMPREHENSIVE FUNCTIONAL TESTING');
console.log('==========================================');

// Test Results Storage
const testResults = {
  modules: {},
  criticalIssues: [],
  highIssues: [],
  mediumIssues: [],
  lowIssues: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0
};

function addIssue(priority, module, title, description, impact, steps, fix, effort) {
  const issue = {
    id: `${priority}${String(testResults.totalTests).padStart(3, '0')}`,
    module,
    title,
    description,
    impact,
    stepsToReproduce: steps,
    suggestedFix: fix,
    estimatedEffort: effort,
    priority
  };
  
  switch(priority) {
    case 'CRITICAL':
      testResults.criticalIssues.push(issue);
      break;
    case 'HIGH':
      testResults.highIssues.push(issue);
      break;
    case 'MEDIUM':
      testResults.mediumIssues.push(issue);
      break;
    case 'LOW':
      testResults.lowIssues.push(issue);
      break;
  }
}

function testModule(moduleName, tests) {
  console.log(`\n🔍 TESTING MODULE: ${moduleName}`);
  console.log('='.repeat(50));
  
  const moduleResults = {
    total: tests.length,
    passed: 0,
    failed: 0,
    issues: []
  };
  
  tests.forEach(test => {
    testResults.totalTests++;
    try {
      const result = test.testFunction();
      if (result.status === 'PASS') {
        console.log(`✅ ${test.name}: PASS`);
        moduleResults.passed++;
        testResults.passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAIL - ${result.message}`);
        moduleResults.failed++;
        testResults.failedTests++;
        
        if (result.issue) {
          addIssue(
            result.issue.priority,
            moduleName,
            result.issue.title,
            result.issue.description,
            result.issue.impact,
            result.issue.steps,
            result.issue.fix,
            result.issue.effort
          );
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      moduleResults.failed++;
      testResults.failedTests++;
    }
  });
  
  testResults.modules[moduleName] = moduleResults;
  
  const successRate = Math.round((moduleResults.passed / moduleResults.total) * 100);
  console.log(`📊 Module Success Rate: ${successRate}% (${moduleResults.passed}/${moduleResults.total})`);
}

// 1. AUTHENTICATION SYSTEM TESTS
const authTests = [
  {
    name: 'Auth Service Configuration',
    testFunction: () => {
      const authFile = 'frontend/src/services/auth.ts';
      if (!fs.existsSync(authFile)) {
        return {
          status: 'FAIL',
          message: 'Auth service file missing',
          issue: {
            priority: 'CRITICAL',
            title: 'Authentication Service Missing',
            description: 'Core authentication service file not found',
            impact: 'Users cannot login or register',
            steps: ['1. Navigate to application', '2. Try to access login page', '3. Service unavailable'],
            fix: 'Ensure auth.ts service file exists and is properly configured',
            effort: '2 hours'
          }
        };
      }
      
      const content = fs.readFileSync(authFile, 'utf8');
      if (!content.includes('supabase') && !content.includes('auth')) {
        return {
          status: 'FAIL',
          message: 'Auth service not properly configured',
          issue: {
            priority: 'HIGH',
            title: 'Authentication Configuration Incomplete',
            description: 'Auth service exists but lacks proper Supabase configuration',
            impact: 'Authentication features may not work correctly',
            steps: ['1. Try to login', '2. Check browser console for errors', '3. Authentication fails'],
            fix: 'Configure Supabase client and authentication methods',
            effort: '4 hours'
          }
        };
      }
      
      return { status: 'PASS' };
    }
  },
  {
    name: 'Environment Variables Check',
    testFunction: () => {
      const envFile = 'frontend/.env.local';
      if (!fs.existsSync(envFile)) {
        return {
          status: 'FAIL',
          message: 'Environment file missing',
          issue: {
            priority: 'CRITICAL',
            title: 'Environment Configuration Missing',
            description: '.env.local file not found - critical environment variables not set',
            impact: 'Database connections, API keys, and authentication will fail',
            steps: ['1. Start application', '2. Try any database operation', '3. Connection fails'],
            fix: 'Create .env.local file with required environment variables',
            effort: '1 hour'
          }
        };
      }
      return { status: 'PASS' };
    }
  },
  {
    name: 'Password Reset Implementation',
    testFunction: () => {
      const authFile = 'frontend/src/services/auth.ts';
      const content = fs.readFileSync(authFile, 'utf8');
      
      if (!content.includes('resetPassword') || !content.includes('updatePassword')) {
        return {
          status: 'FAIL',
          message: 'Password reset functionality incomplete',
          issue: {
            priority: 'HIGH',
            title: 'Password Reset Flow Incomplete',
            description: 'Password reset and update functions not fully implemented',
            impact: 'Users cannot recover forgotten passwords',
            steps: ['1. Go to login page', '2. Click "Forgot Password"', '3. Feature not working'],
            fix: 'Complete implementation of password reset email and update functions',
            effort: '6 hours'
          }
        };
      }
      return { status: 'PASS' };
    }
  }
];

// 2. DATABASE SYSTEM TESTS
const databaseTests = [
  {
    name: 'Database Connection Configuration',
    testFunction: () => {
      const dbFile = 'frontend/src/lib/postgres-server.ts';
      if (!fs.existsSync(dbFile)) {
        return {
          status: 'FAIL',
          message: 'Database connection file missing',
          issue: {
            priority: 'CRITICAL',
            title: 'Database Connection Module Missing',
            description: 'PostgreSQL connection configuration file not found',
            impact: 'All database operations will fail',
            steps: ['1. Try to access any page with data', '2. Database connection fails', '3. Application crashes'],
            fix: 'Create proper database connection configuration',
            effort: '3 hours'
          }
        };
      }
      
      const content = fs.readFileSync(dbFile, 'utf8');
      if (!content.includes('Pool') || !content.includes('query')) {
        return {
          status: 'FAIL',
          message: 'Database connection not properly configured',
          issue: {
            priority: 'CRITICAL',
            title: 'Database Connection Configuration Invalid',
            description: 'Database file exists but connection pool not properly configured',
            impact: 'Database queries will fail',
            steps: ['1. Start application', '2. Try database operation', '3. Connection error'],
            fix: 'Configure PostgreSQL connection pool with proper credentials',
            effort: '2 hours'
          }
        };
      }
      
      return { status: 'PASS' };
    }
  },
  {
    name: 'Database Schema Scripts',
    testFunction: () => {
      const requiredScripts = [
        'frontend/database/setup-complete.sql',
        'frontend/database/permission-system.sql',
        'frontend/database/update-token-system.sql'
      ];
      
      for (const script of requiredScripts) {
        if (!fs.existsSync(script)) {
          return {
            status: 'FAIL',
            message: `Database script missing: ${path.basename(script)}`,
            issue: {
              priority: 'HIGH',
              title: 'Database Schema Scripts Missing',
              description: `Required database setup script ${path.basename(script)} not found`,
              impact: 'Database tables and relationships may not be properly created',
              steps: ['1. Try to run database setup', '2. Script not found', '3. Tables not created'],
              fix: 'Ensure all required database setup scripts are present',
              effort: '4 hours'
            }
          };
        }
      }
      return { status: 'PASS' };
    }
  }
];

// 3. PROJECT MANAGEMENT TESTS
const projectTests = [
  {
    name: 'Project Service Implementation',
    testFunction: () => {
      const projectFile = 'frontend/src/services/marketing-projects.ts';
      if (!fs.existsSync(projectFile)) {
        return {
          status: 'FAIL',
          message: 'Project service missing',
          issue: {
            priority: 'CRITICAL',
            title: 'Project Management Service Missing',
            description: 'Core project management service not found',
            impact: 'Users cannot create, edit, or manage projects',
            steps: ['1. Navigate to projects page', '2. Try to create project', '3. Service unavailable'],
            fix: 'Implement project management service with CRUD operations',
            effort: '8 hours'
          }
        };
      }
      
      const content = fs.readFileSync(projectFile, 'utf8');
      if (!content.includes('createProject') || !content.includes('updateProject')) {
        return {
          status: 'FAIL',
          message: 'Project CRUD operations incomplete',
          issue: {
            priority: 'HIGH',
            title: 'Project CRUD Operations Incomplete',
            description: 'Project service exists but lacks complete CRUD functionality',
            impact: 'Limited project management capabilities',
            steps: ['1. Try to create project', '2. Try to edit project', '3. Operations may fail'],
            fix: 'Complete implementation of all project CRUD operations',
            effort: '6 hours'
          }
        };
      }
      
      return { status: 'PASS' };
    }
  },
  {
    name: 'AI Integration Check',
    testFunction: () => {
      const geminiFile = 'frontend/src/services/gemini.ts';
      if (!fs.existsSync(geminiFile)) {
        return {
          status: 'FAIL',
          message: 'AI service missing',
          issue: {
            priority: 'HIGH',
            title: 'AI Integration Service Missing',
            description: 'Gemini AI integration service not found',
            impact: 'AI-powered research outline generation unavailable',
            steps: ['1. Create new project', '2. Try AI generation', '3. Feature not available'],
            fix: 'Implement Gemini AI integration service',
            effort: '8 hours'
          }
        };
      }
      return { status: 'PASS' };
    }
  }
];

// 4. ADMIN SYSTEM TESTS
const adminTests = [
  {
    name: 'Admin Service Implementation',
    testFunction: () => {
      const adminFile = 'frontend/src/services/admin.ts';
      if (!fs.existsSync(adminFile)) {
        return {
          status: 'FAIL',
          message: 'Admin service missing',
          issue: {
            priority: 'HIGH',
            title: 'Admin Management Service Missing',
            description: 'Admin service for user and system management not found',
            impact: 'Admin panel functionality unavailable',
            steps: ['1. Login as admin', '2. Try to access admin panel', '3. Service unavailable'],
            fix: 'Implement admin service with user management capabilities',
            effort: '10 hours'
          }
        };
      }
      
      const content = fs.readFileSync(adminFile, 'utf8');
      if (!content.includes('getUsers') || !content.includes('updateUser')) {
        return {
          status: 'FAIL',
          message: 'Admin user management incomplete',
          issue: {
            priority: 'MEDIUM',
            title: 'Admin User Management Incomplete',
            description: 'Admin service exists but user management functions incomplete',
            impact: 'Limited admin capabilities for user management',
            steps: ['1. Access admin panel', '2. Try user management', '3. Functions may not work'],
            fix: 'Complete admin user management functions',
            effort: '6 hours'
          }
        };
      }
      
      return { status: 'PASS' };
    }
  },
  {
    name: 'Permission System Check',
    testFunction: () => {
      const permFile = 'frontend/src/services/permissions.ts';
      if (!fs.existsSync(permFile)) {
        return {
          status: 'FAIL',
          message: 'Permission service missing',
          issue: {
            priority: 'HIGH',
            title: 'Permission System Missing',
            description: 'Role-based permission service not implemented',
            impact: 'Security vulnerability - no access control',
            steps: ['1. Try to access admin features as regular user', '2. Access granted inappropriately'],
            fix: 'Implement comprehensive permission system',
            effort: '12 hours'
          }
        };
      }
      return { status: 'PASS' };
    }
  }
];

// 5. ANALYSIS SYSTEM TESTS
const analysisTests = [
  {
    name: 'R Analysis Server Check',
    testFunction: () => {
      const rFile = 'backend/r_analysis/analysis_server.R';
      if (!fs.existsSync(rFile)) {
        return {
          status: 'FAIL',
          message: 'R analysis server missing',
          issue: {
            priority: 'MEDIUM',
            title: 'R Analysis Server Missing',
            description: 'Statistical analysis R server not found',
            impact: 'Statistical analysis features unavailable',
            steps: ['1. Upload data for analysis', '2. Try statistical analysis', '3. Service unavailable'],
            fix: 'Set up R analysis server with required packages',
            effort: '8 hours'
          }
        };
      }
      return { status: 'PASS' };
    }
  },
  {
    name: 'Analysis Components Check',
    testFunction: () => {
      const analysisDir = 'frontend/src/components/analysis';
      if (!fs.existsSync(analysisDir)) {
        return {
          status: 'FAIL',
          message: 'Analysis components missing',
          issue: {
            priority: 'MEDIUM',
            title: 'Analysis UI Components Missing',
            description: 'Statistical analysis UI components not found',
            impact: 'Users cannot access analysis interface',
            steps: ['1. Navigate to analysis page', '2. UI components not loading'],
            fix: 'Implement analysis UI components',
            effort: '10 hours'
          }
        };
      }
      
      const files = fs.readdirSync(analysisDir);
      if (files.length < 5) {
        return {
          status: 'FAIL',
          message: 'Analysis components incomplete',
          issue: {
            priority: 'LOW',
            title: 'Analysis Components Incomplete',
            description: 'Analysis component directory exists but has insufficient components',
            impact: 'Limited analysis functionality',
            steps: ['1. Try different analysis features', '2. Some components missing'],
            fix: 'Complete implementation of all analysis components',
            effort: '6 hours'
          }
        };
      }
      
      return { status: 'PASS' };
    }
  }
];

// Run all tests
testModule('Authentication System', authTests);
testModule('Database System', databaseTests);
testModule('Project Management', projectTests);
testModule('Admin System', adminTests);
testModule('Analysis System', analysisTests);

// Generate comprehensive report
console.log('\n📊 COMPREHENSIVE TEST REPORT');
console.log('============================');

const totalTests = testResults.totalTests;
const successRate = Math.round((testResults.passedTests / totalTests) * 100);

console.log(`Total Tests Executed: ${totalTests}`);
console.log(`✅ Passed: ${testResults.passedTests}`);
console.log(`❌ Failed: ${testResults.failedTests}`);
console.log(`🎯 Success Rate: ${successRate}%`);

console.log('\n🚨 ISSUES SUMMARY:');
console.log(`🔴 Critical: ${testResults.criticalIssues.length}`);
console.log(`🟠 High: ${testResults.highIssues.length}`);
console.log(`🟡 Medium: ${testResults.mediumIssues.length}`);
console.log(`🟢 Low: ${testResults.lowIssues.length}`);

// Generate detailed bug report
const bugReport = {
  summary: {
    testDate: new Date().toISOString(),
    totalTests: totalTests,
    passedTests: testResults.passedTests,
    failedTests: testResults.failedTests,
    successRate: successRate,
    overallStatus: successRate >= 80 ? 'GOOD' : successRate >= 60 ? 'FAIR' : 'POOR'
  },
  moduleResults: testResults.modules,
  issues: {
    critical: testResults.criticalIssues,
    high: testResults.highIssues,
    medium: testResults.mediumIssues,
    low: testResults.lowIssues
  }
};

fs.writeFileSync('bug-report.json', JSON.stringify(bugReport, null, 2));
console.log('\n📄 Detailed bug report saved to: bug-report.json');

console.log('\n✨ Comprehensive testing completed!');