# NCSKIT Frontend Setup Guide

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:3000

## 🔐 Authentication Configuration

### Current Setup (No Authentication Required)

Hiện tại, ứng dụng được cấu hình để **không yêu cầu đăng nhập** cho bất kỳ trang nào. Bạn có thể truy cập tất cả các trang một cách tự do.

### Configuration File

File cấu hình authentication: `src/config/auth.ts`

```typescript
export const authConfig = {
  // Set to false to disable authentication globally
  requireAuth: false,  // ← Hiện tại đang tắt authentication
  
  // Configure which routes require authentication
  protectedRoutes: [
    '/dashboard',
    '/projects', 
    '/references',
    '/editor',
    // ... other routes
  ],
  
  // Routes that don't require authentication
  publicRoutes: [
    '/',
    '/login',
    '/features',
    '/about',
  ],
}
```

### Cách Bật/Tắt Authentication

#### Option 1: Thay đổi trong code
Mở file `src/config/auth.ts` và thay đổi:
```typescript
requireAuth: true,  // Bật authentication
// hoặc
requireAuth: false, // Tắt authentication
```

#### Option 2: Sử dụng Dev Settings (Development only)
- Trong development mode, bạn sẽ thấy nút "Dev Settings" ở góc dưới bên phải
- Click vào để toggle authentication on/off
- **Lưu ý**: Chỉ ảnh hưởng đến UI state, không thay đổi config file

## 📱 Available Pages

### Public Pages (Luôn truy cập được)
- **Home** (`/`) - Trang chủ với hero section và features
- **Features** (`/features`) - Chi tiết các tính năng
- **About** (`/about`) - Giới thiệu về NCSKIT
- **Login** (`/login`) - Trang đăng nhập

### Dashboard Pages (Có thể yêu cầu auth)
- **Dashboard** (`/dashboard`) - Tổng quan dự án và hoạt động
- **Projects** (`/projects`) - Quản lý dự án nghiên cứu
- **References** (`/references`) - Quản lý tài liệu tham khảo
- **Smart Editor** (`/editor`) - Trình soạn thảo AI
- **Topic Suggestions** (`/topics`) - Gợi ý chủ đề nghiên cứu
- **Journal Matcher** (`/journals`) - Tìm journal phù hợp
- **Review Manager** (`/reviews`) - Quản lý peer review
- **Analytics** (`/analytics`) - Phân tích và báo cáo

## 🎨 UI Features

### Responsive Design
- **Desktop**: Full sidebar navigation
- **Tablet/Mobile**: Collapsible navigation

### Navigation
- **Public pages**: Simple top navigation
- **Dashboard pages**: Full sidebar + top navbar

### Demo Data
- Tất cả các trang đều có mock data để demo
- Không cần backend để xem giao diện

## 🔧 Development Features

### Hot Reload
- Tự động reload khi thay đổi code
- Fast refresh cho React components

### TypeScript
- Full TypeScript support
- Type checking và IntelliSense

### Tailwind CSS v4
- Modern CSS framework
- Custom design system với semantic colors

### State Management
- Zustand cho global state
- Persistent auth state

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard routes (có thể protected)
│   ├── features/          # Features page
│   ├── about/             # About page
│   └── page.tsx           # Home page
├── components/
│   ├── ui/               # Base UI components
│   ├── layout/           # Navigation components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   └── dev/              # Development tools
├── config/
│   └── auth.ts           # Authentication configuration
├── store/                # Zustand stores
├── types/                # TypeScript definitions
└── lib/                  # Utilities
```

## 🚀 Next Steps

1. **Explore the UI**: Truy cập http://localhost:3000 và khám phá các trang
2. **Toggle Auth**: Thử bật/tắt authentication để test flow
3. **Customize**: Thay đổi colors, content theo ý muốn
4. **Backend Integration**: Kết nối với Django backend khi sẵn sàng

## 📝 Notes

- Hiện tại tất cả data đều là mock data
- Authentication chỉ là UI flow, chưa có backend validation
- Tất cả trang đều responsive và accessible
- Development server chạy trên port 3000