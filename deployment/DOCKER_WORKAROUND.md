# Docker R Analytics - Workaround Solution

## Vấn Đề

Plumber package không install được trong Docker do missing dependencies phức tạp (httpuv, sodium, systemfonts, textshaping, etc.)

## Giải Pháp Workaround: Sử Dụng Pre-built Image

Thay vì build từ `rocker/r-ver`, sử dụng `rocker/tidyverse` đã có nhiều packages pre-installed.

### Dockerfile Mới

```dockerfile
FROM rocker/tidyverse:4.3.2

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    libsodium-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install only missing R packages
RUN R -e "install.packages(c('plumber', 'psych', 'lavaan', 'lme4', 'semTools', 'mediation'), repos='https://cran.rstudio.com/', dependencies=TRUE)"

# Verify
RUN R -e "library(plumber); library(dplyr); print('SUCCESS')"

WORKDIR /app
COPY api.R /app/
COPY endpoints/ /app/endpoints/
RUN mkdir -p /app/logs

EXPOSE 8000

ENV R_MAX_MEMORY=8G
ENV R_MAX_CORES=4
ENV TZ=UTC

CMD ["R", "-e", "options(warn=-1); pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000, swagger=TRUE)"]
```

### Commands

```powershell
# Build
docker build -t ncskit-r-analytics:latest -f r-analytics/Dockerfile.workaround r-analytics/ --no-cache

# Run
docker run -d \
  --name ncskit-r-analytics \
  -p 8000:8000 \
  -v ${PWD}/r-analytics/endpoints:/app/endpoints:ro \
  -v ${PWD}/r-analytics/logs:/app/logs \
  ncskit-r-analytics:latest

# Test
Start-Sleep -Seconds 30
curl http://localhost:8000/health
```

## Alternative: Manual Package Installation

Nếu workaround không được:

```powershell
# 1. Start container với base image
docker run -it --rm -p 8000:8000 \
  -v ${PWD}/r-analytics:/app \
  rocker/tidyverse:4.3.2 /bin/bash

# 2. Trong container, install packages
apt-get update
apt-get install -y libsodium-dev
R

# 3. Trong R console
install.packages('plumber', repos='https://cran.rstudio.com/')
library(plumber)
quit()

# 4. Run API
cd /app
R -e "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"

# 5. Test từ browser: http://localhost:8000/__docs__/
```

## Lý Do Vấn Đề

R packages có dependency tree phức tạp:
- plumber → httpuv, sodium
- httpuv → later, promises, Rcpp
- Một số packages cần system libraries (libsodium-dev, libfontconfig1-dev, etc.)
- Docker cache có thể gây conflict

## Khuyến Nghị

1. **Sử dụng rocker/tidyverse** thay vì rocker/r-ver
2. **Hoặc sử dụng cloud service** (AWS Lambda R runtime, Google Cloud Run)
3. **Hoặc implement analytics bằng Python** thay vì R

---

**Status**: Workaround solution provided  
**Date**: 2024-01-07
