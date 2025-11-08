# 🎯 CSV Analysis Workflow - Demo Guide

**Status:** ✅ READY TO DEMO  
**URL:** http://localhost:3000  
**Feature:** Complete CSV Analysis Workflow

---

## 🚀 Quick Start

### 1. Server is Running
```
✅ Frontend: http://localhost:3000
✅ Database: Supabase (Connected)
⚠️  R Analytics: http://localhost:8000 (Optional - will use mock data if unavailable)
```

### 2. Access the Feature
Navigate to: **http://localhost:3000/analysis/new**

---

## 📋 Demo Workflow

### Step 1: Upload CSV File
**What to do:**
- Click or drag & drop a CSV file
- File should be < 50MB
- First row should be headers

**What you'll see:**
- ✅ Upload progress bar
- ✅ File validation
- ✅ Preview of first 10 rows
- ✅ Automatic health check starts

**Test Data:**
You can create a simple CSV file:
```csv
Age,Income,Q1_Trust,Q2_Trust,Q3_Quality,Q4_Quality,Gender
25,15,4,5,3,4,Male
30,20,3,4,4,5,Female
35,25,5,4,5,4,Male
28,18,4,3,4,3,Female
```

---

### Step 2: Data Health Check
**What happens automatically:**
- ✅ Missing value detection
- ✅ Outlier detection (IQR method)
- ✅ Data type inference
- ✅ Quality score calculation (0-100)
- ✅ Recommendations generation

**What you'll see:**
- 📊 Overall quality score with color coding
- 📈 Missing data visualization
- 🎯 Outlier detection results
- 📋 Data type distribution
- 💡 Actionable recommendations
- ➡️ "Continue" button

---

### Step 3: Variable Grouping
**What happens:**
- 🤖 AI analyzes variable names
- 🎯 Suggests groups based on:
  - Common prefixes (Q1_, Q2_)
  - Numbering patterns (Item1, Item2)
  - Semantic similarity (trust, quality)

**What you can do:**
- ✅ Accept AI suggestions (click ✓)
- ❌ Reject suggestions (click ✗)
- ➕ Create new groups manually
- 🖱️ Drag & drop variables between groups
- ✏️ Edit group names
- 🗑️ Delete groups
- 💾 Save groups

**What you'll see:**
- 🌟 AI suggestion cards with confidence scores
- 📦 Ungrouped variables panel with search
- 📁 Group cards with drag-drop zones
- 💾 Save button

---

### Step 4: Demographic Configuration
**What happens:**
- 🤖 AI suggests demographic variables
- 🎯 Detects: age, gender, income, education, etc.

**What you can do:**
- ✅ Select demographic variables
- 📝 Assign semantic names (age, gender, income)
- 🎚️ Choose type:
  - **Categorical** - Nominal (gender, region)
  - **Ordinal** - Ordered (education level)
  - **Continuous** - Numeric with custom ranks
- 📊 Create custom ranks for continuous variables:
  - Define min/max values
  - Support open-ended ranges (< 10, > 30)
  - See real-time distribution preview
  - Visual bar charts
- 💾 Save configuration

**Example Ranks:**
For Income variable:
- "Dưới 10 triệu" (< 10)
- "10-15 triệu" (10-15)
- "16-20 triệu" (16-20)
- "21-30 triệu" (21-30)
- "Trên 30 triệu" (> 30)

---

### Step 5: Analysis Selection
**What you'll see:**
8 analysis types available:

1. **📊 Descriptive Statistics**
   - Mean, SD, Min, Max, Skewness, Kurtosis
   - Config: Group by demographics, Confidence level

2. **📈 Reliability Analysis**
   - Cronbach's Alpha
   - Config: Show alpha if deleted

3. **🔍 Exploratory Factor Analysis (EFA)**
   - Factor discovery
   - Config: Rotation method, Number of factors, Loading threshold

4. **🎯 Confirmatory Factor Analysis (CFA)**
   - Model testing
   - Config: Estimator (ML, MLR, WLSMV)

5. **🔗 Correlation Analysis**
   - Correlation matrix
   - Config: Method (Pearson, Spearman, Kendall)

6. **📊 ANOVA**
   - Group comparisons
   - Config: Post-hoc test (Tukey, Bonferroni)

7. **📈 Linear Regression**
   - Predictive modeling
   - Config: Include diagnostics

8. **🌐 Structural Equation Modeling (SEM)**
   - Complex relationships
   - Config: Estimator

**What you can do:**
- ☑️ Select analyses (checkbox)
- ⚙️ Expand configuration options
- 🔧 Configure each analysis
- ⏱️ See estimated execution time
- ▶️ Click "Run X Analyses"

---

### Step 6: Analysis Execution
**What happens:**
- 💾 Configurations saved to database
- 🚀 Background execution starts
- 📡 R Analytics service called (or mock if unavailable)
- 📊 Results saved after each analysis

**What you'll see:**
- 🔄 Animated spinner
- 📊 Progress bar (0-100%)
- 📝 Current analysis indicator
- ✅ Completed analyses list
- ⏱️ Execution time per analysis
- 🎯 Success/error indicators

**Progress updates every 2 seconds**

---

### Step 7: View Results
**What you'll see:**
- 📑 Tabbed interface for each analysis
- 📊 Execution information (date, time)
- ⏱️ Execution duration
- 📈 Summary statistics:
  - Total analyses
  - Total execution time
  - Success rate

