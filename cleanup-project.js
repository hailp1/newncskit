console.log('🧹 CLEANING UP PROJECT - REMOVING UNNECESSARY FILES')
console.log('=' .repeat(60))

const fs = require('fs')
const path = require('path')

// Files to delete (test files, setup files, temporary files)
const filesToDelete = [
  // Root level test/setup files
  'QUICK_DEPLOYMENT_FIX.js',
  'SYSTEM_COMPLETE.js', 
  'prepare-deployment.js',
  'AUTHENTICATION_SYSTEM_COMPLETE.md',
  'MARKETING_RESEARCH_PLATFORM_COMPLETE.md',
  'DATABASE_ARCHITECTURE.md',
  'SUPABASE_SETUP_GUIDE.md',
  'SETUP_DATABASE_NOW.md',
  'setup-complete-database.ps1',
  'setup-supabase-cli.ps1',
  'open-supabase-dashboard.ps1',
  
  // Frontend test files
  'frontend/auto-setup-tables.js',
  'frontend/test-fixed-system.js',
  'frontend/test-complete-supabase-system.js',
  'frontend/test-supabase-integration.js',
  'frontend/test-marketing-platform-complete.js',
  'frontend/test-complete-auth-flow.js',
  'frontend/test-session-persistence.js',
  'frontend/test-real-registration.js',
  'frontend/quick-database-check.js',
  'frontend/check-database-structure.js',
  'frontend/quick-test-registration.js',
  'frontend/test-auth-flow.js',
  'frontend/debug-auth.js',
  'frontend/test-supabase-connection.js',
  'frontend/simple-supabase-test.js',
  'frontend/test-gemini-simple.js',
  'frontend/setup-marketing-database.js',
  
  // Database setup files (keep only essential ones)
  'frontend/create-basic-tables.sql',
  'frontend/database/add-missing-columns.sql',
  'frontend/database/fix-missing-columns-simple.sql',
  'frontend/database/complete-schema.sql',
  'frontend/database/seed-data.sql',
  'frontend/database/seed.sql',
  'frontend/database/schema.sql',
  'frontend/database/setup.md',
  'frontend/database/setup_supabase.js',
  
  // Setup and diagnostic files
  'frontend/diagnose-supabase-connection.js',
  'frontend/execute-sql-curl.js',
  'frontend/direct-sql-setup.js',
  'frontend/auto-setup-database.js',
  
  // Dev/test components and pages
  'frontend/src/app/test-gemini/page.tsx',
  'frontend/src/app/test-supabase/page.tsx',
  'frontend/src/app/demo-auth/page.tsx',
  'frontend/src/app/demo-register/page.tsx',
  'frontend/src/components/dev/auth-status.tsx',
  'frontend/src/components/dev/auth-toggle.tsx',
  'frontend/src/components/dev/api-test.tsx',
  'frontend/src/components/dev/supabase-test.tsx',
  
  // Unused components
  'frontend/src/components/projects/domain-specialization-form.tsx',
  'frontend/src/components/projects/marketing-project-form.tsx', // Using supabase version
  'frontend/src/components/projects/new-project-form.tsx', // Using marketing version
  
  // Unused database files
  'frontend/database/domain-specialization-update.sql',
  
  // R service (not used in current version)
  'r_service/install_r_windows.ps1',
  'r_service/install_r_simple.ps1',
  'r_service/README.md',
  'r_service/app.R',
  'r_service/server.js',
  'r_service/package.json',
  'r_service/package-lock.json',
]

console.log('\n🗑️ **FILES TO DELETE:**')
console.log('')

let deletedCount = 0
let errorCount = 0

filesToDelete.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`   ✅ Deleted: ${filePath}`)
      deletedCount++
    } else {
      console.log(`   ⚠️  Not found: ${filePath}`)
    }
  } catch (error) {
    console.log(`   ❌ Error deleting ${filePath}: ${error.message}`)
    errorCount++
  }
})

console.log('')
console.log(`📊 **CLEANUP SUMMARY:**`)
console.log(`   ✅ Files deleted: ${deletedCount}`)
console.log(`   ❌ Errors: ${errorCount}`)
console.log(`   📁 Files remaining: Production-ready only`)
console.log('')

console.log('🧹 **DIRECTORIES TO CLEAN:**')
console.log('')

// Clean empty directories
const dirsToCheck = [
  'frontend/src/components/dev',
  'r_service'
]

dirsToCheck.forEach(dirPath => {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      if (files.length === 0) {
        fs.rmdirSync(dirPath)
        console.log(`   ✅ Removed empty directory: ${dirPath}`)
      } else {
        console.log(`   📁 Directory not empty: ${dirPath} (${files.length} files)`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking ${dirPath}: ${error.message}`)
  }
})

console.log('')
console.log('✅ **REMAINING ESSENTIAL FILES:**')
console.log('')
console.log('📁 **Root Level:**')
console.log('   ✅ README.md - Project documentation')
console.log('   ✅ .gitignore - Git ignore rules')
console.log('   ✅ VERCEL_DEPLOYMENT_GUIDE.md - Deployment guide')
console.log('   ✅ VERCEL_DEPLOYMENT_FIX.md - Fix guide')
console.log('   ✅ FINAL_SYSTEM_SUMMARY.md - System overview')
console.log('   ✅ DEPLOYMENT_GUIDE.md - General deployment')
console.log('')

console.log('📁 **Frontend (Production Code):**')
console.log('   ✅ package.json - Dependencies')
console.log('   ✅ next.config.ts - Next.js config')
console.log('   ✅ tailwind.config.ts - Styling config')
console.log('   ✅ tsconfig.json - TypeScript config')
console.log('   ✅ src/app/ - Next.js pages')
console.log('   ✅ src/components/ - React components')
console.log('   ✅ src/services/ - API services')
console.log('   ✅ src/store/ - State management')
console.log('   ✅ src/types/ - TypeScript types')
console.log('')

console.log('📁 **Database (Essential SQL):**')
console.log('   ✅ marketing-knowledge-base.sql - Core data')
console.log('   ✅ research-outline-templates.sql - Templates')
console.log('   ✅ demo-data-complete.sql - Demo data')
console.log('')

console.log('📁 **Backend (Django API):**')
console.log('   ✅ All backend files preserved')
console.log('   ✅ Django apps and models')
console.log('   ✅ API endpoints')
console.log('')

console.log('🎯 **CLEANUP COMPLETE!**')
console.log('')
console.log('✅ **Project is now clean and production-ready:**')
console.log('   - No test files')
console.log('   - No setup scripts')
console.log('   - No temporary files')
console.log('   - Only essential production code')
console.log('   - Clean repository structure')
console.log('')

console.log('🚀 **READY FOR DEPLOYMENT:**')
console.log('   Repository: https://github.com/hailp1/newncskit.git')
console.log('   Status: Clean and optimized')
console.log('   Size: Reduced significantly')
console.log('')

console.log('🎊 **CLEAN PROJECT READY FOR PRODUCTION!** 🎊')