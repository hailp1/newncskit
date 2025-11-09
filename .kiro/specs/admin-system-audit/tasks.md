# Implementation Plan - Admin System Audit & Fix

## Overview
This implementation plan fixes the admin system including user management, permissions, roles, settings, and profile pages. Tasks are organized by priority and dependencies.

---

## Phase 1: Database & Infrastructure Setup

- [x] 1. Database Schema Updates





  - Create/update profiles table with new columns
  - Create permissions table if not exists
  - Add indexes for performance
  - Set up Row Level Security (RLS) policies
  - _Requirements: 1.1, 10.1, 10.2_

- [x] 1.1 Create database migration file


  - Write SQL migration for profiles table updates
  - Add institution, orcid_id, research_domains columns
  - Add role, subscription_type, is_active columns
  - _Requirements: 10.1_


- [x] 1.2 Create permissions table migration

  - Define permissions table schema
  - Add foreign key constraints
  - Create indexes on user_id and expires_at
  - _Requirements: 2.1, 10.1_

- [x] 1.3 Set up RLS policies


  - Create policy for users to view own profile
  - Create policy for users to update own profile
  - Create policy for admins to view all profiles
  - Create policy for admins to update any profile
  - _Requirements: 8.4_

- [x] 1.4 Run migrations on database


  - Test migrations on local database
  - Run migrations on staging database
  - Verify data integrity after migration
  - _Requirements: 10.1_

---

## Phase 2: Service Layer Implementation
- [x] 2. Create User Service







- [ ] 2. Create User Service

  - Implement UserService class with all CRUD operations
  - Add Supabase client integration
  - Implement error handling
  - Add request retry logic
  - _Requirements: 1.1, 1.2, 8.1, 8.5_


- [x] 2.1 Implement getUsers method


  - Fetch users from Supabase with filters
  - Support pagination
  - Handle query parameters
  - _Requirements: 1.1, 1.4_



- [ ] 2.2 Implement getUserById method
  - Fetch single user by ID
  - Include related data (permissions, roles)
  - Handle not found errors
  - _Requirements: 1.1_



- [ ] 2.3 Implement updateUser method
  - Update user profile data
  - Validate input before update
  - Return updated user object


  - _Requirements: 3.1, 3.2, 7.1_

- [ ] 2.4 Implement role management methods
  - updateUserRole method
  - toggleUserStatus method


  - Validate role changes
  - _Requirements: 6.2, 6.3_

- [ ] 2.5 Implement bulk actions
  - bulkAction method for multiple users
  - Support activate, suspend, delete actions
  - Return success/failure counts
  - _Requirements: 1.1_

- [x] 3. Enhance Permission Service





  - Update existing PermissionService
  - Add caching mechanism
  - Implement cache invalidation
  - Add audit logging
  - _Requirements: 2.1, 2.2, 2.5, 8.1_

- [x] 3.1 Implement permission caching


  - Create in-memory cache for permissions
  - Set TTL to 5 minutes
  - Implement cache get/set methods
  - _Requirements: 2.5_

- [x] 3.2 Implement getRolePermissions


  - Fetch permissions for a specific role
  - Cache results
  - Handle role not found
  - _Requirements: 2.2_

- [x] 3.3 Implement updateRolePermissions


  - Update permissions for a role
  - Invalidate cache after update
  - Log permission changes
  - _Requirements: 2.3, 2.5_

- [x] 3.4 Add permission validation


  - Validate permission format
  - Check permission exists in system
  - Prevent duplicate permissions
  - _Requirements: 2.4_

- [x] 4. Create Profile Service





  - Implement ProfileService class
  - Add profile CRUD operations
  - Implement password change
  - Add avatar upload
  - _Requirements: 3.1, 3.3, 4.1, 7.1_

- [x] 4.1 Implement getProfile method






  - Fetch current user profile from Supabase
  - Include all profile fields
  - Handle missing data gracefully
  - _Requirements: 4.1, 4.3_

- [x] 4.2 Implement updateProfile method


  - Update profile data in database
  - Validate all inputs
  - Return updated profile
  - _Requirements: 3.1, 3.2, 7.1_


- [x] 4.3 Implement changePassword method

  - Verify current password
  - Validate new password strength
  - Update password in Supabase Auth
  - _Requirements: 7.3_



- [ ] 4.4 Implement uploadAvatar method
  - Upload image to Supabase Storage
  - Resize and optimize image
  - Update avatar_url in profile
  - _Requirements: 4.1_

---

## Phase 3: Error Handling & Validation

