# Tài Liệu Yêu Cầu - Tái Cấu Trúc Kiến Trúc Hệ Thống

## Giới Thiệu

Dự án NCSKIT cần được tái cấu trúc để tách biệt các thành phần theo chức năng và môi trường triển khai. Kiến trúc mới sẽ tối ưu hóa chi phí, hiệu suất và khả năng mở rộng bằng cách:
- Deploy frontend lên Vercel (serverless, CDN global)
- Sử dụng Supabase cho database, authentication, và storage
- Chạy module phân tích R trên máy local qua Docker và expose qua Cloudflare Tunnel
- Các chức năng khác chạy trên Vercel, chỉ gọi về Docker khi cần phân tích dữ liệu

## Bảng Thuật Ngữ

- **Frontend**: Ứng dụng Next.js chứa giao diện người dùng và API routes
- **Vercel**: Nền tảng serverless hosting cho Next.js applications
- **Supabase**: Backend-as-a-Service cung cấp PostgreSQL database, authentication, và storage
- **R Analytics Module**: Module phân tích dữ liệu sử dụng ngôn ngữ R, chạy trong Docker container
- **Docker Container**: Môi trường ảo hóa chứa R Analytics Module
- **Cloudflare Tunnel**: Dịch vụ tạo secure tunnel từ local machine ra internet
- **API Gateway**: Lớp trung gian điều hướng requests giữa Vercel và Docker
- **Health Check Endpoint**: API endpoint kiểm tra trạng thái của services
- **Environment Variables**: Biến môi trường chứa configuration và secrets

## Yêu Cầu

### Yêu Cầu 1: Triển Khai Frontend lên Vercel

**User Story:** Là một developer, tôi muốn deploy frontend Next.js lên Vercel để tận dụng CDN global và serverless infrastructure

#### Tiêu Chí Chấp Nhận

1. WHEN Frontend được build, THE Frontend SHALL deploy thành công lên Vercel platform
2. THE Frontend SHALL sử dụng environment variables từ Vercel dashboard cho configuration
3. THE Frontend SHALL serve static assets qua Vercel CDN với caching tối ưu
4. THE Frontend SHALL có automatic deployments khi push code lên Git repository
5. THE Frontend SHALL có preview deployments cho mỗi pull request

### Yêu Cầu 2: Tích Hợp Supabase cho Database và Authentication

**User Story:** Là một developer, tôi muốn sử dụng Supabase để quản lý database, authentication và storage thay vì tự host PostgreSQL

#### Tiêu Chí Chấp Nhận

1. THE Frontend SHALL kết nối với Supabase PostgreSQL database thông qua Supabase client
2. THE Frontend SHALL sử dụng Supabase Authentication cho user login và session management
3. THE Frontend SHALL sử dụng Supabase Storage cho file uploads và media storage
4. WHEN user đăng nhập, THE Frontend SHALL xác thực qua Supabase Auth API
5. THE Frontend SHALL lưu trữ Supabase credentials trong environment variables
6. THE Frontend SHALL implement Row Level Security policies trong Supabase database

### Yêu Cầu 3: Thiết Lập R Analytics Module trong Docker

**User Story:** Là một data analyst, tôi muốn chạy R analytics module trong Docker container trên máy local để xử lý phân tích dữ liệu phức tạp

#### Tiêu Chí Chấp Nhận

1. THE R Analytics Module SHALL chạy trong Docker container với R runtime environment
2. THE Docker Container SHALL expose REST API endpoints cho analytics functions
3. THE Docker Container SHALL có health check endpoint để verify service status
4. THE Docker Container SHALL log analytics requests và results
5. WHEN Docker Container khởi động, THE Container SHALL load tất cả R packages cần thiết
6. THE Docker Container SHALL có resource limits (CPU, memory) được cấu hình

### Yêu Cầu 4: Expose Docker Service qua Cloudflare Tunnel

**User Story:** Là một developer, tôi muốn expose Docker container ra internet qua Cloudflare Tunnel để Frontend có thể gọi analytics API một cách bảo mật

#### Tiêu Chí Chấp Nhận

1. THE Cloudflare Tunnel SHALL tạo secure connection từ local Docker container ra internet
2. THE Cloudflare Tunnel SHALL cung cấp public URL để truy cập Docker service
3. THE Cloudflare Tunnel SHALL tự động reconnect khi connection bị mất
4. THE Cloudflare Tunnel SHALL có authentication token được lưu trữ an toàn
5. WHEN Frontend gọi analytics API, THE Request SHALL được route qua Cloudflare Tunnel đến Docker container
6. THE Cloudflare Tunnel SHALL log tất cả incoming requests

