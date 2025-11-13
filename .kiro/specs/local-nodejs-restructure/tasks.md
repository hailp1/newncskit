# Kế Hoạch Triển Khai - Tái Cấu Trúc Dự Án Local với Node.js

## Tổng Quan

Kế hoạch này chia việc tái cấu trúc thành các tasks tuần tự, từ setup cơ bản đến migration hoàn chỉnh.

## Tasks

- [x] 1. Setup Next.js Project và Dependencies





  - Initialize Next.js project với TypeScript và App Router
  - Install dependencies: Prisma, NextAuth, bcryptjs, papaparse, winston
  - Configure TypeScript và ESLint
  - Setup folder structure theo design
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Setup PostgreSQL và Prisma



- [x] 2.1 Configure Prisma


  - Install Prisma CLI và client
  - Create prisma/schema.prisma với database schema
  - Configure PostgreSQL connection string
  - _Requirements: 2.1, 2.2, 2.6_

- [x] 2.2 Create database migrations



  - Run `prisma migrate dev` để tạo initial migration
  - Verify tables được tạo trong PostgreSQL
  - _Requirements: 2.3_

- [x] 2.3 Create Prisma client singleton

  - Implement src/lib/prisma.ts với singleton pattern
  - Test database connection
  - _Requirements: 2.5_

- [ ]* 2.4 Create seed script
  - Implement prisma/seed.ts với sample data
  - Run seed script để tạo test data
  - _Requirements: 2.4_

- [x] 3. Implement Authentication với NextAuth.js




- [x] 3.1 Setup NextAuth configuration


  - Install NextAuth và @next-auth/prisma-adapter
  - Create src/lib/auth.ts với authOptions
  - Configure Credentials provider và Google provider
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.2 Create auth API route


  - Implement src/app/api/auth/[...nextauth]/route.ts
  - Test authentication endpoints
  - _Requirements: 3.7_

- [x] 3.3 Create login và register pages


  - Implement src/app/(auth)/login/page.tsx
  - Implement src/app/(auth)/register/page.tsx
  - Add form validation và error handling
  - _Requirements: 3.7_

- [x] 3.4 Implement protected route middleware


  - Create middleware.ts để protect dashboard routes
  - Test authentication flow
  - _Requirements: 3.6_

- [x] 4. Implement Projects API Routes

- [x] 4.1 Create projects list và create endpoints


  - Implement GET /api/projects (list all user projects)
  - Implement POST /api/projects (create new project)
  - Add authentication check
  - Add input validation
  - _Requirements: 6.1, 6.5, 6.6_

- [x] 4.2 Create project detail endpoints


  - Implement GET /api/projects/[id] (get project details)
  - Implement PUT /api/projects/[id] (update project)
  - Implement DELETE /api/projects/[id] (delete project)
  - Verify user ownership before operations
  - _Requirements: 6.1, 6.5, 6.6_

- [x] 5. Implement Datasets API Routes

- [x] 5.1 Create datasets list endpoint


  - Implement GET /api/datasets (list datasets for a project)
  - Add filtering by projectId
  - _Requirements: 6.2_

- [x] 5.2 Create dataset detail endpoints


  - Implement GET /api/datasets/[id]
  - Implement DELETE /api/datasets/[id]
  - _Requirements: 6.2_

- [x] 6. Implement File Upload

- [x] 6.1 Create upload API route


  - Implement POST /api/upload
  - Handle multipart/form-data
  - Validate file type (CSV only) và size (max 10MB)
  - _Requirements: 4.3, 4.4_

- [x] 6.2 Implement file storage

  - Create public/uploads directory
  - Generate unique filenames
  - Save files to local filesystem
  - _Requirements: 4.1, 4.2_

- [x] 6.3 Save file metadata to database


  - Create Dataset record với file info
  - Return file URL to client
  - _Requirements: 4.4, 4.7_

- [x] 6.4 Create download endpoint


  - Implement GET /api/datasets/[id]/download
  - Stream file to client
  - _Requirements: 4.6_

- [x] 7. Setup R Analytics Service

- [x] 7.1 Create R service structure


  - Create r-analytics/ directory
  - Create api.R với Plumber
  - Create modules/ directory for analysis functions
  - _Requirements: 5.1, 5.2_

- [x] 7.2 Implement health check endpoint

  - Add GET /health endpoint in api.R
  - Return service status và version
  - _Requirements: 5.6_

- [x] 7.3 Implement sentiment analysis endpoint


  - Create modules/sentiment.R
  - Add POST /analyze/sentiment endpoint
  - Test với sample data
  - _Requirements: 5.3_

- [x] 7.4 Implement clustering endpoint


  - Create modules/clustering.R
  - Add POST /analyze/cluster endpoint
  - _Requirements: 5.3_

- [x] 7.5 Implement topic modeling endpoint


  - Create modules/topics.R
  - Add POST /analyze/topics endpoint
  - _Requirements: 5.3_

- [x] 7.6 Create Dockerfile và docker-compose


  - Write Dockerfile với R runtime
  - Create docker-compose.yml
  - Build và test Docker image
  - _Requirements: 5.1_

- [x] 8. Implement R Service Integration in Next.js

