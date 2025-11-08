# Implementation Plan - Admin & Blog System

## Phase 1: Core Infrastructure & Services

- [x] 1. Setup permission system foundation



  - Create permission constants and enums in `lib/permissions/constants.ts`
  - Implement permission cache utility in `lib/permissions/cache.ts`
  - Create permission check utility in `lib/permissions/check.ts`


  - _Requirements: 2.4, 10.1, 10.5_

- [x] 2. Create Permission Service


  - Implement `PermissionService` class in `services/permission.service.ts`
  - Add `hasPermission()` method with caching
  - Add `grantPermission()` method


  - Add `revokePermission()` method
  - Add cache invalidation logic
  - _Requirements: 2.2, 2.3, 10.1, 10.5_

- [x] 3. Create Admin Service


  - Implement `AdminService` class in `services/admin.service.ts`



  - Add `getUsers()` method with pagination and filtering
  - Add `updateUserRole()` method with permission check
  - Add `getDashboardStats()` method
  - Add `logAction()` method for audit trail
  - _Requirements: 1.1, 1.3, 4.1, 4.3, 9.1_

- [x] 4. Create Blog Service



  - Implement `BlogService` class in `services/blog.service.ts`
  - Add `createPost()` method with permission check
  - Add `updatePost()` method
  - Add `publishPost()` method
  - Add `getPublishedPosts()` with pagination
  - Add `incrementViewCount()` method
  - Add `generateSlug()` utility
  - _Requirements: 5.1, 5.2, 6.3, 7.1, 7.3, 5.5_

## Phase 2: Type Definitions

- [x] 5. Create TypeScript types





  - Define `Permission` enum in `types/permissions.ts`
  - Define `Role` type and `ROLE_PERMISSIONS` mapping
  - Define `User`, `AdminLog`, `DashboardStats` types in `types/admin.ts`
  - Define `Post`, `CreatePostInput`, `UpdatePostInput` types in `types/blog.ts`
  - _Requirements: 1.5, 2.1_

## Phase 3: API Routes - Admin

- [ ] 6. Create admin users API
- [ ] 6.1 Implement GET `/api/admin/users` route
  - Add authentication check
  - Add permission check for `VIEW_USERS`
  - Call `AdminService.getUsers()` with query params
  - Return paginated user list
  - _Requirements: 4.1_

- [ ] 6.2 Implement GET `/api/admin/users/[id]` route
  - Add authentication and permission check
  - Fetch user details from database
  - Return user profile with permissions
  - _Requirements: 4.2_

- [ ] 6.3 Implement PATCH `/api/admin/users/[id]` route
  - Add authentication and permission check for `EDIT_USERS`
  - Validate input data
  - Update user in database
  - Log admin action
  - _Requirements: 4.3, 9.1_

- [ ] 6.4 Implement PATCH `/api/admin/users/[id]/role` route
  - Add permission check for `MANAGE_ROLES`
  - Call `AdminService.updateUserRole()`
  - Invalidate permission cache
  - _Requirements: 1.3, 1.4_

- [ ] 6.5 Implement PATCH `/api/admin/users/[id]/status` route
  - Add permission check
  - Update user status (suspend/activate)
  - Log action
  - _Requirements: 4.4_

- [ ] 7. Create admin permissions API
- [ ] 7.1 Implement GET `/api/admin/permissions` route
  - Return all available permissions grouped by category
  - _Requirements: 2.1_

- [ ] 7.2 Implement POST `/api/admin/permissions/grant` route
  - Add permission check for `MANAGE_PERMISSIONS`
  - Call `PermissionService.grantPermission()`
  - Support expiration date
  - _Requirements: 2.2, 2.5_

- [ ] 7.3 Implement DELETE `/api/admin/permissions/revoke` route
  - Add permission check for `MANAGE_PERMISSIONS`
  - Call `PermissionService.revokePermission()`
  - _Requirements: 2.3_

