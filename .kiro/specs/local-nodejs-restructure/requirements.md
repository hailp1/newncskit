# Tài Liệu Yêu Cầu - Tái Cấu Trúc Dự Án Chạy Local với Node.js

## Giới Thiệu

Dự án NCSKIT cần được tái cấu trúc để chạy hoàn toàn local với kiến trúc đơn giản hơn:
- **Frontend và Backend**: Chạy trên Next.js (Node.js) với API routes
- **Database**: PostgreSQL local hoặc SQLite
- **R Analytics**: Chỉ được gọi khi cần tính toán các chỉ số định lượng
- **Mục tiêu**: Đơn giản hóa deployment, dễ dàng phát triển và debug local

## Bảng Thuật Ngữ

- **Next.js Application**: Ứng dụng full-stack chạy trên Node.js, bao gồm frontend và backend API
- **API Routes**: Backend endpoints được định nghĩa trong Next.js (folder `app/api/`)
- **R Analytics Service**: Service riêng biệt chạy R, chỉ được gọi khi cần phân tích định lượng
- **Database**: PostgreSQL chạy local
- **ORM**: Prisma để quản lý database
- **Authentication**: NextAuth.js cho quản lý đăng nhập
- **File Storage**: Local file system hoặc MinIO (S3-compatible)

## Yêu Cầu

### Yêu Cầu 1: Thiết Lập Next.js Full-Stack Application

**User Story:** Là một developer, tôi muốn có một Next.js application chạy cả frontend và backend để đơn giản hóa kiến trúc

#### Tiêu Chí Chấp Nhận

1. THE Next.js Application SHALL chạy trên một port duy nhất (ví dụ: 3000)
2. THE Next.js Application SHALL serve frontend pages và API routes
3. THE Next.js Application SHALL sử dụng App Router (không phải Pages Router)
4. THE Next.js Application SHALL có hot-reload cho cả frontend và backend code
5. WHEN developer chạy `npm run dev`, THE Application SHALL khởi động thành công
6. THE Next.js Application SHALL có TypeScript configuration đầy đủ

### Yêu Cầu 2: Tích Hợp Database Local

**User Story:** Là một developer, tôi muốn sử dụng database local để lưu trữ dữ liệu mà không cần cloud services

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL sử dụng PostgreSQL làm database
2. THE Application SHALL sử dụng Prisma ORM để quản lý database
3. THE Application SHALL có migration scripts để setup database schema
4. THE Application SHALL có seed scripts để tạo dữ liệu mẫu
5. WHEN application khởi động, THE Application SHALL tự động kết nối với database
6. THE Database connection SHALL được configure qua environment variables

### Yêu Cầu 3: Implement Authentication với NextAuth.js

**User Story:** Là một user, tôi muốn đăng nhập vào hệ thống để sử dụng các tính năng

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL sử dụng NextAuth.js cho authentication
2. THE Application SHALL hỗ trợ email/password authentication
3. THE Application SHALL hỗ trợ Google OAuth (optional)
4. THE Application SHALL lưu user sessions trong database
5. WHEN user đăng nhập thành công, THE Application SHALL tạo session token
6. THE Application SHALL có middleware để protect các routes cần authentication
7. THE Application SHALL có API endpoints cho login, logout, và register

### Yêu Cầu 4: Implement File Upload và Storage

**User Story:** Là một user, tôi muốn upload file CSV để phân tích dữ liệu

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL lưu uploaded files vào local file system
2. THE Application SHALL tạo unique filename cho mỗi uploaded file
3. THE Application SHALL validate file type và size trước khi lưu
4. THE Application SHALL lưu file metadata vào database
5. THE Application SHALL có API endpoint để upload files
6. THE Application SHALL có API endpoint để download files
7. WHEN user upload file, THE Application SHALL return file URL

### Yêu Cầu 5: Tách Biệt R Analytics Service

**User Story:** Là một developer, tôi muốn R analytics chạy như một service riêng biệt, chỉ được gọi khi cần

#### Tiêu Chí Chấp Nhận

