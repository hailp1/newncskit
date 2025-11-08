# Giải Thích Cách Hoạt Động Docker R Analytics

## Tổng Quan Kiến Trúc

Docker R Analytics là một microservice độc lập chạy các phân tích thống kê nâng cao bằng ngôn ngữ R, được đóng gói trong Docker container và tích hợp vào hệ thống NCSKIT.

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Browser                                  │
│                                                                  │
│  https://ncskit.app                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Vercel (Next.js Frontend)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Frontend Pages                                           │  │
│  │  - Dashboard                                              │  │
│  │  - Projects                                               │  │
│  │  - Analysis Tools                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │  API Routes                                              │  │
│  │  - /api/analytics (Gateway)                              │  │
│  │  - /api/health/docker (Health Check)                     │  │
│  │                                                           │  │
│  │  Features:                                                │  │
│  │  • Circuit Breaker (auto retry/fallback)                 │  │
│  │  • Caching (1 hour TTL)                                   │  │
│  │  • Error Logging                                          │  │
│  │  • Request Timeout (30s)                                  │  │
│  └──────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ HTTPS Request
                          │ (analytics.ncskit.app)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Tunnel (Public Gateway)                  │
│                                                                  │
│  • Secure tunnel connection                                     │
│  • SSL/TLS termination                                          │
│  • DDoS protection                                              │
│  • No port forwarding needed                                    │
│                                                                  │
│  Public URL: https://analytics.ncskit.app                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Secure Tunnel
                         │ (localhost:8000)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           Docker Container (ncskit-r-analytics)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Plumber API (R Web Framework)                           │  │
│  │  Port: 8000                                               │  │
│  │                                                           │  │
│  │  Endpoints:                                               │  │
│  │  • GET  /health                                           │  │
│  │  • POST /data/upload                                      │  │
│  │  • POST /analysis/descriptive                             │  │
│  │  • POST /analysis/correlation                             │  │
│  │  • POST /analysis/ttest-independent                       │  │
│  │  • POST /analysis/anova-oneway                            │  │
│  │  • POST /analysis/efa (Factor Analysis)                   │  │
│  │  • POST /analysis/cfa (Confirmatory FA)                   │  │
│  │  • POST /analysis/regression-linear                       │  │
│  │  • POST /analysis/regression-logistic                     │  │
│  │  • POST /analysis/sem (Structural Equation)               │  │
│  │  • POST /analysis/mediation                               │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │  R Packages (Statistical Libraries)                      │  │
│  │                                                           │  │
│  │  • plumber - Web API framework                            │  │
│  │  • dplyr, tidyr - Data manipulation                       │  │
│  │  • psych - Descriptive statistics                         │  │
│  │  • lavaan - SEM & CFA                                     │  │
│  │  • lme4 - Multilevel models                               │  │
│  │  • car - ANOVA & regression diagnostics                   │  │
│  │  • mediation - Mediation analysis                         │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │  In-Memory Data Storage                                   │  │
│  │  (Per Project ID)                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Chi Tiết Các Thành Phần

### 1. Docker Container

#### Dockerfile
```dockerfile
FROM rocker/r-ver:4.3.2

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    curl

# Install R packages
RUN R -e "install.packages(c( \
    'plumber',      # Web API framework
    'jsonlite',     # JSON parsing
    'dplyr',        # Data manipulation
    'psych',        # Statistics
    'lavaan',       # SEM
    'lme4'          # Multilevel models
  ), repos='https://cran.rstudio.com/')"

# Copy application code
WORKDIR /app
COPY api.R /app/
COPY endpoints/ /app/endpoints/

# Expose port
EXPOSE 8000

# Start API server
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"]
```

**Giải thích:**
- Base image: `rocker/r-ver:4.3.2` - R version 4.3.2 trên Linux
- System dependencies: Các thư viện C cần thiết cho R packages
- R packages: Cài đặt tất cả packages thống kê
- Application code: Copy API code vào container
- Port 8000: Expose để truy cập từ bên ngoài
- CMD: Khởi động Plumber API server