### Yêu Cầu 5: Implement API Gateway Pattern

**User Story:** Là một developer, tôi muốn có API Gateway để điều hướng requests giữa Vercel functions và Docker analytics service

#### Tiêu Chí Chấp Nhận

1. THE API Gateway SHALL chạy như Next.js API routes trên Vercel
2. WHEN request cần analytics, THE API Gateway SHALL forward request đến Docker service qua Cloudflare Tunnel
3. WHEN request không cần analytics, THE API Gateway SHALL xử lý trực tiếp trên Vercel
4. THE API Gateway SHALL implement retry logic khi Docker service không available
5. THE API Gateway SHALL cache analytics results khi có thể
6. THE API Gateway SHALL return error response khi Docker service timeout
7. THE API Gateway SHALL validate requests trước khi forward đến Docker service

### Yêu Cầu 6: Migration Database từ Local PostgreSQL sang Supabase

**User Story:** Là một developer, tôi muốn migrate existing database schema và data từ local PostgreSQL sang Supabase

#### Tiêu Chí Chấp Nhận

1. THE Migration Script SHALL export schema từ local PostgreSQL database
2. THE Migration Script SHALL export data từ local PostgreSQL database
3. THE Migration Script SHALL import schema vào Supabase database
4. THE Migration Script SHALL import data vào Supabase database
5. THE Migration Script SHALL verify data integrity sau khi migration
6. THE Migration Script SHALL tạo backup trước khi migration
7. WHEN migration hoàn thành, THE Application SHALL kết nối với Supabase database thay vì local database

### Yêu Cầu 7: Environment Configuration Management

**User Story:** Là một developer, tôi muốn quản lý environment variables cho các môi trường khác nhau (development, staging, production)

#### Tiêu Chí Chấp Nhận

1. THE Application SHALL có separate environment files cho development, staging, và production
2. THE Application SHALL load Supabase credentials từ environment variables
3. THE Application SHALL load Cloudflare Tunnel URL từ environment variables
4. THE Application SHALL load Docker service URL từ environment variables
5. THE Application SHALL validate required environment variables khi khởi động
6. THE Application SHALL có fallback values cho optional environment variables
7. THE Application SHALL không commit sensitive credentials vào Git repository

### Yêu Cầu 8: Health Monitoring và Error Handling

**User Story:** Là một developer, tôi muốn monitor health của tất cả services và handle errors gracefully

#### Tiêu Chí Chấp Nhận

1. THE Frontend SHALL có health check endpoint kiểm tra Vercel service status
2. THE Frontend SHALL có health check endpoint kiểm tra Supabase connection
3. THE Frontend SHALL có health check endpoint kiểm tra Docker service availability
4. WHEN Docker service không available, THE Frontend SHALL hiển thị user-friendly error message
5. THE Frontend SHALL log errors đến monitoring service (Vercel Analytics hoặc Sentry)
6. THE Frontend SHALL implement circuit breaker pattern cho Docker service calls
7. WHEN health check fail, THE System SHALL send notification đến developers

### Yêu Cầu 9: Update Frontend Code để Sử Dụng Kiến Trúc Mới

**User Story:** Là một developer, tôi muốn update existing frontend code để tương thích với kiến trúc mới

#### Tiêu Chí Chấp Nhận

1. THE Frontend SHALL thay thế direct PostgreSQL connections bằng Supabase client
2. THE Frontend SHALL thay thế NextAuth configuration để sử dụng Supabase Auth
3. THE Frontend SHALL update API routes để sử dụng API Gateway pattern
4. THE Frontend SHALL update file upload logic để sử dụng Supabase Storage
5. THE Frontend SHALL remove unused dependencies (pg, bcryptjs, jsonwebtoken)
6. THE Frontend SHALL update environment variable references
7. WHEN analytics được request, THE Frontend SHALL gọi API Gateway thay vì direct backend call

### Yêu Cầu 10: Documentation và Deployment Guide

**User Story:** Là một developer, tôi muốn có documentation đầy đủ về kiến trúc mới và hướng dẫn deployment

#### Tiêu Chí Chấp Nhận

1. THE Documentation SHALL mô tả kiến trúc tổng thể với diagrams
2. THE Documentation SHALL có hướng dẫn setup Supabase project
3. THE Documentation SHALL có hướng dẫn setup Cloudflare Tunnel
4. THE Documentation SHALL có hướng dẫn build và run Docker container
5. THE Documentation SHALL có hướng dẫn deploy lên Vercel
6. THE Documentation SHALL có hướng dẫn configure environment variables
7. THE Documentation SHALL có troubleshooting guide cho common issues
8. THE Documentation SHALL có API documentation cho Docker analytics endpoints