- [ ] 8. Create admin dashboard API
- [ ] 8.1 Implement GET `/api/admin/dashboard/stats` route
  - Add permission check for `VIEW_ANALYTICS`
  - Call `AdminService.getDashboardStats()`
  - Return user, post, and activity statistics
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Create admin logs API
- [ ] 9.1 Implement GET `/api/admin/logs` route
  - Add permission check for `VIEW_ADMIN_LOGS`
  - Fetch logs with pagination
  - Support filtering by admin, action, date
  - _Requirements: 9.2, 9.3_

## Phase 4: API Routes - Blog

- [ ] 10. Create blog posts API
- [ ] 10.1 Implement GET `/api/blog/posts` route
  - Fetch published posts with pagination
  - Support filtering by category and tag
  - Include author information
  - _Requirements: 7.1_

- [ ] 10.2 Implement GET `/api/blog/posts/[slug]` route
  - Fetch post by slug
  - Increment view count
  - Return post with author and metadata
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 10.3 Implement POST `/api/blog/posts` route
  - Add authentication check
  - Add permission check for `CREATE_POST`
  - Validate input with Zod schema
  - Call `BlogService.createPost()`
  - _Requirements: 5.1, 5.2_

- [ ] 10.4 Implement PATCH `/api/blog/posts/[id]` route
  - Add authentication check
  - Check if user can edit (own post or has `EDIT_ANY_POST`)
  - Update post in database
  - _Requirements: 6.2_

- [ ] 10.5 Implement POST `/api/blog/posts/[id]/publish` route
  - Add permission check for `PUBLISH_POST`
  - Call `BlogService.publishPost()`
  - Set published_at timestamp
  - _Requirements: 6.3_

- [ ] 10.6 Implement POST `/api/blog/posts/[id]/schedule` route
  - Add permission check
  - Set scheduled_at timestamp
  - Update status to 'scheduled'
  - _Requirements: 6.4_

- [ ] 10.7 Implement DELETE `/api/blog/posts/[id]` route
  - Check if user can delete (own post or has `DELETE_ANY_POST`)
  - Archive post (soft delete)
  - _Requirements: 6.5_

- [ ] 11. Create blog categories & tags API
- [ ] 11.1 Implement GET `/api/blog/categories` route
  - Return all categories with post counts
  - _Requirements: 8.1_

- [ ] 11.2 Implement GET `/api/blog/tags` route
  - Return all tags with usage counts
  - Support autocomplete for tag suggestions
  - _Requirements: 8.2, 8.5_

## Phase 5: Admin UI Components

- [ ] 12. Create admin dashboard page
  - Create `app/admin/dashboard/page.tsx`
  - Implement `AdminDashboard` component
  - Add stat cards for users, posts, activities
  - Add recent activities list
  - Add charts for analytics
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 13. Create user management page
  - Create `app/admin/users/page.tsx`
  - Implement `UserTable` component with pagination
  - Add search and filter functionality
  - Add role and status badges
  - Add actions menu (edit, suspend, delete)
  - _Requirements: 4.1, 4.2_

- [ ] 14. Create user detail/edit page
  - Create `app/admin/users/[id]/page.tsx`
  - Display complete user profile
  - Add role selector with permission check
  - Add status toggle
  - Add permission management section
  - _Requirements: 4.2, 4.3, 4.4, 1.2, 1.3_

- [ ] 15. Create permission management component
  - Implement `PermissionEditor` component
  - Display available permissions grouped by category
  - Add grant/revoke buttons
  - Add expiration date picker
  - Show current permissions with granted_by info
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 16. Create admin logs page
  - Create `app/admin/logs/page.tsx`
  - Implement `AdminLogTable` component
  - Add filters for admin, action type, date range
  - Display action details in expandable rows
  - Show IP address and timestamp
  - _Requirements: 9.2, 9.3, 9.4_

## Phase 6: Blog UI Components

- [ ] 17. Create blog list page
  - Create `app/blog/page.tsx`
  - Implement `PostList` component
  - Add `PostCard` component for each post
  - Add pagination controls
  - Add category and tag filters
  - _Requirements: 7.1, 8.3, 8.4_

