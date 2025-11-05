# Requirements Document

## Introduction

Tái cấu trúc workflow của hệ thống NCSKit để tối ưu hóa quy trình nghiên cứu. Hiện tại Research Design và Data Collection đang nằm trong phần Analysis, cần di chuyển vào Project Creation để tạo một quy trình logic hơn: Project Setup → Data Collection → Analysis.

## Glossary

- **Project Creation Workflow**: Quy trình tạo project bao gồm basic info, research design và data collection setup
- **Analysis Workflow**: Quy trình phân tích dữ liệu chỉ tập trung vào upload file và statistical computation
- **Survey Results**: Dữ liệu thu thập được từ surveys đã tạo trong hệ thống
- **External Data**: File CSV/Excel được upload từ nguồn bên ngoài
- **NCSKit System**: Hệ thống nghiên cứu khoa học tích hợp
- **Survey Builder**: Công cụ tạo survey dựa trên research models và theoretical frameworks
- **Question Bank**: Database chứa các template câu hỏi theo từng model nghiên cứu
- **Survey Campaign**: Chiến dịch kêu gọi thành viên hệ thống tham gia survey
- **Token Reward System**: Hệ thống thưởng token cho người tham gia survey
- **Project Progress Tracking**: Hệ thống theo dõi tiến độ project qua các milestone
- **Research Variables**: Các biến nghiên cứu được định nghĩa trong theoretical models
- **Admin Fee Configuration**: Cấu hình phần trăm phí hệ thống thu từ survey campaigns

## Requirements

### Requirement 1

**User Story:** Là một researcher, tôi muốn tạo project với đầy đủ research design và data collection setup ngay từ đầu, để có thể thực hiện nghiên cứu một cách có hệ thống.

#### Acceptance Criteria

1. WHEN user truy cập trang tạo project mới, THE NCSKit_System SHALL hiển thị workflow 3 bước: Basic Info → Research Design → Data Collection
2. WHEN user hoàn thành basic information, THE NCSKit_System SHALL cho phép user chuyển sang bước Research Design
3. WHEN user hoàn thành research design, THE NCSKit_System SHALL cho phép user setup data collection methods
4. WHEN user hoàn thành tất cả 3 bước, THE NCSKit_System SHALL tạo project hoàn chỉnh với research design và data collection đã được cấu hình

### Requirement 2

**User Story:** Là một researcher, tôi muốn phần Data Analysis chỉ tập trung vào việc upload và phân tích dữ liệu, để quy trình phân tích được đơn giản và hiệu quả.

#### Acceptance Criteria

1. WHEN user truy cập trang Data Analysis, THE NCSKit_System SHALL chỉ hiển thị các bước: Data Upload → Preview → Statistical Analysis → Results
2. WHEN user upload dữ liệu, THE NCSKit_System SHALL hỗ trợ cả survey results từ hệ thống và external CSV/Excel files
3. THE NCSKit_System SHALL loại bỏ Research Design và Data Collection khỏi Analysis workflow
4. WHEN user chọn survey results, THE NCSKit_System SHALL load dữ liệu từ projects đã hoàn thành data collection

### Requirement 3

**User Story:** Là một researcher, tôi muốn có thể load dữ liệu từ surveys đã tạo trong hệ thống hoặc upload file external, để linh hoạt trong việc phân tích dữ liệu.

#### Acceptance Criteria

1. WHEN user ở bước Data Upload, THE NCSKit_System SHALL cung cấp 2 options: "Survey Results" và "Upload File"
2. WHEN user chọn "Survey Results", THE NCSKit_System SHALL hiển thị danh sách projects có dữ liệu survey available
3. WHEN user chọn "Upload File", THE NCSKit_System SHALL cho phép upload CSV/Excel files
4. THE NCSKit_System SHALL xử lý cả hai loại dữ liệu với cùng một interface phân tích

### Requirement 4

**User Story:** Là một researcher, tôi muốn project creation workflow được tích hợp seamlessly với analysis workflow, để có thể chuyển đổi dễ dàng giữa các giai đoạn nghiên cứu.

