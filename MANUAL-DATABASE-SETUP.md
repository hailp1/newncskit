# Hướng Dẫn Setup Database Thủ Công

Docker Desktop đang gặp vấn đề khởi động. Hãy làm theo các bước sau:

## Bước 1: Kiểm Tra Docker Desktop

1. **Mở Docker Desktop app** từ Start Menu hoặc system tray
2. **Xem có thông báo lỗi không**
3. **Nếu thấy lỗi**, thử:
   - Click "Restart" trong Docker Desktop
   - Hoặc tắt hoàn toàn và mở lại

## Bước 2: Đợi Docker Sẵn Sàng

Trong PowerShell, chạy lệnh này để kiểm tra:
```powershell
docker ps
```

- Nếu thấy danh sách containers (có thể rỗng) → Docker đã sẵn sàng ✅
- Nếu thấy lỗi "cannot connect" → Docker chưa sẵn sàng, đợi thêm

## Bước 3: Start PostgreSQL

Khi Docker đã sẵn sàng:
```powershell
docker-compose -f docker-compose.production.yml up -d postgres
```

Đợi 10-15 giây cho PostgreSQL khởi động.

## Bước 4: Khởi Tạo Database

```powershell
cd frontend
npx prisma db push
```

Lệnh này sẽ:
- Tạo database schema
- Tạo tất cả các tables
- Báo "Your database is now in sync" khi xong

## Bước 5: Restart Dev Server

1. Trong terminal đang chạy dev server, nhấn **Ctrl+C**
2. Chạy lại:
```powershell
npm run dev
```

## Bước 6: Test

1. Mở browser: http://localhost:3000
2. Refresh trang
3. Kiểm tra:
   - ✅ Không còn lỗi 500
   - ✅ Blog posts load được
   - ✅ Đăng nhập hoạt động

## Nếu Vẫn Gặp Vấn Đề

### Docker Không Khởi Động Được

**Giải pháp 1: Restart Windows**
- Đôi khi Docker cần restart máy để hoạt động

**Giải pháp 2: Reinstall Docker Desktop**
- Uninstall Docker Desktop
- Download phiên bản mới từ: https://www.docker.com/products/docker-desktop
- Install lại

**Giải pháp 3: Dùng Cloud Database**
- Tạo free PostgreSQL database trên Supabase hoặc Neon
- Update DATABASE_URL trong `.env.local`
- Chạy `npx prisma db push`

### PostgreSQL Container Không Start

Kiểm tra logs:
```powershell
docker logs ncskit-postgres
```

Nếu thấy lỗi port conflict:
```powershell
# Stop local PostgreSQL service
Stop-Service postgresql
# Rồi thử lại
docker-compose -f docker-compose.production.yml up -d postgres
```

## Kiểm Tra Trạng Thái

### Docker đang chạy?
```powershell
docker ps
```

### PostgreSQL container đang chạy?
```powershell
docker ps --filter "name=ncskit-postgres"
```

### Database connection OK?
```powershell
cd frontend
npx prisma migrate status
```

## Cần Trợ Giúp?

Nếu gặp lỗi, copy thông báo lỗi và báo cho tôi biết!
