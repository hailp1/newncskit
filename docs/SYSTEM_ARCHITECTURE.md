# NCSKIT System Architecture

## 🏗️ Tổng quan kiến trúc

NCSKIT được thiết kế theo kiến trúc microservices với frontend và backend tách biệt, đảm bảo khả năng mở rộng và bảo trì cao.

## 🎯 Kiến trúc tổng thể

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "CDN & Load Balancer"
        CDN[CloudFlare CDN]
        LB[Load Balancer]
    end
    
    subgraph "Frontend Layer"
        NEXT[Next.js App]
        STATIC[Static Assets]
    end
    
    subgraph "API Gateway"
        GATEWAY[Django REST API]
        AUTH[Authentication Service]
        RATE[Rate Limiting]
    end
    
    subgraph "Application Services"
        SURVEY[Survey Service]
        ANALYTICS[Analytics Service]
        ADMIN[Admin Service]
        PROJECTS[Projects Service]
    end
    
    subgraph "Data Processing"
        R_ENGINE[R Analysis Engine]
        CELERY[Celery Workers]
        SCHEDULER[Task Scheduler]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        FILES[File Storage]
    end
    
    WEB --> CDN
    MOBILE --> CDN
    CDN --> LB
    LB --> NEXT
    NEXT --> GATEWAY
    GATEWAY --> AUTH
    GATEWAY --> SURVEY
    GATEWAY --> ANALYTICS
    GATEWAY --> ADMIN
    GATEWAY --> PROJECTS
    
    ANALYTICS --> R_ENGINE
    SURVEY --> CELERY
    ANALYTICS --> CELERY
    
    SURVEY --> POSTGRES
    ANALYTICS --> POSTGRES
    ADMIN --> POSTGRES
    PROJECTS --> POSTGRES
    
    GATEWAY --> REDIS
    CELERY --> REDIS
    R_ENGINE --> FILES
```

## 🔧 Chi tiết các thành phần

### Frontend Layer

#### Next.js Application
- **Framework**: Next.js 16 với App Router
- **Language**: TypeScript cho type safety
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand cho global state
- **Data Fetching**: SWR cho caching và revalidation

```typescript
// Cấu trúc thư mục frontend
src/
├── app/                    # App Router pages
│   ├── (dashboard)/       # Dashboard layout group
│   ├── (auth)/           # Authentication pages
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── analytics/        # Analytics components
│   ├── surveys/          # Survey components
│   └── admin/            # Admin components
├── services/             # API services
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

### Backend Layer

#### Django REST Framework
- **Framework**: Django 5.0 với DRF
- **Database**: PostgreSQL với connection pooling
- **Authentication**: JWT với refresh tokens
- **API Documentation**: OpenAPI/Swagger
- **Background Tasks**: Celery với Redis broker

```python
# Cấu trúc thư mục backend
apps/
├── authentication/       # User authentication
├── surveys/             # Survey management
├── analytics/           # Data analysis
├── admin_management/    # Admin functionality
├── projects/            # Project management
└── question_bank/       # Question templates

ncskit_backend/
├── settings/            # Environment-specific settings
├── urls.py             # URL routing
└── wsgi.py             # WSGI application
```

### Data Processing Layer

#### R Analysis Engine
- **Statistical Computing**: R 4.3+ với specialized packages
- **Integration**: rpy2 cho Python-R communication
- **Packages**: lavaan, psych, semTools, ggplot2
- **Output**: JSON serialized results

```r
# R packages được sử dụng
required_packages <- c(
  "lavaan",      # SEM analysis
  "psych",       # Psychometric analysis
  "semTools",    # SEM utilities
  "ggplot2",     # Visualization
  "dplyr",       # Data manipulation
  "tidyr",       # Data tidying
  "corrplot",    # Correlation plots
  "VIM"          # Missing data visualization
)
```

#### Celery Task Queue
- **Broker**: Redis cho message passing
- **Workers**: Multiple workers cho parallel processing
- **Monitoring**: Flower cho task monitoring
- **Scheduling**: Celery Beat cho scheduled tasks

### Data Layer

#### PostgreSQL Database
```sql
-- Core tables structure
Users                    -- User management
Projects                 -- Research projects
Surveys                  -- Survey definitions
Campaigns               -- Survey campaigns
Responses               -- Survey responses
AnalysisProjects        -- Analysis projects
AnalysisResults         -- Analysis results
StatisticalValidations  -- Validation results
```

#### Redis Cache
- **Session Storage**: User sessions
- **API Caching**: Response caching
- **Task Queue**: Celery message broker
- **Real-time Data**: WebSocket connections

## 🔐 Security Architecture

### Authentication & Authorization
```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API Gateway
    participant Auth Service
    participant Database
    
    Client->>Frontend: Login Request
    Frontend->>API Gateway: POST /auth/login
    API Gateway->>Auth Service: Validate Credentials
    Auth Service->>Database: Check User
    Database-->>Auth Service: User Data
    Auth Service-->>API Gateway: JWT Tokens
    API Gateway-->>Frontend: Access + Refresh Tokens
    Frontend-->>Client: Login Success
    
    Note over Client,Database: Subsequent API Calls
    Client->>Frontend: API Request
    Frontend->>API Gateway: Request + JWT
    API Gateway->>Auth Service: Validate JWT
    Auth Service-->>API Gateway: User Context
    API Gateway->>Database: Execute Request
    Database-->>API Gateway: Response Data
    API Gateway-->>Frontend: API Response
    Frontend-->>Client: UI Update
```

### Data Security
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS 1.3 cho tất cả connections
- **Data Anonymization**: PII masking trong analytics
- **Audit Logging**: Comprehensive activity tracking
- **GDPR Compliance**: Data retention policies

