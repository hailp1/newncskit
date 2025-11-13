# 🚀 NCSKIT - Quick Start Guide

## ✅ Trạng Thái Hiện Tại

**Ứng dụng đang chạy thành công tại:** http://localhost:3000

### Services Đang Hoạt Động

| Service | Port | Status |
|---------|------|--------|
| Next.js App | 3000 | ✅ Running |
| PostgreSQL | 5432 | ✅ Healthy |
| R Analytics | 8000 | ✅ Healthy |

---

## 🎯 Bắt Đầu Sử Dụng (3 Bước)

### Bước 1: Mở Ứng Dụng
Mở trình duyệt và truy cập: **http://localhost:3000**

### Bước 2: Đăng Ký Tài Khoản
1. Click vào "Đăng ký" hoặc truy cập: http://localhost:3000/register
2. Nhập thông tin:
   ```
   Email: test@example.com
   Password: password123
   Name: Test User
   ```
3. Click "Đăng ký"

### Bước 3: Bắt Đầu Sử Dụng
1. Đăng nhập với tài khoản vừa tạo
2. Tạo project mới
3. Upload file CSV
4. Chạy phân tích (Sentiment/Clustering/Topics)

---

## 📊 Tính Năng Chính

### 1. Quản Lý Projects
- Tạo, xem, sửa, xóa projects
- Tổ chức datasets theo projects

### 2. Upload Datasets
- Hỗ trợ file CSV
- Tự động phân tích cấu trúc dữ liệu
- Lưu trữ an toàn

### 3. Phân Tích Dữ Liệu

#### Sentiment Analysis (Phân tích cảm xúc)
- Phân tích cảm xúc văn bản tiếng Việt
- Điểm số từ -1 (tiêu cực) đến +1 (tích cực)
- Biểu đồ trực quan

#### Clustering (Phân nhóm)
- Tự động phân nhóm dữ liệu
- Xác định patterns và trends
- Visualization với charts

#### Topic Modeling (Phân tích chủ đề)
- Trích xuất chủ đề chính
- Từ khóa quan trọng
- Phân phối chủ đề

---

## 🔧 Quản Lý Services

### Xem Logs
```bash
# Next.js logs (trong terminal đang chạy npm run dev)
# Hoặc xem process output

# PostgreSQL logs
docker logs config-postgres-1

# R Service logs
docker logs ncskit-r-analytics
```

### Kiểm Tra Health
```bash
# Chạy health check script
cd frontend
node scripts/check-services.js
```

### Dừng Ứng Dụng
```bash
# Dừng Next.js
Ctrl + C (trong terminal đang chạy npm run dev)

# Dừng containers (nếu cần)
docker stop config-postgres-1 ncskit-r-analytics
```

### Khởi Động Lại
```bash
# Đảm bảo containers đang chạy
docker start config-postgres-1 ncskit-r-analytics

# Khởi động Next.js
cd frontend
npm run dev
```

---

## 🐛 Troubleshooting

### Ứng dụng không mở được?
1. Kiểm tra port 3000 có bị chiếm không:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Xem logs trong terminal
3. Thử refresh trình duyệt (Ctrl + F5)

### Không kết nối được database?
```bash
# Kiểm tra PostgreSQL
docker ps | findstr postgres

# Khởi động lại nếu cần
docker restart config-postgres-1
```

### R Service không hoạt động?
```bash
# Kiểm tra R service
curl http://localhost:8000/health

# Khởi động lại nếu cần
docker restart ncskit-r-analytics
```

### Lỗi khi đăng ký/đăng nhập?
1. Kiểm tra database đang chạy
2. Xem logs trong terminal Next.js
3. Thử xóa cookies và refresh

---

## 📝 Notes

### Warning về DialogContent
Có một accessibility warning về `DialogContent` - đây chỉ là warning không ảnh hưởng chức năng. Ứng dụng vẫn hoạt động bình thường.

### Development Mode
Ứng dụng đang chạy ở development mode với:
- Hot reload (tự động refresh khi code thay đổi)
- Detailed error messages
- Development tools enabled

### Database
- Database mới được tạo (0 users)
- Tất cả tables đã sẵn sàng
- Có thể xem database với Prisma Studio:
  ```bash
  cd frontend
  npm run db:studio
  ```
  Mở: http://localhost:5555

---

## 📚 Tài Liệu Chi Tiết

- **Setup đầy đủ:** `LOCAL_SETUP_GUIDE.md`
- **Trạng thái chi tiết:** `LOCAL_RUNNING_STATUS.md`
- **Migration guide:** `README_NODEJS_MIGRATION.md`
- **Testing guide:** `frontend/PERFORMANCE_TESTING_GUIDE.md`

---

## 🎉 Bạn Đã Sẵn Sàng!

Ứng dụng NCSKIT đang chạy thành công tại local. Hãy:

1. ✅ Mở http://localhost:3000
2. ✅ Đăng ký tài khoản
3. ✅ Tạo project đầu tiên
4. ✅ Upload dataset và chạy phân tích

**Chúc bạn sử dụng thành công! 🚀**

---

## 💡 Tips

- Sử dụng Ctrl + K để mở command palette (nếu có)
- Xem API documentation tại `frontend/README.md`
- Chạy tests: `cd frontend && npm test`
- Xem database: `npm run db:studio`

---

**Cần hỗ trợ?** Xem các file documentation trong thư mục project.