- [x] 5. Create Error Handler Utility




  - Implement ErrorHandler class
  - Map technical errors to user-friendly messages
  - Add Vietnamese error messages
  - Implement retry logic
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 5.1 Define error types enum

  - Create ErrorType enum
  - Define all error categories
  - Map HTTP status codes to error types
  - _Requirements: 5.4_


- [x] 5.2 Implement error message mapping


  - Create Vietnamese error messages
  - Map error codes to messages
  - Handle generic errors
  - _Requirements: 5.2_

- [x] 5.3 Implement retry logic

  - Determine which errors should retry
  - Implement exponential backoff
  - Max 3 retry attempts
  - _Requirements: 8.5_

- [x] 6. Create Validation Utility




  - Implement Validator class
  - Add validation methods for all input types
  - Implement input sanitization
  - Add XSS and SQL injection prevention
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 6.1 Implement email validation

  - RFC 5322 compliant validation
  - Check email format
  - Prevent invalid emails
  - _Requirements: 7.1_


- [x] 6.2 Implement ORCID validation



  - Validate format 0000-0000-0000-000X
  - Check checksum digit
  - Handle invalid formats
  - _Requirements: 7.2_




- [x] 6.3 Implement password validation


  - Min 8 characters
  - Require uppercase, lowercase, number
  - Check against common passwords


  - _Requirements: 7.3_




- [x] 6.4 Implement input sanitization


  - Remove HTML tags
  - Escape special characters
  - Prevent XSS attacks
  - _Requirements: 7.4, 7.5_

---

## Phase 4: UI Component Updates

- [x] 7. Fix User Management Page





  - Replace hardcoded API calls with UserService
  - Implement proper error handling
  - Add loading states
  - Fix data mapping
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2_

- [x] 7.1 Update API integration


  - Replace fetch calls with UserService methods
  - Remove localStorage auth token usage
  - Use Supabase client for authentication
  - _Requirements: 1.1, 8.3_

- [x] 7.2 Implement error handling

  - Add try-catch blocks
  - Display error messages in Vietnamese
  - Show retry button on network errors
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7.3 Add loading states

  - Show spinner while fetching data
  - Disable buttons during actions
  - Show skeleton loaders for list
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 7.4 Fix data mapping

  - Map API response to UI model
  - Handle missing fields
  - Convert snake_case to camelCase
  - _Requirements: 10.2, 10.3_

- [x] 7.5 Implement role management UI

  - Add role dropdown for each user
  - Handle role change events
  - Show confirmation dialog
  - _Requirements: 6.1, 6.2, 6.3_
-

- [x] 8. Fix Permission Management Page




  - Replace mock data with real API calls
  - Implement permission updates
  - Add cache invalidation
  - Fix role-permission sync
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8.1 Implement data loading


  - Fetch features from database
  - Fetch role permissions
  - Load permission costs
  - _Requirements: 2.1_


- [x] 8.2 Implement permission editor

  - Allow editing permission settings
  - Update token costs
  - Set daily/monthly limits
  - _Requirements: 2.3_


- [x] 8.3 Add cache invalidation

  - Clear cache after permission update
  - Refresh UI after cache clear
  - Show success message
  - _Requirements: 2.5_


- [x] 8.4 Implement audit logging

  - Log all permission changes
  - Record who made changes
  - Store timestamp
  - _Requirements: 2.3_
-

- [x] 9. Fix Settings Page




  - Implement actual save functionality
  - Add password change feature
  - Persist research domains
  - Show real success/error messages
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9.1 Implement profile save


  - Call ProfileService.updateProfile
  - Validate all inputs before save
  - Handle save errors
  - _Requirements: 3.1, 3.2_

- [x] 9.2 Implement password change


  - Add ChangePasswordForm component
  - Validate current password
  - Validate new password strength
  - _Requirements: 7.3_

- [x] 9.3 Implement research domains

  - Save selected domains to database
  - Load domains on page load
  - Show selected domains
  - _Requirements: 3.1_

- [x] 9.4 Add success/error feedback

  - Show success message after save
  - Display specific error messages
  - Auto-hide success after 3 seconds
  - _Requirements: 3.3, 3.4_
- [x] 10. Fix Profile Page




- [ ] 10. Fix Profile Page

  - Load actual profile data
  - Display all profile fields
  - Implement edit functionality
  - Add avatar upload
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10.1 Implement data loading


  - Fetch profile from ProfileService
  - Display institution and ORCID
  - Show research domains
  - _Requirements: 4.1, 4.2_

- [x] 10.2 Fix "Not specified" display


  - Check for null/undefined values
  - Display "Not specified" only when truly empty
  - Format dates properly
  - _Requirements: 4.3_

- [x] 10.3 Implement edit mode


  - Toggle between view and edit modes
  - Save changes on submit
  - Cancel reverts changes
  - _Requirements: 4.1_

