# Requirements Document - Blog Permission Enhancement

## Introduction

Cải thiện hệ thống phân quyền blog để đảm bảo chỉ user được phân quyền mới có thể tạo và quản lý bài viết blog. Hiện tại hệ thống đã có backend permission nhưng thiếu kiểm tra ở frontend.

## Glossary

- **Blog System**: Hệ thống quản lý bài viết blog của NCSKit
- **Permission Service**: Service kiểm tra quyền hạn của user
- **Blog Editor**: Component để tạo và chỉnh sửa bài viết
- **User Role**: Vai trò của user (user, moderator, admin, super_admin)
- **CREATE_POST Permission**: Quyền tạo bài viết blog mới

## Requirements

### Requirement 1: Permission Check at Frontend

**User Story:** As a system administrator, I want to ensure only authorized users can access blog creation pages, so that unauthorized users cannot create blog posts.

#### Acceptance Criteria

1. WHEN a user navigates to `/blog-admin/create`, THE Blog System SHALL check if the user has CREATE_POST permission
2. IF the user does not have CREATE_POST permission, THEN THE Blog System SHALL redirect the user to an unauthorized page with a clear message
3. WHEN a user with CREATE_POST permission accesses the create page, THE Blog System SHALL display the blog editor
4. WHILE loading permission data, THE Blog System SHALL display a loading indicator
5. IF permission check fails due to network error, THEN THE Blog System SHALL display an error message with retry option

### Requirement 2: Permission-Based UI Display

**User Story:** As a user, I want to see only the features I have permission to use, so that I don't get confused by inaccessible options.

#### Acceptance Criteria

1. WHEN a user views the blog admin dashboard, THE Blog System SHALL display only actions the user has permission to perform
2. IF the user does not have CREATE_POST permission, THEN THE Blog System SHALL hide the "Create New Post" button
3. WHEN displaying a blog post list, THE Blog System SHALL show edit/delete buttons only for posts the user can modify
4. THE Blog System SHALL display a badge or indicator showing the user's blog permissions
5. WHERE a user has moderator role, THE Blog System SHALL display additional moderation controls

### Requirement 3: Real-time Permission Validation

**User Story:** As a developer, I want permission checks to happen in real-time, so that permission changes take effect immediately.

#### Acceptance Criteria

1. WHEN a user's permissions are revoked, THE Blog System SHALL invalidate the permission cache within 5 seconds
2. THE Blog System SHALL re-check permissions before any critical action (save, publish, delete)
3. IF permissions change during editing, THEN THE Blog System SHALL notify the user and prevent unauthorized actions
4. THE Blog System SHALL use optimistic UI updates with server-side validation
5. WHEN permission check fails on save, THE Blog System SHALL display a clear error message explaining the issue

### Requirement 4: Permission Error Handling

**User Story:** As a user, I want clear feedback when I don't have permission to perform an action, so that I understand why the action failed.

#### Acceptance Criteria

1. WHEN a permission check fails, THE Blog System SHALL display a user-friendly error message in Vietnamese
2. THE Blog System SHALL provide guidance on how to request the required permission
3. IF a user attempts an unauthorized action, THE Blog System SHALL log the attempt for security monitoring
4. THE Blog System SHALL differentiate between "no permission" and "network error" scenarios
5. WHEN displaying permission errors, THE Blog System SHALL include contact information for administrators

### Requirement 5: Permission-Based Routing Protection

**User Story:** As a security administrator, I want all blog admin routes to be protected by permissions, so that unauthorized access is prevented at the routing level.

#### Acceptance Criteria

1. THE Blog System SHALL implement a permission guard for all `/blog-admin/*` routes
2. WHEN an unauthorized user attempts to access a protected route, THE Blog System SHALL redirect to `/unauthorized`
3. THE Blog System SHALL preserve the intended destination URL for post-login redirect
4. WHERE a user has partial permissions, THE Blog System SHALL allow access to permitted sub-routes only
5. THE Blog System SHALL check permissions on both client-side routing and server-side rendering

### Requirement 6: User Role Display and Management

**User Story:** As a user, I want to see my current role and permissions, so that I know what actions I can perform.

#### Acceptance Criteria

1. WHEN a user views their profile, THE Blog System SHALL display their current role (user, moderator, admin)
2. THE Blog System SHALL list all blog-related permissions the user currently has
3. WHERE permissions have expiration dates, THE Blog System SHALL display the expiration time
4. THE Blog System SHALL provide a link to request additional permissions
5. WHEN viewing the blog admin dashboard, THE Blog System SHALL display a permission summary card

### Requirement 7: Audit Trail for Permission Checks

**User Story:** As a system administrator, I want to track permission check failures, so that I can identify potential security issues or permission configuration problems.

#### Acceptance Criteria

1. WHEN a permission check fails, THE Blog System SHALL log the event with user ID, requested permission, and timestamp
2. THE Blog System SHALL record the page/action that triggered the permission check
3. WHERE multiple permission failures occur for the same user, THE Blog System SHALL flag for review
4. THE Blog System SHALL provide an admin dashboard showing recent permission check failures
5. THE Blog System SHALL send alerts when suspicious permission check patterns are detected

### Requirement 8: Permission Request Workflow

**User Story:** As a user without blog permissions, I want to request permission to create blog posts, so that I can contribute content to the platform.

#### Acceptance Criteria

1. WHEN a user without CREATE_POST permission views the blog admin page, THE Blog System SHALL display a "Request Permission" button
2. THE Blog System SHALL provide a form for users to explain why they need blog permissions
3. WHEN a permission request is submitted, THE Blog System SHALL notify administrators
4. THE Blog System SHALL track the status of permission requests (pending, approved, rejected)
5. WHEN a permission request is processed, THE Blog System SHALL notify the requesting user

