# Kế Hoạch Triển Khai - Tái Cấu Trúc Kiến Trúc

## Tổng Quan

Kế hoạch này chia việc tái cấu trúc thành các tasks có thể thực hiện tuần tự. Mỗi task build dựa trên task trước đó và kết thúc với việc tích hợp hoàn chỉnh.

## Tasks

- [x] 1. Setup Supabase Project và Database Schema



  - Tạo Supabase project mới
  - Tạo database schema (tables, indexes)
  - Thiết lập Row Level Security policies
  - Cấu hình Storage buckets và policies
  - Thiết lập Authentication providers
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Migrate Database từ Local PostgreSQL sang Supabase



  - Export schema và data từ local PostgreSQL
  - Transform schema cho Supabase (adjust user references)
  - Import schema vào Supabase
  - Import data vào Supabase
  - Verify data integrity sau migration
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 3. Update Frontend Code để sử dụng Supabase





- [x] 3.1 Cài đặt và cấu hình Supabase client



  - Cài đặt `@supabase/supabase-js` và `@supabase/ssr`
  - Tạo Supabase client cho browser (`src/lib/supabase/client.ts`)
  - Tạo Supabase client cho server (`src/lib/supabase/server.ts`)
  - Tạo middleware cho authentication (`src/lib/supabase/middleware.ts`)
  - Cấu hình environment variables cho Supabase
  - _Requirements: 2.1, 7.2, 7.3_

- [x] 3.2 Thay thế database queries bằng Supabase client



  - Update tất cả queries trong `src/services/` để sử dụng Supabase
  - Thay thế direct PostgreSQL connections
  - Update error handling cho Supabase errors
  - _Requirements: 2.1, 9.1_

- [x] 3.3 Migrate authentication sang Supabase Auth





  - Thay thế NextAuth configuration bằng Supabase Auth
  - Update login/signup pages để sử dụng Supabase Auth
  - Implement session management với Supabase
  - Update protected routes middleware
  - _Requirements: 2.4, 9.2_

- [x] 3.4 Update file upload để sử dụng Supabase Storage



  - Thay thế local file storage bằng Supabase Storage
  - Update upload logic trong components
  - Implement file URL generation từ Supabase
  - _Requirements: 2.3, 9.4_

- [x] 3.5 Remove unused dependencies



  - Xóa `pg`, `bcryptjs`, `jsonwebtoken`, `next-auth` từ package.json
  - Xóa unused imports trong code
  - Update TypeScript types
  - _Requirements: 9.5_

- [-] 4. Build Docker R Analytics Module



- [x] 4.1 Tạo R Analytics API structure




  - Tạo thư mục `r-analytics/`
  - Tạo main API file (`api.R`) với plumber
  - Implement health check endpoint
  - Implement sentiment analysis endpoint
  - Implement clustering endpoint
  - Implement topic modeling endpoint
  - _Requirements: 3.2, 3.3_





- [ ] 4.2 Tạo Dockerfile và Docker Compose
  - Viết Dockerfile với R runtime và dependencies
  - Cấu hình Docker Compose với resource limits
  - Thiết lập health check trong Docker
  - Cấu hình logging

  - _Requirements: 3.1, 3.4, 3.5, 3.6_



- [x] 4.3 Build và test Docker container locally


  - Build Docker image
  - Run container và verify health endpoint
  - Test tất cả analytics endpoints
  - Verify logging hoạt động
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 5. Setup Cloudflare Tunnel

- [x] 5.1 Install và authenticate Cloudflare Tunnel


  - Install cloudflared CLI
  - Authenticate với Cloudflare account
  - _Requirements: 4.4_

- [x] 5.2 Create và configure tunnel


  - Create tunnel với tên `ncskit-analytics`
  - Cấu hình tunnel config file
  - Route DNS cho tunnel subdomain
  - _Requirements: 4.1, 4.2_

- [x] 5.3 Setup tunnel auto-start service


  - Cấu hình systemd service (Linux) hoặc Windows Service
  - Enable auto-start on boot
  - Test tunnel reconnection
  - _Requirements: 4.3, 4.6_

- [x] 6. Implement API Gateway trong Next.js

- [x] 6.1 Tạo Analytics API Gateway


  - Tạo `/api/analytics/route.ts` với POST handler
  - Implement request validation
  - Implement forwarding logic đến Docker service
  - _Requirements: 5.1, 5.2, 5.7_

- [x] 6.2 Implement Circuit Breaker pattern

  - Tạo circuit breaker state management
  - Implement failure tracking
  - Implement auto-recovery logic
  - _Requirements: 5.4, 8.6_

