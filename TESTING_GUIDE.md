# Hướng Dẫn Testing Flow Phân Tích Dữ Liệu

## Ngày: 2025-11-10

## Chuẩn Bị

### 1. Kiểm tra Database
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'analysis_projects',
  'analysis_variables',
  'variable_groups',
  'variable_role_tags'
);

-- Should return 4 rows
```

### 2. Kiểm tra Supabase Storage
```bash
# Verify bucket exists
# Go to Supabase Dashboard → Storage
# Check if 'analysis-csv-files' bucket exists
# If not, create it with public access disabled
```

### 3. Kiểm tra R Service
```bash
# Check if R service is running
curl http://localhost:8000/health

# Should return:
# {
#   "status": "healthy",
#   "helper_functions": "loaded",
#   "data_cached": 0,
#   "r_version": "R version ...",
#   "timestamp": "..."
# }
```

---

## Test Case 1: Upload CSV

### Bước 1: Chuẩn bị file CSV
Tạo file `test_data.csv`:
```csv
Q1_Satisfaction,Q2_Quality,Q3_Price,Q4_Service,Age,Gender
5,4,3,5,25,Male
4,5,4,4,30,Female
3,3,5,3,35,Male
5,5,5,5,28,Female
4,4,4,4,32,Male
```

### Bước 2: Upload file
1. Mở browser: `http://localhost:3000/analysis/new`
2. Drag & drop file `test_data.csv`
3. Click "Upload and Continue"

### Bước 3: Verify upload
**Expected:**
- ✅ Progress bar hiển thị 0% → 100%
- ✅ Success message: "Upload Successful"
- ✅ Tự động chuyển sang Health Check step

**Verify in Database:**
```sql
-- Check project created
SELECT * FROM analysis_projects 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- - id: UUID
-- - name: "test_data"
-- - csv_file_path: "user_id/timestamp-test_data.csv"
-- - row_count: 5
-- - column_count: 6
-- - status: "uploaded"

-- Check variables created
SELECT * FROM analysis_variables 
WHERE analysis_project_id = '<project_id_from_above>';

-- Should show 6 rows:
-- Q1_Satisfaction, Q2_Quality, Q3_Price, Q4_Service, Age, Gender
```

**Verify in Supabase Storage:**
```bash
# Go to Supabase Dashboard → Storage → analysis-csv-files
# Should see file: user_id/timestamp-test_data.csv
```

---

## Test Case 2: Health Check

### Bước 1: Review health report
**Expected:**
- ✅ Health report hiển thị:
  - Total rows: 5
  - Total columns: 6
  - Missing values: 0
  - Data quality: Good

### Bước 2: Click "Continue"
**Expected:**
- ✅ Loading indicator hiển thị
- ✅ Tự động chuyển sang Variable Grouping step

**Verify in Console:**
```javascript
// Should see logs:
[Grouping] Fetching suggestions for project: <project_id>
[Grouping] Response status: 200
[Grouping] Received data: { suggestionsCount: 2, totalVariables: 6, ... }
[Grouping] Moved to group step
```

---

## Test Case 3: Variable Grouping

### Bước 1: Review suggestions
**Expected:**
- ✅ Suggestions hiển thị:
  - Group 1: "Satisfaction" (Q1_Satisfaction, Q2_Quality, Q3_Price, Q4_Service)
  - Group 2: "Demographics" (Age, Gender)

### Bước 2: Accept suggestions
1. Click "Accept" cho từng suggestion
2. Hoặc click "Accept All"

**Expected:**
- ✅ Suggestions biến thành groups
- ✅ Groups hiển thị trong "Variable Groups" section

### Bước 3: Modify groups (Optional)
1. Click "Edit" trên group name
2. Rename group
3. Click "Save"

**Expected:**
- ✅ Group name updated
- ✅ Success notification

### Bước 4: Save groups
1. Click "Save & Continue"

**Expected:**
- ✅ Loading indicator
- ✅ Success notification: "Saved Successfully"
- ✅ Tự động chuyển sang Demographics step

**Verify in Database:**
```sql
-- Check groups saved
SELECT * FROM variable_groups 
WHERE analysis_project_id = '<project_id>';

-- Should show 2 rows:
-- - name: "Satisfaction"
-- - name: "Demographics"

-- Check group members
SELECT vg.name, av.column_name
FROM variable_groups vg
JOIN analysis_variables av ON av.variable_group_id = vg.id
WHERE vg.analysis_project_id = '<project_id>'
ORDER BY vg.name, av.display_order;

-- Should show:
-- Satisfaction | Q1_Satisfaction
-- Satisfaction | Q2_Quality
-- Satisfaction | Q3_Price
-- Satisfaction | Q4_Service
-- Demographics | Age
-- Demographics | Gender
```

---

## Test Case 4: Demographics

### Bước 1: Select demographics
1. Check "Age" as demographic
2. Select type: "Continuous"
3. Check "Gender" as demographic
4. Select type: "Categorical"

**Expected:**
- ✅ Demographic options hiển thị
- ✅ Type selectors hoạt động

### Bước 2: Save demographics
1. Click "Save & Continue"

