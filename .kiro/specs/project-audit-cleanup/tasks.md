# Implementation Plan - Project Audit & Cleanup

## Task List

- [x] 1. Fix Critical Security Issues (URGENT)


  - Fix hardcoded Gemini API key and exposed credentials
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 1.1 Remove hardcoded Gemini API key from code


  - Update `frontend/src/services/gemini.ts` to use environment variable
  - Add `GEMINI_API_KEY` to `.env.example` with placeholder
  - Add `GEMINI_API_KEY` to `.env.local` with actual key
  - Add validation to throw error if key is missing
  - _Requirements: 4.2_

- [x] 1.2 Remove Supabase credentials from environment files


  - Remove all `SUPABASE_*` and `NEXT_PUBLIC_SUPABASE_*` variables from `frontend/.env.local`
  - Remove all `SUPABASE_*` variables from `frontend/.env.production`
  - Remove all `SUPABASE_*` variables from `.env.production`
  - Update `frontend/.env.example` to remove Supabase sections
  - _Requirements: 4.1, 4.3_

- [x] 1.3 Verify no other hardcoded secrets exist


  - Search codebase for potential hardcoded API keys, tokens, passwords
  - Document any findings and create follow-up tasks if needed
  - _Requirements: 4.2_

- [x] 2. Create Comprehensive Backups


  - Create backups of all code and files before deletion
  - _Requirements: 7.1_

- [x] 2.1 Backup Django backend directory


  - Create `.backup/django-backend-{timestamp}/` directory
  - Copy entire `backend/` directory to backup location
  - Verify backup integrity
  - _Requirements: 2.4_

- [x] 2.2 Backup Supabase configuration and code


  - Create `.backup/supabase-config-{timestamp}/` directory
  - Copy `supabase/` directory to backup
  - Copy Supabase-related code files to `.backup/supabase-code-{timestamp}/`
  - _Requirements: 3.3_

- [x] 2.3 Backup legacy documentation files



  - Create `.backup/legacy-docs-{timestamp}/` directory
  - Copy all obsolete .md files from root to backup
  - Create manifest file listing all backed up docs
  - _Requirements: 1.5_

- [x] 3. Remove Supabase Legacy Code


  - Refactor services to use Prisma instead of Supabase client
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 3.1 Delete Supabase library files


  - Delete `frontend/src/lib/supabase/client.ts`
  - Delete `frontend/src/lib/supabase/auth.ts`
  - Delete entire `frontend/src/lib/supabase/` directory if empty
  - _Requirements: 3.4_

- [x] 3.2 Delete Supabase type definitions


  - Delete `frontend/src/types/supabase.ts`
  - Delete `frontend/src/types/supabase-analysis-types.ts`
  - Remove Supabase exports from `frontend/src/types/index.ts`
  - _Requirements: 3.1_

- [x] 3.3 Delete Supabase backup store file


  - Delete `frontend/src/store/auth-supabase.backup.ts`
  - _Requirements: 3.1_

- [x] 3.4 Refactor user.service.ts to use Prisma


  - Replace Supabase client imports with Prisma client
  - Refactor all database queries from Supabase syntax to Prisma syntax
  - Update error handling for Prisma errors
  - Test all user service methods work correctly
  - _Requirements: 3.2, 5.4_

- [x] 3.5 Refactor user.service.client.ts to use Prisma


  - Replace Supabase client with Prisma client
  - Update all queries to use Prisma syntax
  - Test client-side user operations
  - _Requirements: 3.2_

- [x] 3.6 Search and fix remaining Supabase references


  - Search entire codebase for remaining Supabase imports
  - Fix or remove any remaining references
  - Verify no Supabase client initialization exists
  - _Requirements: 3.5_

- [x] 3.7 Archive Supabase directory


  - Move `supabase/` directory to `.backup/supabase-config-{timestamp}/`
  - Verify directory is no longer in project root
  - _Requirements: 3.3_

- [x] 4. Remove Django Backend


  - Archive Django backend directory
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Verify no frontend dependencies on Django backend


  - Search frontend code for any Django API endpoint calls
  - Check for any Django-specific imports or references
  - Document any findings
  - _Requirements: 2.2_

- [x] 4.2 Check environment variables for Django references


  - Search all .env files for Django-related variables
  - Remove or comment out Django variables
  - _Requirements: 2.3_

- [x] 4.3 Archive Django backend directory


  - Move `backend/` directory to `.backup/django-backend-{timestamp}/`
  - Verify directory is no longer in project root
  - Create README in backup explaining what was archived and why
  - _Requirements: 2.4_

- [-] 5. Consolidate and Clean Documentation



  - Organize documentation into clean structure
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5.1 Create new documentation structure




  - Create `docs/setup/` directory
  - Create `docs/troubleshooting/` directory
  - Create `docs/migration/` directory
  - Create `docs/testing/` directory
  - Create `docs/README.md` as documentation index
  - _Requirements: 8.1, 8.2_


