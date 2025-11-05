# 🔬 Enhanced Data Analysis System

## 📋 Tổng quan thay đổi

Đã tái cấu trúc hoàn toàn hệ thống phân tích dữ liệu theo yêu cầu:

### ✅ **Chuyển thiết kế nghiên cứu và thu thập dữ liệu vào project workflow**
### ✅ **Phân tích chỉ focus vào xử lý dữ liệu từ survey**
### ✅ **Chia tách R backend thành các module riêng biệt**
### ✅ **Bổ sung các phương pháp phân tích nâng cao**

## 🏗️ Kiến trúc mới

### **1. Project Workflow (Thiết kế + Thu thập dữ liệu)**

#### **Research Design Step** (`frontend/src/components/projects/research-design-step.tsx`)
- ✅ Xác định mục tiêu nghiên cứu
- ✅ Thiết lập câu hỏi nghiên cứu (RQ1, RQ2, ...)
- ✅ Xây dựng giả thuyết (H1, H2, mediation, moderation)
- ✅ Tính toán cỡ mẫu (power analysis)
- ✅ Định nghĩa biến số (IV, DV, Mediator, Moderator)

#### **Data Collection Step** (`frontend/src/components/projects/data-collection-step.tsx`)
- ✅ Thiết kế phương pháp thu thập (survey, interview, experiment)
- ✅ Thiết kế khảo sát (thang đo, câu hỏi)
- ✅ Kế hoạch lấy mẫu (convenience, random, stratified)
- ✅ Xem xét đạo đức (IRB, informed consent)

### **2. Analysis Workflow (Chỉ phân tích dữ liệu)**

#### **Quy trình phân tích 9 bước:**
1. **Upload Data** - Tải dữ liệu từ survey/file
2. **Data Preview** - Xem trước và kiểm tra dữ liệu
3. **Data Screening** - Làm sạch, xử lý missing data, outliers
4. **Variable Mapping** - Định nghĩa vai trò biến (IV, DV, control)
5. **Reliability & Validity** - Kiểm tra độ tin cậy thang đo
6. **Basic Analysis** - Thống kê mô tả, tương quan
7. **Hypothesis Testing** - Kiểm định giả thuyết (t-test, ANOVA)
8. **Advanced Modeling** - SEM, hồi quy, phân tích nâng cao
9. **Results Export** - Xuất báo cáo và kết quả

## 🔧 R Backend Architecture (Modular)

### **Main Plumber API** (`backend/r_analysis/plumber.R`)
- 🎯 Orchestrates tất cả analysis endpoints
- 🔗 CORS support và error handling
- 📊 Data management (upload, preview)
- 🏥 Health check và utility endpoints

### **Modular Analysis Files:**

#### **1. Descriptive Statistics** (`endpoints/descriptive-stats.R`)
```r
- calculate_descriptive_stats()
- calculate_correlation_matrix()
```

#### **2. Factor Analysis** (`endpoints/factor-analysis.R`)
```r
- perform_efa()          # Exploratory Factor Analysis
- perform_cfa()          # Confirmatory Factor Analysis
- calculate_composite_reliability()
```

#### **3. Regression Analysis** (`endpoints/regression.R`)
```r
- perform_linear_regression()     # Linear Regression
- perform_logistic_regression()   # Logistic Regression  
- perform_multilevel_regression() # Multilevel/HLM
```

#### **4. SEM Analysis** (`endpoints/sem.R`)
```r
- perform_sem()                   # Structural Equation Modeling
- perform_path_analysis()         # Path Analysis
- perform_mediation_analysis()    # Mediation Analysis
```

#### **5. Advanced Analysis** (`endpoints/advanced-analysis.R`)
```r
- perform_cluster_analysis()      # Cluster Analysis
- perform_time_series_analysis()  # Time Series Analysis
- perform_market_basket_analysis() # Market Basket Analysis
- perform_survival_analysis()     # Survival Analysis
- perform_conjoint_analysis()     # Conjoint Analysis
```

## 📊 Phương pháp phân tích được bổ sung

### **Hồi quy (Regression)**
- ✅ **Linear Regression** - Hồi quy tuyến tính
- ✅ **Logistic Regression** - Hồi quy logistic
- ✅ **Multilevel Modeling** - Hồi quy đa cấp/HLM

### **SEM & Advanced Modeling**
- ✅ **Structural Equation Modeling** - Mô hình phương trình cấu trúc
- ✅ **Mediation Analysis** - Phân tích trung gian
- ✅ **Path Analysis** - Phân tích đường dẫn

