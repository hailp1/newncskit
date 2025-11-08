# Requirements Document - Admin & Blog System

## Introduction

Hệ thống quản lý admin, phân quyền và blog cho NCSKIT platform. Cho phép quản trị viên quản lý users, roles, permissions và tạo/quản lý blog posts.

## Glossary

- **System**: NCSKIT Admin & Blog System
- **Admin**: Người dùng có quyền quản trị hệ thống
- **User**: Người dùng thường của hệ thống
- **Role**: Vai trò của người dùng (user, admin, moderator, super_admin)
- **Permission**: Quyền hạn cụ thể (create_post, edit_user, delete_project, etc.)
- **Post**: Bài viết blog
- **RLS**: Row Level Security - Bảo mật cấp hàng trong database

## Requirements

### Requirement 1: Quản Lý Role User

**User Story:** As an admin, I want to manage user roles, so that I can control access levels

#### Acceptance Criteria

1. WHEN admin views user list, THE System SHALL display all users with their current roles
2. WHEN admin selects a user, THE System SHALL show user details including role, status, and permissions
3. WHEN admin changes user role, THE System SHALL update the role and apply corresponding permissions
4. WHEN admin assigns role, THE System SHALL validate admin has permission to assign that role
5. THE System SHALL support roles: user, moderator, admin, super_admin

### Requirement 2: Quản Lý Permissions

**User Story:** As an admin, I want to manage user permissions, so that I can grant specific access rights

#### Acceptance Criteria

1. WHEN admin views permissions, THE System SHALL display all available permissions grouped by category
2. WHEN admin assigns permission to user, THE System SHALL add permission to user's permission list
3. WHEN admin revokes permission, THE System SHALL remove permission and log the action
4. WHEN user attempts action, THE System SHALL check user has required permission
5. THE System SHALL support permission expiration dates

### Requirement 3: Admin Dashboard

**User Story:** As an admin, I want a dashboard, so that I can monitor system activity

#### Acceptance Criteria

1. WHEN admin accesses dashboard, THE System SHALL display user statistics
2. WHEN admin views dashboard, THE System SHALL show recent activities
3. WHEN admin checks metrics, THE System SHALL display token transactions summary
4. THE System SHALL show blog post statistics
5. THE System SHALL display system health status

### Requirement 4: User Management

**User Story:** As an admin, I want to manage users, so that I can maintain user accounts

#### Acceptance Criteria

1. WHEN admin searches users, THE System SHALL filter by email, name, role, or status
2. WHEN admin views user, THE System SHALL display complete user profile
3. WHEN admin updates user, THE System SHALL validate changes and update database
4. WHEN admin suspends user, THE System SHALL block user access and log action
5. WHEN admin deletes user, THE System SHALL require confirmation and soft-delete

### Requirement 5: Blog Post Creation

**User Story:** As an author, I want to create blog posts, so that I can share content

#### Acceptance Criteria

1. WHEN author creates post, THE System SHALL provide rich text editor
2. WHEN author saves draft, THE System SHALL store post with draft status
3. WHEN author adds images, THE System SHALL upload and embed images
4. WHEN author sets category, THE System SHALL validate category exists
5. THE System SHALL auto-generate slug from title

### Requirement 6: Blog Post Management

**User Story:** As an author, I want to manage my posts, so that I can update content

#### Acceptance Criteria

1. WHEN author views posts, THE System SHALL display author's posts with status
2. WHEN author edits post, THE System SHALL load existing content
3. WHEN author publishes post, THE System SHALL change status to published and set published_at
4. WHEN author schedules post, THE System SHALL set scheduled_at and auto-publish at that time
5. WHEN author deletes post, THE System SHALL archive post

### Requirement 7: Blog Post Display

**User Story:** As a visitor, I want to read blog posts, so that I can learn from content

#### Acceptance Criteria

1. WHEN visitor views blog, THE System SHALL display published posts ordered by date
2. WHEN visitor clicks post, THE System SHALL show full post content
3. WHEN visitor reads post, THE System SHALL increment view count
4. THE System SHALL display post metadata (author, date, category, tags)
5. THE System SHALL show related posts

### Requirement 8: Blog Categories & Tags

**User Story:** As an author, I want to categorize posts, so that readers can find related content

#### Acceptance Criteria

1. WHEN author creates post, THE System SHALL allow selecting category
2. WHEN author adds tags, THE System SHALL suggest existing tags
3. WHEN visitor filters by category, THE System SHALL show posts in that category
4. WHEN visitor clicks tag, THE System SHALL show posts with that tag
5. THE System SHALL display tag cloud with popular tags

### Requirement 9: Admin Logs

**User Story:** As a super admin, I want to view admin actions, so that I can audit system changes

#### Acceptance Criteria

1. WHEN admin performs action, THE System SHALL log action with timestamp and details
2. WHEN super admin views logs, THE System SHALL display all admin actions
3. WHEN super admin filters logs, THE System SHALL filter by admin, action type, or date
4. THE System SHALL store IP address and user agent
5. THE System SHALL retain logs for 90 days minimum

### Requirement 10: Permission Checks

**User Story:** As the system, I want to enforce permissions, so that unauthorized access is prevented

#### Acceptance Criteria

1. WHEN user attempts action, THE System SHALL check user has required permission
2. WHEN permission check fails, THE System SHALL return 403 Forbidden error
3. WHEN user has role-based permission, THE System SHALL allow action
4. WHEN user has explicit permission, THE System SHALL allow action
5. THE System SHALL cache permission checks for 5 minutes

### Requirement 11: Blog SEO

**User Story:** As an author, I want SEO features, so that posts rank well in search

#### Acceptance Criteria

1. WHEN author creates post, THE System SHALL allow setting meta description
2. WHEN post is published, THE System SHALL generate Open Graph tags
3. THE System SHALL create SEO-friendly URLs from slugs
4. THE System SHALL generate sitemap.xml with all published posts
5. THE System SHALL support canonical URLs

### Requirement 12: Blog Comments (Optional)

**User Story:** As a reader, I want to comment on posts, so that I can engage with content

#### Acceptance Criteria

1. WHEN reader views post, THE System SHALL display existing comments
2. WHEN authenticated user comments, THE System SHALL save comment with user info
3. WHEN moderator reviews comments, THE System SHALL allow approve/reject
4. THE System SHALL support nested replies
5. THE System SHALL notify author of new comments