## 📊 Performance Architecture

### Caching Strategy
```mermaid
graph LR
    subgraph "Caching Layers"
        CDN[CDN Cache<br/>Static Assets]
        REDIS[Redis Cache<br/>API Responses]
        DB_CACHE[Database Cache<br/>Query Results]
    end
    
    subgraph "Application"
        CLIENT[Client]
        API[API Server]
        DB[(Database)]
    end
    
    CLIENT --> CDN
    CLIENT --> REDIS
    API --> REDIS
    API --> DB_CACHE
    DB_CACHE --> DB
```

### Load Balancing
- **Frontend**: Vercel Edge Network
- **Backend**: Application Load Balancer
- **Database**: Read replicas cho read-heavy operations
- **File Storage**: CDN distribution

### Monitoring & Observability
```mermaid
graph TB
    subgraph "Application Metrics"
        APP_METRICS[Application Metrics]
        ERROR_TRACKING[Error Tracking]
        PERFORMANCE[Performance Monitoring]
    end
    
    subgraph "Infrastructure Metrics"
        SERVER_METRICS[Server Metrics]
        DB_METRICS[Database Metrics]
        CACHE_METRICS[Cache Metrics]
    end
    
    subgraph "Monitoring Stack"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ALERTMANAGER[Alert Manager]
    end
    
    APP_METRICS --> PROMETHEUS
    ERROR_TRACKING --> PROMETHEUS
    PERFORMANCE --> PROMETHEUS
    SERVER_METRICS --> PROMETHEUS
    DB_METRICS --> PROMETHEUS
    CACHE_METRICS --> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTMANAGER
```

## 🚀 Deployment Architecture

### Production Environment
```mermaid
graph TB
    subgraph "Production Infrastructure"
        subgraph "Frontend"
            VERCEL[Vercel<br/>Next.js App]
            CDN_PROD[CloudFlare CDN]
        end
        
        subgraph "Backend"
            LB_PROD[Load Balancer]
            API_PROD[API Servers<br/>Auto Scaling]
            WORKER_PROD[Celery Workers]
        end
        
        subgraph "Data"
            DB_PROD[(PostgreSQL<br/>Primary + Replicas)]
            REDIS_PROD[(Redis Cluster)]
            STORAGE_PROD[File Storage<br/>S3/CloudFlare R2]
        end
    end
    
    CDN_PROD --> VERCEL
    VERCEL --> LB_PROD
    LB_PROD --> API_PROD
    API_PROD --> DB_PROD
    API_PROD --> REDIS_PROD
    WORKER_PROD --> REDIS_PROD
    API_PROD --> STORAGE_PROD
```

### CI/CD Pipeline
```mermaid
graph LR
    subgraph "Development"
        DEV[Developer]
        GIT[Git Repository]
    end
    
    subgraph "CI/CD"
        GITHUB[GitHub Actions]
        TEST[Automated Tests]
        BUILD[Build Process]
        DEPLOY[Deployment]
    end
    
    subgraph "Environments"
        STAGING[Staging]
        PROD[Production]
    end
    
    DEV --> GIT
    GIT --> GITHUB
    GITHUB --> TEST
    TEST --> BUILD
    BUILD --> STAGING
    STAGING --> PROD
```

## 🔄 Data Flow Architecture

### Survey Data Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    participant Analytics
    participant R Engine
    
    User->>Frontend: Create Survey
    Frontend->>API: POST /surveys/
    API->>Database: Store Survey
    
    User->>Frontend: Launch Campaign
    Frontend->>API: POST /campaigns/
    API->>Database: Create Campaign
    
    Note over User,R Engine: Data Collection Phase
    User->>Frontend: Submit Response
    Frontend->>API: POST /responses/
    API->>Database: Store Response
    
    Note over User,R Engine: Analysis Phase
    User->>Frontend: Request Analysis
    Frontend->>API: POST /analytics/
    API->>Analytics: Process Data
    Analytics->>R Engine: Statistical Analysis
    R Engine-->>Analytics: Results
    Analytics->>Database: Store Results
    Analytics-->>API: Analysis Complete
    API-->>Frontend: Results Available
    Frontend-->>User: Display Results
```

### Real-time Updates
```mermaid
graph LR
    subgraph "Real-time Architecture"
        CLIENT[Client Browser]
        WEBSOCKET[WebSocket Server]
        REDIS_PUB[Redis Pub/Sub]
        CELERY_TASK[Celery Tasks]
    end
    
    CLIENT <--> WEBSOCKET
    WEBSOCKET <--> REDIS_PUB
    CELERY_TASK --> REDIS_PUB
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Frontend**: Edge deployment với Vercel
- **Backend**: Auto-scaling API servers
- **Database**: Read replicas và sharding
- **Cache**: Redis cluster mode
- **Workers**: Dynamic worker scaling

### Performance Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Lazy Loading**: Component-level code splitting
- **Image Optimization**: Next.js Image component
- **API Pagination**: Efficient data loading

### Resource Management
- **Memory**: Efficient data structures
- **CPU**: Optimized algorithms
- **Storage**: Compressed data storage
- **Network**: Minimized payload sizes

## 🛡️ Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups
- **Files**: Replicated storage
- **Code**: Git repository backups
- **Configuration**: Infrastructure as Code

### Recovery Procedures
- **RTO**: Recovery Time Objective < 4 hours
- **RPO**: Recovery Point Objective < 1 hour
- **Failover**: Automated failover procedures
- **Testing**: Regular disaster recovery drills

---

*Tài liệu này được cập nhật thường xuyên để phản ánh các thay đổi trong kiến trúc hệ thống.*