- [x] 6.3 Implement caching layer

  - Implement cache check trước khi forward
  - Implement cache storage sau khi nhận response
  - Sử dụng Supabase `analytics_cache` table
  - _Requirements: 5.5_

- [x] 6.4 Implement retry logic và timeout

  - Add retry logic cho failed requests
  - Implement timeout cho Docker service calls
  - Handle timeout errors gracefully
  - _Requirements: 5.4, 5.6_

- [x] 7. Implement Health Check System




- [x] 7.1 Tạo health check endpoints


  - Tạo `/api/health/vercel/route.ts`
  - Tạo `/api/health/supabase/route.ts`
  - Tạo `/api/health/docker/route.ts`
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 7.2 Tạo health monitoring dashboard


  - Tạo `/admin/health/page.tsx`
  - Implement real-time health status display
  - Add auto-refresh mỗi 30 giây
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 7.3 Setup error logging và monitoring


  - Integrate Sentry hoặc Vercel Analytics
  - Implement error logging trong API routes
  - Setup notification cho health check failures
  - _Requirements: 8.5, 8.7_

- [x] 8. Environment Configuration Management





- [x] 8.1 Tạo environment files


  - Tạo `.env.local` cho development
  - Tạo `.env.production` template
  - Document tất cả required variables
  - _Requirements: 7.1, 7.6_

- [x] 8.2 Update environment variable references


  - Update tất cả `process.env` references
  - Add Supabase environment variables
  - Add Cloudflare Tunnel URL variable
  - Add Analytics API key variable
  - _Requirements: 7.2, 7.3, 7.4, 9.6_

- [x] 8.3 Implement environment validation


  - Tạo validation function cho required env vars
  - Run validation khi app khởi động
  - Provide helpful error messages
  - _Requirements: 7.5_

- [x] 9. Update Next.js Configuration




- [x] 9.1 Update next.config.ts


  - Remove PostgreSQL webpack externals
  - Update image domains cho Supabase Storage
  - Add Cloudflare Tunnel URL to allowed origins
  - Update environment variables exposure
  - _Requirements: 9.1, 9.6_

- [x] 9.2 Create vercel.json configuration


  - Cấu hình build settings
  - Cấu hình routes và rewrites
  - Cấu hình headers
  - _Requirements: 1.2_

- [-] 10. Deploy và Testing


- [x] 10.1 Setup Vercel project


  - Link project với Vercel CLI
  - Add environment variables trong Vercel dashboard
  - Configure deployment settings
  - _Requirements: 1.1, 1.2, 7.2, 7.3, 7.4_

- [x] 10.2 Deploy lên Vercel




  - Push code lên Git repository
  - Trigger Vercel deployment
  - Verify deployment thành công
  - _Requirements: 1.1, 1.4_


- [-] 10.3 Test production deployment



  - Test frontend pages load correctly
  - Test Supabase connection
  - Test authentication flow
  - Test file upload to Supabase Storage
  - Test analytics API calls đến Docker
  - Test health check endpoints
  - _Requirements: 1.3, 2.1, 2.4, 2.3, 5.2, 8.1, 8.2, 8.3_

- [ ] 10.4 Run integration tests
  - Run API integration tests
  - Run E2E tests với Playwright
  - Verify tất cả flows hoạt động end-to-end
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 11. Documentation
- [ ] 11.1 Viết architecture documentation
  - Document kiến trúc tổng thể với diagrams
  - Explain luồng dữ liệu
  - Document security measures
  - _Requirements: 10.1_

- [ ] 11.2 Viết setup guides
  - Hướng dẫn setup Supabase project
  - Hướng dẫn setup Cloudflare Tunnel
  - Hướng dẫn build và run Docker container
  - Hướng dẫn deploy lên Vercel
  - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [ ] 11.3 Viết configuration guide
  - Document tất cả environment variables
  - Hướng dẫn configure cho dev/staging/prod
  - _Requirements: 10.6_

- [ ] 11.4 Viết troubleshooting guide
  - Common issues và solutions
  - Debug tips cho mỗi component
  - Contact information cho support
  - _Requirements: 10.7_

- [ ] 11.5 Viết API documentation
  - Document Docker analytics endpoints
  - Document request/response formats
  - Provide example requests
  - _Requirements: 10.8_

## Ghi Chú

- **QUAN TRỌNG**: Thực hiện tasks theo đúng thứ tự từ 1 → 11
- Mỗi task phải hoàn thành và đánh dấu `[x]` trước khi chuyển sang task tiếp theo
- Không được bỏ qua bất kỳ task nào
- Backup database trước khi migration (Task 2)
- Keep Docker container và Cloudflare Tunnel running trong quá trình development
- Monitor health checks thường xuyên sau khi deploy production
