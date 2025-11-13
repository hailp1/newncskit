# Fix Database Connection Error (500 Error)

## Problem
Your Next.js app is getting a 500 error when trying to fetch blog posts because it can't connect to the PostgreSQL database.

## Root Cause
- The app expects PostgreSQL at `localhost:5432`
- Docker Desktop wasn't running, so the PostgreSQL container wasn't available
- Database name mismatch: `.env.local` had `ncskit` but Docker uses `ncskit_production`

## Solution

### Step 1: Start Docker Desktop
1. Docker Desktop should now be starting (I already launched it)
2. Wait for the Docker icon in your system tray to stop animating (usually 30-60 seconds)
3. You'll know it's ready when the icon is static

### Step 2: Start PostgreSQL Container
Once Docker Desktop is ready, run this command:

```powershell
docker-compose -f docker-compose.production.yml up -d postgres
```

Or use the script I created:
```powershell
.\start-postgres-only.ps1
```

### Step 3: Run Database Migrations
After PostgreSQL is running, initialize the database:

```powershell
cd frontend
npx prisma migrate deploy
# or if you need to create the schema from scratch:
npx prisma db push
```

### Step 4: Restart Your Dev Server
The dev server should automatically reconnect, but if not:
1. Stop the current dev server (Ctrl+C in the terminal)
2. Start it again: `npm run dev`

## What I Fixed
✅ Updated `.env.local` to use correct database credentials:
   - Database: `ncskit_production` (was `ncskit`)
   - Password: `ncskit_secure_password_change_me` (was `postgres`)

✅ Created `start-postgres-only.ps1` script for easy PostgreSQL startup

## Verify It's Working
After completing the steps above, check:

1. **PostgreSQL is running:**
   ```powershell
   docker ps --filter "name=ncskit-postgres"
   ```
   You should see the container running.

2. **Database connection works:**
   ```powershell
   cd frontend
   npx prisma migrate status
   ```
   Should connect successfully (not show connection error).

3. **Blog posts load:**
   Refresh your browser - the 500 error should be gone!

## Alternative: Use Local PostgreSQL
If you prefer not to use Docker, you can:
1. Install PostgreSQL locally
2. Create a database named `ncskit_production`
3. Update `.env.local` with your local credentials
4. Run migrations

## Need Help?
If you still see errors after following these steps, let me know and I'll help troubleshoot!