**For each analysis:**
- 📋 Analysis name and icon
- 📅 Execution timestamp
- ⏱️ Execution time
- 📊 Results (JSON format currently)
- ❌ Error messages (if failed)

---

### Step 8: Export Results
**What you can do:**

**📗 Export to Excel:**
- Click "Export to Excel" button
- ⏳ Wait for generation (1-3s)
- 💾 File downloads automatically
- 📊 Multi-sheet workbook:
  - Sheet 1: Project Overview
  - Sheet 2+: One per analysis
  - SPSS-style formatting
  - Auto-sized columns

**📕 Export to PDF:**
- Click "Export to PDF" button
- ⏳ Wait for generation (<1s)
- 🖨️ Opens in new window
- 📄 Professional report styling
- 🖨️ Use browser print to save as PDF

---

## 🎨 UI Features to Notice

### Beautiful Design
- ✨ Modern, clean interface
- 🎨 Color-coded status indicators
- 📱 Responsive design
- 🖱️ Smooth animations
- 💫 Loading states
- ✅ Success feedback
- ❌ Error handling

### Workflow Stepper
- 📍 Shows current step
- ✅ Completed steps (green)
- 🔵 Current step (blue)
- ⚪ Upcoming steps (gray)
- ➡️ Progress indicator

### Interactive Elements
- 🖱️ Drag & drop
- 🔍 Search and filter
- 📊 Real-time previews
- 💡 Tooltips
- 🎯 Confidence scores
- 📈 Progress bars

---

## 🤖 AI Features to Highlight

### 1. Variable Grouping AI
- Analyzes variable names
- Detects patterns automatically
- Provides confidence scores
- Explains reasoning

### 2. Demographic Detection
- Recognizes common demographic variables
- Supports English and Vietnamese
- Suggests semantic names
- Recommends appropriate types

### 3. Data Quality AI
- Automatic outlier detection
- Missing value analysis
- Quality scoring algorithm
- Actionable recommendations

---

## 🔧 Technical Features

### Performance
- ⚡ Fast CSV parsing (PapaParse)
- 🚀 Optimized database queries
- 📊 Real-time progress tracking
- 💾 Efficient data storage

### Security
- 🔒 Authentication required
- 🛡️ Row-level security (RLS)
- ✅ Project ownership verification
- 🔐 Secure file storage

### Error Handling
- ✅ Graceful degradation
- 🔄 Fallback mechanisms
- 📝 User-friendly error messages
- 🔍 Detailed error logging

---

## 📊 Test Scenarios

### Scenario 1: Simple Survey
**Data:** 5 variables, 100 rows
**Expected Time:** ~30 seconds total
**Analyses:** Descriptive, Reliability

### Scenario 2: Complex Research
**Data:** 30 variables, 1000 rows
**Expected Time:** ~2 minutes total
**Analyses:** All 8 types

### Scenario 3: Large Dataset
**Data:** 100 variables, 10,000 rows
**Expected Time:** ~5 minutes total
**Analyses:** Selected analyses

---

## 🐛 Known Behaviors

### R Analytics Service
- ⚠️ If R service is unavailable:
  - System will use mock results
  - Warning message displayed
  - Workflow continues normally

### Export Features
- 📗 Excel: Full implementation
- 📕 PDF: HTML-based (use browser print)

### Results Display
- 📊 Currently shows JSON format
- 🎨 Enhanced visualizations (future update)

---

## 🎯 Key Selling Points

### For Researchers
1. **No Coding Required** - Complete workflow through UI
2. **AI-Powered** - Intelligent suggestions throughout
3. **Professional Output** - SPSS-style Excel exports
4. **Time-Saving** - Automated data quality checks
5. **Comprehensive** - 8 analysis types in one place

### For Developers
1. **Modern Stack** - Next.js, TypeScript, Supabase
2. **Clean Architecture** - Service layer, API routes
3. **Type-Safe** - Full TypeScript coverage
4. **Scalable** - Handles large datasets
5. **Extensible** - Easy to add new analyses

---

## 📝 Demo Script

### 5-Minute Demo
1. **Upload** (30s) - Show drag & drop, validation
2. **Health Check** (30s) - Show quality score, recommendations
3. **Grouping** (1m) - Show AI suggestions, drag & drop
4. **Demographics** (1m) - Show rank creation, preview
5. **Analysis** (30s) - Show selection, configuration
6. **Execution** (1m) - Show progress tracking
7. **Results** (30s) - Show tabbed interface
8. **Export** (30s) - Show Excel download

### 15-Minute Deep Dive
- All of above plus:
- Detailed explanation of each analysis type
- Show configuration options
- Demonstrate error handling
- Show export formats
- Discuss technical architecture

---

## 🚀 Next Steps After Demo

### Immediate
1. Gather user feedback
2. Test with real data
3. Performance optimization
4. Enhanced visualizations

### Short Term
1. Add interactive charts
2. Statistical interpretation
3. Result comparison
4. Analysis templates

### Long Term
1. Machine learning insights
2. Collaborative features
3. Mobile app
4. API for integrations

---

## 📞 Support

### Issues?
- Check browser console for errors
- Verify Supabase connection
- Check R Analytics service status
- Review error messages

### Questions?
- See documentation in `.kiro/specs/csv-analysis-workflow/`
- Review requirements.md for feature details
- Check design.md for architecture
- See PROJECT_COMPLETE.md for overview

---

**Demo Status:** ✅ READY  
**URL:** http://localhost:3000/analysis/new  
**Enjoy the demo!** 🎉