#### docker-compose.yml
```yaml
services:
  r-analytics:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ncskit-r-analytics
    ports:
      - "8000:8000"  # Map port 8000 container -> host
    environment:
      - R_MAX_MEMORY=8G
      - R_MAX_CORES=4
    volumes:
      - ./endpoints:/app/endpoints:ro  # Mount endpoints (read-only)
      - ./logs:/app/logs               # Mount logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Giải thích:**
- `ports`: Map port container ra host machine
- `environment`: Cấu hình R memory và CPU
- `volumes`: Mount code và logs để dễ debug
- `restart`: Tự động restart nếu crash
- `healthcheck`: Kiểm tra service còn sống không

### 2. R API (Plumber)

#### api.R (Main Entry Point)
```r
library(plumber)
library(jsonlite)
library(dplyr)

# Source all endpoint modules
source("endpoints/descriptive-stats.R")
source("endpoints/hypothesis-tests.R")
source("endpoints/factor-analysis.R")
source("endpoints/regression.R")
source("endpoints/sem.R")

# Global data storage (in-memory)
analysis_data <- new.env()

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiVersion 2.0.0

# CORS Filter
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  plumber::forward()
}

# Health check
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    version = "2.0.0"
  )
}

# Upload data
#* @post /data/upload
function(req, project_id) {
  data <- jsonlite::fromJSON(req$postBody)
  analysis_data[[project_id]] <- data
  list(success = TRUE, rows = nrow(data))
}
```

**Giải thích:**
- `plumber`: Framework để tạo REST API trong R
- `source()`: Load các endpoint modules
- `analysis_data`: Environment lưu data theo project_id
- `#*`: Plumber annotations để define routes
- CORS filter: Cho phép frontend gọi API

#### Endpoint Example: Descriptive Statistics
```r
#* Descriptive statistics
#* @post /analysis/descriptive
function(project_id, variables = NULL) {
  # Get data
  data <- analysis_data[[project_id]]
  
  if (is.null(variables)) {
    variables <- names(data)
  }
  
  # Calculate statistics
  results <- data %>%
    select(all_of(variables)) %>%
    summarise(across(everything(), list(
      mean = ~mean(., na.rm = TRUE),
      sd = ~sd(., na.rm = TRUE),
      median = ~median(., na.rm = TRUE),
      min = ~min(., na.rm = TRUE),
      max = ~max(., na.rm = TRUE)
    )))
  
  list(
    success = TRUE,
    results = results
  )
}
```

**Giải thích:**
- Nhận `project_id` để lấy data
- Nhận `variables` (optional) để chọn cột
- Dùng `dplyr` để tính toán
- Trả về JSON response

### 3. Frontend Integration

#### /api/analytics (Gateway)
```typescript
// frontend/src/app/api/analytics/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Check circuit breaker
  if (!analyticsCircuitBreaker.canAttempt()) {
    return NextResponse.json({
      success: false,
      error: 'Service temporarily unavailable'
    }, { status: 503 })
  }
  
  // Check cache
  const cached = await analyticsCache.get(body.endpoint, body.params)
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      cached: true
    })
  }
  
  // Forward to R Analytics
  try {
    const url = `${ANALYTICS_SERVICE_URL}${body.endpoint}`
    const response = await fetchWithRetry(url, {
      method: body.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ANALYTICS_API_KEY
      },
      body: JSON.stringify(body.params)
    })
    
    const result = await response.json()
    
    // Cache result
    await analyticsCache.set(body.endpoint, body.params, result)
    
    // Record success
    analyticsCircuitBreaker.recordSuccess()
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    // Record failure
    analyticsCircuitBreaker.recordFailure()
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

**Giải thích:**
- **Circuit Breaker**: Ngăn gọi service khi đang fail liên tục
- **Caching**: Lưu kết quả 1 giờ để giảm load
- **Retry Logic**: Tự động retry khi timeout
- **Error Logging**: Log lỗi để debug

#### Circuit Breaker Pattern
```typescript
// frontend/src/lib/circuit-breaker.ts

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private lastFailureTime: number = 0
  
  canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true
    }
    
    if (this.state === CircuitState.OPEN) {
      // Check if cooldown period passed
      if (Date.now() - this.lastFailureTime > COOLDOWN_PERIOD) {
        this.state = CircuitState.HALF_OPEN
        return true
      }
      return false
    }
    
    // HALF_OPEN: Allow one request to test
    return true
  }
  
  recordSuccess(): void {
    this.failureCount = 0
    this.state = CircuitState.CLOSED
  }
  
  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= FAILURE_THRESHOLD) {
      this.state = CircuitState.OPEN
    }
  }
}
```

**Giải thích:**
- **CLOSED**: Bình thường, cho phép tất cả requests
- **OPEN**: Service đang fail, block tất cả requests
- **HALF_OPEN**: Thử 1 request để test service đã OK chưa

### 4. Cloudflare Tunnel

#### Cách Hoạt Động
```
1. Cloudflared daemon chạy trên local machine
2. Tạo secure tunnel đến Cloudflare edge
3. Cloudflare route traffic từ public URL đến tunnel
4. Tunnel forward traffic đến localhost:8000
```

#### Configuration
```yaml
# deployment/cloudflare-tunnel/config/tunnel-config.yml

