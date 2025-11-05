# NCSKit - Hệ thống Hỗ trợ Nghiên cứu Khoa học Toàn diện

## 🎯 Tổng quan

NCSKit (Nghiên Cứu Khoa học Kit) là một nền tảng toàn diện hỗ trợ các nhà nghiên cứu trong việc thực hiện nghiên cứu khoa học từ A đến Z. Hệ thống tích hợp AI và các công cụ phân tích thống kê tiên tiến để tối ưu hóa quy trình nghiên cứu.

## 🌟 Tính năng chính

### 📊 Quản lý Dự án Nghiên cứu
- **Tạo dự án tự động**: AI tạo đề cương nghiên cứu dựa trên lĩnh vực và mô hình lý thuyết
- **Theo dõi tiến độ**: Hệ thống milestone và progress tracking
- **Quản lý tài liệu**: Lưu trữ và tổ chức tài liệu nghiên cứu
- **Collaboration**: Làm việc nhóm với nhiều nghiên cứu viên

### 🔬 Thiết kế Nghiên cứu
- **Khung lý thuyết**: Thư viện 50+ mô hình lý thuyết phổ biến
- **Biến nghiên cứu**: Định nghĩa và quản lý biến độc lập/phụ thuộc
- **Giả thuyết**: Xây dựng và kiểm định giả thuyết nghiên cứu
- **Phương pháp**: Hướng dẫn chọn phương pháp nghiên cứu phù hợp

### 📋 Xây dựng Survey
- **Survey Builder**: Công cụ tạo khảo sát trực quan
- **Question Bank**: Ngân hàng câu hỏi chuẩn hóa
- **Validation**: Kiểm tra độ tin cậy và giá trị của thang đo
- **Multi-language**: Hỗ trợ tiếng Việt và tiếng Anh

### 🎯 Quản lý Chiến dịch Thu thập Dữ liệu
- **Campaign Management**: Quản lý chiến dịch khảo sát
- **Token System**: Hệ thống thưởng token cho người tham gia
- **Participant Targeting**: Nhắm mục tiêu đối tượng phù hợp
- **Real-time Monitoring**: Theo dõi tiến độ thu thập dữ liệu

### 📈 Phân tích Dữ liệu Nâng cao
- **Descriptive Statistics**: Thống kê mô tả cơ bản
- **Reliability Analysis**: Phân tích độ tin cậy Cronbach's Alpha
- **Factor Analysis**: EFA và CFA
- **SEM**: Mô hình phương trình cấu trúc
- **Advanced Analytics**: Regression, ANOVA, T-test

### 📝 Hệ thống Blog Khoa học
- **Knowledge Sharing**: Chia sẻ kiến thức nghiên cứu
- **SEO Optimized**: Tối ưu hóa công cụ tìm kiếm
- **Multi-format**: Hỗ trợ markdown, LaTeX, biểu đồ
- **Community**: Cộng đồng nghiên cứu viên

## 🏗️ Kiến trúc Hệ thống

### Frontend (Next.js 14)
```
frontend/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   ├── components/          # React Components
│   ├── services/           # API Services
│   ├── hooks/              # Custom Hooks
│   ├── store/              # State Management
│   ├── types/              # TypeScript Types
│   └── lib/                # Utilities
├── public/                 # Static Assets
└── docs/                   # Documentation
```

### Backend (Django + R)
```
backend/
├── apps/                   # Django Apps
│   ├── authentication/    # User Management
│   ├── projects/          # Project Management
│   └── analysis/          # Data Analysis
├── r_analysis/            # R Statistical Engine
│   ├── endpoints/         # R API Endpoints
│   └── analysis_server.R  # R Server
└── requirements.txt       # Python Dependencies
```

### Database (PostgreSQL)
```
database/
├── migrations/            # Database Migrations
├── seed-data/            # Initial Data
└── schemas/              # Database Schemas
```

## 🚀 Cài đặt và Triển khai

### Yêu cầu Hệ thống
- **Node.js**: >= 18.0.0
- **Python**: >= 3.9
- **R**: >= 4.0.0
- **PostgreSQL**: >= 13.0
- **Docker**: >= 20.0 (tùy chọn)

### Cài đặt Nhanh với Docker
```bash
# Clone repository
git clone https://github.com/your-org/ncskit.git
cd ncskit

# Khởi chạy với Docker
docker-compose up -d

# Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# R Server: http://localhost:8001
```

### Cài đặt Manual
```bash
# 1. Cài đặt Frontend
cd frontend
npm install
npm run dev

# 2. Cài đặt Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 3. Khởi chạy R Server
cd backend/r_analysis
Rscript analysis_server.R
```

## 📚 Hướng dẫn Sử dụng

### 1. Tạo Dự án Nghiên cứu Mới
1. Đăng nhập vào hệ thống
2. Chọn "Tạo dự án mới"
3. Chọn lĩnh vực nghiên cứu
4. Chọn mô hình lý thuyết
5. AI sẽ tự động tạo đề cương nghiên cứu

### 2. Thiết kế Survey
1. Vào phần "Survey Builder"
2. Chọn "Tạo survey từ thiết kế nghiên cứu"
3. Hệ thống tự động tạo câu hỏi từ Question Bank
4. Tùy chỉnh và kiểm tra survey
5. Xuất bản survey

### 3. Thu thập Dữ liệu
1. Tạo chiến dịch thu thập dữ liệu
2. Thiết lập tiêu chí đối tượng
3. Cấu hình hệ thống thưởng token
4. Khởi chạy chiến dịch
5. Theo dõi tiến độ real-time

### 4. Phân tích Dữ liệu
1. Upload dữ liệu hoặc sử dụng dữ liệu từ survey
2. Chọn phương pháp phân tích phù hợp
3. Cấu hình tham số phân tích
4. Chạy phân tích với R engine
5. Xuất kết quả và báo cáo

## 🔧 API Documentation

### Authentication API
```typescript
// Đăng nhập
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Đăng ký
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name"
}
```

### Projects API
```typescript
// Tạo dự án
POST /api/projects
{
  "title": "Project Title",
  "description": "Project Description",
  "business_domain_id": 1,
  "selected_models": [1, 2, 3]
}

// Lấy danh sách dự án
GET /api/projects?user_id={userId}
```

### Survey API
```typescript
// Tạo survey
POST /api/surveys
{
  "title": "Survey Title",
  "questions": [...],
  "settings": {...}
}

// Lấy survey
GET /api/surveys/{surveyId}
```

### Analysis API
```typescript
// Phân tích độ tin cậy
POST /api/analysis/reliability
{
  "data": [...],
  "scales": {...}
}

// Phân tích nhân tố
POST /api/analysis/efa
{
  "data": [...],
  "variables": [...],
  "n_factors": 3
}
```

## 🤝 Đóng góp

### Quy trình Đóng góp
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards
- **TypeScript**: Sử dụng strict mode
- **React**: Functional components với hooks
- **CSS**: Tailwind CSS với component-based styling
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 📄 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: support@ncskit.com
- **Website**: https://ncskit.com
- **Documentation**: https://docs.ncskit.com
- **Community**: https://community.ncskit.com

## 🙏 Acknowledgments

- **R Community**: Cho các package thống kê mạnh mẽ
- **Next.js Team**: Cho framework React tuyệt vời
- **Tailwind CSS**: Cho utility-first CSS framework
- **Supabase**: Cho backend-as-a-service platform
- **Vercel**: Cho deployment platform

---

**NCSKit** - Nâng tầm nghiên cứu khoa học Việt Nam 🇻🇳