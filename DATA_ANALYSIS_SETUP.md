# 📊 NCSKIT Data Analysis Setup Guide

## 🎯 **Overview**

NCSKIT Data Analysis module provides professional statistical analysis using academic R libraries including:

- **Descriptive Statistics** - Mean, SD, frequencies, correlations
- **Reliability Analysis** - Cronbach's Alpha, item analysis
- **Factor Analysis** - EFA, CFA with fit indices
- **Structural Equation Modeling** - Full SEM with lavaan
- **Multicollinearity** - VIF analysis
- **ANOVA & T-tests** - With effect sizes and assumptions testing
- **Data Health Check** - Missing data, outliers, recommendations

## 🔧 **Setup Options**

### **Option 1: Docker Setup (Recommended)**

1. **Start R Analysis Server:**
```bash
docker-compose up r-analysis
```

2. **Verify server is running:**
```bash
curl http://localhost:8000/health
```

### **Option 2: Local R Setup**

1. **Install R (version 4.0+):**
   - Download from: https://cran.r-project.org/

2. **Install required packages:**
```bash
cd backend/r_analysis
Rscript setup.R
```

3. **Start the server:**
```bash
Rscript -e "plumber::plumb('analysis_server.R')$run(host='0.0.0.0', port=8000)"
```

### **Option 3: RStudio Server Setup**

1. **Install RStudio Server**
2. **Run setup script in RStudio**
3. **Start plumber API from RStudio**

## 📦 **Required R Packages**

### **Core Analysis:**
- `psych` - Psychological statistics
- `lavaan` - Latent variable analysis (SEM/CFA)
- `semTools` - SEM utilities
- `car` - Regression analysis

### **Data Processing:**
- `dplyr` - Data manipulation
- `readr` - Data reading
- `VIM` - Missing data visualization
- `mice` - Multiple imputation

### **Visualization:**
- `ggplot2` - Graphics
- `corrplot` - Correlation plots
- `gridExtra` - Multiple plots

### **API & Export:**
- `plumber` - REST API framework
- `jsonlite` - JSON handling
- `openxlsx` - Excel export

## 🌐 **Frontend Integration**

### **Environment Variables:**
```env
NEXT_PUBLIC_R_API_URL=http://localhost:8000
```

### **Service Usage:**
```typescript
import { rAnalysisService } from '@/services/r-analysis';

// Health check
const health = await rAnalysisService.healthCheck();

// Data analysis
const results = await rAnalysisService.descriptiveAnalysis(data, variables);
```

## 📊 **Analysis Workflow**

### **1. Data Upload**
- Support CSV, Excel files
- Automatic data type detection
- Missing data analysis
- Outlier detection

### **2. Variable Mapping**
- Classify variables (numeric, categorical, ordinal)
- Assign roles (independent, dependent, demographic)
- Group variables into scales
- Set demographic variables

### **3. Model Building**
- Define research models
- Specify relationships
- Create hypotheses
- Generate lavaan syntax

### **4. Statistical Analysis**
- Run multiple analyses
- Professional result tables
- Academic-standard output
- Interpretation guidance

### **5. Results Export**
- Excel workbooks
- Professional tables
- Charts and plots
- Save to projects

## 🔬 **Available Analyses**

### **Descriptive Statistics**
```r
# R Code Example
describe(data)
cor(data, use="pairwise.complete.obs")
```

### **Reliability Analysis**
```r
# Cronbach's Alpha
alpha(scale_items)
```

### **Factor Analysis**
```r
# EFA
fa(data, nfactors=3, rotate="varimax")

# CFA
cfa(model_syntax, data=data)
```

### **SEM Analysis**
```r
# Full SEM
sem(model_syntax, data=data)
fitMeasures(model, c("cfi", "tli", "rmsea", "srmr"))
```

### **Multicollinearity**
```r
# VIF Analysis
vif(lm_model)
```

### **ANOVA & T-tests**
```r
# ANOVA
aov(dependent ~ independent, data=data)
TukeyHSD(model)

# T-test
t.test(group1, group2)
```

## 📈 **Professional Output**

### **Fit Indices Standards:**
- **CFI/TLI:** ≥ 0.95 (Excellent), ≥ 0.90 (Acceptable)
- **RMSEA:** ≤ 0.05 (Excellent), ≤ 0.08 (Acceptable)
- **SRMR:** ≤ 0.05 (Excellent), ≤ 0.08 (Acceptable)

### **Reliability Standards:**
- **Cronbach's α:** ≥ 0.9 (Excellent), ≥ 0.8 (Good), ≥ 0.7 (Acceptable)

### **Effect Size Standards:**
- **Cohen's d:** ≥ 0.8 (Large), ≥ 0.5 (Medium), ≥ 0.2 (Small)

## 🚀 **Getting Started**

1. **Start R server** (Docker or local)
2. **Access analysis page:** http://localhost:3000/analysis
3. **Upload your data** (CSV/Excel)
4. **Follow the 6-step workflow**
5. **Export professional results**

## 🔧 **Troubleshooting**

### **R Server Issues:**
```bash
# Check R server logs
docker logs ncskit_r-analysis_1

# Restart R server
docker-compose restart r-analysis
```

### **Package Installation Issues:**
```r
# Manual package installation
install.packages("package_name", dependencies=TRUE)

# Check package versions
packageVersion("lavaan")
```

### **Memory Issues:**
```r
# Increase memory limit
memory.limit(size=8000)  # 8GB

# Clear workspace
rm(list=ls())
gc()
```

## 📚 **Academic References**

- **lavaan:** Rosseel, Y. (2012). lavaan: An R Package for Structural Equation Modeling. Journal of Statistical Software, 48(2), 1-36.
- **psych:** Revelle, W. (2023). psych: Procedures for Psychological, Psychometric, and Personality Research. R package version 2.3.9.
- **semTools:** Jorgensen, T. D., et al. (2022). semTools: Useful tools for structural equation modeling. R package version 0.5-6.

## 🎊 **Ready for Professional Analysis!**

NCSKIT Data Analysis module is now ready to provide academic-grade statistical analysis with R's most trusted libraries.

**🔬 Start analyzing your research data with confidence!**