1. THE R Analytics Service SHALL chạy trên port riêng biệt (ví dụ: 8000)
2. THE R Analytics Service SHALL expose REST API endpoints
3. THE R Analytics Service SHALL chỉ được gọi khi user request phân tích định lượng
4. THE Next.js Application SHALL gọi R Analytics Service qua HTTP requests
5. WHEN R Service không available, THE Application SHALL hiển thị error message thân thiện
6. THE R Analytics Service SHALL có health check endpoint
7. THE R Analytics Service SHALL log tất cả requests

### Yêu Cầu 6: Implement API Routes cho Business Logic

**User Story:** Là một developer, tôi muốn tất cả business logic được xử lý trong Next.js API routes

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL có API routes cho CRUD operations của projects
2. THE Application SHALL có API routes cho CRUD operations của datasets
3. THE Application SHALL có API routes cho user management
4. THE Application SHALL có API routes để trigger R analytics
5. THE API routes SHALL validate input data trước khi xử lý
6. THE API routes SHALL return consistent response format (success/error)
7. THE API routes SHALL handle errors gracefully

### Yêu Cầu 7: Migrate Code từ Django Backend sang Next.js

**User Story:** Là một developer, tôi muốn migrate existing Django backend logic sang Next.js API routes

#### Tiêu Chí Chấp Nhận

1. THE Migration SHALL chuyển tất cả Django views thành Next.js API routes
2. THE Migration SHALL chuyển Django models thành Prisma schema
3. THE Migration SHALL chuyển Django authentication logic sang NextAuth.js
4. THE Migration SHALL preserve tất cả business logic
5. THE Migration SHALL migrate database data sang database mới
6. THE Migration SHALL update frontend code để gọi Next.js APIs thay vì Django APIs
7. WHEN migration hoàn thành, THE Django backend SHALL không còn được sử dụng

### Yêu Cầu 8: Implement R Analytics Integration

**User Story:** Là một user, tôi muốn chạy phân tích định lượng trên dữ liệu của mình

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL có API route `/api/analytics/run` để trigger R analytics
2. WHEN user request phân tích, THE API route SHALL forward request đến R Service
3. THE API route SHALL wait cho R Service response hoặc timeout sau 60 giây
4. THE API route SHALL return R analysis results đến frontend
5. THE Application SHALL cache R analysis results trong database
6. THE Application SHALL check cache trước khi gọi R Service
7. WHEN R Service timeout, THE Application SHALL return error message

### Yêu Cầu 9: Environment Configuration

**User Story:** Là một developer, tôi muốn configure application qua environment variables

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL có `.env.local` file cho development
2. THE Application SHALL có `.env.production` file cho production
3. THE Application SHALL load database connection string từ environment
4. THE Application SHALL load R Service URL từ environment
5. THE Application SHALL load NextAuth secret từ environment
6. THE Application SHALL validate required environment variables khi khởi động
7. THE Application SHALL có `.env.example` file với tất cả required variables

### Yêu Cầu 10: Development Workflow

**User Story:** Là một developer, tôi muốn có workflow đơn giản để develop và test application

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL có script `npm run dev` để start development server
2. THE Application SHALL có script `npm run build` để build production
3. THE Application SHALL có script `npm run start` để start production server
4. THE Application SHALL có script `npm run db:migrate` để run database migrations
5. THE Application SHALL có script `npm run db:seed` để seed database
6. THE Application SHALL có script `npm run r:start` để start R Analytics Service
7. THE Application SHALL có README với hướng dẫn setup đầy đủ

### Yêu Cầu 11: Error Handling và Logging

**User Story:** Là một developer, tôi muốn có error handling và logging tốt để debug issues

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL log tất cả API requests
2. THE Application SHALL log tất cả errors với stack trace
3. THE Application SHALL có centralized error handler cho API routes
4. THE Application SHALL return user-friendly error messages
5. THE Application SHALL log R Service calls và responses
6. THE Application SHALL có log levels (debug, info, warn, error)
7. THE Application SHALL write logs vào file trong development mode

### Yêu Cầu 12: Testing Setup

**User Story:** Là một developer, tôi muốn có testing framework để test application

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL sử dụng Vitest cho unit tests
2. THE Application SHALL sử dụng Playwright cho E2E tests
3. THE Application SHALL có test scripts trong package.json
4. THE Application SHALL có test coverage reports
5. THE Application SHALL có example tests cho API routes
6. THE Application SHALL có example tests cho components
7. THE Application SHALL có CI/CD configuration để run tests