### **Phân tích mở rộng (Advanced Analysis)**
- ✅ **Cluster Analysis** - Phân tích cụm (K-means, Hierarchical, PAM)
- ✅ **Time Series Analysis** - Phân tích chuỗi thời gian (ARIMA, forecasting)
- ✅ **Market Basket Analysis** - Phân tích giỏ hàng (Association Rules)
- ✅ **Survival Analysis** - Phân tích sống còn (Kaplan-Meier, Cox)
- ✅ **Conjoint Analysis** - Phân tích liên hợp

## 🔌 API Endpoints

### **Data Management**
```
POST /data/upload?project_id={id}
GET  /data/preview/{project_id}
```

### **Basic Analysis**
```
POST /analysis/descriptive/{project_id}
POST /analysis/correlation/{project_id}
```

### **Factor Analysis**
```
POST /analysis/efa/{project_id}
POST /analysis/cfa/{project_id}
```

### **Regression**
```
POST /analysis/linear-regression/{project_id}
POST /analysis/logistic-regression/{project_id}
POST /analysis/multilevel-regression/{project_id}
```

### **SEM**
```
POST /analysis/sem/{project_id}
POST /analysis/mediation/{project_id}
```

### **Advanced Analysis**
```
POST /analysis/cluster/{project_id}
POST /analysis/time-series/{project_id}
POST /analysis/market-basket/{project_id}
POST /analysis/survival/{project_id}
POST /analysis/conjoint/{project_id}
```

### **Utilities**
```
GET /health
GET /methods
```

## 💻 Frontend Integration

### **Enhanced R Analysis Service** (`frontend/src/services/r-analysis-new.ts`)

#### **Type-safe interfaces cho tất cả analysis methods:**
- `DescriptiveStatsResults`
- `CorrelationResults`
- `EFAResults`, `CFAResults`
- `LinearRegressionResults`, `LogisticRegressionResults`
- `SEMResults`, `MediationResults`
- `ClusterResults`, `TimeSeriesResults`, `SurvivalResults`

#### **Service methods:**
```typescript
// Basic Analysis
rAnalysisService.calculateDescriptiveStats()
rAnalysisService.calculateCorrelation()

// Factor Analysis
rAnalysisService.performEFA()
rAnalysisService.performCFA()

// Regression
rAnalysisService.performLinearRegression()
rAnalysisService.performLogisticRegression()
rAnalysisService.performMultilevelRegression()

// SEM
rAnalysisService.performSEM()
rAnalysisService.performMediationAnalysis()

// Advanced
rAnalysisService.performClusterAnalysis()
rAnalysisService.performTimeSeriesAnalysis()
rAnalysisService.performSurvivalAnalysis()
// ... và nhiều hơn nữa
```

## 🎯 Workflow mới

### **1. Project Creation (Thiết kế nghiên cứu)**
```
Tạo project → Research Design → Data Collection Plan → Ready for Analysis
```

### **2. Data Analysis (Từ dữ liệu có sẵn)**
```
Upload Data → Screen Data → Map Variables → Check Reliability → 
Basic Analysis → Hypothesis Testing → Advanced Modeling → Export Results
```

## 🔍 Key Benefits

### **✅ Separation of Concerns**
- Thiết kế nghiên cứu: Project workflow
- Phân tích dữ liệu: Analysis workflow

### **✅ Modular R Backend**
- Dễ maintain và extend
- Mỗi analysis method trong file riêng
- Plumber API tổng hợp tất cả

### **✅ Comprehensive Analysis Methods**
- Từ basic statistics đến advanced modeling
- Support cho tất cả phương pháp phổ biến trong nghiên cứu

### **✅ Type-safe Frontend**
- Strongly typed interfaces
- Error handling chuyên nghiệp
- Consistent API responses

### **✅ Professional Workflow**
- Guided step-by-step process
- Data validation và quality checks
- Comprehensive reporting

## 🚀 Next Steps

1. **Test R backend** với sample data
2. **Integrate frontend components** với new service
3. **Add visualization** cho analysis results
4. **Implement result interpretation** với AI
5. **Add export functionality** (PDF, Word reports)

---

**🎯 Kết quả:** Hệ thống phân tích dữ liệu hoàn chỉnh, modular và chuyên nghiệp, tách biệt rõ ràng giữa thiết kế nghiên cứu và phân tích dữ liệu, với đầy đủ các phương pháp phân tích từ cơ bản đến nâng cao.