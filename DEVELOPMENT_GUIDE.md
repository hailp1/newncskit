# 🚀 NCSKIT Development Guide

> **Hướng dẫn phát triển cho AI và developers tiếp tục dự án**

## 🎯 Quick Start

### 1. Khởi động dự án
```bash
# Backend
cd backend
python manage.py runserver  # http://localhost:8000

# Frontend (terminal mới)
cd frontend  
npm run dev                  # http://localhost:3000
```

### 2. Truy cập các tính năng
- **Homepage**: http://localhost:3000
- **Blog Public**: http://localhost:3000/blog (không cần login)
- **Login**: http://localhost:3000/login
- **Admin Panel**: http://localhost:3000/admin (sau khi login với admin)
- **Blog Admin**: http://localhost:3000/blog-admin (sau khi login)

### 3. Test Account
- **Username**: admin
- **Password**: admin123
- **Role**: Admin (full access)

## 🏗️ Architecture Overview

### Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected routes (cần login)
│   │   ├── admin/         # Admin panel
│   │   └── blog-admin/    # Blog management
│   ├── blog/              # Public blog (không cần login)
│   ├── login/             # Authentication
│   └── register/          # User registration
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Header, Footer)
│   ├── admin/             # Admin-specific components
│   ├── blog/              # Blog-specific components
│   ├── analytics/         # Analytics components
│   └── campaigns/         # Campaign components
├── services/              # API service layers
├── store/                 # State management (Zustand)
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities và configurations
```

### Backend Structure
```
backend/
├── apps/
│   ├── authentication/   # JWT auth, user management
│   ├── admin_management/  # Admin panel functionality
│   ├── blog/             # Blog system (posts, categories, tags)
│   ├── analytics/        # Data analysis và R integration
│   ├── surveys/          # Survey creation và management
│   ├── projects/         # Project management
│   └── question_bank/    # Question templates
├── r_analysis/           # R scripts cho statistical analysis
└── ncskit_backend/       # Django settings và configuration
```

## 🔧 Development Patterns

### 1. Component Development
```typescript
// Pattern: UI Component với TypeScript
interface ComponentProps {
  title: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
}

export function MyComponent({ title, onAction, variant = 'primary' }: ComponentProps) {
  return (
    <div className={cn("base-styles", variant === 'primary' && "primary-styles")}>
      <h2>{title}</h2>
      {onAction && <Button onClick={onAction}>Action</Button>}
    </div>
  );
}
```

### 2. API Service Pattern
```typescript
// Pattern: Service class với error handling
export class MyService {
  private baseUrl = '/api/my-endpoint';

  async getData(options: GetDataOptions): Promise<DataResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

export const myService = new MyService();
```

### 3. Django ViewSet Pattern
```python
# Pattern: ViewSet với permissions
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    
    def get_queryset(self):
        # Custom filtering logic
        return super().get_queryset().filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        # Custom endpoint logic
        pass
```

## 📋 Common Tasks

### 1. Thêm trang mới
```bash
# 1. Tạo page component
touch frontend/src/app/my-page/page.tsx

# 2. Implement component
# 3. Thêm navigation link trong header.tsx
# 4. Test routing
```

### 2. Thêm API endpoint mới
```bash
# 1. Tạo model trong models.py
# 2. Tạo serializer trong serializers.py  
# 3. Tạo viewset trong views.py
# 4. Thêm URL trong urls.py
# 5. Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 3. Thêm UI component mới
```bash
# 1. Tạo component trong components/ui/
# 2. Export trong index file nếu cần
# 3. Sử dụng trong pages/components khác
# 4. Test responsive design
```

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Run tests
npm test

# Test files location
frontend/src/test/
├── unit/           # Unit tests cho services, hooks
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── mocks/         # Mock data
```

### Backend Testing
```bash
# Run tests
python manage.py test

# Test files trong mỗi app
backend/apps/*/tests.py
```

## 🔐 Security Guidelines

### 1. Authentication
- Sử dụng JWT tokens với refresh mechanism
- Protected routes require authentication
- Role-based access control implemented

### 2. API Security
- CORS configured properly
- Input validation on all endpoints
- SQL injection protection via Django ORM
- XSS protection via proper escaping

### 3. Data Protection
- Sensitive data không được log
- Environment variables cho secrets
- Database credentials secured

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Security settings reviewed

### Production Settings
- [ ] DEBUG = False
- [ ] ALLOWED_HOSTS configured
- [ ] Database connection secured
- [ ] HTTPS enabled
- [ ] Monitoring setup

## 🐛 Debugging Tips

### Frontend Issues
```bash
# Check console errors
# Inspect network requests
# Use React DevTools
# Check Next.js build output
npm run build
```

### Backend Issues
```bash
# Check Django logs
python manage.py runserver --verbosity=2

# Database queries
python manage.py shell
>>> from django.db import connection
>>> connection.queries

# Check migrations
python manage.py showmigrations
```

## 📚 Key Resources

### Documentation
- `docs/USER_GUIDE.md` - User documentation
- `docs/SYSTEM_ARCHITECTURE.md` - Technical architecture
- `README.md` - Project overview

### Completion Status
- `PUBLIC_BLOG_COMPLETED.md` - Blog system status
- `BLOG_FIXES_COMPLETED.md` - Recent fixes
- `LAYOUT_STANDARDIZATION_COMPLETE.md` - UI standardization
- `CRITICAL_SECURITY_FIXES_COMPLETED.md` - Security updates

### Specs
- `.kiro/specs/*/requirements.md` - Feature requirements
- `.kiro/specs/*/design.md` - Technical design
- `.kiro/specs/*/tasks.md` - Implementation tasks

## 🔄 Development Workflow

### 1. Feature Development
1. Đọc spec requirements và design
2. Tạo branch mới từ main
3. Implement theo tasks trong spec
4. Test functionality
5. Update documentation
6. Create pull request

### 2. Bug Fixes
1. Reproduce issue
2. Identify root cause
3. Implement fix
4. Test fix
5. Update relevant documentation

### 3. Code Review
- Check code quality và consistency
- Verify tests pass
- Review security implications
- Ensure documentation updated

## 🎯 Next Development Priorities

### High Priority
1. **Survey Builder UI** - Complete drag-drop interface
2. **Projects Dashboard** - Implement project management
3. **Testing Coverage** - Expand unit và integration tests

### Medium Priority
1. **Real-time Features** - WebSocket integration
2. **Performance Optimization** - Database queries, caching
3. **Mobile Responsiveness** - PWA features

### Low Priority
1. **Advanced Analytics** - ML integration
2. **Internationalization** - Multi-language support
3. **Enterprise Features** - Multi-tenant architecture

---

**💡 Tips cho AI developers**:
1. Luôn đọc existing code patterns trước khi implement
2. Follow TypeScript strict mode
3. Sử dụng existing UI components thay vì tạo mới
4. Test trên cả desktop và mobile
5. Update documentation khi có changes lớn