- [x] 5.2 Consolidate admin troubleshooting docs



  - Merge all `ADMIN_*` files into `docs/troubleshooting/admin-issues.md`
  - Include solutions from all admin fix guides
  - Remove redundant information
  - _Requirements: 1.3, 8.3_

- [x] 5.3 Consolidate migration documentation








  - Move Django migration docs to `docs/migration/django-to-nodejs.md`
  - Move Supabase migration docs to `docs/migration/supabase-to-nextauth.md`
  - Consolidate duplicate migration information
  - _Requirements: 8.3_

- [x] 5.4 Consolidate testing documentation

  - Move testing guides to `docs/testing/testing-guide.md`
  - Include performance testing information
  - Include integration testing information
  - _Requirements: 8.3_

- [x] 5.5 Move essential docs to docs/setup/

  - Move `LOCAL_SETUP_GUIDE.md` to `docs/setup/local-setup.md`
  - Keep `DEPLOYMENT.md` in root but reference from docs
  - Update internal links in moved documents
  - _Requirements: 8.2, 8.4_

- [x] 5.6 Delete obsolete documentation files






  - Delete all `ADMIN_FIX_*.md` files (after consolidation)
  - Delete all `CURRENT_STATUS*.md` files
  - Delete all `FINAL_*.md` files
  - Delete all `*_SUMMARY.md` files
  - Delete cleanup scripts: `cleanup-legacy.ps1`, `cleanup-legacy.sh`
  - Delete SQL scripts: `UPDATE_ADMIN_ROLE.sql`, `enable-uuid.sql`
  - Delete `CLEANUP_*.md` files
  - _Requirements: 1.2, 8.5_

- [x] 5.7 Update main README.md





  - Add clear links to documentation in docs/
  - Add quick start section
  - Add troubleshooting section with link to docs
  - Ensure README is concise and well-organized
  - _Requirements: 8.3, 8.4_

- [x] 6. Fix NPM Vulnerabilities





  - Update vulnerable packages
  - _Requirements: 4.4_

- [x] 6.1 Update vitest and related packages


  - Update `vitest` to version 4.0.8
  - Update `@vitest/coverage-v8` to version 4.0.8
  - Update `@vitest/ui` to version 4.0.8
  - Run tests to verify updates don't break anything
  - _Requirements: 4.4_

- [x] 6.2 Evaluate xlsx package replacement


  - Research safer alternatives to `xlsx` package (e.g., `exceljs`)
  - Document recommendation for xlsx replacement
  - Create follow-up task if replacement is needed
  - _Requirements: 4.4_

- [x] 6.3 Update esbuild through vite update


  - Check if vite update resolves esbuild vulnerability
  - Update vite if safe to do so
  - Test build process after update
  - _Requirements: 4.4_

- [-] 7. Verify and Test All Changes





  - Comprehensive testing after all changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1_

- [x] 7.1 Run TypeScript type checking



  - Run `npm run type-check` or `tsc --noEmit`
  - Fix any TypeScript errors that appear
  - Verify no type errors related to removed Supabase code
  - _Requirements: 5.3_

- [x] 7.2 Run build process



  - Run `npm run build` in frontend directory
  - Verify build completes successfully
  - Check for any build warnings or errors
  - _Requirements: 7.1_

- [x] 7.3 Run test suite





  - Run `npm run test` to execute all tests
  - Verify all tests pass
  - Fix any failing tests
  - _Requirements: 7.1_

- [x] 7.4 Test authentication flow manually





  - Start dev server
  - Test login with admin account
  - Test logout
  - Test session persistence
  - Verify admin panel access works
  - _Requirements: 5.4, 6.1_

- [x] 7.5 Test core application features





  - Test dataset upload functionality
  - Test R analytics execution
  - Test project management features
  - Verify no errors in browser console
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 7.6 Verify no Supabase references remain





  - Search codebase for "supabase" (case-insensitive)
  - Search for "SUPABASE" in all files
  - Verify search results are only in backup directories or comments
  - _Requirements: 3.5_
-

- [x] 7.7 Run security audit




  - Run `npm audit` to check for remaining vulnerabilities
  - Verify no hardcoded secrets in codebase
  - Check that all sensitive data is in .env files
  - Verify .env files are in .gitignore
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 8. Create Cleanup Summary Documentation





  - Document what was cleaned up and why
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 8.1 Create cleanup summary document

  - Create `CLEANUP_COMPLETED.md` in root
  - List all files deleted with reasons
  - List all files moved to backup with locations
  - List all code refactored with brief description
  - Document any remaining issues or follow-up tasks
  - _Requirements: 8.5_

- [x] 8.2 Update KNOWN_ISSUES.md


  - Remove resolved issues from KNOWN_ISSUES.md
  - Add any new issues discovered during cleanup
  - Prioritize remaining issues
  - _Requirements: 8.5_

- [x] 8.3 Create rollback documentation


  - Document how to rollback each major change
  - List backup locations for each component
  - Provide step-by-step rollback procedures
  - _Requirements: 7.1_