- [x] 8.1 Create R service client


  - Implement src/lib/r-service.ts
  - Add runAnalysis method với timeout
  - Add checkHealth method
  - _Requirements: 5.4, 5.6, 5.7_

- [x] 8.2 Create analytics API route


  - Implement POST /api/analytics/run
  - Read CSV file và parse data
  - Call R service với data
  - Handle timeout và errors
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7_

- [x] 8.3 Implement result caching


  - Check cache before calling R service
  - Save results to Analysis table
  - Return cached results when available
  - _Requirements: 8.5, 8.6_

- [ ] 9. Migrate Django Backend Logic
- [ ] 9.1 Audit existing Django views
  - List all Django views và endpoints
  - Document business logic for each
  - Create migration checklist
  - _Requirements: 7.1, 7.4_

- [ ] 9.2 Migrate remaining API endpoints
  - Convert any remaining Django views to Next.js API routes
  - Maintain same request/response contracts
  - Update error handling
  - _Requirements: 7.1, 7.4_

- [ ] 9.3 Migrate database data
  - Export data from Django database
  - Transform data for Prisma schema
  - Import data to PostgreSQL
  - Verify data integrity
  - _Requirements: 7.5_

- [ ] 9.4 Update frontend API calls
  - Replace Django API URLs với Next.js API routes
  - Update request/response handling
  - Test all API integrations
  - _Requirements: 7.6_

- [ ] 10. Implement Frontend Pages
- [ ] 10.1 Create projects list page
  - Implement src/app/(dashboard)/projects/page.tsx
  - Fetch projects from API
  - Display projects in grid/list
  - Add create project button
  - _Requirements: 6.1_

- [ ] 10.2 Create project detail page
  - Implement src/app/(dashboard)/projects/[id]/page.tsx
  - Display project info và datasets
  - Add edit và delete actions
  - _Requirements: 6.1_

- [ ] 10.3 Create dataset upload page
  - Add upload form to project page
  - Handle file selection và upload
  - Show upload progress
  - _Requirements: 4.5_

- [ ] 10.4 Create analytics page
  - Implement analytics UI
  - Add analysis type selection
  - Display results với charts
  - Handle loading và error states
  - _Requirements: 8.1, 8.4_

- [ ] 11. Implement Error Handling và Logging
- [x] 11.1 Create error handler utility


  - Implement src/lib/error-handler.ts
  - Create AppError class
  - Add handleApiError function
  - _Requirements: 11.3, 11.4_

- [x] 11.2 Setup Winston logger

  - Implement src/lib/logger.ts
  - Configure log levels và transports
  - Add file logging for development
  - _Requirements: 11.1, 11.2, 11.6, 11.7_

- [ ] 11.3 Add logging to API routes
  - Log all API requests
  - Log errors với stack traces
  - Log R service calls
  - _Requirements: 11.1, 11.2, 11.5_

- [x] 12. Environment Configuration

- [x] 12.1 Create environment files

  - Create .env.example với all variables
  - Create .env.local for development
  - Document each variable
  - _Requirements: 9.1, 9.2, 9.7_

- [x] 12.2 Configure environment variables

  - Add DATABASE_URL
  - Add NEXTAUTH_URL và NEXTAUTH_SECRET
  - Add R_SERVICE_URL
  - Add optional Google OAuth credentials
  - _Requirements: 9.3, 9.4, 9.5_

- [x] 12.3 Add environment validation


  - Validate required variables on startup
  - Provide helpful error messages
  - _Requirements: 9.6_

- [ ]* 13. Setup Testing
- [ ]* 13.1 Configure Vitest
  - Install Vitest và testing utilities
  - Create vitest.config.ts
  - Add test scripts to package.json
  - _Requirements: 12.1, 12.3_

- [ ]* 13.2 Write unit tests for R service client
  - Test successful API calls
  - Test timeout handling
  - Test error handling
  - _Requirements: 12.5_

- [ ]* 13.3 Configure Playwright
  - Install Playwright
  - Create playwright.config.ts
  - Add E2E test scripts
  - _Requirements: 12.2, 12.3_

- [ ]* 13.4 Write E2E tests
  - Test authentication flow
  - Test project CRUD operations
  - Test file upload
  - Test analytics flow
  - _Requirements: 12.6_

- [x] 14. Create Documentation và Scripts


- [x] 14.1 Write README


  - Document project overview
  - Add setup instructions
  - Add development workflow
  - Add troubleshooting guide
  - _Requirements: 10.7_

- [x] 14.2 Create npm scripts

  - Add dev, build, start scripts
  - Add db:migrate, db:seed scripts
  - Add r:start script for R service
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 14.3 Create deployment guide


  - Document local deployment steps
  - Document production deployment
  - Add PM2 configuration example
  - _Requirements: 10.7_

- [x] 15. Final Testing và Cleanup





- [x] 15.1 Integration testing


  - Test complete user flows
  - Test all API endpoints
  - Test R analytics integration
  - Verify error handling
  - _Requirements: All_

- [x] 15.2 Remove Django backend


  - Backup Django code
  - Remove Django directory
  - Update .gitignore
  - _Requirements: 7.7_

- [x] 15.3 Performance testing


  - Test with large datasets
  - Verify R service timeout handling
  - Check database query performance
  - _Requirements: All_

