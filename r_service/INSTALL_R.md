# Cài đặt R cho NCSKIT Analytics Service

## 🔧 Cài đặt R trên Windows

### Bước 1: Download R
1. Truy cập: https://cran.r-project.org/bin/windows/base/
2. Download phiên bản R mới nhất (R-4.3.x for Windows)
3. Chạy file .exe và cài đặt với settings mặc định

### Bước 2: Kiểm tra cài đặt
Mở Command Prompt và chạy:
```cmd
R --version
```

Hoặc:
```cmd
Rscript --version
```

### Bước 3: Cài đặt packages
Trong thư mục r_service, chạy:
```cmd
Rscript install_packages.R
```

### Bước 4: Chạy R service
```cmd
Rscript run_service.R
```

## 🚀 Alternative: Cài đặt qua Chocolatey (nếu có)

Nếu bạn có Chocolatey package manager:
```cmd
choco install r.project
```

## 🐳 Alternative: Sử dụng Docker

Nếu không muốn cài R trực tiếp, có thể dùng Docker:

### Tạo Dockerfile:
```dockerfile
FROM r-base:4.3.0

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev

# Copy and install R packages
COPY install_packages.R .
RUN Rscript install_packages.R

# Copy application files
COPY . .

EXPOSE 8001

CMD ["Rscript", "run_service.R"]
```

### Build và chạy Docker:
```cmd
docker build -t ncskit-r-service .
docker run -p 8001:8001 ncskit-r-service
```

## 📋 Troubleshooting

### Lỗi "Rscript not found":
- Thêm R vào PATH environment variable
- Path thường là: `C:\Program Files\R\R-4.3.x\bin`

### Lỗi cài đặt packages:
- Chạy R as Administrator
- Hoặc cài packages manually trong R console:
```r
install.packages(c("plumber", "jsonlite", "dplyr", "tm", "topicmodels"))
```

### Port đã được sử dụng:
- Thay đổi port trong `run_service.R`
- Hoặc kill process đang dùng port 8001

## ✅ Kiểm tra service hoạt động

Sau khi chạy thành công, test endpoints:

### Health check:
```cmd
curl http://localhost:8001/health
```

### Topic modeling test:
```cmd
curl -X POST http://localhost:8001/analyze/topics ^
  -H "Content-Type: application/json" ^
  -d "{\"abstracts\": [\"Machine learning research\", \"AI applications\"], \"num_topics\": 2}"
```