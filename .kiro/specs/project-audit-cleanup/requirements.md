# Requirements Document

## Introduction

Dự án hiện tại có quá nhiều file documentation dư thừa, code legacy từ Django/Supabase chưa được dọn dẹp, và có nhiều rủi ro tiềm ẩn cần được xử lý. Spec này định nghĩa yêu cầu cho việc audit toàn diện và cleanup dự án để đảm bảo codebase sạch sẽ, an toàn và dễ maintain.

## Glossary

- **System**: Toàn bộ dự án NCSKit bao gồm frontend (Next.js), backend legacy (Django), và R analytics service
- **Legacy Code**: Code từ Django backend và Supabase authentication đã không còn được sử dụng
- **Documentation Files**: Các file .md ở root directory chứa hướng dẫn, status, và fix guides
- **Risk**: Các vấn đề tiềm ẩn có thể gây lỗi, security issues, hoặc performance problems
- **Cleanup**: Quá trình xóa file dư thừa và tối ưu hóa cấu trúc dự án

## Requirements

### Requirement 1: Audit Documentation Files

**User Story:** Là developer, tôi muốn có một danh sách đầy đủ các file documentation dư thừa, để tôi có thể quyết định file nào cần giữ lại và file nào cần xóa.

#### Acceptance Criteria

1. THE System SHALL scan toàn bộ root directory và liệt kê tất cả file .md
2. THE System SHALL phân loại các file .md thành: Essential (cần giữ), Redundant (trùng lặp), Obsolete (lỗi thời), Debug (tạm thời)
3. THE System SHALL xác định các file có nội dung trùng lặp hoặc tương tự nhau
4. THE System SHALL đề xuất danh sách file cần xóa với lý do cụ thể
5. THE System SHALL tạo backup trước khi xóa bất kỳ file nào

### Requirement 2: Audit Legacy Backend Code

**User Story:** Là developer, tôi muốn xác định và loại bỏ toàn bộ Django backend code không còn sử dụng, để giảm confusion và tránh nhầm lẫn trong development.

#### Acceptance Criteria

1. THE System SHALL scan thư mục backend/ và xác định các file Django còn tồn tại
2. THE System SHALL kiểm tra xem có dependencies nào trong frontend còn reference đến Django backend không
3. THE System SHALL xác định các environment variables liên quan đến Django backend
4. THE System SHALL đề xuất cách xử lý backend/ directory (xóa hoặc archive)
5. THE System SHALL verify không có code nào trong frontend còn import hoặc call Django endpoints

### Requirement 3: Audit Supabase Legacy Code

**User Story:** Là developer, tôi muốn loại bỏ hoàn toàn Supabase legacy code, để dự án chỉ sử dụng NextAuth và tránh conflicts.

#### Acceptance Criteria

1. THE System SHALL scan frontend/src/ để tìm tất cả imports và references đến Supabase
2. THE System SHALL kiểm tra các environment variables liên quan đến Supabase
3. THE System SHALL xác định các file trong supabase/ directory còn cần thiết không
4. THE System SHALL verify không có Supabase client initialization nào còn active
5. THE System SHALL đề xuất xóa hoặc archive supabase/ directory

### Requirement 4: Audit Security Risks

**User Story:** Là developer, tôi muốn xác định và fix tất cả security risks trong dự án, để đảm bảo ứng dụng an toàn cho production.

#### Acceptance Criteria

1. THE System SHALL scan tất cả .env files để tìm credentials hoặc secrets bị expose
2. THE System SHALL kiểm tra các file có chứa hardcoded passwords, API keys, hoặc tokens
3. THE System SHALL verify tất cả sensitive files đã được thêm vào .gitignore
4. THE System SHALL kiểm tra các API routes có proper authentication middleware không
5. THE System SHALL scan dependencies trong package.json để tìm known vulnerabilities

### Requirement 5: Audit Code Quality Issues

**User Story:** Là developer, tôi muốn xác định các code quality issues và technical debt, để cải thiện maintainability của dự án.

#### Acceptance Criteria

1. THE System SHALL scan frontend/src/ để tìm unused imports và dead code
2. THE System SHALL xác định các TODO comments và incomplete implementations
3. THE System SHALL kiểm tra TypeScript errors và warnings
4. THE System SHALL verify tất cả API routes có proper error handling
5. THE System SHALL xác định các file có code duplication cao

### Requirement 6: Audit Performance Risks

**User Story:** Là developer, tôi muốn xác định các performance bottlenecks và risks, để đảm bảo ứng dụng chạy nhanh và ổn định.

#### Acceptance Criteria

1. THE System SHALL kiểm tra các API routes có potential timeout issues không
2. THE System SHALL xác định các database queries không có proper indexing
3. THE System SHALL scan các file có large bundle size hoặc unnecessary dependencies
4. THE System SHALL verify R analytics service có proper error handling và timeouts
5. THE System SHALL kiểm tra các caching mechanisms đang hoạt động đúng không

### Requirement 7: Execute Cleanup Actions

**User Story:** Là developer, tôi muốn thực hiện cleanup một cách an toàn với backup, để dự án trở nên sạch sẽ mà không mất dữ liệu quan trọng.

#### Acceptance Criteria

1. THE System SHALL tạo full backup của dự án trước khi cleanup
2. THE System SHALL xóa các file documentation dư thừa đã được approve
3. THE System SHALL xóa hoặc archive Django backend directory
4. THE System SHALL xóa hoặc archive Supabase directory và related files
5. THE System SHALL verify dự án vẫn build và run thành công sau cleanup

### Requirement 8: Create Clean Documentation Structure

**User Story:** Là developer, tôi muốn có một cấu trúc documentation rõ ràng và organized, để dễ dàng tìm kiếm thông tin khi cần.

#### Acceptance Criteria

1. THE System SHALL tạo docs/ directory structure hợp lý nếu chưa có
2. THE System SHALL consolidate các essential documentation vào docs/
3. THE System SHALL tạo một README.md chính với links đến các docs quan trọng
4. THE System SHALL đảm bảo mỗi major component có documentation riêng
5. THE System SHALL xóa các duplicate hoặc outdated documentation files