- [ ] 18. Create blog post detail page
  - Create `app/blog/[slug]/page.tsx`
  - Display full post content
  - Show author info and metadata
  - Add related posts section
  - Implement view count tracking
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 19. Create post editor page
  - Create `app/blog/create/page.tsx` and `app/blog/edit/[id]/page.tsx`
  - Implement `PostEditor` component
  - Integrate rich text editor (TipTap or similar)
  - Add title and excerpt inputs
  - Add category selector
  - Add tag input with autocomplete
  - Add featured image uploader
  - Add meta description input for SEO
  - Add save draft and publish buttons
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2, 11.2_

- [ ] 20. Create rich text editor component
  - Implement `RichTextEditor` component using TipTap
  - Add formatting toolbar (bold, italic, headings, lists)
  - Add image upload functionality
  - Add link insertion
  - Add code block support
  - _Requirements: 5.1, 5.3_

- [ ] 21. Create my posts page
  - Create `app/blog/my-posts/page.tsx`
  - Display author's posts with all statuses
  - Add status filter (draft, published, scheduled)
  - Add quick actions (edit, publish, delete)
  - _Requirements: 6.1_

## Phase 7: Middleware & Protection

- [ ] 22. Create authentication middleware
  - Implement `requireAuth()` middleware in `lib/middleware/auth.ts`
  - Check if user is authenticated
  - Return user object or throw error
  - _Requirements: 10.1_

- [ ] 23. Create permission middleware
  - Implement `requirePermission()` middleware
  - Check if user has required permission
  - Use `PermissionService` with caching
  - Throw `PermissionError` if unauthorized
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 24. Create admin route protection
  - Add middleware to all `/admin/*` routes
  - Check user has admin or super_admin role
  - Redirect to login if not authenticated
  - Show 403 error if not authorized
  - _Requirements: 10.1, 10.2_

## Phase 8: SEO & Optimization

- [ ] 25. Implement blog SEO features
  - Add meta tags generation for blog posts
  - Generate Open Graph tags
  - Create sitemap.xml generation endpoint
  - Add canonical URLs
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 26. Add database indexes
  - Create indexes for posts (status, published_at, slug, author_id)
  - Create indexes for permissions (user_id)
  - Create indexes for admin_logs (admin_id, created_at)
  - _Requirements: Performance optimization_

- [ ] 27. Implement caching strategy
  - Add permission caching (5 minutes TTL)
  - Add blog post caching for published posts
  - Add dashboard stats caching
  - Implement cache invalidation on updates
  - _Requirements: 10.5, Performance optimization_

## Phase 9: Testing & Documentation

- [ ] 28. Write unit tests
  - Test `PermissionService` methods
  - Test `AdminService` methods
  - Test `BlogService` methods
  - Test permission check utilities
  - _Requirements: All_

- [ ] 29. Write integration tests
  - Test admin API routes with different roles
  - Test blog API routes with permissions
  - Test permission enforcement
  - Test RLS policies
  - _Requirements: All_

- [ ] 30. Create user documentation
  - Write admin user guide
  - Write blog author guide
  - Document permission system
  - Create API documentation
  - _Requirements: All_

## Phase 10: Deployment & Monitoring

- [ ] 31. Setup environment variables
  - Add admin configuration variables
  - Add blog configuration variables
  - Document all required env vars
  - _Requirements: Deployment_

- [ ] 32. Run database migrations
  - Verify all tables exist (already in schema)
  - Create additional indexes if needed
  - Seed initial admin roles
  - _Requirements: Deployment_

- [ ] 33. Setup monitoring
  - Add error tracking for permission errors
  - Add logging for admin actions
  - Monitor API performance
  - Setup alerts for critical errors
  - _Requirements: 9.1, 9.5_

---

**Total Tasks**: 33 main tasks, 60+ sub-tasks
**Estimated Time**: 3-4 weeks
**Priority**: High (Core functionality for platform)
