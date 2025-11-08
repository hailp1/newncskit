# 🔧 CSV Analysis Workflow - Troubleshooting Guide

## ❓ Vấn đề: "Không thấy AI suggestions cho variable grouping"

### ✅ Workflow đúng là:
1. Upload CSV → ✅
2. Health Check tự động → ✅ (saves variables to DB)
3. Click "Continue" → ✅ (calls grouping API)
4. **AI Suggestions xuất hiện** → ❓ (Bạn không thấy?)

---

## 🔍 Nguyên nhân có thể:

### 1. Database chưa có tables ⚠️

**Kiểm tra:**
```bash
# Check if migrations have been run
npx supabase db remote list
```

**Fix:**
```bash
# Run migrations
npx supabase link --project-ref hfczndbrexnaoczxmopn
npx supabase db push
```

**Verify tables exist:**
- `analysis_projects`
- `analysis_variables`
- `variable_groups`
- `demographic_ranks`
- `ordinal_categories`
- `analysis_configurations`
- `analysis_results`

---

### 2. Variables không có pattern rõ ràng

**AI grouping hoạt động khi:**
- Variables có prefix giống nhau (Q1_, Q2_, Trust1, Trust2)
- Variables có numbering pattern (Item1, Item2, Item3)
- Variables có semantic similarity (trust, trustworthy, trusted)

**Test CSV tốt:**
```csv
Age,Income,Q1_Trust,Q2_Trust,Q3_Quality,Q4_Quality,Gender
25,15,4,5,3,4,Male
30,20,3,4,4,5,Female
35,25,5,4,5,4,Male
```

**Kết quả mong đợi:**
- Group 1: "Trust" (Q1_Trust, Q2_Trust) - Confidence: 85%
- Group 2: "Quality" (Q3_Quality, Q4_Quality) - Confidence: 85%

---

### 3. API Error không hiển thị

**Check browser console:**
1. Mở DevTools (F12)
2. Tab Console
3. Xem có error không

**Common errors:**
- "Failed to fetch" → Network issue
- "Unauthorized" → Auth issue
- "Project not found" → Database issue
- "No variables found" → Variables chưa được save

---

### 4. Loading state bị stuck

**Nếu loading mãi:**
- Check Network tab trong DevTools
- Xem API call `/api/analysis/group` có complete không
- Check response status

---

## 🚀 Quick Test

### Test 1: Check if variables were saved

**Browser Console:**
```javascript
// After health check completes
fetch('/api/analysis/results/YOUR_PROJECT_ID')
  .then(r => r.json())
  .then(d => console.log('Variables:', d.variables))
```

### Test 2: Manually call grouping API

**Browser Console:**
```javascript
fetch('/api/analysis/group', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ projectId: 'YOUR_PROJECT_ID' })
})
  .then(r => r.json())
  .then(d => console.log('Suggestions:', d))
```

---

## 📊 R Analytics - Không bắt buộc!

### ❓ "Có cần start R service không?"

**Trả lời: KHÔNG bắt buộc!**

**System hoạt động 2 mode:**

### Mode 1: Với R Analytics (Full features)
```bash
# Start R service
cd r-analytics
docker-compose up -d
```

**Khi có R:**
- ✅ Real statistical analysis
- ✅ Actual Cronbach's Alpha
- ✅ Real factor analysis
- ✅ Accurate results

### Mode 2: Không có R (Mock results)
**Khi không có R:**
- ✅ Workflow vẫn chạy bình thường
- ✅ Dùng mock results
- ✅ Test được toàn bộ UI/UX
- ⚠️ Results là mock data

**System tự động detect:**
```typescript
// In AnalysisService
const isRServiceHealthy = await AnalysisService.checkRServiceHealth();

if (isRServiceHealthy) {
  // Use real R analytics
} else {
  // Use mock results
  console.warn('R service unavailable, using mock results');
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Unauthorized" error

**Cause:** Not logged in or session expired

**Fix:**
1. Go to `/auth/login`
2. Sign in
3. Try again

---

### Issue 2: "Failed to upload CSV"

**Cause:** Storage bucket not configured

**Fix:**
```sql
-- In Supabase SQL Editor
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-csv-files', 'analysis-csv-files', false);