**Expected:**
- ✅ Loading indicator
- ✅ Success notification
- ✅ Tự động chuyển sang Analysis step

**Verify in Database:**
```sql
-- Check demographics saved
SELECT column_name, is_demographic, demographic_type
FROM analysis_variables 
WHERE analysis_project_id = '<project_id>'
AND is_demographic = true;

-- Should show:
-- Age | true | continuous
-- Gender | true | categorical
```

---

## Test Case 5: Analysis Execution

### Bước 1: Select analysis types
1. Check "Descriptive Statistics"
2. Check "Correlation Analysis"
3. Click "Run Analysis"

**Expected:**
- ✅ Loading indicator
- ✅ Progress bar hiển thị
- ✅ Status: "Analyzing..."

### Bước 2: Wait for completion
**Expected:**
- ✅ Progress bar đạt 100%
- ✅ Success notification
- ✅ Tự động chuyển sang Results step

**Verify in Database:**
```sql
-- Check analysis results saved
SELECT analysis_type, executed_at
FROM analysis_results 
WHERE analysis_project_id = '<project_id>';

-- Should show:
-- descriptive_stats | <timestamp>
-- correlation | <timestamp>
```

**Verify in Console:**
```javascript
// Should see logs:
[Execute] Loading project from database
[Execute] Loading CSV from storage
[Execute] Calling R service
[Execute] Analysis completed
[Execute] Results saved to database
```

---

## Test Case 6: Results

### Bước 1: View results
**Expected:**
- ✅ Results hiển thị cho từng analysis type
- ✅ Tables, charts, statistics hiển thị đúng

### Bước 2: Export results (Optional)
1. Click "Export to Excel"
2. Click "Export to PDF"

**Expected:**
- ✅ File downloaded
- ✅ File chứa đúng results

---

## Test Case 7: Error Handling

### Test 7.1: Upload invalid file
1. Upload file `.txt` thay vì `.csv`

**Expected:**
- ✅ Error message: "Chỉ chấp nhận file CSV"

### Test 7.2: Upload empty file
1. Upload file CSV rỗng

**Expected:**
- ✅ Error message: "File must contain at least a header row and one data row"

### Test 7.3: Upload file quá lớn
1. Upload file > 50MB

**Expected:**
- ✅ Error message: "File quá lớn. Kích thước tối đa là 50MB"

### Test 7.4: Network error
1. Disconnect internet
2. Try to upload file

**Expected:**
- ✅ Error message: "Vấn đề kết nối - Đang thử lại..."
- ✅ Auto retry 3 lần

---

## Test Case 8: Backward Compatibility

### Test 8.1: Load existing project
1. Upload CSV và save groups
2. Refresh page
3. Navigate back to project

**Expected:**
- ✅ Project loads từ database
- ✅ Groups loads từ database
- ✅ Demographics loads từ database
- ✅ Auto-continue disabled (existing project)

---

## Debugging Tips

### Check Browser Console
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check workflow logs
// Should see:
[Workflow] Session initialized
[Upload] Processing file...
[Health] Loading from database...
[Grouping] Fetching suggestions...
[Save] Saving to database...
```

### Check Network Tab
```
POST /api/analysis/upload → 200 OK
GET /api/analysis/variables → 200 OK
POST /api/analysis/group → 200 OK
POST /api/analysis/groups/save → 200 OK
POST /api/analysis/execute → 200 OK
```

### Check Database
```sql
-- Check project status
SELECT id, name, status, created_at 
FROM analysis_projects 
ORDER BY created_at DESC 
LIMIT 5;

-- Check variables count
SELECT analysis_project_id, COUNT(*) as variable_count
FROM analysis_variables 
GROUP BY analysis_project_id;

-- Check groups count
SELECT analysis_project_id, COUNT(*) as group_count
FROM variable_groups 
GROUP BY analysis_project_id;
```

---

## Common Issues

### Issue 1: "Project not found"
**Cause:** Project không được lưu vào database
**Fix:** Check upload route, verify database connection

### Issue 2: "No variables found"
**Cause:** Variables không được tạo trong database
**Fix:** Check upload route, verify variables insert

### Issue 3: "Failed to load CSV file"
**Cause:** CSV không được upload vào Supabase Storage
**Fix:** Check storage bucket exists, verify permissions

### Issue 4: "R service unavailable"
**Cause:** R service không chạy hoặc không accessible
**Fix:** Start R service, check port 8000

---

## Success Criteria

### ✅ All tests pass:
- [ ] Upload CSV → Database
- [ ] Health check → Load from database
- [ ] Variable grouping → Load from database
- [ ] Save groups → Database
- [ ] Save demographics → Database
- [ ] Execute analysis → R service
- [ ] View results → Database

### ✅ No errors in console
### ✅ No errors in database
### ✅ All data persisted correctly
### ✅ Flow hoạt động mượt mà

---

## Next Steps

1. **Run all test cases**
2. **Fix any issues found**
3. **Add automated tests**
4. **Deploy to staging**
5. **User acceptance testing**
6. **Deploy to production**

**READY FOR TESTING!**
