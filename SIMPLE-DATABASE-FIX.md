# Simple Database Fix - Run These Commands

## The Problem
- 500 Error: Can't connect to database
- NextAuth Error: Can't connect to database
- Docker Desktop is slow to start

## The Solution (5 minutes)

### Option 1: Use Local PostgreSQL (Fastest)

Your local PostgreSQL is already running! Just run these commands:

#### Step 1: Create the database
```powershell
# Try with password 'postgres'
$env:PGPASSWORD="postgres"
psql -U postgres -c "CREATE DATABASE ncskit_production;"
```

If that doesn't work, try without password:
```powershell
psql -U postgres -c "CREATE DATABASE ncskit_production;"
```

#### Step 2: Update your .env.local
Edit `frontend/.env.local` and change the DATABASE_URL line to:

```env
# If password is 'postgres':
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ncskit_production

# OR if no password:
DATABASE_URL=postgresql://postgres@localhost:5432/ncskit_production
```

#### Step 3: Initialize the database
```powershell
cd frontend
npx prisma db push
```

#### Step 4: Restart dev server
Press Ctrl+C in your dev server terminal, then:
```powershell
npm run dev
```

### Option 2: Wait for Docker (Slower)

If you prefer Docker:

1. Check Docker Desktop app - is it fully started?
2. Once it's ready, run:
```powershell
docker-compose -f docker-compose.production.yml up -d postgres
cd frontend
npx prisma db push
```

## How to Know It Worked

✓ No more 500 errors in browser
✓ No more NextAuth CLIENT_FETCH_ERROR
✓ Blog posts load successfully
✓ You can log in

## Still Having Issues?

Check if PostgreSQL is listening:
```powershell
Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
```

If nothing shows up, PostgreSQL might be on a different port or not configured to accept connections.