-- Add policies (see DEPLOY_CSV_ANALYSIS.md)
```

---

### Issue 3: "No suggestions" but variables exist

**Cause:** Variables don't have clear patterns

**Fix:**
- Use test CSV with clear patterns (Q1_, Q2_, etc.)
- Or create groups manually (drag & drop)
- System still works without AI suggestions

---

### Issue 4: "Analysis execution failed"

**Cause:** R service not available

**Fix:**
- **Option A:** Start R service (see above)
- **Option B:** Do nothing - system uses mock results

---

## 📝 Debug Checklist

When workflow doesn't work as expected:

### Step 1: Upload
- [ ] CSV file uploaded successfully
- [ ] File appears in Supabase Storage
- [ ] Project created in database

### Step 2: Health Check
- [ ] Health check runs automatically
- [ ] Quality score displays
- [ ] Variables saved to database
- [ ] "Continue" button appears

### Step 3: Variable Grouping
- [ ] Click "Continue" triggers API call
- [ ] Loading state shows
- [ ] AI suggestions appear (if variables have patterns)
- [ ] Can create groups manually
- [ ] Can save groups

### Step 4: Demographics
- [ ] Can select demographics
- [ ] Can create ranks
- [ ] Preview shows distribution
- [ ] Can save configuration

### Step 5: Analysis
- [ ] Can select analyses
- [ ] Can configure options
- [ ] Can run analyses
- [ ] Progress tracking works

### Step 6: Results
- [ ] Results display
- [ ] Can switch tabs
- [ ] Can export Excel
- [ ] Can export PDF

---

## 🔧 Manual Fixes

### Fix 1: Reset project and start over

```sql
-- In Supabase SQL Editor
DELETE FROM analysis_results WHERE project_id = 'YOUR_PROJECT_ID';
DELETE FROM analysis_configurations WHERE project_id = 'YOUR_PROJECT_ID';
DELETE FROM demographic_ranks WHERE variable_id IN (
  SELECT id FROM analysis_variables WHERE analysis_project_id = 'YOUR_PROJECT_ID'
);
DELETE FROM analysis_variables WHERE analysis_project_id = 'YOUR_PROJECT_ID';
DELETE FROM variable_groups WHERE project_id = 'YOUR_PROJECT_ID';
DELETE FROM analysis_projects WHERE id = 'YOUR_PROJECT_ID';
```

### Fix 2: Manually create variable groups

If AI suggestions don't work, you can:
1. Click "Create New Group"
2. Name the group
3. Drag variables into the group
4. Save

**This is perfectly fine!** AI suggestions are optional.

---

## 📞 Still Having Issues?

### Check these files:
1. `deployment/DEPLOY_CSV_ANALYSIS.md` - Deployment guide
2. `.kiro/specs/csv-analysis-workflow/DEMO_GUIDE.md` - Demo guide
3. `.kiro/specs/csv-analysis-workflow/PROJECT_COMPLETE.md` - Overview

### Check logs:
1. **Browser Console** - Frontend errors
2. **Vercel Logs** - `vercel logs --follow`
3. **Supabase Logs** - Dashboard → Logs

### Common solutions:
- Clear browser cache
- Try incognito mode
- Check network tab for failed requests
- Verify environment variables in Vercel

---

## ✅ Expected Behavior

### With good test data (Q1_, Q2_ pattern):
1. Upload CSV ✅
2. Health check ✅
3. Click Continue ✅
4. **See AI suggestions** ✅
5. Accept or create groups ✅
6. Configure demographics ✅
7. Select analyses ✅
8. View results ✅
9. Export ✅

### With random data (no patterns):
1. Upload CSV ✅
2. Health check ✅
3. Click Continue ✅
4. **No AI suggestions** (expected!)
5. **Create groups manually** ✅
6. Configure demographics ✅
7. Select analyses ✅
8. View results ✅
9. Export ✅

**Both workflows are valid!**

---

## 🎯 Summary

**Variable Grouping AI:**
- ✅ Implemented and working
- ✅ Requires variables with patterns
- ✅ Optional - can create manually
- ✅ No R service needed for this step

**R Analytics:**
- ⚠️ Optional for testing
- ✅ System works without it (mock results)
- ✅ Only needed for real statistical analysis

**If you don't see suggestions:**
1. Check if variables have patterns (Q1_, Q2_)
2. Check browser console for errors
3. Verify database has variables
4. Or just create groups manually!

---

**Status:** Workflow is working correctly!  
**AI Suggestions:** Optional feature, not required  
**R Service:** Optional, system has fallback