#### Acceptance Criteria

1. WHEN user hoàn thành project creation, THE NCSKit_System SHALL cung cấp option "Go to Analysis" 
2. WHEN user từ completed project chuyển sang analysis, THE NCSKit_System SHALL tự động detect survey data available
3. THE NCSKit_System SHALL maintain project context khi chuyển từ creation sang analysis
4. WHEN user có survey data từ project, THE NCSKit_System SHALL ưu tiên hiển thị survey results option trong data upload

### Requirement 5

**User Story:** Là một researcher, tôi muốn data collection setup tự động tạo survey dựa trên research design đã chọn, để tiết kiệm thời gian và đảm bảo tính khoa học.

#### Acceptance Criteria

1. WHEN user hoàn thành research design với theoretical models, THE NCSKit_System SHALL tự động suggest survey questions từ Question_Bank
2. WHEN user chọn research variables từ multiple models, THE NCSKit_System SHALL cho phép customize và combine các câu hỏi
3. THE NCSKit_System SHALL cho phép user modify survey questions theo nhu cầu cụ thể
4. WHEN survey được finalized, THE NCSKit_System SHALL lưu survey template với mapping đến research variables

### Requirement 6

**User Story:** Là một researcher, tôi muốn tạo survey campaign để thu thập dữ liệu từ community, để có đủ sample size cho nghiên cứu.

#### Acceptance Criteria

1. WHEN user tạo survey campaign, THE NCSKit_System SHALL cho phép set token reward amount cho participants
2. WHEN campaign được launched, THE NCSKit_System SHALL notify eligible members trong hệ thống
3. WHEN user hoàn thành survey, THE NCSKit_System SHALL tự động credit token reward vào account
4. THE NCSKit_System SHALL thu admin fee theo percentage được config bởi admin

### Requirement 7

**User Story:** Là một researcher, tôi muốn theo dõi tiến độ project qua các milestone rõ ràng, để quản lý timeline và deliverables hiệu quả.

#### Acceptance Criteria

1. THE NCSKit_System SHALL track project progress qua các stages: Hoàn tất ý tưởng, Hoàn tất khung lý thuyết mô hình và biến, Hoàn tất bản survey và bảng hỏi định tính
2. THE NCSKit_System SHALL track data collection stages: Hoàn tất thu thập số liệu survey/kết quả hỏi, Hoàn tất chạy phân tích các chỉ số định tính
3. THE NCSKit_System SHALL track writing stages: Hoàn tất nội dung bài sơ lượt, Hoàn tất bài với đầy đủ trích dẫn, Hoàn tất định dạng bài đúng chuẩn quốc tế, Hoàn tất quyết đạo văn
4. THE NCSKit_System SHALL track publication stages: Đã submit kèm trạng thái, Đã công bố kèm link

### Requirement 8

**User Story:** Là một admin, tôi muốn cấu hình fee percentage cho survey campaigns, để hệ thống có thể thu revenue từ việc cung cấp dịch vụ data collection.

#### Acceptance Criteria

1. WHEN admin truy cập admin panel, THE NCSKit_System SHALL cung cấp interface để set survey campaign fee percentage
2. THE NCSKit_System SHALL áp dụng fee percentage cho tất cả survey campaigns mới
3. WHEN survey campaign kết thúc, THE NCSKit_System SHALL tự động calculate và deduct admin fee
4. THE NCSKit_System SHALL provide reporting về revenue từ survey campaigns

### Requirement 9

**User Story:** Là một researcher, tôi muốn interface được cập nhật để phản ánh đúng workflow mới, để tránh confusion và tối ưi user experience.

#### Acceptance Criteria

1. THE NCSKit_System SHALL cập nhật navigation và breadcrumbs để phản ánh workflow mới
2. THE NCSKit_System SHALL cập nhật descriptions và help text để hướng dẫn user theo workflow mới  
3. THE NCSKit_System SHALL loại bỏ các references cũ đến research design trong analysis section
4. THE NCSKit_System SHALL cập nhật progress indicators để phản ánh đúng các bước trong mỗi workflow