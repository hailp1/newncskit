# Tài Liệu Thiết Kế - Tái Cấu Trúc Dự Án Chạy Local với Node.js

## Tổng Quan

Tài liệu này mô tả thiết kế chi tiết cho việc tái cấu trúc NCSKIT thành kiến trúc đơn giản:
- **Next.js Full-Stack**: Frontend + Backend API trong một application
- **PostgreSQL Local**: Database chạy local với Prisma ORM
- **R Analytics Service**: Service riêng biệt, chỉ gọi khi cần phân tích định lượng

### Mục Tiêu Thiết Kế

1. **Đơn giản hóa**: Một codebase duy nhất cho frontend và backend
2. **Dễ phát triển**: Hot-reload, TypeScript, debugging dễ dàng
3. **Performance**: Tất cả chạy local, không có network latency
4. **Tách biệt concerns**: R analytics là service riêng, không ảnh hưởng main app

## Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
                         │
┌────────────────────────▼────────────────────────────────┐
│           Next.js Application (Port 3000)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (React Components)                     │   │
│  │  - Pages (App Router)                            │   │
│  │  - Components                                    │   │
│  │  - Client-side logic                             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Backend (API Routes)                            │   │
│  │  - /api/auth/*      → Authentication             │   │
│  │  - /api/projects/*  → Project CRUD               │   │
│  │  - /api/datasets/*  → Dataset CRUD               │   │
│  │  - /api/analytics/* → R Service Proxy            │   │
│  │  - /api/upload/*    → File Upload                │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Prisma ORM                                      │   │
│  └────────────┬─────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────┘
                │
                │
       ┌────────▼────────┐              ┌──────────────────┐
       │   PostgreSQL    │              │  R Analytics     │
       │   (Port 5432)   │              │  Service         │
       │                 │              │  (Port 8000)     │
       │  - Users        │              │                  │
       │  - Projects     │              │  - Plumber API   │
       │  - Datasets     │              │  - R Scripts     │
       │  - Sessions     │              │  - Analytics     │
       └─────────────────┘              └──────────────────┘
```

### Luồng Dữ Liệu

**Luồng 1: Normal Page Request**
```
Browser → Next.js (SSR/SSG) → PostgreSQL → Render HTML → Browser
```

**Luồng 2: API Request (CRUD)**
```
Browser → Next.js API Route → Prisma → PostgreSQL → Response
```

**Luồng 3: Analytics Request**
```
Browser → Next.js API Route → R Service (HTTP) → R Analysis → Response
```

**Luồng 4: File Upload**
```
Browser → Next.js API Route → Save to /uploads → Save metadata to PostgreSQL
```

## Thành Phần và Giao Diện

### 1. Next.js Application Structure


```
frontend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Protected layout
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── datasets/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── datasets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── analytics/
│   │   │   │   └── run/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── projects/
│   │   ├── datasets/
│   │   └── analytics/
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── r-service.ts        # R service client
│   │   └── utils.ts
│   └── types/
│       ├── api.ts
│       └── models.ts
├── public/
│   └── uploads/                # Uploaded files
├── .env.local
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```


### 2. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  projects      Project[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  datasets    Dataset[]
}

model Dataset {
  id          String    @id @default(cuid())
  name        String
  fileName    String
  filePath    String
  fileSize    Int
  rowCount    Int?
  columnCount Int?
  projectId   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  analyses    Analysis[]
}

model Analysis {
  id          String    @id @default(cuid())
  type        String    // 'sentiment', 'cluster', 'topic', etc.
  parameters  Json
  results     Json
  status      String    @default("pending") // pending, running, completed, failed
  datasetId   String
  createdAt   DateTime  @default(now())
  completedAt DateTime?
  
  dataset     Dataset   @relation(fields: [datasetId], references: [id], onDelete: Cascade)
}
```


### 3. Prisma Client Setup

```typescript
// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4. NextAuth Configuration

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return user
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
```


```typescript
// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 5. API Routes Implementation

#### 5.1 Projects API

```typescript
// src/app/api/projects/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        datasets: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
      }
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
```


```typescript
// src/app/api/projects/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        datasets: true,
      }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    const project = await prisma.project.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        name,
        description,
      }
    })

    if (project.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    })

    if (project.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
```


#### 5.2 File Upload API

```typescript
// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const name = formData.get('name') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = join(UPLOAD_DIR, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save metadata to database
    const dataset = await prisma.dataset.create({
      data: {
        name: name || file.name,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileSize: file.size,
        projectId,
      }
    })

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
```


#### 5.3 R Analytics Integration

```typescript
// src/lib/r-service.ts

interface RServiceConfig {
  baseUrl: string
  timeout: number
}

interface AnalyticsRequest {
  type: string
  data: any
  parameters?: any
}

interface AnalyticsResponse {
  success: boolean
  data?: any
  error?: string
}

class RServiceClient {
  private config: RServiceConfig

  constructor(config: RServiceConfig) {
    this.config = config
  }

  async runAnalysis(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(`${this.config.baseUrl}/analyze/${request.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: request.data,
          parameters: request.parameters,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`R Service error: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Analysis timeout - please try with a smaller dataset',
        }
      }
      
      console.error('R Service error:', error)
      return {
        success: false,
        error: 'Failed to connect to analytics service',
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const rService = new RServiceClient({
  baseUrl: process.env.R_SERVICE_URL || 'http://localhost:8000',
  timeout: 60000, // 60 seconds
})
```


```typescript
// src/app/api/analytics/run/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rService } from '@/lib/r-service'
import { readFile } from 'fs/promises'
import { join } from 'path'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { datasetId, type, parameters } = body

    if (!datasetId || !type) {
      return NextResponse.json(
        { success: false, error: 'Dataset ID and analysis type are required' },
        { status: 400 }
      )
    }

    // Get dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        project: {
          userId: session.user.id,
        }
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Check if analysis already exists in cache
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        datasetId,
        type,
        status: 'completed',
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    if (existingAnalysis) {
      return NextResponse.json({
        success: true,
        data: existingAnalysis.results,
        cached: true,
      })
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        type,
        parameters: parameters || {},
        results: {},
        status: 'running',
        datasetId,
      }
    })

    // Read CSV file
    const filePath = join(process.cwd(), 'public', dataset.filePath)
    const fileContent = await readFile(filePath, 'utf-8')
    
    // Parse CSV
    const parsed = Papa.parse(fileContent, { header: true })
    
    // Call R service
    const result = await rService.runAnalysis({
      type,
      data: parsed.data,
      parameters,
    })

    if (!result.success) {
      // Update analysis status to failed
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'failed',
          results: { error: result.error },
          completedAt: new Date(),
        }
      })

      return NextResponse.json(result, { status: 500 })
    }

    // Update analysis with results
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: 'completed',
        results: result.data,
        completedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error running analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run analysis' },
      { status: 500 }
    )
  }
}
```


### 6. R Analytics Service

#### 6.1 R Service Structure

```
r-analytics/
├── api.R                   # Main Plumber API
├── modules/
│   ├── sentiment.R         # Sentiment analysis
│   ├── clustering.R        # Text clustering
│   ├── topics.R            # Topic modeling
│   └── utils.R             # Utility functions
├── Dockerfile
├── docker-compose.yml
└── start.sh
```

#### 6.2 Plumber API

```r
# api.R

library(plumber)
library(jsonlite)

#* @apiTitle NCSKIT Analytics API
#* @apiDescription R-based analytics for NCSKIT

#* Health check
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    version = "1.0.0"
  )
}

#* Sentiment analysis
#* @post /analyze/sentiment
#* @param data:object Dataset
#* @param parameters:object Analysis parameters
function(data, parameters = list()) {
  tryCatch({
    source("modules/sentiment.R")
    result <- analyze_sentiment(data, parameters)
    list(success = TRUE, data = result)
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}

#* Text clustering
#* @post /analyze/cluster
#* @param data:object Dataset
#* @param parameters:object Analysis parameters
function(data, parameters = list()) {
  tryCatch({
    source("modules/clustering.R")
    result <- cluster_texts(data, parameters)
    list(success = TRUE, data = result)
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}

#* Topic modeling
#* @post /analyze/topics
#* @param data:object Dataset
#* @param parameters:object Analysis parameters
function(data, parameters = list()) {
  tryCatch({
    source("modules/topics.R")
    result <- extract_topics(data, parameters)
    list(success = TRUE, data = result)
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}
```


#### 6.3 Docker Configuration

```dockerfile
# Dockerfile

FROM rocker/r-ver:4.3.2

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c( \
    'plumber', \
    'jsonlite', \
    'dplyr', \
    'tidyr', \
    'stringr', \
    'tm', \
    'text2vec', \
    'sentimentr', \
    'cluster', \
    'topicmodels' \
  ), repos='https://cran.rstudio.com/')"

WORKDIR /app

COPY . /app

EXPOSE 8000

CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  r-analytics:
    build: .
    container_name: ncskit-r-analytics
    ports:
      - "8000:8000"
    volumes:
      - ./modules:/app/modules
    restart: unless-stopped
    environment:
      - R_MAX_MEMORY=4G
```

### 7. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ncskit"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# R Analytics Service
R_SERVICE_URL="http://localhost:8000"

# App
NODE_ENV="development"
```


### 8. Migration Strategy

#### 8.1 Django to Next.js Migration Map

| Django Component | Next.js Equivalent |
|-----------------|-------------------|
| Django Views | Next.js API Routes |
| Django Models | Prisma Schema |
| Django ORM | Prisma Client |
| Django Templates | React Components |
| Django Auth | NextAuth.js |
| Django Static Files | Next.js public/ |
| Django Media Files | public/uploads/ |
| Django Middleware | Next.js Middleware |
| Django Admin | Custom Admin Pages |

#### 8.2 Migration Steps

1. **Setup Next.js Project**
   - Initialize Next.js with TypeScript
   - Install dependencies
   - Configure Prisma

2. **Migrate Database Schema**
   - Convert Django models to Prisma schema
   - Run migrations
   - Seed initial data

3. **Migrate Authentication**
   - Setup NextAuth.js
   - Migrate user data
   - Update login/register flows

4. **Migrate API Endpoints**
   - Convert Django views to API routes
   - Update request/response handling
   - Maintain same API contracts

5. **Migrate Frontend**
   - Convert Django templates to React components
   - Update API calls
   - Maintain same UI/UX

6. **Setup R Service**
   - Keep existing R analytics code
   - Wrap in Plumber API
   - Dockerize

7. **Testing**
   - Test all API endpoints
   - Test authentication flows
   - Test R analytics integration
   - E2E testing

### 9. Error Handling

```typescript
// src/lib/error-handler.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
    },
    { status: 500 }
  )
}
```


### 10. Logging

```typescript
// src/lib/logger.ts

import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  )
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  )
}

export { logger }
```

### 11. Testing Strategy

#### 11.1 Unit Tests (Vitest)

```typescript
// src/lib/__tests__/r-service.test.ts

import { describe, it, expect, vi } from 'vitest'
import { rService } from '../r-service'

describe('RServiceClient', () => {
  it('should call R service successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      })
    ) as any

    const result = await rService.runAnalysis({
      type: 'sentiment',
      data: [],
    })

    expect(result.success).toBe(true)
  })

  it('should handle timeout', async () => {
    global.fetch = vi.fn(() =>
      new Promise((resolve) => setTimeout(resolve, 70000))
    ) as any

    const result = await rService.runAnalysis({
      type: 'sentiment',
      data: [],
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('timeout')
  })
})
```

#### 11.2 E2E Tests (Playwright)

```typescript
// tests/e2e/auth.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('http://localhost:3000/projects')
  })
})
```

### 12. Performance Optimization

1. **Database Connection Pooling**: Prisma handles automatically
2. **API Response Caching**: Cache R analytics results in database
3. **Static Asset Optimization**: Next.js Image optimization
4. **Code Splitting**: Automatic with Next.js App Router
5. **Lazy Loading**: React.lazy for heavy components

### 13. Security Considerations

1. **Authentication**: NextAuth.js with secure session management
2. **Authorization**: Check user ownership in all API routes
3. **Input Validation**: Validate all user inputs
4. **File Upload**: Validate file type and size
5. **SQL Injection**: Prisma prevents by default
6. **XSS Protection**: React escapes by default
7. **CSRF Protection**: NextAuth.js handles
8. **Environment Variables**: Never commit secrets

### 14. Deployment

#### Local Development

```bash
# Start PostgreSQL
docker run -d \
  --name ncskit-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ncskit \
  -p 5432:5432 \
  postgres:15

# Start R Analytics
cd r-analytics
docker-compose up -d

# Start Next.js
cd frontend
npm install
npx prisma migrate dev
npm run dev
```

#### Production

```bash
# Build Next.js
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "ncskit" -- start
```