tunnel: <tunnel-id>
credentials-file: ~/.cloudflared/<tunnel-id>.json

ingress:
  # Route analytics.ncskit.app -> localhost:8000
  - hostname: analytics.ncskit.app
    service: http://localhost:8000
  
  # Catch-all
  - service: http_status:404
```

**Giải thích:**
- `tunnel`: ID của tunnel đã tạo
- `credentials-file`: File chứa authentication token
- `ingress`: Rules để route traffic
- `hostname`: Public domain
- `service`: Local service URL

## Luồng Xử Lý Request

### Example: Descriptive Statistics

```
1. User clicks "Run Analysis" button
   ↓
2. Frontend gửi request:
   POST https://ncskit.app/api/analytics
   {
     "endpoint": "/analysis/descriptive",
     "method": "POST",
     "params": {
       "project_id": "abc123",
       "variables": ["age", "score"]
     }
   }
   ↓
3. Vercel API Route (/api/analytics):
   - Check circuit breaker ✓
   - Check cache ✗ (miss)
   - Forward to R Analytics
   ↓
4. Request qua Cloudflare Tunnel:
   https://analytics.ncskit.app/analysis/descriptive
   ↓
5. Docker Container nhận request:
   - Plumber router match endpoint
   - Call descriptive-stats.R function
   ↓
6. R Code xử lý:
   - Lấy data từ analysis_data["abc123"]
   - Tính mean, sd, median, min, max
   - Return JSON
   ↓
7. Response trả về:
   {
     "success": true,
     "results": {
       "age_mean": 25.5,
       "age_sd": 5.2,
       "score_mean": 85.3,
       "score_sd": 10.1
     }
   }
   ↓
8. Vercel API Route:
   - Cache result (1 hour)
   - Record success in circuit breaker
   - Return to frontend
   ↓
9. Frontend hiển thị kết quả
```

## Data Flow

### Upload Data
```
Frontend → Vercel → Cloudflare → Docker
  |
  └─> POST /data/upload?project_id=abc123
      Body: { "data": [...] }
      
Docker:
  analysis_data["abc123"] <- data
  
Response: { "success": true, "rows": 100 }
```

### Run Analysis
```
Frontend → Vercel → Cloudflare → Docker
  |
  └─> POST /analysis/descriptive?project_id=abc123
      Body: { "variables": ["age", "score"] }
      
Docker:
  data <- analysis_data["abc123"]
  results <- calculate_stats(data)
  
Response: { "success": true, "results": {...} }
```

## Performance Optimizations

### 1. Caching
```typescript
// Cache key: endpoint + params hash
const cacheKey = `${endpoint}:${hash(params)}`

// TTL: 1 hour
const TTL = 3600

// Cache hit: Return immediately
// Cache miss: Call R Analytics, then cache
```

### 2. Circuit Breaker
```
Failure threshold: 5 consecutive failures
Cooldown period: 60 seconds
Half-open test: 1 request

Benefits:
- Prevent cascading failures
- Fast fail when service down
- Automatic recovery
```

### 3. Request Timeout
```typescript
const TIMEOUT = 30000 // 30 seconds

// Abort request if takes too long
const controller = new AbortController()
setTimeout(() => controller.abort(), TIMEOUT)

fetch(url, { signal: controller.signal })
```

### 4. Retry Logic
```typescript
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
  try {
    return await fetch(url)
  } catch (error) {
    if (attempt === MAX_RETRIES) throw error
    await sleep(RETRY_DELAY * Math.pow(2, attempt)) // Exponential backoff
  }
}
```

## Security

### 1. API Key Authentication
```typescript
// Vercel → R Analytics
headers: {
  'X-API-Key': process.env.ANALYTICS_API_KEY
}

