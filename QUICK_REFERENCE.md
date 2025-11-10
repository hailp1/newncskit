# Quick Reference - Data Analysis Flow

## 🚀 Quick Start

### For Testing
```bash
# 1. Check database
psql -d your_database -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'analysis%';"

# 2. Check storage bucket
# Go to Supabase Dashboard → Storage → analysis-csv-files

# 3. Start testing
# Open http://localhost:3000/analysis/new
# Upload test_data.csv
# Follow the flow
```

### For Deployment
```bash
# 1. Run migrations (if any)
npm run db:migrate

# 2. Build frontend
npm run build

# 3. Deploy
npm run deploy

# 4. Verify
curl http://your-domain/api/analysis/health
```

---

## 📁 File Locations

### Modified Files
```
frontend/src/app/api/analysis/
├── upload/route.ts          ← Fixed: Save to database
├── health/route.ts          ← Fixed: Load from database
├── group/route.ts           ← Fixed: Load from database
└── variables/route.ts       ← New: Load variables

frontend/src/app/(dashboard)/analysis/
└── new/page.tsx             ← Fixed: Simplified logic
```

### Documentation
```
docs/
├── DATA_ANALYSIS_FLOW_ISSUES.md      ← Problem analysis
├── DATA_ANALYSIS_FLOW_FIXES.md       ← Fix summary
├── TESTING_GUIDE.md                  ← Testing instructions
├── RELEASE_DATA_ANALYSIS_FLOW_v1.0.md ← Release notes
├── PRE_RELEASE_CHECKLIST.md          ← Pre-release checklist
├── FINAL_SUMMARY.md                  ← Final summary
└── QUICK_REFERENCE.md                ← This file
```

---

## 🔄 Flow Overview

```
Upload → Health → Grouping → Demographics → Analysis → Results
  ↓        ↓         ↓            ↓            ↓         ↓
 DB      DB        DB           DB           R Svc     DB
```

---

## 🗄️ Database Tables

```sql
-- Projects
analysis_projects (id, user_id, name, csv_file_path, status, ...)

-- Variables
analysis_variables (id, analysis_project_id, column_name, ...)

-- Groups
variable_groups (id, analysis_project_id, name, ...)

-- Role Tags
variable_role_tags (id, project_id, variable_id, role, ...)
```

---

## 🔌 API Endpoints

```
POST   /api/analysis/upload      - Upload CSV
POST   /api/analysis/health      - Health check
POST   /api/analysis/group       - Generate suggestions
GET    /api/analysis/variables   - Load variables
POST   /api/analysis/groups/save - Save groups
POST   /api/analysis/execute     - Execute analysis
```

---

## 🧪 Quick Test

```bash
# 1. Create test CSV
cat > test.csv << EOF
Q1,Q2,Q3,Age,Gender
5,4,3,25,Male
4,5,4,30,Female
EOF

# 2. Upload via UI
# Open http://localhost:3000/analysis/new
# Upload test.csv

# 3. Verify in database
psql -d your_database -c "SELECT * FROM analysis_projects ORDER BY created_at DESC LIMIT 1;"

# 4. Check storage
# Supabase Dashboard → Storage → analysis-csv-files
```

---

## 🐛 Common Issues

### Issue: "Project not found"
**Fix:** Check if project was created in database
```sql
SELECT * FROM analysis_projects WHERE id = 'your-project-id';
```

### Issue: "Failed to load CSV"
**Fix:** Check if file exists in storage
```bash
# Supabase Dashboard → Storage → analysis-csv-files
# Look for: user_id/timestamp-filename.csv
```

### Issue: "No variables found"
**Fix:** Check if variables were created
```sql
SELECT * FROM analysis_variables WHERE analysis_project_id = 'your-project-id';
```

---

## 📊 Monitoring

### Check Logs
```bash
# Frontend logs
tail -f logs/frontend.log | grep "Upload\|Health\|Grouping"

# Database logs
tail -f logs/postgres.log | grep "analysis_"

# Storage logs
# Supabase Dashboard → Logs → Storage
```

### Check Metrics
```sql
-- Upload success rate
SELECT 
  COUNT(*) as total_uploads,
  COUNT(*) FILTER (WHERE status = 'uploaded') as successful
FROM analysis_projects
WHERE created_at > NOW() - INTERVAL '1 day';

-- Average file size
SELECT AVG(row_count * column_count) as avg_cells
FROM analysis_projects;
```

---

## 🔧 Troubleshooting

### Reset Test Data
```sql
-- Delete test projects
DELETE FROM analysis_projects WHERE name LIKE 'test%';

-- Clean up orphaned files
-- Supabase Dashboard → Storage → analysis-csv-files
-- Delete files manually
```

### Verify Setup
```bash
# Check database connection
psql -d your_database -c "SELECT 1;"

# Check storage bucket
# Supabase Dashboard → Storage → Verify bucket exists

# Check R service (if using)
curl http://localhost:8000/health
```

---

## 📝 Quick Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check linting
```

### Database
```bash
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed test data
```

### Deployment
```bash
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production
```

---

## 🎯 Success Checklist

Quick checklist before release:

- [ ] Upload CSV works
- [ ] Project saved to database
- [ ] CSV saved to storage
- [ ] Variables created in database
- [ ] Health check displays correctly
- [ ] Grouping suggestions generated
- [ ] Groups saved to database
- [ ] Demographics configured
- [ ] Analysis executes
- [ ] Results displayed

---

## 📞 Quick Links

- **Testing Guide:** `TESTING_GUIDE.md`
- **Release Notes:** `RELEASE_DATA_ANALYSIS_FLOW_v1.0.md`
- **Issue Analysis:** `DATA_ANALYSIS_FLOW_ISSUES.md`
- **Fix Summary:** `DATA_ANALYSIS_FLOW_FIXES.md`
- **Checklist:** `PRE_RELEASE_CHECKLIST.md`

---

## 🆘 Need Help?

1. Check `TESTING_GUIDE.md` for detailed instructions
2. Check `DATA_ANALYSIS_FLOW_ISSUES.md` for known issues
3. Check console logs for error messages
4. Check database for data persistence
5. Check Supabase Dashboard for storage issues

---

**Last Updated:** 2025-11-10  
**Version:** 1.0.0  
**Status:** Ready for Testing
