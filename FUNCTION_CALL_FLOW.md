# Sơ Đồ Luồng Gọi Hàm - NCSKIT

## Mục Lục

1. [Authentication Flow](#authentication-flow)
2. [Data Analysis Flow](#data-analysis-flow)
3. [Project Management Flow](#project-management-flow)
4. [Blog Management Flow](#blog-management-flow)

---

## Authentication Flow

### 1. Login với Email/Password

```
User clicks "Login" button
    │
    ▼
Header.tsx
  └─> useAuthModal().openLogin()
        │
        ▼
    hooks/use-auth-modal.ts
      └─> setIsOpen(true), setMode('login')
            │
            ▼
        AuthModal.tsx (renders)
          └─> AuthForm.tsx
                │
                ▼
            User enters credentials
                │
                ▼
            AuthForm.handleSubmit()
              │
              ├─> validateForm() (client-side)
              │     └─> validateEmail()
              │     └─> validatePassword()
              │
              ├─> useNetworkStatus() (check network)
              │
              └─> retryAsync() wrapper
                    │
                    ▼
                store/auth.ts
                  └─> login({ email, password })
                        │
                        ▼
                    lib/supabase/auth.ts
                      └─> signInWithPassword()
                            │
                            ▼
                        Supabase Auth API
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                Success         Error
                    │               │
                    │               └─> parseSupabaseError()
                    │                     └─> Display error message
                    │                     └─> Show retry button (if retryable)
                    │
                    └─> Store session in auth store
                          └─> onSuccess callback
                                └─> Close modal
                                      └─> Redirect to dashboard
```

**Files Involved:**
1. `components/layout/header.tsx` - Trigger
2. `hooks/use-auth-modal.ts` - Modal state
3. `components/auth/auth-modal.tsx` - Modal UI
4. `components/auth/auth-form.tsx` - Form logic
5. `store/auth.ts` - Auth state management
6. `lib/supabase/auth.ts` - Supabase integration
7. `lib/errors/auth-errors.ts` - Error handling
8. `lib/utils/retry.ts` - Retry logic

---

### 2. Login với OAuth (Google)

```
User clicks "Google" button
    │
    ▼
AuthForm.handleOAuthLogin('google')
    │
    ├─> useNetworkStatus() (check network)
    │
    ├─> checkPopupBlocked() (check popup blocker)
    │
    └─> retryAsync() wrapper
          │
          ▼
      store/auth.ts
        └─> loginWithGoogle()
              │
              ▼
          lib/supabase/auth.ts
            └─> signInWithGoogle()
                  │
                  ▼
              Open OAuth popup
                  │
                  ▼
              Google OAuth Flow
                  │
                  ▼
              Redirect to /auth/callback
                  │
                  ▼
              app/auth/callback/route.ts
                │
                ├─> Exchange code for session
                │
                └─> Redirect to dashboard
```

**Files Involved:**
1. `components/auth/auth-form.tsx` - OAuth trigger
2. `store/auth.ts` - OAuth state
3. `lib/supabase/auth.ts` - OAuth functions
4. `app/auth/callback/route.ts` - OAuth callback
5. `components/auth/oauth-fallback-instructions.tsx` - Error fallback

---


## Data Analysis Flow

### 1. Upload CSV File

```
User navigates to /dashboard/analysis
    │
    ▼
app/(dashboard)/analysis/page.tsx
    │
    └─> AnalysisWorkflow.tsx
          │
          └─> CSVUploader.tsx
                │
                ▼
            User selects CSV file
                │
                ▼
            CSVUploader.handleFileSelect()
              │
              ├─> Validate file type (.csv)
              ├─> Validate file size (< 10MB)
              │
              └─> services/csv-parser.service.ts
                    └─> parseCSV(file)
                          │
                          ├─> Read file content
                          ├─> Parse CSV to JSON
                          ├─> Detect data types
                          └─> Return parsed data
                                │
                                ▼
                            DataPreview.tsx
                              └─> Display data table
                                    └─> Show statistics
                                          └─> Enable next step
```

**Files Involved:**
1. `app/(dashboard)/analysis/page.tsx` - Analysis page
2. `features/analysis/AnalysisWorkflow.tsx` - Workflow container
3. `components/analysis/CSVUploader.tsx` - Upload component
4. `services/csv-parser.service.ts` - CSV parsing
5. `components/analysis/DataPreview.tsx` - Data preview

---

### 2. Variable Grouping

```
User proceeds to Variable Grouping step
    │
    ▼
VariableGroupingPanel.tsx
    │
    ├─> Display ungrouped variables
    │     └─> UngroupedVariables.tsx
    │
    └─> User creates groups
          │
          ▼
      VariableGroupEditor.tsx
        │
        ├─> User enters group name
        ├─> User selects variables
        │
        └─> handleSaveGroup()
              │
              ▼
          services/variable-grouping.service.ts
            └─> saveVariableGroup(projectId, group)
                  │
                  ▼
              Supabase Database
                └─> INSERT INTO variable_groups
                      │
                      ▼
                  useAutoSave hook
                    └─> Auto-save every 30 seconds
                          └─> Update database
```

**Files Involved:**
1. `components/analysis/VariableGroupingPanel.tsx` - Main panel
2. `components/analysis/VariableGroupEditor.tsx` - Group editor
3. `components/analysis/UngroupedVariables.tsx` - Ungrouped list
4. `services/variable-grouping.service.ts` - Grouping service
5. `hooks/useVariableGroupingAutoSave.ts` - Auto-save hook

---

### 3. Execute Statistical Analysis

```
User configures analysis and clicks "Run Analysis"
    │
    ▼
AnalysisSelector.tsx
  └─> handleExecuteAnalysis()
        │
        ├─> Validate configuration
        ├─> Prepare data payload
        │
        └─> services/analysis.service.ts
              └─> executeAnalysis(config)
                    │
                    ▼
                services/r-analysis.ts
                  └─> callREndpoint(endpoint, data)
                        │
                        ├─> POST /api/r-analytics/[endpoint]
                        │
                        └─> app/api/r-analytics/[endpoint]/route.ts
                              │
                              └─> Forward to R Service
                                    │
                                    ▼
                                R Analytics Service
                                  └─> r-analytics/endpoints/[analysis].R
                                        │
                                        ├─> Load R modules
                                        ├─> Validate input data
                                        ├─> Perform statistical analysis
                                        ├─> Generate plots
                                        │
                                        └─> Return results
                                              │
                                              ▼
                                          ResultsViewer.tsx
                                            │
                                            ├─> Display statistics
                                            ├─> Display plots
                                            └─> Export options
```

**Files Involved:**
1. `components/analysis/AnalysisSelector.tsx` - Analysis config
2. `services/analysis.service.ts` - Analysis service
3. `services/r-analysis.ts` - R service client
4. `app/api/r-analytics/[endpoint]/route.ts` - API proxy
5. `r-analytics/endpoints/[analysis].R` - R endpoint
6. `r-analytics/modules/[analysis].R` - R analysis logic
7. `components/analysis/ResultsViewer.tsx` - Results display

---

### 4. Export Results

```
User clicks "Export Results"
    │
    ▼
ResultsViewer.tsx
  └─> handleExport(format)
        │
        ▼
    services/export.service.ts
      └─> exportResults(results, format)
            │
            ├─> format === 'pdf'
            │     └─> generatePDF(results)
            │           └─> Return PDF blob
            │
            ├─> format === 'excel'
            │     └─> generateExcel(results)
            │           └─> Return Excel blob
            │
            └─> format === 'csv'
                  └─> generateCSV(results)
                        └─> Return CSV blob
                              │
                              ▼
                          Download file
```

**Files Involved:**
1. `components/analysis/ResultsViewer.tsx` - Export trigger
2. `services/export.service.ts` - Export service
3. `lib/utils.ts` - File download utilities

---


## Project Management Flow

### 1. Create New Project

```
User clicks "New Project" button
    │
    ▼
app/(dashboard)/projects/page.tsx
  └─> ProjectForm component
        │
        ▼
    User fills project details
      - Title
      - Description
      - Research type
      - Timeline
        │
        ▼
    ProjectForm.handleSubmit()
      │
      ├─> Validate form data
      │     └─> validator.ts
      │           └─> validateProjectData()
      │
      └─> services/projects.ts
            └─> createProject(projectData)
                  │
                  ▼
              lib/supabase/client.ts
                └─> supabase.from('marketing_projects').insert()
                      │
                      ▼
                  Supabase Database
                    └─> INSERT INTO marketing_projects
                          │
                          ├─> Trigger: update_updated_at_column()
                          ├─> RLS Policy: check user_id
                          │
                          └─> Return new project
                                │
                                ▼
                            store/projects.ts
                              └─> addProject(newProject)
                                    │
                                    └─> Update UI
                                          └─> Redirect to project detail
```

**Files Involved:**
1. `app/(dashboard)/projects/page.tsx` - Projects page
2. `components/projects/marketing-project-form-supabase.tsx` - Form
3. `services/projects.ts` - Projects service
4. `services/validator.ts` - Validation
5. `store/projects.ts` - Projects state
6. `lib/supabase/client.ts` - Supabase client

---

### 2. View Project Details

```
User clicks on project card
    │
    ▼
app/(dashboard)/projects/[id]/page.tsx
    │
    └─> useEffect(() => fetchProject())
          │
          ▼
      services/projects.ts
        └─> getProjectById(id)
              │
              ▼
          lib/supabase/client.ts
            └─> supabase
                  .from('marketing_projects')
                  .select(`
                    *,
                    profiles:user_id (
                      full_name,
                      avatar_url
                    ),
                    project_files (*)
                  `)
                  .eq('id', id)
                  .single()
                  │
                  ▼
              Supabase Database
                └─> SELECT with JOIN
                      │
                      └─> Return project with relations
                            │
                            ▼
                        ProjectDetail component
                          │
                          ├─> Display project info
                          ├─> Display team members
                          ├─> Display files
                          └─> Display actions
```

**Files Involved:**
1. `app/(dashboard)/projects/[id]/page.tsx` - Project detail page
2. `services/projects.ts` - Projects service
3. `components/projects/project-detail.tsx` - Detail component
4. `lib/supabase/client.ts` - Supabase client

---

### 3. Update Project

```
User clicks "Edit" button
    │
    ▼
ProjectDetail.tsx
  └─> setEditMode(true)
        │
        ▼
    ProjectForm component (edit mode)
      │
      └─> Pre-fill with existing data
            │
            ▼
        User modifies fields
            │
            ▼
        ProjectForm.handleUpdate()
          │
          ├─> Validate changes
          │
          └─> services/projects.ts
                └─> updateProject(id, updates)
                      │
                      ▼
                  lib/supabase/client.ts
                    └─> supabase
                          .from('marketing_projects')
                          .update(updates)
                          .eq('id', id)
                          │
                          ▼
                      Supabase Database
                        └─> UPDATE marketing_projects
                              │
                              ├─> Trigger: update_updated_at_column()
                              ├─> RLS Policy: check ownership
                              │
                              └─> Return updated project
                                    │
                                    ▼
                                store/projects.ts
                                  └─> updateProject(id, updates)
                                        │
                                        └─> Update UI
                                              └─> Show success message
```

**Files Involved:**
1. `components/projects/project-detail.tsx` - Detail component
2. `components/projects/marketing-project-form-supabase.tsx` - Form
3. `services/projects.ts` - Projects service
4. `store/projects.ts` - Projects state

---


## Blog Management Flow

### 1. View Blog Posts (Public)

```
User visits /blog
    │
    ▼
app/blog/page.tsx
    │
    └─> useEffect(() => fetchPosts())
          │
          ▼
      services/blog.service.ts
        └─> getBlogPosts(filters)
              │
              ▼
          lib/supabase/client.ts
            └─> supabase
                  .from('blog_posts')
                  .select(`
                    *,
                    profiles:author_id (
                      full_name,
                      avatar_url
                    ),
                    blog_categories (
                      name,
                      slug
                    )
                  `)
                  .eq('published', true)
                  .order('published_at', { ascending: false })
                  │
                  ▼
              Supabase Database
                └─> SELECT published posts
                      │
                      └─> Return posts array
                            │
                            ▼
                        BlogList component
                          │
                          └─> Map posts to BlogCard
                                │
                                └─> Display grid of posts
```

**Files Involved:**
1. `app/blog/page.tsx` - Blog list page
2. `services/blog.service.ts` - Blog service
3. `components/blog/blog-card.tsx` - Post card
4. `lib/supabase/client.ts` - Supabase client

---

### 2. View Single Blog Post

```
User clicks on blog post
    │
    ▼
app/blog/[id]/page.tsx
    │
    ├─> generateMetadata() (SEO)
    │     └─> Fetch post for metadata
    │
    └─> useEffect(() => fetchPost())
          │
          ▼
      services/blog.service.ts
        └─> getBlogPostById(id)
              │
              ▼
          lib/supabase/client.ts
            └─> supabase
                  .from('blog_posts')
                  .select(`
                    *,
                    profiles:author_id (*),
                    blog_categories (*),
                    blog_tags (*)
                  `)
                  .eq('id', id)
                  .eq('published', true)
                  .single()
                  │
                  ▼
              Supabase Database
                └─> SELECT post with relations
                      │
                      └─> Return post object
                            │
                            ▼
                        BlogContent component
                          │
                          ├─> Render markdown content
                          ├─> Display author info
                          ├─> Display categories/tags
                          └─> Show related posts
```

**Files Involved:**
1. `app/blog/[id]/page.tsx` - Blog post page
2. `services/blog.service.ts` - Blog service
3. `components/blog/blog-content.tsx` - Content renderer
4. `components/blog/blog-seo.tsx` - SEO component

---

### 3. Create Blog Post (Admin)

```
Admin navigates to /dashboard/blog-admin
    │
    ▼
app/(dashboard)/blog-admin/page.tsx
  └─> BlogEditor component
        │
        ▼
    Admin fills post details
      - Title
      - Content (Markdown)
      - Excerpt
      - Categories
      - Tags
      - Featured image
        │
        ▼
    BlogEditor.handleSave()
      │
      ├─> Validate post data
      │     └─> Check required fields
      │     └─> Validate markdown
      │
      ├─> Upload featured image (if any)
      │     └─> lib/supabase/storage.ts
      │           └─> uploadFile('blog-images', file)
      │
      └─> services/blog.service.ts
            └─> createBlogPost(postData)
                  │
                  ▼
              lib/supabase/client.ts
                └─> supabase
                      .from('blog_posts')
                      .insert({
                        ...postData,
                        author_id: user.id,
                        published: false
                      })
                      │
                      ▼
                  Supabase Database
                    └─> INSERT INTO blog_posts
                          │
                          ├─> Trigger: generate_slug()
                          ├─> RLS Policy: check admin role
                          │
                          └─> Return new post
                                │
                                ▼
                            Show success message
                              └─> Redirect to post preview
```

**Files Involved:**
1. `app/(dashboard)/blog-admin/page.tsx` - Admin page
2. `components/blog/blog-editor.tsx` - Editor component
3. `services/blog.service.ts` - Blog service
4. `lib/supabase/storage.ts` - Storage functions
5. `lib/permissions/check.ts` - Permission check

---

### 4. Publish Blog Post (Admin)

```
Admin clicks "Publish" button
    │
    ▼
BlogEditor.handlePublish()
  │
  ├─> Validate post is complete
  │     └─> Check title, content, excerpt
  │
  ├─> SEO Analysis
  │     └─> components/blog/seo-analyzer.tsx
  │           └─> analyzeSEO(post)
  │                 └─> Check meta description
  │                 └─> Check keywords
  │                 └─> Check readability
  │
  └─> services/blog.service.ts
        └─> publishBlogPost(postId)
              │
              ▼
          lib/supabase/client.ts
            └─> supabase
                  .from('blog_posts')
                  .update({
                    published: true,
                    published_at: new Date()
                  })
                  .eq('id', postId)
                  │
                  ▼
              Supabase Database
                └─> UPDATE blog_posts
                      │
                      ├─> Trigger: notify_subscribers()
                      ├─> Trigger: update_sitemap()
                      │
                      └─> Return updated post
                            │
                            ▼
                        Show success message
                          └─> Post is now public
```

**Files Involved:**
1. `components/blog/blog-editor.tsx` - Editor component
2. `components/blog/seo-analyzer.tsx` - SEO analyzer
3. `services/blog.service.ts` - Blog service
4. `lib/supabase/client.ts` - Supabase client

---

## Error Handling Flow

### Global Error Handling

```
Error occurs in any component
    │
    ▼
Try-Catch block
  │
  └─> catch (error)
        │
        ▼
    lib/errors/auth-errors.ts (if auth error)
      └─> parseSupabaseError(error)
            │
            ├─> Categorize error type
            ├─> Generate user-friendly message
            ├─> Determine if retryable
            │
            └─> Return parsed error
                  │
                  ▼
              Component displays error
                │
                ├─> Show error message
                ├─> Show retry button (if retryable)
                └─> Log error
                      │
                      └─> lib/monitoring/error-logger.ts
                            └─> logError(error, context)
                                  │
                                  ├─> Console.error
                                  ├─> Send to monitoring service
                                  └─> Store in error log
```

**Files Involved:**
1. `lib/errors/auth-errors.ts` - Error parsing
2. `lib/monitoring/error-logger.ts` - Error logging
3. `components/errors/ErrorDisplay.tsx` - Error UI
4. `lib/utils/retry.ts` - Retry logic

---

## State Management Flow

### Zustand Store Pattern

```
Component needs data
    │
    ▼
Import store hook
  └─> import { useAuthStore } from '@/store/auth'
        │
        ▼
    Use in component
      └─> const { user, login, logout } = useAuthStore()
            │
            ▼
        Call store action
          └─> await login(credentials)
                │
                ▼
            store/auth.ts
              └─> login: async (credentials) => {
                    │
                    ├─> set({ isLoading: true })
                    │
                    ├─> Call API
                    │     └─> lib/supabase/auth.ts
                    │
                    ├─> On success:
                    │     └─> set({ user, isLoading: false })
                    │
                    └─> On error:
                          └─> set({ error, isLoading: false })
                  }
                    │
                    ▼
                Component re-renders
                  └─> Display updated state
```

**Store Files:**
1. `store/auth.ts` - Authentication state
2. `store/projects.ts` - Projects state
3. `stores/workflowStore.ts` - Workflow state

---

## Summary

Tài liệu này mô tả chi tiết luồng gọi hàm cho các chức năng chính trong hệ thống NCSKIT:

1. **Authentication** - Xác thực người dùng với email/password và OAuth
2. **Data Analysis** - Upload, phân tích và export dữ liệu
3. **Project Management** - Tạo, xem, cập nhật dự án
4. **Blog Management** - Quản lý nội dung blog
5. **Error Handling** - Xử lý lỗi toàn cục
6. **State Management** - Quản lý state với Zustand

Mỗi luồng bao gồm:
- Sơ đồ chi tiết từng bước
- Files liên quan
- Functions được gọi
- Database operations
- UI updates

Sử dụng tài liệu này để:
- Hiểu cách hệ thống hoạt động
- Debug issues
- Thêm features mới
- Onboard developers mới
- Maintain và optimize code

---

**Last Updated:** 2024-01-11
**Document Version:** 1.0.0