// R Analytics validates key
if (req$HTTP_X_API_KEY != Sys.getenv("API_KEY")) {
  return(list(error = "Unauthorized"))
}
```

### 2. CORS Protection
```r
# Only allow specific origins
cors <- function(req, res) {
  allowed_origins <- c(
    "https://ncskit.app",
    "https://frontend-*.vercel.app"
  )
  
  origin <- req$HTTP_ORIGIN
  if (origin %in% allowed_origins) {
    res$setHeader("Access-Control-Allow-Origin", origin)
  }
  
  plumber::forward()
}
```

### 3. Rate Limiting
```typescript
// In Vercel API Route
const rateLimiter = new RateLimiter({
  requests: 100,
  window: 60 // 100 requests per minute
})

if (!rateLimiter.check(userId)) {
  return NextResponse.json({
    error: 'Rate limit exceeded'
  }, { status: 429 })
}
```

### 4. Input Validation
```r
# Validate project_id
if (is.null(project_id) || !exists(project_id, envir = analysis_data)) {
  return(list(
    success = FALSE,
    error = "Invalid project_id"
  ))
}

# Validate variables
if (!all(variables %in% names(data))) {
  return(list(
    success = FALSE,
    error = "Invalid variables"
  ))
}
```

## Monitoring & Logging

### 1. Health Checks
```r
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    version = "2.0.0",
    uptime = Sys.time() - start_time,
    memory = pryr::mem_used(),
    projects = length(ls(analysis_data))
  )
}
```

### 2. Error Logging
```typescript
// frontend/src/lib/monitoring/error-logger.ts

export function logAnalyticsError(error: Error, context: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'analytics_error',
    error: error.message,
    stack: error.stack,
    context: context,
    user: getCurrentUser(),
    environment: process.env.NODE_ENV
  }
  
  // Log to console
  console.error('[Analytics Error]', logEntry)
  
  // Send to monitoring service (Sentry, etc.)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context })
  }
  
  // Store in database
  await db.errorLogs.create({ data: logEntry })
}
```

### 3. Performance Metrics
```typescript
// Track request duration
const startTime = Date.now()

const response = await fetch(url)

const duration = Date.now() - startTime

// Log metrics
logMetric('analytics_request_duration', duration, {
  endpoint: body.endpoint,
  cached: false,
  status: response.status
})
```

## Scaling Considerations

### Horizontal Scaling
```yaml
# docker-compose.yml with multiple replicas

services:
  r-analytics:
    deploy:
      replicas: 3
    ports:
      - "8000-8002:8000"

# Load balancer (nginx)
upstream r_analytics {
  server localhost:8000;
  server localhost:8001;
  server localhost:8002;
}
```

### Vertical Scaling
```yaml
# Increase resources
environment:
  - R_MAX_MEMORY=16G  # More memory
  - R_MAX_CORES=8     # More CPU

deploy:
  resources:
    limits:
      cpus: '8'
      memory: 16G
```

### Persistent Storage
```yaml
# Use database instead of in-memory
volumes:
  - postgres-data:/var/lib/postgresql/data

# R code connects to PostgreSQL
library(RPostgreSQL)
con <- dbConnect(PostgreSQL(), 
  host = "postgres",
  dbname = "analytics",
  user = "user",
  password = "pass"
)
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker logs ncskit-r-analytics
   
   # Check if port is available
   netstat -ano | findstr :8000
   ```

2. **R packages missing**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Out of memory**
   ```yaml
   # Increase memory limit
   environment:
     - R_MAX_MEMORY=16G
   ```

4. **Slow performance**
   ```r
   # Enable parallel processing
   library(parallel)
   cl <- makeCluster(detectCores())
   results <- parLapply(cl, data, analysis_function)
   stopCluster(cl)
   ```

## Tóm Tắt

Docker R Analytics hoạt động như một **microservice độc lập**:

1. **Isolation**: Chạy trong container riêng, không ảnh hưởng hệ thống chính
2. **Scalability**: Dễ dàng scale horizontal/vertical
3. **Portability**: Chạy được ở bất kỳ đâu có Docker
4. **Reliability**: Circuit breaker, retry, caching đảm bảo uptime
5. **Security**: API key, CORS, rate limiting bảo vệ service
6. **Monitoring**: Health checks, logging, metrics theo dõi performance

Kiến trúc này cho phép NCSKIT cung cấp **phân tích thống kê nâng cao** mà không cần cài R trên server chính, dễ maintain và scale khi cần.

---

**Tác giả**: NCSKIT Team  
**Cập nhật**: 2024-01-07
