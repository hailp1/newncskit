# Hướng Dẫn Deploy Lên Vercel

## Phương Án 1: Deploy Qua Vercel Dashboard (Khuyến Nghị)

### Bước 1: Tạo Tài Khoản Vercel
1. Truy cập: https://vercel.com/signup
2. Đăng ký bằng GitHub, GitLab, hoặc Bitbucket

### Bước 2: Import Project
1. Đăng nhập vào Vercel Dashboard: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Chọn "Import Git Repository"
4. Authorize Vercel để truy cập GitHub repository của bạn
5. Chọn repository: `newncskit`

### Bước 3: Cấu Hình Project
```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Bước 4: Thêm Environment Variables
Trong phần "Environment Variables", thêm các biến sau:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_R_ANALYTICS_URL=your_r_analytics_url
```

### Bước 5: Deploy
1. Click "Deploy"
2. Đợi 2-3 phút để build hoàn tất
3. Nhận được URL production

---

## Phương Án 2: Deploy Qua Vercel CLI

### Bước 1: Cài Đặt Vercel CLI
Mở PowerShell mới với quyền Administrator:
```powershell
npm install -g vercel
```

### Bước 2: Đóng và Mở Lại PowerShell
Sau khi cài đặt, đóng PowerShell và mở lại để refresh PATH

### Bước 3: Login
```powershell
vercel login
```
Làm theo hướng dẫn trên browser để login

### Bước 4: Deploy
```powershell
cd frontend
vercel --prod
```

---

## Phương Án 3: Build Local và Upload Manual

### Bước 1: Build Production
```powershell
cd frontend
npm run build:vercel
```

### Bước 2: Test Local
```powershell
npm start
```
Truy cập http://localhost:3000 để kiểm tra

### Bước 3: Upload lên Vercel
1. Vào Vercel Dashboard
2. Drag & drop thư mục `frontend` vào Vercel
3. Vercel sẽ tự động detect Next.js và deploy

---

## Kiểm Tra Sau Khi Deploy

### 1. Health Check
```
https://your-domain.vercel.app/api/health/check
```

### 2. Test API Routes
```
https://your-domain.vercel.app/api/analysis/health
```

### 3. Test Frontend
```
https://your-domain.vercel.app
```

---

## Troubleshooting

### Lỗi Build
- Kiểm tra logs trong Vercel Dashboard
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra environment variables

### Lỗi Runtime
- Kiểm tra Vercel Function Logs
- Verify Supabase connection
- Check API endpoints

### Performance Issues
- Enable Edge Functions nếu cần
- Optimize images với next/image
- Enable caching headers

---

## Auto Deploy (Khuyến Nghị)

Sau khi setup lần đầu, mọi push lên `main` branch sẽ tự động deploy:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel sẽ tự động:
1. Detect changes
2. Build project
3. Run tests (nếu có)
4. Deploy to production
5. Gửi notification

---

## Custom Domain (Optional)

1. Vào Project Settings → Domains
2. Add custom domain
3. Update DNS records theo hướng dẫn
4. Đợi DNS propagation (5-10 phút)

---

## Monitoring

### Vercel Analytics
- Tự động enabled cho mọi project
- Xem real-time metrics
- Track Core Web Vitals

### Logs
- Function Logs: Real-time logs cho API routes
- Build Logs: Chi tiết quá trình build
- Runtime Logs: Errors và warnings

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Community: https://github.com/vercel/vercel/discussions
