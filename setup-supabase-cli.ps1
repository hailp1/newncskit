# Setup Supabase CLI and run database migrations
Write-Host "🚀 NCSKIT Supabase CLI Setup" -ForegroundColor Green
Write-Host "=" * 50

# Check if Supabase CLI is installed
Write-Host "`n1. 🔍 Checking Supabase CLI..." -ForegroundColor Cyan

try {
    $supabaseVersion = supabase --version 2>$null
    if ($supabaseVersion) {
        Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
    } else {
        throw "Not found"
    }
} catch {
    Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host "`n📦 Installing Supabase CLI..." -ForegroundColor Yellow
    
    # Install via npm
    try {
        npm install -g supabase
        Write-Host "✅ Supabase CLI installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Supabase CLI" -ForegroundColor Red
        Write-Host "💡 Please install manually:" -ForegroundColor Yellow
        Write-Host "   npm install -g supabase" -ForegroundColor White
        Write-Host "   or visit: https://supabase.com/docs/guides/cli" -ForegroundColor White
        exit 1
    }
}

# Initialize Supabase project
Write-Host "`n2. 🔧 Setting up Supabase project..." -ForegroundColor Cyan

if (!(Test-Path "supabase")) {
    Write-Host "   Initializing Supabase project..." -ForegroundColor Yellow
    supabase init
}

# Link to remote project
Write-Host "`n3. 🔗 Linking to remote project..." -ForegroundColor Cyan
try {
    supabase link --project-ref ujcsqwegzchvsxigydcl
    Write-Host "✅ Linked to remote project" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Link failed - may need authentication" -ForegroundColor Yellow
    Write-Host "💡 Run: supabase login" -ForegroundColor White
}

# Create migration file
Write-Host "`n4. 📝 Creating migration..." -ForegroundColor Cyan

$migrationContent = @"
-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS research_domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Update existing users
UPDATE users SET research_domains = ARRAY['Computer Science'] WHERE email = 'demo@ncskit.com';
UPDATE users SET research_domains = ARRAY['Data Science'] WHERE email = 'researcher@ncskit.com';
UPDATE users SET research_domains = ARRAY['Biology'] WHERE email = 'student@ncskit.com';

-- Add columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS research_domain VARCHAR(100);

-- Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample institutions
INSERT INTO institutions (name, country) VALUES
('NCSKIT University', 'Vietnam'),
('Tech Research Institute', 'Vietnam'),
('State University', 'Vietnam')
ON CONFLICT DO NOTHING;
"@

$migrationFile = "supabase/migrations/$(Get-Date -Format 'yyyyMMddHHmmss')_add_missing_columns.sql"
New-Item -Path (Split-Path $migrationFile) -ItemType Directory -Force | Out-Null
$migrationContent | Out-File -FilePath $migrationFile -Encoding UTF8

Write-Host "✅ Migration file created: $migrationFile" -ForegroundColor Green

# Run migration
Write-Host "`n5. 🚀 Running migration..." -ForegroundColor Cyan
try {
    supabase db push
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "💡 Try manual approach:" -ForegroundColor Yellow
    Write-Host "   1. supabase login" -ForegroundColor White
    Write-Host "   2. supabase link --project-ref ujcsqwegzchvsxigydcl" -ForegroundColor White
    Write-Host "   3. supabase db push" -ForegroundColor White
}

# Verify setup
Write-Host "`n6. ✅ Verifying setup..." -ForegroundColor Cyan
Write-Host "Running verification script..." -ForegroundColor Yellow

try {
    node check-database-structure.js
} catch {
    Write-Host "⚠️ Verification script failed" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 50
Write-Host "🎯 SETUP SUMMARY:" -ForegroundColor Magenta
Write-Host "✅ Supabase CLI configured" -ForegroundColor Green
Write-Host "✅ Migration file created" -ForegroundColor Green
Write-Host "📂 Migration location: $migrationFile" -ForegroundColor Cyan

Write-Host "`n🧪 Test your setup:" -ForegroundColor Yellow
Write-Host "   node check-database-structure.js" -ForegroundColor White
Write-Host "   http://localhost:3000/demo-register" -ForegroundColor White

Write-Host "`n🔗 Useful commands:" -ForegroundColor Yellow
Write-Host "   supabase status          # Check project status" -ForegroundColor White
Write-Host "   supabase db reset        # Reset database" -ForegroundColor White
Write-Host "   supabase db push         # Push migrations" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")