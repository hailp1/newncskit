# Tài Liệu Cấu Trúc Dự Án NCSKIT

## Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Luồng Hoạt Động Chính](#luồng-hoạt-động-chính)
5. [Module và Chức Năng](#module-và-chức-năng)
6. [API và Endpoints](#api-và-endpoints)
7. [Database Schema](#database-schema)
8. [Hướng Dẫn Bảo Trì](#hướng-dẫn-bảo-trì)
9. [Deployment](#deployment)

---

## Tổng Quan Dự Án

**NCSKIT** là nền tảng phân tích dữ liệu nghiên cứu khoa học với các tính năng:

- ✅ Xác thực người dùng (Email/Password, OAuth Google/LinkedIn)
- ✅ Quản lý dự án nghiên cứu
- ✅ Upload và phân tích dữ liệu CSV
- ✅ Phân tích thống kê với R
- ✅ Quản lý blog và nội dung
- ✅ Dashboard quản trị
- ✅ Hệ thống chiến dịch marketing

### Tech Stack

**Frontend:**
- Next.js 16.0.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Radix UI (Components)

**Backend:**
- Django (Python)
- R Analytics Service
- Supabase (Database, Auth, Storage)

**Infrastructure:**
- Vercel (Frontend Hosting)
- Docker (Containerization)
- Cloudflare Tunnel (Networking)

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (Next.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App Router  │  Components  │  Hooks  │  Services   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  State Management (Zustand)  │  API Client          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase       │ │   Django     │ │  R Analytics │
│   - Auth         │ │   Backend    │ │   Service    │
│   - Database     │ │   - API      │ │   - Stats    │
│   - Storage      │ │   - Admin    │ │   - Analysis │
└──────────────────┘ └──────────────┘ └──────────────┘
```

---

## Cấu Trúc Thư Mục

### Root Level

```
newncskit/
├── frontend/              # Next.js Frontend Application
├── backend/               # Django Backend API
├── r-analytics/           # R Statistical Analysis Service
├── supabase/             # Database Migrations & Schema
├── deployment/           # Deployment Scripts & Configs
├── docs/                 # Documentation
├── scripts/              # Utility Scripts
├── config/               # Configuration Files
└── blog-content/         # Blog Content (Markdown)
```

### Frontend Structure (`frontend/src/`)

```
src/
├── app/                  # Next.js App Router
│   ├── (dashboard)/     # Protected Dashboard Routes
│   │   ├── admin/       # Admin Panel
│   │   ├── analysis/    # Analysis Workspace
│   │   ├── dashboard/   # Main Dashboard
│   │   ├── profile/     # User Profile
│   │   └── projects/    # Project Management
│   ├── auth/            # Authentication Pages
│   │   ├── login/       # Login Page
│   │   ├── register/    # Register Page
│   │   └── callback/    # OAuth Callback
│   ├── blog/            # Blog Pages
│   ├── api/             # API Routes
│   └── layout.tsx       # Root Layout
│
├── components/          # React Components
│   ├── auth/           # Authentication Components
│   ├── analysis/       # Analysis Components
│   ├── dashboard/      # Dashboard Components
│   ├── layout/         # Layout Components
│   ├── ui/             # UI Components (Radix UI)
│   └── ...
│
├── hooks/              # Custom React Hooks
│   ├── use-auth-modal.ts
│   ├── use-network-status.ts
│   └── ...
│
├── lib/                # Utility Libraries
│   ├── supabase/       # Supabase Client & Utils
│   ├── errors/         # Error Handling
│   ├── utils/          # General Utilities
│   └── ...
│
├── services/           # API Services
│   ├── auth.ts         # Authentication Service
│   ├── analysis.service.ts
│   ├── blog.service.ts
│   └── ...
│
├── store/              # Zustand State Management
│   ├── auth.ts         # Auth Store
│   └── projects.ts     # Projects Store
│
├── types/              # TypeScript Type Definitions
│   ├── analysis.ts
│   ├── database.ts
│   └── ...
│
└── middleware.ts       # Next.js Middleware
```

---

## Luồng Hoạt Động Chính

### 1. Luồng Xác Thực (Authentication Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

User Access → Check Auth Status
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   Authenticated          Not Authenticated
        │                       │
        ▼                       ▼
   Dashboard            Login/Register Page
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Email/Password          OAuth
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    Supabase Auth API
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                Success             Error
                    │                   │
                    ▼                   ▼
            Store Session      Display Error
                    │           + Retry Option
                    ▼
            Redirect to Dashboard
```

**Files Liên Quan:**
- `frontend/src/app/auth/login/page.tsx` - Login Page
- `frontend/src/app/auth/register/page.tsx` - Register Page
- `frontend/src/components/auth/auth-form.tsx` - Form Component
- `frontend/src/components/auth/auth-modal.tsx` - Modal Component
- `frontend/src/store/auth.ts` - Auth State Management
- `frontend/src/lib/supabase/auth.ts` - Supabase Auth Functions

**Tài Liệu Chi Tiết:**
- [AUTH_COMPONENTS_API.md](frontend/src/components/auth/AUTH_COMPONENTS_API.md)
- [AUTH_FLOW_GUIDE.md](frontend/src/components/auth/AUTH_FLOW_GUIDE.md)

---

### 2. Luồng Phân Tích Dữ Liệu (Data Analysis Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA ANALYSIS WORKFLOW                     │
└─────────────────────────────────────────────────────────────┘

Create Project → Upload CSV File
                      │
                      ▼
              Parse & Validate Data
                      │
                      ▼
              Data Preview & Screening
                      │
                      ▼
              Variable Grouping
                      │
                      ▼
              Configure Analysis
                      │
                      ▼
              Send to R Analytics Service
                      │
                      ▼
              Process Statistical Analysis
                      │
                      ▼
              Return Results
                      │
                      ▼
              Display & Export Results
```

**Files Liên Quan:**
- `frontend/src/app/(dashboard)/analysis/` - Analysis Pages
- `frontend/src/components/analysis/` - Analysis Components
- `frontend/src/services/analysis.service.ts` - Analysis Service
- `frontend/src/services/r-analysis.ts` - R Service Client
- `r-analytics/api.R` - R Analytics API

**Endpoints:**
- `POST /api/analysis/upload` - Upload CSV
- `POST /api/analysis/configure` - Configure Analysis
- `POST /api/analysis/execute` - Execute Analysis
- `GET /api/analysis/results/:id` - Get Results

---

### 3. Luồng Quản Lý Dự Án (Project Management Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                  PROJECT MANAGEMENT FLOW                     │
└─────────────────────────────────────────────────────────────┘

Dashboard → View Projects List
                │
        ┌───────┴───────┐
        ▼               ▼
   Create New      Select Existing
   Project         Project
        │               │
        ▼               ▼
   Project Form    Project Details
        │               │
        ▼               ▼
   Save to DB      View/Edit/Delete
        │               │
        └───────┬───────┘
                ▼
        Update Projects List
```

**Files Liên Quan:**
- `frontend/src/app/(dashboard)/projects/` - Projects Pages
- `frontend/src/components/projects/` - Project Components
- `frontend/src/services/projects.ts` - Projects Service
- `frontend/src/store/projects.ts` - Projects State

**Database Tables:**
- `marketing_projects` - Project Information
- `project_members` - Project Team Members
- `project_files` - Uploaded Files

---

## Module và Chức Năng

### 1. Authentication Module

**Mô tả:** Quản lý xác thực người dùng, đăng nhập, đăng ký, OAuth

**Components:**
- `AuthForm` - Form đăng nhập/đăng ký
- `AuthLayout` - Layout split-screen cho auth pages
- `AuthModal` - Modal đăng nhập trong app
- `IllustrationPanel` - Panel minh họa với animation

**Hooks:**
- `useAuthModal()` - Quản lý state của auth modal
- `useNetworkStatus()` - Theo dõi trạng thái mạng

**Services:**
- `auth.ts` - Authentication service
- `lib/supabase/auth.ts` - Supabase auth functions

**Features:**
- ✅ Email/Password authentication
- ✅ OAuth (Google, LinkedIn)
- ✅ Real-time validation
- ✅ Network error detection
- ✅ Automatic retry
- ✅ Responsive design

**Tài Liệu:**
- [README.md](frontend/src/components/auth/README.md)
- [API Documentation](frontend/src/components/auth/AUTH_COMPONENTS_API.md)

---

### 2. Analysis Module

**Mô tả:** Phân tích dữ liệu thống kê với R

**Components:**
- `CSVUploader` - Upload file CSV
- `DataPreview` - Xem trước dữ liệu
- `VariableGroupingPanel` - Nhóm biến số
- `AnalysisSelector` - Chọn phương pháp phân tích
- `ResultsViewer` - Hiển thị kết quả

**Services:**
- `analysis.service.ts` - Analysis service
- `r-analysis.ts` - R service client
- `csv-parser.service.ts` - CSV parser
- `data-health.service.ts` - Data quality check

**Workflow Steps:**
1. Upload CSV
2. Data Screening
3. Variable Mapping
4. Configure Analysis
5. Execute Analysis
6. View Results
7. Export Results

**R Analytics Endpoints:**
- `/cronbach` - Cronbach's Alpha
- `/efa` - Exploratory Factor Analysis
- `/cfa` - Confirmatory Factor Analysis
- `/regression` - Regression Analysis
- `/correlation` - Correlation Analysis

---

### 3. Dashboard Module

**Mô tả:** Dashboard chính của người dùng

**Components:**
- `project-card.tsx` - Card hiển thị project
- `enhanced-admin-dashboard.tsx` - Admin dashboard

**Pages:**
- `/dashboard` - Main dashboard
- `/dashboard/projects` - Projects list
- `/dashboard/analysis` - Analysis workspace
- `/dashboard/profile` - User profile

**Features:**
- ✅ Project overview
- ✅ Recent activities
- ✅ Quick actions
- ✅ Statistics

---

### 4. Blog Module

**Mô tả:** Quản lý blog và nội dung

**Components:**
- `blog-card.tsx` - Blog post card
- `blog-content.tsx` - Blog content renderer
- `blog-editor.tsx` - Blog editor (admin)
- `blog-seo.tsx` - SEO metadata

**Services:**
- `blog.service.ts` - Blog service
- `blog.ts` - Blog API client

**Database Tables:**
- `blog_posts` - Blog posts
- `blog_categories` - Categories
- `blog_tags` - Tags

**Features:**
- ✅ Markdown support
- ✅ SEO optimization
- ✅ Categories & tags
- ✅ Search functionality

---

### 5. Admin Module

**Mô tả:** Quản trị hệ thống

**Components:**
- `admin-settings-panel.tsx` - Settings panel
- `enhanced-admin-dashboard.tsx` - Admin dashboard
- `revenue-manager.tsx` - Revenue management

**Services:**
- `admin.service.ts` - Admin service
- `admin-client.ts` - Admin API client

**Features:**
- ✅ User management
- ✅ System settings
- ✅ Analytics
- ✅ Revenue tracking

**Permissions:**
- `ADMIN` - Full access
- `MODERATOR` - Limited admin access
- `USER` - Regular user access

---

## API và Endpoints

### Frontend API Routes (`/api/`)

#### Authentication
```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Register
POST   /api/auth/logout         # Logout
GET    /api/auth/session        # Get session
POST   /api/auth/refresh        # Refresh token
```

#### Analysis
```
POST   /api/analysis/upload     # Upload CSV
POST   /api/analysis/configure  # Configure analysis
POST   /api/analysis/execute    # Execute analysis
GET    /api/analysis/results/:id # Get results
DELETE /api/analysis/:id        # Delete analysis
```

#### Projects
```
GET    /api/projects            # List projects
POST   /api/projects            # Create project
GET    /api/projects/:id        # Get project
PUT    /api/projects/:id        # Update project
DELETE /api/projects/:id        # Delete project
```

#### Blog
```
GET    /api/blog/posts          # List posts
GET    /api/blog/posts/:id      # Get post
POST   /api/blog/posts          # Create post (admin)
PUT    /api/blog/posts/:id      # Update post (admin)
DELETE /api/blog/posts/:id      # Delete post (admin)
```

#### Admin
```
GET    /api/admin/users         # List users
GET    /api/admin/stats         # System stats
POST   /api/admin/settings      # Update settings
```

---

### R Analytics Service Endpoints

**Base URL:** `http://localhost:8001` (local) or configured URL

#### Statistical Analysis
```
POST   /cronbach                # Cronbach's Alpha
POST   /efa                     # Exploratory Factor Analysis
POST   /cfa                     # Confirmatory Factor Analysis
POST   /regression              # Regression Analysis
POST   /correlation             # Correlation Analysis
POST   /descriptive             # Descriptive Statistics
POST   /hypothesis-test         # Hypothesis Testing
```

#### Data Operations
```
POST   /data/validate           # Validate data
POST   /data/clean              # Clean data
POST   /data/transform          # Transform data
```

**Request Format:**
```json
{
  "data": [[1, 2, 3], [4, 5, 6]],
  "variables": ["var1", "var2", "var3"],
  "options": {
    "method": "pearson",
    "alpha": 0.05
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "results": {
    "alpha": 0.85,
    "items": 10,
    "statistics": {...}
  },
  "plots": {
    "scree": "base64_image_data"
  }
}
```

---

### Supabase Database Schema

#### Users & Authentication
```sql
-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_permissions table
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  permission TEXT NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW()
);
```

#### Projects
```sql
-- marketing_projects table
CREATE TABLE marketing_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- project_files table
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES marketing_projects(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### Analysis
```sql
-- analysis_results table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES marketing_projects(id),
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- variable_groups table
CREATE TABLE variable_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES marketing_projects(id),
  group_name TEXT NOT NULL,
  variables TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Blog
```sql
-- blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- blog_categories table
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);
```

---

## Hướng Dẫn Bảo Trì

### 1. Thêm Component Mới

**Bước 1:** Tạo component file
```bash
# Tạo component trong thư mục phù hợp
frontend/src/components/[module]/[component-name].tsx
```

**Bước 2:** Định nghĩa TypeScript types
```typescript
// frontend/src/types/[module].ts
export interface ComponentProps {
  // Define props
}
```

**Bước 3:** Implement component
```typescript
'use client'

import { ComponentProps } from '@/types/[module]'

export function ComponentName({ ...props }: ComponentProps) {
  return (
    // JSX
  )
}
```

**Bước 4:** Export component
```typescript
// frontend/src/components/[module]/index.ts
export { ComponentName } from './component-name'
```

---

### 2. Thêm API Endpoint Mới

**Bước 1:** Tạo route handler
```typescript
// frontend/src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Logic
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

**Bước 2:** Tạo service function
```typescript
// frontend/src/services/[service].ts
export async function fetchData() {
  const response = await fetch('/api/[endpoint]')
  return response.json()
}
```

**Bước 3:** Sử dụng trong component
```typescript
import { fetchData } from '@/services/[service]'

export function Component() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  
  return <div>{/* Render data */}</div>
}
```

---

### 3. Thêm Database Table Mới

**Bước 1:** Tạo migration file
```sql
-- supabase/migrations/[timestamp]_create_table.sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- columns
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
```

**Bước 2:** Định nghĩa TypeScript types
```typescript
// frontend/src/types/database.ts
export interface TableName {
  id: string
  // fields
  created_at: string
}
```

**Bước 3:** Tạo service functions
```typescript
// frontend/src/services/[table].ts
import { supabase } from '@/lib/supabase'

export async function getRecords() {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
  
  if (error) throw error
  return data
}
```

---

### 4. Thêm R Analysis Function Mới

**Bước 1:** Tạo R module
```r
# r-analytics/modules/new_analysis.R
perform_analysis <- function(data, options) {
  # R code
  result <- list(
    statistics = stats,
    plots = plots
  )
  return(result)
}
```

**Bước 2:** Thêm endpoint
```r
# r-analytics/endpoints/new_analysis.R
#* @post /new-analysis
function(req, res) {
  data <- req$body$data
  options <- req$body$options
  
  result <- perform_analysis(data, options)
  
  return(list(
    success = TRUE,
    results = result
  ))
}
```

**Bước 3:** Tạo frontend service
```typescript
// frontend/src/services/r-analysis.ts
export async function performNewAnalysis(data: any, options: any) {
  const response = await fetch('/api/r-analytics/new-analysis', {
    method: 'POST',
    body: JSON.stringify({ data, options })
  })
  return response.json()
}
```

---

### 5. Debug và Troubleshooting

#### Frontend Issues

**Check Browser Console:**
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true')
```

**Check Network Requests:**
- Open DevTools → Network tab
- Filter by XHR/Fetch
- Check request/response

**Check State:**
```typescript
// Add to component
useEffect(() => {
  console.log('State:', state)
}, [state])
```

#### Backend Issues

**Check Logs:**
```bash
# Frontend logs (Vercel)
vercel logs

# R Analytics logs
docker logs r-analytics

# Django logs
cd backend && python manage.py runserver
```

**Check Database:**
```sql
-- Supabase SQL Editor
SELECT * FROM table_name WHERE condition;
```

#### Common Issues

**1. Authentication Error:**
- Check Supabase credentials in `.env.local`
- Verify OAuth redirect URLs
- Check session expiration

**2. API Error:**
- Check API endpoint URL
- Verify request format
- Check CORS settings

**3. Database Error:**
- Check RLS policies
- Verify user permissions
- Check foreign key constraints

**4. R Analytics Error:**
- Check R service is running
- Verify data format
- Check R package dependencies

---

## Deployment

### Environment Variables

#### Frontend (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id

# R Analytics
NEXT_PUBLIC_R_ANALYTICS_URL=http://localhost:8001

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (`.env`)
```bash
# Django
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=your_domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```

---

### Deployment Steps

#### 1. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Vercel Configuration:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
- Add all `NEXT_PUBLIC_*` variables in Vercel dashboard
- Settings → Environment Variables

---

#### 2. Deploy R Analytics (Docker)

```bash
# Build Docker image
cd r-analytics
docker build -t r-analytics .

# Run container
docker run -d \
  -p 8001:8001 \
  --name r-analytics \
  r-analytics

# Check logs
docker logs r-analytics
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  r-analytics:
    build: ./r-analytics
    ports:
      - "8001:8001"
    restart: always
```

---

#### 3. Setup Supabase

**Database Migration:**
```bash
# Run migrations
supabase db push

# Or manually in SQL Editor
# Copy content from supabase/migrations/*.sql
```

**Storage Buckets:**
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('datasets', 'datasets', false),
  ('exports', 'exports', false);

-- Set policies
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Auth Settings:**
- Enable Email provider
- Configure OAuth providers (Google, LinkedIn)
- Set redirect URLs
- Configure email templates

---

### Monitoring và Maintenance

#### 1. Performance Monitoring

**Frontend (Vercel Analytics):**
- Real User Monitoring (RUM)
- Web Vitals
- Page load times

**Backend:**
```bash
# Check R service health
curl http://localhost:8001/health

# Check response time
time curl http://localhost:8001/cronbach
```

#### 2. Error Tracking

**Frontend:**
```typescript
// lib/monitoring/error-logger.ts
export function logError(error: Error, context?: any) {
  console.error('Error:', error, context)
  // Send to monitoring service (Sentry, etc.)
}
```

**Usage:**
```typescript
try {
  await someOperation()
} catch (error) {
  logError(error, { operation: 'someOperation' })
}
```

#### 3. Database Maintenance

**Backup:**
```bash
# Supabase automatic backups
# Or manual backup
pg_dump -h host -U user -d database > backup.sql
```

**Optimize:**
```sql
-- Analyze tables
ANALYZE;

-- Vacuum
VACUUM ANALYZE;

-- Check indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

#### 4. Security Updates

**Dependencies:**
```bash
# Check vulnerabilities
npm audit

# Update packages
npm update

# Fix vulnerabilities
npm audit fix
```

**Supabase:**
- Review RLS policies regularly
- Check user permissions
- Monitor auth logs

---

### Backup và Recovery

#### 1. Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$DATE.sql
```

#### 2. Code Backup

```bash
# Git backup
git push origin main
git push backup main

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### 3. Recovery Process

**Database Recovery:**
```bash
# Restore from backup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```

**Code Recovery:**
```bash
# Rollback to previous version
git checkout v1.0.0
vercel --prod
```

---

## Tài Liệu Tham Khảo

### Documentation Files

#### Root Level
- `README.md` - Project overview
- `MASTER_README.md` - Master documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `TESTING_GUIDE.md` - Testing guidelines
- `CONTRIBUTING.md` - Contribution guidelines

#### Frontend Documentation
- `frontend/src/components/auth/README.md` - Auth components
- `frontend/src/components/auth/AUTH_COMPONENTS_API.md` - Auth API
- `frontend/src/components/auth/AUTH_FLOW_GUIDE.md` - Auth flows
- `frontend/src/components/auth/RESPONSIVE_DESIGN.md` - Responsive design

#### Spec Documents
- `.kiro/specs/auth-page-redesign/requirements.md` - Requirements
- `.kiro/specs/auth-page-redesign/design.md` - Design document
- `.kiro/specs/auth-page-redesign/tasks.md` - Implementation tasks

#### Backend Documentation
- `backend/README.md` - Backend setup
- `r-analytics/README.md` - R analytics setup
- `supabase/README.md` - Database setup

#### Deployment Documentation
- `deployment/DEPLOYMENT_GUIDE.md` - Deployment guide
- `deployment/DOCKER_R_ANALYTICS_EXPLAINED.md` - Docker setup
- `deployment/OAUTH_REDIRECT_URLS.md` - OAuth configuration

---

## Quick Reference

### Common Commands

#### Development
```bash
# Start frontend
cd frontend && npm run dev

# Start R analytics
cd r-analytics && Rscript api.R

# Start backend
cd backend && python manage.py runserver
```

#### Build
```bash
# Build frontend
cd frontend && npm run build

# Build R Docker
cd r-analytics && docker build -t r-analytics .
```

#### Test
```bash
# Run frontend tests
cd frontend && npm test

# Run specific test
cd frontend && npm test -- auth-form.test.tsx
```

#### Database
```bash
# Run migrations
supabase db push

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/database.ts
```

---

### File Naming Conventions

#### Components
- PascalCase: `AuthForm.tsx`, `DataPreview.tsx`
- Kebab-case for files: `auth-form.tsx`, `data-preview.tsx`

#### Services
- Kebab-case: `auth.service.ts`, `analysis.service.ts`

#### Types
- PascalCase: `UserProfile`, `AnalysisResult`

#### Hooks
- Camel-case with `use` prefix: `useAuthModal`, `useNetworkStatus`

#### API Routes
- Kebab-case: `/api/auth/login`, `/api/analysis/upload`

---

### Code Style Guidelines

#### TypeScript
```typescript
// Use explicit types
function processData(data: DataType): ResultType {
  // Implementation
}

// Use interfaces for objects
interface UserProfile {
  id: string
  email: string
  name: string
}

// Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}
```

#### React Components
```typescript
// Use functional components
export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks at top
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### CSS/Tailwind
```typescript
// Use Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* Content */}
</div>

// Responsive design
<div className="text-base md:text-sm lg:text-lg">
  {/* Content */}
</div>

// Conditional classes
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  variant === 'primary' && 'primary-classes'
)}>
  {/* Content */}
</div>
```

---

### Contact và Support

#### Development Team
- **Frontend Lead:** [Contact Info]
- **Backend Lead:** [Contact Info]
- **DevOps:** [Contact Info]

#### Resources
- **GitHub Repository:** https://github.com/hailp1/newncskit
- **Documentation:** [Link to docs]
- **Issue Tracker:** [Link to issues]

#### Emergency Contacts
- **Production Issues:** [Contact]
- **Security Issues:** [Contact]
- **Database Issues:** [Contact]

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Authentication system redesign
- ✅ Split-screen auth layout
- ✅ OAuth integration (Google, LinkedIn)
- ✅ Comprehensive error handling
- ✅ Network status monitoring
- ✅ Responsive design
- ✅ Complete documentation

### Upcoming Features
- 🔄 Two-factor authentication
- 🔄 Social login (Facebook, Twitter)
- 🔄 Advanced analytics dashboard
- 🔄 Real-time collaboration
- 🔄 Mobile app

---

## License

This project is proprietary software. All rights reserved.

For licensing inquiries, contact: [Contact Info]

---

**Last Updated:** 2024-01-11
**Document Version:** 1.0.0
**Maintained By:** Development Team
