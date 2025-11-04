# 🧪 LOCAL TESTING GUIDE

## 🗄️ **STEP 1: SETUP DATABASE**

### Database Status Check:
- ✅ Supabase connection working
- ❌ **business_domains** table missing
- ❌ **marketing_models** table missing  
- ✅ **users** table exists
- ✅ **projects** table exists

### Required Action: Execute SQL Files

**Go to Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard
2. Select your project: `ujcsqwegzchvsxigydcl`
3. Go to **SQL Editor**

**Execute these files in order:**

#### 1. Complete Production Schema (19 KB)
```sql
-- Copy content from: frontend/database/complete-production-schema.sql
-- This creates all tables, relationships, RLS policies, and functions
```

#### 2. Sample Production Data (23 KB)
```sql
-- Copy content from: frontend/database/sample-production-data.sql
-- This inserts business domains, marketing models, and variables
```

#### 3. Marketing Knowledge Base (11 KB)
```sql
-- Copy content from: frontend/database/marketing-knowledge-base.sql
-- This adds comprehensive marketing data
```

#### 4. Research Templates (20 KB)
```sql
-- Copy content from: frontend/database/research-outline-templates.sql
-- This adds research outline templates
```

### Verification Queries:
After executing all files, run these to verify:

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check data counts
SELECT 'business_domains' as table_name, COUNT(*) as records FROM business_domains
UNION ALL
SELECT 'marketing_models' as table_name, COUNT(*) as records FROM marketing_models
UNION ALL
SELECT 'research_variables' as table_name, COUNT(*) as records FROM research_variables;
```

**Expected Results:**
- business_domains: 6 records
- marketing_models: 6+ records  
- research_variables: 15+ records

## 🧪 **STEP 2: TEST DATABASE CONNECTION**

Run the connection test:
```bash
node test-supabase-connection.js
```

**Expected Output:**
```
✅ Basic connection successful
✅ business_domains table accessible
✅ marketing_models table accessible  
✅ users table accessible
✅ projects table accessible
```

## 🚀 **STEP 3: TEST USER & PROJECT CREATION**

After database setup, test full functionality:
```bash
node test-create-user-project.js
```

**This will test:**
- ✅ User creation
- ✅ Project creation
- ✅ Model relationships
- ✅ Activity logging

## 🖥️ **STEP 4: START LOCAL DEVELOPMENT**

### Start Frontend:
```bash
cd frontend
npm run dev
```

**Expected:**
- Server starts on http://localhost:3000
- No build errors
- All pages load correctly

### Test Core Features:

#### 1. Landing Page
- Visit: http://localhost:3000
- Should load without errors
- Navigation works

#### 2. User Registration
- Visit: http://localhost:3000/register
- Try registering a new user
- Should redirect to dashboard

#### 3. Dashboard
- Visit: http://localhost:3000/dashboard
- Should show user stats
- Recent projects section

#### 4. Project Creation
- Visit: http://localhost:3000/projects/new
- Should show business domains dropdown
- Should show marketing models selection
- Try creating a test project

#### 5. Database Integration
- Created projects should appear in dashboard
- User data should persist
- All CRUD operations should work

## 🔧 **TROUBLESHOOTING**

### Common Issues:

#### Build Errors:
```bash
# Check for TypeScript errors
cd frontend
npm run build

# If errors, check:
- Import statements
- Type definitions
- Missing dependencies
```

#### Database Connection:
```bash
# Test connection
node test-supabase-connection.js

# If fails, check:
- Supabase URL and key in .env.local
- Database schema setup
- RLS policies
```

#### Environment Variables:
```bash
# Check .env.local has:
NEXT_PUBLIC_SUPABASE_URL=https://ujcsqwegzchvsxigydcl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key (optional)
```

#### Missing Tables:
```bash
# If tables missing, execute SQL files in Supabase dashboard
# Order matters: schema → data → knowledge base → templates
```

## ✅ **SUCCESS CRITERIA**

### Database Setup Complete:
- [ ] All 20+ tables created
- [ ] Sample data loaded (6 domains, 6+ models)
- [ ] RLS policies active
- [ ] Connection test passes

### Local App Working:
- [ ] Frontend starts without errors
- [ ] User registration works
- [ ] Dashboard loads with data
- [ ] Project creation works
- [ ] Data persists to Supabase

### Ready for Production:
- [ ] All tests pass
- [ ] No console errors
- [ ] Responsive design works
- [ ] Database operations work

## 🎯 **NEXT STEPS**

After local testing works:

1. **Add Gemini API Key** for AI features
2. **Test AI outline generation**
3. **Deploy to Vercel** using deployment guide
4. **Setup production monitoring**

## 📞 **SUPPORT**

**Test Scripts:**
- `node test-supabase-connection.js` - Test database
- `node test-create-user-project.js` - Test CRUD operations
- `node check-build-errors.js` - Check build issues

**Documentation:**
- `VERCEL_DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `README.md` - Project overview

**Repository:** https://github.com/hailp1/newncskit.git

---

## 🎊 **READY FOR LOCAL TESTING!**

Follow the steps above to get your local environment working with real Supabase data.

**Priority:** Execute the SQL files in Supabase dashboard first! 🗄️