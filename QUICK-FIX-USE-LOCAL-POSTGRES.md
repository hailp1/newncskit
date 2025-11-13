# Quick Fix: Use Local PostgreSQL (Bypass Docker Issue)

## Problem
Docker Desktop is taking too long to start, blocking the database connection.

## Quick Solution: Use Your Local PostgreSQL

You already have PostgreSQL running locally (I saw the processes earlier). Let's use that instead!

### Step 1: Create the Database
Open a PowerShell terminal and run:

```powershell
# Connect to PostgreSQL (you may need to adjust the path)
psql -U postgres

# In the psql prompt, create the database:
CREATE DATABASE ncskit_production;

# Exit psql
\q
```

### Step 2: Update .env.local
Update your `frontend/.env.local` file to use local PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/ncskit_production
```

Replace `YOUR_LOCAL_PASSWORD` with your local PostgreSQL password (commonly `postgres` or empty).

### Step 3: Initialize the Database
```powershell
cd frontend
npx prisma db push
```

This will create all the tables in your database.

### Step 4: Restart Dev Server
1. Stop the current dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Refresh your browser

## Alternative: Wait for Docker
If you prefer to use Docker, you can:
1. Wait a few more minutes for Docker Desktop to fully start
2. Check the Docker Desktop app - look for any error messages
3. Try restarting Docker Desktop from the system tray
4. Once it's running, use the `check-docker-and-start-db.ps1` script

## Which Should You Choose?

**Use Local PostgreSQL if:**
- ✓ You want to fix the issue immediately
- ✓ You're doing local development
- ✓ Docker Desktop is having issues

**Use Docker PostgreSQL if:**
- ✓ You want production-like environment
- ✓ You're testing the full Docker stack
- ✓ Docker Desktop is working properly

## Need Help Finding Your Local PostgreSQL Password?
Common defaults:
- Username: `postgres`
- Password: `postgres` or empty string
- Port: `5432`

If you don't remember, you may need to reset it or check your PostgreSQL installation.
