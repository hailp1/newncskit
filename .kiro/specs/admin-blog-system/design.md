# Design Document - Admin & Blog System

## Overview

Hệ thống Admin & Blog cho NCSKIT được thiết kế theo kiến trúc Next.js App Router với Supabase backend. Hệ thống sử dụng Row Level Security (RLS) để bảo mật dữ liệu và implement role-based access control (RBAC) với permission caching.

### Key Design Principles

1. **Security First**: RLS policies, permission checks, audit logging
2. **Performance**: Permission caching, optimistic updates, pagination
3. **Scalability**: Modular architecture, service layer pattern
4. **User Experience**: Real-time updates, rich text editor, responsive UI

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Admin    │  │    Blog    │  │    User    │           │
│  │   Pages    │  │   Pages    │  │   Pages    │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│  ┌─────▼────────────────▼────────────────▼──────┐          │
│  │           API Routes Layer                    │          │
│  │  /api/admin/*  /api/blog/*  /api/users/*     │          │
│  └─────┬─────────────────────────────────────────┘          │
│        │                                                     │
│  ┌─────▼──────────────────────────────────────┐            │
│  │         Service Layer                       │            │
│  │  AdminService  BlogService  PermissionService│          │
│  └─────┬──────────────────────────────────────┘            │
└────────┼──────────────────────────────────────────────────┘
         │
         │ Supabase Client
         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  - profiles  - posts  - permissions                   │  │
│  │  - admin_roles  - admin_logs                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS) Policies             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Realtime Subscriptions                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── admin/                    # Admin pages
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   └── logs/
│   ├── blog/                     # Blog pages
│   │   ├── page.tsx             # Blog list
│   │   ├── [slug]/              # Blog post detail
│   │   ├── create/              # Create post
│   │   └── edit/[id]/           # Edit post
│   └── api/
│       ├── admin/               # Admin API routes
│       │   ├── users/
│       │   ├── roles/
│       │   ├── permissions/
│       │   └── logs/
│       └── blog/                # Blog API routes
│           ├── posts/
│           ├── categories/
│           └── tags/
├── components/
│   ├── admin/                   # Admin components
│   │   ├── UserTable.tsx
│   │   ├── RoleManager.tsx
│   │   ├── PermissionEditor.tsx
│   │   └── AdminDashboard.tsx
│   └── blog/                    # Blog components
│       ├── PostEditor.tsx
│       ├── PostList.tsx
│       ├── PostCard.tsx
│       └── RichTextEditor.tsx
├── services/                    # Business logic
│   ├── admin.service.ts
│   ├── blog.service.ts
│   ├── permission.service.ts
│   └── user.service.ts
├── lib/
│   ├── permissions/             # Permission utilities
│   │   ├── check.ts
│   │   ├── cache.ts
│   │   └── constants.ts
│   └── rbac/                    # RBAC utilities
│       ├── roles.ts
│       └── middleware.ts
└── types/
    ├── admin.ts
    ├── blog.ts
    └── permissions.ts
```

## Data Models

### Permission System

```typescript
// Permission constants
enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  
  // Blog management
  CREATE_POST = 'create_post',
  EDIT_OWN_POST = 'edit_own_post',
  EDIT_ANY_POST = 'edit_any_post',
  DELETE_OWN_POST = 'delete_own_post',
  DELETE_ANY_POST = 'delete_any_post',
  PUBLISH_POST = 'publish_post',
  
  // Admin
  VIEW_ADMIN_LOGS = 'view_admin_logs',
  MANAGE_PERMISSIONS = 'manage_permissions',
  VIEW_ANALYTICS = 'view_analytics',
}

// Role definitions
const ROLE_PERMISSIONS = {
  user: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.DELETE_OWN_POST,
  ],
  moderator: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_OWN_POST,
    Permission.PUBLISH_POST,
  ],
  admin: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_ANY_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_ADMIN_LOGS,
    Permission.VIEW_ANALYTICS,
  ],
  super_admin: Object.values(Permission), // All permissions
}
```

### Database Schema (Already exists in Supabase)

```sql
-- profiles table (extends auth.users)
profiles {
  id: UUID (PK)
  email: VARCHAR
  role: VARCHAR (user|moderator|admin|super_admin)
  status: VARCHAR (active|inactive|suspended|banned)
  ...
}

-- permissions table
permissions {
  id: SERIAL (PK)
  user_id: UUID (FK -> profiles)
  permission: VARCHAR
  granted_by: UUID (FK -> profiles)
  granted_at: TIMESTAMP
  expires_at: TIMESTAMP
}

-- admin_roles table
admin_roles {
  id: SERIAL (PK)
  name: VARCHAR
  description: TEXT
  permissions: JSONB
}

-- admin_logs table
admin_logs {
  id: SERIAL (PK)
  admin_id: UUID (FK -> profiles)
  action: VARCHAR
  target_type: VARCHAR
  target_id: INTEGER
  details: JSONB
  ip_address: INET
  created_at: TIMESTAMP
}

-- posts table
posts {
  id: SERIAL (PK)
  title: VARCHAR
  slug: VARCHAR (UNIQUE)
  excerpt: TEXT
  content: TEXT
  author_id: UUID (FK -> profiles)
  status: VARCHAR (draft|published|scheduled|archived)
  category: VARCHAR
  tags: JSONB
  featured_image: VARCHAR
  meta_description: TEXT
  view_count: INTEGER
  like_count: INTEGER
  published_at: TIMESTAMP
  scheduled_at: TIMESTAMP
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## Components and Interfaces

### 1. Permission Service

```typescript
// services/permission.service.ts
export class PermissionService {
  private cache: Map<string, { permissions: Permission[], expires: number }>
  
  /**
   * Check if user has permission
   * Uses cache for performance
   */
  async hasPermission(
    userId: string, 
    permission: Permission
  ): Promise<boolean> {
    // Check cache first
    const cached = this.getFromCache(userId)
    if (cached) {
      return cached.permissions.includes(permission)
    }
    
    // Get user role and permissions from DB
    const user = await this.getUserWithPermissions(userId)
    
    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || []
    if (rolePermissions.includes(permission)) {
      this.setCache(userId, rolePermissions)
      return true
    }
    
    // Check explicit permissions
    const explicitPermissions = await this.getExplicitPermissions(userId)
    const hasExplicit = explicitPermissions.some(p => 
      p.permission === permission && 
      (!p.expires_at || new Date(p.expires_at) > new Date())
    )
    
    this.setCache(userId, [...rolePermissions, ...explicitPermissions.map(p => p.permission)])
    return hasExplicit
  }
  
  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    await supabase.from('permissions').insert({
      user_id: userId,
      permission,
      granted_by: grantedBy,
      expires_at: expiresAt,
    })
    
    // Invalidate cache
    this.invalidateCache(userId)
    
    // Log action
    await this.logAdminAction(grantedBy, 'grant_permission', {
      user_id: userId,
      permission,
    })
  }
  
  /**
   * Revoke permission from user
   */
  async revokePermission(
    userId: string,
    permission: Permission,
    revokedBy: string
  ): Promise<void> {
    await supabase
      .from('permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permission)
    
    this.invalidateCache(userId)
    
    await this.logAdminAction(revokedBy, 'revoke_permission', {
      user_id: userId,
      permission,
    })
  }
}
```

### 2. Admin Service

```typescript
// services/admin.service.ts
export class AdminService {
  /**
   * Get all users with pagination
   */
  async getUsers(params: {
    page: number
    limit: number
    search?: string
    role?: string
    status?: string
  }): Promise<{ users: User[], total: number }> {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(params.page * params.limit, (params.page + 1) * params.limit - 1)
    
    if (params.search) {
      query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`)
    }
    
    if (params.role) {
      query = query.eq('role', params.role)
    }
    
    if (params.status) {
      query = query.eq('status', params.status)
    }
    
    const { data, count, error } = await query
    
    if (error) throw error
    
    return { users: data, total: count || 0 }
  }
  
  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    newRole: string,
    adminId: string
  ): Promise<void> {
    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.MANAGE_ROLES
    )
    
    if (!hasPermission) {
      throw new Error('Insufficient permissions')
    }
    
    // Update role
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    // Invalidate permission cache
    permissionService.invalidateCache(userId)
    
    // Log action
    await this.logAction(adminId, 'update_role', 'user', userId, {
      new_role: newRole,
    })
  }
  
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      publishedPosts,
      recentActivities,
    ] = await Promise.all([
      this.countUsers(),
      this.countUsers({ status: 'active' }),
      this.countPosts(),
      this.countPosts({ status: 'published' }),
      this.getRecentActivities(10),
    ])
    
    return {
      users: { total: totalUsers, active: activeUsers },
      posts: { total: totalPosts, published: publishedPosts },
      activities: recentActivities,
    }
  }
}
```

### 3. Blog Service

```typescript
// services/blog.service.ts
export class BlogService {
  /**
   * Create new blog post
   */
  async createPost(post: CreatePostInput, authorId: string): Promise<Post> {
    // Check permission
    const hasPermission = await permissionService.hasPermission(
      authorId,
      Permission.CREATE_POST
    )
    
    if (!hasPermission) {
      throw new Error('Insufficient permissions')
    }
    
    // Generate slug
    const slug = this.generateSlug(post.title)
    
    // Insert post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        slug,
        author_id: authorId,
        status: 'draft',
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  }
  
  /**
   * Publish post
   */
  async publishPost(postId: number, userId: string): Promise<void> {
    // Get post
    const post = await this.getPost(postId)
    
    // Check permission
    const canPublish = await this.canPublishPost(userId, post)
    
    if (!canPublish) {
      throw new Error('Insufficient permissions')
    }
    
    // Update status
    await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', postId)
  }
  
  /**
   * Get published posts with pagination
   */
  async getPublishedPosts(params: {
    page: number
    limit: number
    category?: string
    tag?: string
  }): Promise<{ posts: Post[], total: number }> {
    let query = supabase
      .from('posts')
      .select('*, author:profiles(id, full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(params.page * params.limit, (params.page + 1) * params.limit - 1)
    
    if (params.category) {
      query = query.eq('category', params.category)
    }
    
    if (params.tag) {
      query = query.contains('tags', [params.tag])
    }
    
    const { data, count, error } = await query
    
    if (error) throw error
    
    return { posts: data, total: count || 0 }
  }
  
  /**
   * Increment view count
   */
  async incrementViewCount(postId: number): Promise<void> {
    await supabase.rpc('increment_post_views', { post_id: postId })
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
```

### 4. UI Components

#### Admin Dashboard Component

```typescript
// components/admin/AdminDashboard.tsx
export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  async function loadStats() {
    const data = await adminService.getDashboardStats()
    setStats(data)
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.users.total}
          icon={<Users />}
        />
        <StatCard
          title="Active Users"
          value={stats?.users.active}
          icon={<UserCheck />}
        />
        <StatCard
          title="Total Posts"
          value={stats?.posts.total}
          icon={<FileText />}
        />
        <StatCard
          title="Published Posts"
          value={stats?.posts.published}
          icon={<CheckCircle />}
        />
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList activities={stats?.activities} />
        </CardContent>
      </Card>
    </div>
  )
}
```

#### Post Editor Component

```typescript
// components/blog/PostEditor.tsx
export function PostEditor({ postId }: { postId?: number }) {
  const [post, setPost] = useState<Post | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  
  async function handleSave(status: 'draft' | 'published') {
    setSaving(true)
    
    try {
      if (postId) {
        await blogService.updatePost(postId, { ...post, content, status })
      } else {
        await blogService.createPost({ ...post, content, status })
      }
      
      toast.success('Post saved successfully')
    } catch (error) {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Input
        placeholder="Post title"
        value={post?.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />
      
      <RichTextEditor
        value={content}
        onChange={setContent}
      />
      
      <div className="flex gap-2">
        <Button
          onClick={() => handleSave('draft')}
          disabled={saving}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave('published')}
          disabled={saving}
          variant="primary"
        >
          Publish
        </Button>
      </div>
    </div>
  )
}
```

## Error Handling

### Permission Errors

```typescript
// lib/errors/permission-error.ts
export class PermissionError extends Error {
  constructor(
    message: string,
    public permission: Permission,
    public userId: string
  ) {
    super(message)
    this.name = 'PermissionError'
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    const hasPermission = await permissionService.hasPermission(
      user.id,
      Permission.CREATE_POST
    )
    
    if (!hasPermission) {
      throw new PermissionError(
        'You do not have permission to create posts',
        Permission.CREATE_POST,
        user.id
      )
    }
    
    // ... rest of logic
  } catch (error) {
    if (error instanceof PermissionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/permission.service.test.ts
describe('PermissionService', () => {
  it('should check role-based permissions', async () => {
    const service = new PermissionService()
    const hasPermission = await service.hasPermission(
      'user-id',
      Permission.CREATE_POST
    )
    expect(hasPermission).toBe(true)
  })
  
  it('should cache permissions', async () => {
    const service = new PermissionService()
    await service.hasPermission('user-id', Permission.CREATE_POST)
    
    // Second call should use cache
    const cached = service.getFromCache('user-id')
    expect(cached).toBeDefined()
  })
})
```

### Integration Tests

```typescript
// __tests__/api/admin/users.test.ts
describe('Admin Users API', () => {
  it('should list users for admin', async () => {
    const response = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.users).toBeInstanceOf(Array)
  })
  
  it('should deny access for non-admin', async () => {
    const response = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    
    expect(response.status).toBe(403)
  })
})
```

## Security Considerations

### 1. RLS Policies

```sql
-- Only admins can view all users
CREATE POLICY "Admins can view all users"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')
    )
  );

-- Users can only edit their own posts (unless admin)
CREATE POLICY "Users can edit own posts"
  ON posts FOR UPDATE
  USING (
    author_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'super_admin')
    )
  );
```

### 2. API Route Protection

```typescript
// lib/middleware/auth.ts
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<User> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  const hasPermission = await permissionService.hasPermission(
    user.id,
    permission
  )
  
  if (!hasPermission) {
    throw new PermissionError(
      `Missing permission: ${permission}`,
      permission,
      user.id
    )
  }
  
  return user
}
```

### 3. Input Validation

```typescript
// lib/validation/blog.ts
export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  featured_image: z.string().url().optional(),
  meta_description: z.string().max(160).optional(),
})
```

## Performance Optimizations

### 1. Permission Caching

- Cache permissions for 5 minutes
- Invalidate on role/permission changes
- Use in-memory cache (Redis in production)

### 2. Database Indexes

```sql
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
```

### 3. Pagination

- Default page size: 20 items
- Max page size: 100 items
- Use cursor-based pagination for large datasets

## Deployment Considerations

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_EMAIL=
SUPER_ADMIN_IDS=

# Blog
BLOG_POSTS_PER_PAGE=20
BLOG_CACHE_TTL=3600
```

### Database Migrations

```sql
-- Migration: Add admin system
-- File: supabase/migrations/20240108_admin_system.sql

-- Already exists in schema, just ensure indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);
```

---

**Design Status**: Complete
**Next Step**: Create implementation tasks
