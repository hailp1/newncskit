# Hướng dẫn khắc phục lỗi Backend Connection

## Vấn đề
Frontend không thể kết nối tới Django backend API tại `localhost:8001` vì backend chưa chạy.

Lỗi: `ERR_CONNECTION_REFUSED` khi POST tới `/api/blog/api/posts/`

## Nguyên nhân
Django backend container chưa được start trong Docker.

## Giải pháp

### Bước 1: Start Django Backend với Docker

Mở terminal và chạy:

```bash
cd config
docker-compose up django-backend postgres redis
```

Hoặc để chạy tất cả services (bao gồm R Analytics):

```bash
cd config
docker-compose up
```

Để chạy ở background (detached mode):

```bash
cd config
docker-compose up -d django-backend postgres redis
```

### Bước 2: Kiểm tra Backend đã chạy

Kiểm tra container:

```bash
docker ps
```

Bạn sẽ thấy container `django-backend` đang chạy ở port 8001.

Kiểm tra health endpoint:

```bash
curl http://localhost:8001/health/
```

Hoặc mở trình duyệt: http://localhost:8001/admin/

### Bước 3: Restart Frontend (nếu cần)

Nếu frontend đang chạy, restart lại để load biến môi trường mới:

```bash
cd frontend
npm run dev
```

## Kiểm tra kết nối

Sau khi backend chạy, thử tạo blog post lại. Lỗi `ERR_CONNECTION_REFUSED` sẽ biến mất.

## Troubleshooting

### Nếu container không start được:

1. Kiểm tra logs:
```bash
docker-compose logs django-backend
```

2. Rebuild container:
```bash
cd config
docker-compose build django-backend
docker-compose up django-backend
```

3. Kiểm tra port 8001 có bị chiếm không:
```bash
netstat -ano | findstr :8001
```

### Nếu database connection lỗi:

Đảm bảo PostgreSQL container đang chạy:
```bash
docker-compose up postgres
```

## Cấu hình đã được cập nhật

✅ Đã thêm `NEXT_PUBLIC_BACKEND_URL=http://localhost:8001` vào `frontend/.env.local`

## Lưu ý

- Backend Django chạy trong Docker container ở port 8001
- R Analytics chạy ở port 8000
- Frontend Next.js chạy ở port 3000
- PostgreSQL chạy ở port 5432
- Redis chạy ở port 6379

Tất cả services cần chạy đồng thời để ứng dụng hoạt động đầy đủ.
