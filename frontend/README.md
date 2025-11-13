# NCSKIT Frontend - Local Node.js Architecture

This is the Next.js frontend application for NCSKIT, restructured to run as a full-stack application with local PostgreSQL database and R Analytics service.

## Architecture Overview

- **Frontend & Backend**: Next.js 16 with App Router (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials and Google OAuth
- **R Analytics**: Separate Docker service (called on-demand)
- **File Storage**: Local filesystem (`public/uploads/`)

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (running locally or via Docker)
- R Analytics Service (Docker container on port 8000)
- Git

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the following required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ncskit

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32

# R Analytics Service
R_SERVICE_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Setup Database

Create the database:

```bash
# Using psql
createdb ncskit

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE ncskit;
\q
```

Run migrations:

```bash
npm run db:migrate
```

Seed the database with sample data:

```bash
npm run db:seed
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database Management

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Create and apply migrations
- `npm run db:migrate:deploy` - Apply migrations (production)
- `npm run db:push` - Push schema changes without migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Testing

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate coverage report

### Other

- `npm run clean` - Clean build artifacts
- `npm run analyze` - Analyze bundle size
- `npm run validate-env` - Validate environment variables

## Project Structure

```
frontend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── projects/      # Project CRUD
│   │   │   ├── datasets/      # Dataset CRUD
│   │   │   ├── analytics/     # R service proxy
│   │   │   └── upload/        # File upload
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── logger.ts          # Winston logger
│   │   └── error-handler.ts   # Error handling
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Next.js middleware
├── public/
│   └── uploads/               # Uploaded files
├── logs/                      # Application logs
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js config
├── tsconfig.json              # TypeScript config
└── package.json
```

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Account**: OAuth accounts (Google, etc.)
- **Session**: User sessions
- **Project**: User projects
- **Dataset**: Uploaded CSV files
- **Analysis**: R analytics results (cached)

See `prisma/schema.prisma` for the complete schema.

## Authentication

The application uses NextAuth.js with two providers:

1. **Credentials**: Email/password authentication
2. **Google OAuth**: Optional Google sign-in

### Test User

After running `npm run db:seed`, you can login with:

- Email: `test@example.com`
- Password: `password123`

## API Routes

All API routes are in `src/app/api/`:

- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/upload` - Upload CSV file
- `POST /api/analytics/run` - Run R analytics

## R Analytics Integration

The R Analytics service runs separately on port 8000. The Next.js app calls it via HTTP when users request analysis.

### Starting R Service

```bash
cd ../r-analytics
docker-compose up -d
```

### Health Check

```bash
curl http://localhost:8000/health
```

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `R_SERVICE_URL` - R Analytics service URL

### Optional

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env.local`
3. Verify database exists: `psql -l`
4. Check user permissions

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
npm run db:generate
```

### R Service Connection Issues

If analytics fail:

1. Check R service is running: `curl http://localhost:8000/health`
2. Verify R_SERVICE_URL in `.env.local`
3. Check Docker logs: `docker logs ncskit-r-analytics`

### Migration Issues

If migrations fail:

```bash
# Reset database (WARNING: deletes all data)
npm run db:push -- --force-reset

# Or manually reset
dropdb ncskit
createdb ncskit
npm run db:migrate
```

## Development Workflow

1. Make changes to code
2. Hot reload automatically updates the app
3. For schema changes:
   - Update `prisma/schema.prisma`
   - Run `npm run db:migrate`
   - Run `npm run db:generate`
4. Test changes
5. Commit and push

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Set all required environment variables in your hosting platform:

- DATABASE_URL (production PostgreSQL)
- NEXTAUTH_URL (production URL)
- NEXTAUTH_SECRET (strong secret)
- R_SERVICE_URL (production R service)

### Start

```bash
npm run start
```

Or use a process manager like PM2:

```bash
pm2 start npm --name "ncskit" -- start
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm run test`
4. Run type check: `npm run type-check`
5. Run lint: `npm run lint`
6. Submit pull request

## License

[Your License Here]
