# Hướng dẫn Setup Tra Cứu Lý Thuyết Khoa Học

## Tổng quan

Chức năng tra cứu lý thuyết khoa học tại `ncskit.org/model_theories` đã được tạo. Dữ liệu từ `model_theories/model/theories.json` sẽ được import vào database và hiển thị qua Next.js.

## Các bước setup

### 1. Tạo migration và chạy migration

```powershell
cd frontend
npx prisma migrate dev --name add_theories_model
```

Hoặc nếu database đã chạy, chạy migration trực tiếp:

```powershell
cd frontend
npx prisma migrate deploy
```

### 2. Import dữ liệu từ JSON vào database

```powershell
cd frontend
npx ts-node scripts/import-theories.ts
```

Script này sẽ:
- Đọc file `model_theories/model/theories.json`
- Import tất cả theories vào database
- Hiển thị số lượng đã import

### 3. Verify dữ liệu

Kiểm tra xem dữ liệu đã được import:

```powershell
cd frontend
npx prisma studio
```

Mở tab "Theory" để xem dữ liệu.

### 4. Test API

```powershell
# Test API get all theories
curl http://localhost:3000/api/theories

# Test API get single theory
curl http://localhost:3000/api/theories/1

# Test với filters
curl "http://localhost:3000/api/theories?group=Hành vi&search=TPB"
```

### 5. Truy cập trang web

Mở trình duyệt và truy cập:
- Development: http://localhost:3000/model_theories
- Production: https://ncskit.org/model_theories

## Tính năng

### Trang tra cứu (`/model_theories`)

- ✅ Tìm kiếm theo tên lý thuyết, ghi chú, lĩnh vực, trích dẫn
- ✅ Lọc theo nhóm (Group)
- ✅ Lọc theo lĩnh vực (Domain)
- ✅ Hiển thị danh sách dạng card
- ✅ Click vào card để xem chi tiết
- ✅ Modal hiển thị đầy đủ thông tin:
  - Định nghĩa
  - Biến & mã hóa
  - Chi tiết các biến
  - Ứng dụng
  - Thang đo mẫu
  - Lý thuyết liên quan
  - Hạn chế

### API Routes

- `GET /api/theories` - Lấy danh sách theories với filters
  - Query params: `group`, `domain`, `search`, `page`, `limit`
- `GET /api/theories/[id]` - Lấy chi tiết một theory

## Cấu trúc Database

### Model Theory

```prisma
model Theory {
  id                Int      @id @default(autoincrement())
  theory            String   // Tên lý thuyết
  constructsFull    String?  // Danh sách biến đầy đủ
  constructsCode    String?  // Mã hóa biến
  noteVi            String?  // Ghi chú tiếng Việt
  group             String?  // Nhóm (Hành vi, Công nghệ, etc.)
  domain            String?  // Lĩnh vực
  dependentVariable String?  // Biến phụ thuộc
  reference         String?  // Trích dẫn
  applicationVi     String?  // Ứng dụng
  definitionLong    String?  // Định nghĩa dài
  constructsDetailed Json?   // Chi tiết các biến (JSON)
  sampleScales      Json?    // Thang đo mẫu (JSON)
  relatedTheories   Json?    // Lý thuyết liên quan (JSON)
  limitations       String?  // Hạn chế
  createdAt         DateTime
  updatedAt         DateTime
}
```

## Troubleshooting

### Lỗi: Database không kết nối được

1. Kiểm tra database đang chạy:
   ```powershell
   docker ps
   # hoặc
   .\start-postgres-only.ps1
   ```

2. Kiểm tra DATABASE_URL trong `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/database_name"
   ```

### Lỗi: Import script không tìm thấy file

Đảm bảo file `model_theories/model/theories.json` tồn tại và đường dẫn đúng.

### Lỗi: Prisma client chưa được generate

```powershell
cd frontend
npx prisma generate
```

## Next Steps

Sau khi setup xong:
1. Rebuild production: `.\build-production.ps1`
2. Restart production: `.\restart-production.ps1`
3. Test tại: https://ncskit.org/model_theories