- [x] 10.4 Add avatar upload


  - Implement file picker
  - Upload to Supabase Storage
  - Update avatar_url in profile
  - _Requirements: 4.1_

---

## Phase 5: Testing & Quality Assurance

- [ ] 11. Write Unit Tests
  - Test all service methods
  - Test validation functions
  - Test error handlers
  - Test cache logic
  - _Requirements: All_

- [ ]* 11.1 Test UserService
  - Test getUsers with various filters
  - Test updateUser with valid/invalid data
  - Test role management methods
  - Test bulk actions

- [ ]* 11.2 Test PermissionService
  - Test hasPermission with cache
  - Test permission grant/revoke
  - Test cache invalidation
  - Test role permissions

- [ ]* 11.3 Test ProfileService
  - Test getProfile
  - Test updateProfile
  - Test changePassword
  - Test avatar upload

- [ ]* 11.4 Test Validators
  - Test email validation
  - Test ORCID validation
  - Test password validation
  - Test input sanitization

- [ ] 12. Write Integration Tests
  - Test API calls end-to-end
  - Test database operations
  - Test permission checks
  - Test role updates
  - _Requirements: All_

- [ ]* 12.1 Test user management flow
  - Create, read, update, delete users
  - Change user roles
  - Bulk actions

- [ ]* 12.2 Test permission flow
  - Grant permissions
  - Revoke permissions
  - Check permissions
  - Update role permissions

- [ ]* 12.3 Test profile flow
  - Update profile
  - Change password
  - Upload avatar

- [ ] 13. Perform Manual Testing
  - Test all pages in browser
  - Test error scenarios
  - Test loading states
  - Test responsive design
  - _Requirements: All_

- [ ] 13.1 Test user management page
  - Search and filter users
  - Update user roles
  - Suspend/activate users
  - Bulk actions

- [ ] 13.2 Test permission page
  - View permissions
  - Update permissions
  - Change costs
  - Verify cache invalidation

- [ ] 13.3 Test settings page
  - Update profile info
  - Change password
  - Select research domains
  - Verify save

- [ ] 13.4 Test profile page
  - View profile
  - Edit profile
  - Upload avatar
  - Verify display

---

## Phase 6: Deployment & Monitoring

- [ ] 14. Deploy to Staging
  - Run database migrations
  - Deploy frontend code
  - Test all functionality
  - Fix any issues
  - _Requirements: All_

- [ ] 14.1 Run database migrations
  - Backup staging database
  - Run migration scripts
  - Verify schema changes
  - Test RLS policies

- [ ] 14.2 Deploy frontend
  - Build production bundle
  - Deploy to staging environment
  - Verify deployment success
  - Check for errors

- [ ] 14.3 Smoke testing
  - Test critical paths
  - Verify API connections
  - Check error handling
  - Test permissions

- [ ] 15. Deploy to Production
  - Schedule maintenance window
  - Run database migrations
  - Deploy frontend code
  - Monitor for issues
  - _Requirements: All_

- [ ] 15.1 Pre-deployment checklist
  - Backup production database
  - Notify users of maintenance
  - Prepare rollback plan
  - Review deployment steps

- [ ] 15.2 Execute deployment
  - Run database migrations
  - Deploy frontend code
  - Clear CDN cache
  - Verify deployment

- [ ] 15.3 Post-deployment monitoring
  - Monitor error rates
  - Check API response times
  - Verify user logins
  - Watch for issues

- [ ] 16. Documentation & Handoff
  - Update technical documentation
  - Create user guide
  - Document API changes
  - Train support team
  - _Requirements: All_

- [ ] 16.1 Update technical docs
  - Document new services
  - Update API documentation
  - Document database schema
  - Add troubleshooting guide

- [ ] 16.2 Create user guide
  - Write admin user guide
  - Document permission system
  - Create FAQ
  - Add screenshots

---

## Notes

- Tasks marked with `*` are optional testing tasks
- Each task should be completed and tested before moving to the next
- Always check requirements referenced in each task
- Run diagnostics after each code change
- Commit frequently with descriptive messages

## Estimated Timeline

- Phase 1: 2 days
- Phase 2: 3 days
- Phase 3: 2 days
- Phase 4: 4 days
- Phase 5: 2 days
- Phase 6: 2 days

**Total: ~15 days**

## Success Criteria

- ✅ All admin pages load without errors
- ✅ User management works with real API
- ✅ Permissions can be managed
- ✅ Settings save correctly
- ✅ Profile displays real data
- ✅ All tests pass
- ✅ No console errors
- ✅ Performance metrics met
