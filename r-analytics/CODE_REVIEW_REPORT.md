# Báo Cáo Rà Soát Code Xử Lý Phép Tính Định Lượng Bằng R

## Tổng Quan

Hệ thống R Analytics của NCSKIT cung cấp các API endpoint để thực hiện phân tích định lượng toàn diện. Code được tổ chức theo module với cấu trúc rõ ràng.

## Cấu Trúc Hệ Thống

```
r-analytics/
├── api.R                          # Main API file với CORS và routing
├── endpoints/
│   ├── data-health.R             # Kiểm tra chất lượng dữ liệu
│   ├── descriptive-stats.R       # Thống kê mô tả
│   ├── hypothesis-tests.R        # Kiểm định giả thuyết
│   ├── factor-analysis.R         # Phân tích nhân tố
│   ├── regression.R              # Phân tích hồi quy
│   └── sem.R                     # Mô hình cấu trúc tuyến tính
└── modules/
    ├── clustering.R              # Phân cụm
    ├── sentiment.R               # Phân tích cảm xúc
    └── topics.R                  # Phân tích chủ đề
```

---

## 1. DATA HEALTH CHECK (data-health.R)

### Các Hàm Chính

#### 1.1 `perform_data_health_check()`
**Mục đích**: Kiểm tra toàn diện chất lượng dữ liệu

**Chức năng**:
- ✅ Phân tích missing values (số lượng, phần trăm)
- ✅ Phát hiện outliers (IQR method)
- ✅ Kiểm tra normality (Shapiro-Wilk test)
- ✅ Phân tích biến số (numeric và categorical)
- ✅ Phát hiện duplicate rows
- ✅ Kiểm tra multicollinearity (correlation > 0.9)
- ✅ Tính data quality score (0-100)

**Đánh giá**:
- ✅ Logic tính toán chính xác
- ✅ Xử lý edge cases tốt (sample size, missing data)
- ⚠️ **Cần cải thiện**: Quality score formula có thể điều chỉnh weights

#### 1.2 `check_missing_patterns()`
**Mục đích**: Phân tích patterns của missing data

**Chức năng**:
- ✅ Tạo missing indicator matrix
- ✅ Đếm số patterns
- ✅ Xác định biến có missing data
- ✅ Tính complete cases percentage

**Đánh giá**: ✅ Hoạt động tốt

#### 1.3 `detect_outliers()`
**Mục đích**: Phát hiện outliers bằng nhiều phương pháp

**Phương pháp hỗ trợ**:
- ✅ IQR method (1.5 * IQR)
- ✅ Z-score method (|z| > 3)
- ✅ MAD method (Modified Z-score > 3.5)

**Đánh giá**: ✅ Đầy đủ và chính xác

#### 1.4 `test_normality()`
**Mục đích**: Kiểm tra phân phối chuẩn

**Tests**:
- ✅ Shapiro-Wilk test (n ≤ 5000)
- ✅ Kolmogorov-Smirnov test
- ✅ Skewness và Kurtosis analysis

**Đánh giá**: ✅ Comprehensive

---

## 2. DESCRIPTIVE STATISTICS (descriptive-stats.R)

### Các Endpoint

#### 2.1 `/analysis/descriptive`
**Chức năng**: Tính thống kê mô tả cơ bản

**Sử dụng**: `psych::describe()`

**Output**:
- Mean, SD, Median
- Min, Max, Range
- Skewness, Kurtosis
- SE (Standard Error)

**Đánh giá**: ✅ Sử dụng package psych - reliable và standard

#### 2.2 `/analysis/correlation`
**Chức năng**: Tính ma trận tương quan

**Methods hỗ trợ**:
- Pearson (default)
- Spearman
- Kendall

**Xử lý missing**: `use = "pairwise.complete.obs"`

**Đánh giá**: ✅ Đúng chuẩn

---

## 3. HYPOTHESIS TESTS (hypothesis-tests.R)

### 3.1 Independent Samples T-Test

**Hàm**: `perform_independent_ttest()`

**Chức năng**:
- ✅ T-test với equal/unequal variances
- ✅ Levene's test for homogeneity
- ✅ Cohen's d effect size
- ✅ Confidence intervals
- ✅ Descriptive statistics by group

**Đánh giá**: ✅ **Excellent** - đầy đủ và chính xác

**Kiểm tra**:
```r
# ✅ Kiểm tra đúng 2 groups
if (length(groups) != 2) {
  stop("Independent t-test requires exactly 2 groups")
}

# ✅ Tính effect size
cohens_d <- cohen.d(group1_data, group2_data, na.rm = TRUE)

# ✅ Descriptive stats với CI
ci_lower = mean - qt(0.975, n - 1) * se
ci_upper = mean + qt(0.975, n - 1) * se
```

### 3.2 Paired Samples T-Test

**Hàm**: `perform_paired_ttest()`

**Chức năng**:
- ✅ Paired t-test
- ✅ Cohen's d for paired samples
- ✅ Normality test on differences (Shapiro-Wilk)
- ✅ Descriptive statistics for both variables và differences

**Đánh giá**: ✅ **Excellent**

### 3.3 One-Way ANOVA

**Hàm**: `perform_oneway_anova()`

**Chức năng**:
- ✅ ANOVA với F-test
- ✅ Levene's test for homogeneity
- ✅ Effect sizes (Eta-squared, Omega-squared)
- ✅ Post-hoc tests (Tukey HSD, Bonferroni)
- ✅ Descriptive statistics by group

**Đánh giá**: ✅ **Excellent**

**Effect Size Calculation**:
```r
eta_squared <- ss_between / ss_total
omega_squared <- (ss_between - df_between * ms_within) / (ss_total + ms_within)

# ✅ Interpretation
interpretation = if (eta_squared < 0.06) "small" 
                 else if (eta_squared < 0.14) "medium" 
                 else "large"
```

### 3.4 Two-Way ANOVA

**Hàm**: `perform_twoway_anova()`

**Chức năng**:
- ✅ Two-way ANOVA với interaction
- ✅ Type III ANOVA (unbalanced designs)
- ✅ Main effects và interaction effects
- ✅ Effect sizes (Eta-squared)
- ✅ Descriptive statistics by groups

**Đánh giá**: ✅ **Good** - hỗ trợ interaction effects

### 3.5 Repeated Measures ANOVA

**Hàm**: `perform_repeated_anova()`

**Chức năng**:
- ✅ RM-ANOVA với Error term
- ✅ Descriptive statistics

**Đánh giá**: ⚠️ **Cần cải thiện**
- ❌ Thiếu Mauchly's test for sphericity
- ❌ Thiếu Greenhouse-Geisser correction
- 💡 **Khuyến nghị**: Sử dụng `ezANOVA` package

### 3.6 Chi-Square Test

**Hàm**: `perform_chisquare_test()`

**Chức năng**:
- ✅ Chi-square test of independence
- ✅ Cramér's V effect size
- ✅ Expected frequencies
- ✅ Standardized residuals

**Đánh giá**: ✅ **Excellent**

**Effect Size**:
```r
cramers_v <- sqrt(chisq_result$statistic / (n * min_dim))

# ✅ Interpretation
interpretation = if (cramers_v < 0.1) "negligible" 
                 else if (cramers_v < 0.3) "small" 
                 else if (cramers_v < 0.5) "medium" 
                 else "large"
```

---

## 4. REGRESSION ANALYSIS (regression.R)

### 4.1 Linear Regression

**Endpoint**: `/analysis/regression-linear`

**Chức năng**:
- ✅ Linear regression với `lm()`
- ✅ Model summary (R², Adjusted R²)
- ✅ F-statistic và p-value
- ✅ Coefficients với `broom::tidy()`
- ✅ Model fit với `broom::glance()`

**Đánh giá**: ✅ **Good**

**⚠️ Cần bổ sung**:
- ❌ Residual diagnostics
- ❌ Assumption checks (normality, homoscedasticity)
- ❌ VIF for multicollinearity
- ❌ Influential points (Cook's distance)

### 4.2 Logistic Regression

**Endpoint**: `/analysis/regression-logistic`

**Chức năng**:
- ✅ Logistic regression với `glm(family = binomial())`
- ✅ Odds ratios (`exponentiate = TRUE`)
- ✅ Deviance và AIC

**Đánh giá**: ✅ **Good**

**⚠️ Cần bổ sung**:
- ❌ Hosmer-Lemeshow test
- ❌ ROC curve và AUC
- ❌ Classification table
- ❌ Pseudo R²

### 4.3 Multilevel Regression

**Endpoint**: `/analysis/regression-multilevel`

**Chức năng**:
- ✅ Mixed effects model với `lmerTest::lmer()`
- ✅ Fixed effects
- ✅ Random effects
- ✅ Model fit

**Đánh giá**: ✅ **Good**

**⚠️ Cần bổ sung**:
- ❌ ICC (Intraclass Correlation)
- ❌ Model comparison (LRT)
- ❌ Random slopes

---

## 5. FACTOR ANALYSIS (factor-analysis.R)

### 5.1 Exploratory Factor Analysis (EFA)

**Endpoint**: `/analysis/efa`

**Chức năng**:
- ✅ EFA với `psych::fa()`
- ✅ Multiple rotation methods (varimax, promax, etc.)
- ✅ Factor loadings
- ✅ Communalities
- ✅ Variance explained

**Đánh giá**: ✅ **Good**

**⚠️ Cần bổ sung**:
- ❌ KMO (Kaiser-Meyer-Olkin) test
- ❌ Bartlett's test of sphericity
- ❌ Scree plot data
- ❌ Parallel analysis

### 5.2 Confirmatory Factor Analysis (CFA)

**Endpoint**: `/analysis/cfa`

**Chức năng**:
- ✅ CFA với `lavaan::cfa()`
- ✅ Fit indices (CFI, TLI, RMSEA, SRMR)
- ✅ Parameter estimates

**Đánh giá**: ✅ **Excellent**

**Fit Indices**:
```r
fit_indices <- fitMeasures(cfa_result, c(
  "chisq", "df", "pvalue", 
  "cfi", "tli", "rmsea", "srmr"
))
```

---

## 6. STRUCTURAL EQUATION MODELING (sem.R)

### 6.1 SEM

**Endpoint**: `/analysis/sem`

**Chức năng**:
- ✅ SEM với `lavaan::sem()`
- ✅ Multiple estimators (ML, MLR, WLSMV, etc.)
- ✅ Comprehensive fit indices
- ✅ R² for endogenous variables
- ✅ Standardized solutions

**Đánh giá**: ✅ **Excellent**

**Fit Indices**:
```r
fit_indices <- fitMeasures(sem_result, c(
  "chisq", "df", "pvalue", 
  "cfi", "tli", 
  "rmsea", "rmsea.ci.lower", "rmsea.ci.upper",
  "srmr", "aic", "bic"
))
```

### 6.2 Mediation Analysis

**Endpoint**: `/analysis/mediation`

**Chức năng**:
- ✅ Mediation với `mediation::mediate()`
- ✅ Bootstrap (1000 iterations)
- ✅ ACME (Average Causal Mediation Effect)
- ✅ ADE (Average Direct Effect)
- ✅ Total effect
- ✅ Proportion mediated
- ✅ Confidence intervals
- ✅ Covariates support

**Đánh giá**: ✅ **Excellent**

**Formula Building**:
```r
# ✅ Với covariates
mediator_formula <- as.formula(paste(m_var, "~", x_var, "+", cov_str))
outcome_formula <- as.formula(paste(y_var, "~", x_var, "+", m_var, "+", cov_str))

# ✅ Bootstrap với 1000 sims
med_result <- mediate(
  mediator_model, outcome_model,
  treat = x_var, mediator = m_var,
  boot = TRUE, sims = 1000
)
```

---

## 7. API STRUCTURE (api.R)

### 7.1 CORS Configuration

```r
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}
```

**Đánh giá**: ✅ **Good** - CORS được cấu hình đúng

### 7.2 Data Management

**Upload**: `/data/upload`
- ✅ Parse JSON data
- ✅ Store in global environment
- ✅ Return summary

**Preview**: `/data/preview/<project_id>`
- ✅ Return first 10 rows
- ✅ Data summary

**Đánh giá**: ⚠️ **Cần cải thiện**
- ❌ Không có authentication
- ❌ Không có data validation
- ❌ Memory management cho large datasets
- ❌ Data persistence (chỉ lưu trong memory)

### 7.3 Error Handling

```r
tryCatch({
  # ... analysis code ...
}, error = function(e) {
  res$status <- 500
  return(list(success = FALSE, error = as.character(e)))
})
```

**Đánh giá**: ✅ **Good** - consistent error handling

---

## TỔNG KẾT VÀ KHUYẾN NGHỊ

### ✅ Điểm Mạnh

1. **Code Structure**: Tổ chức module rõ ràng, dễ maintain
2. **Statistical Accuracy**: Các phép tính thống kê chính xác
3. **Comprehensive**: Bao phủ nhiều phương pháp phân tích
4. **Effect Sizes**: Tính toán effect sizes đầy đủ
5. **Error Handling**: Xử lý lỗi consistent
6. **Documentation**: Comments rõ ràng

### ⚠️ Vấn Đề Cần Khắc Phục

#### 1. **Regression Diagnostics** (Ưu tiên CAO)
```r
# Cần bổ sung vào regression.R
- Residual plots
- Q-Q plots
- VIF (Variance Inflation Factor)
- Cook's distance
- Durbin-Watson test
```

#### 2. **Logistic Regression Validation** (Ưu tiên CAO)
```r
# Cần bổ sung
- Hosmer-Lemeshow test
- ROC curve và AUC
- Classification metrics (accuracy, sensitivity, specificity)
- Pseudo R² (McFadden, Nagelkerke)
```

#### 3. **EFA Prerequisites** (Ưu tiên TRUNG BÌNH)
```r
# Cần bổ sung vào factor-analysis.R
- KMO test
- Bartlett's test
- Parallel analysis
- Scree plot data
```

#### 4. **Repeated Measures ANOVA** (Ưu tiên TRUNG BÌNH)
```r
# Cần cải thiện
- Mauchly's test for sphericity
- Greenhouse-Geisser correction
- Huynh-Feldt correction
# Khuyến nghị: Sử dụng ezANOVA package
```

#### 5. **Data Security** (Ưu tiên CAO)
```r
# Cần bổ sung
- API authentication
- Input validation
- Rate limiting
- Data encryption
```

#### 6. **Data Persistence** (Ưu tiên TRUNG BÌNH)
```r
# Hiện tại: Chỉ lưu trong memory
# Cần: Database integration hoặc file-based storage
```

#### 7. **Memory Management** (Ưu tiên TRUNG BÌNH)
```r
# Cần xử lý large datasets
- Streaming data processing
- Chunking
- Memory limits
- Garbage collection
```

### 💡 Khuyến Nghị Cải Thiện

#### 1. Thêm Regression Diagnostics Function

```r
# Thêm vào regression.R
perform_regression_diagnostics <- function(model, data) {
  # Residuals
  residuals <- residuals(model)
  fitted_values <- fitted(model)
  
  # Normality tests
  shapiro_test <- shapiro.test(residuals)
  
  # Homoscedasticity
  bp_test <- lmtest::bptest(model)
  
  # Multicollinearity
  vif_values <- car::vif(model)
  
  # Influential points
  cooks_d <- cooks.distance(model)
  influential <- which(cooks_d > 4/length(cooks_d))
  
  # Durbin-Watson
  dw_test <- lmtest::dwtest(model)
  
  return(list(
    normality = shapiro_test,
    homoscedasticity = bp_test,
    vif = vif_values,
    influential_points = influential,
    autocorrelation = dw_test
  ))
}
```

#### 2. Thêm Logistic Regression Validation

```r
# Thêm vào regression.R
validate_logistic_regression <- function(model, data) {
  # Hosmer-Lemeshow test
  hl_test <- ResourceSelection::hoslem.test(
    model$y, fitted(model), g = 10
  )
  
  # ROC và AUC
  roc_obj <- pROC::roc(model$y, fitted(model))
  auc_value <- pROC::auc(roc_obj)
  
  # Classification table
  predicted_class <- ifelse(fitted(model) > 0.5, 1, 0)
  conf_matrix <- table(Predicted = predicted_class, Actual = model$y)
  
  # Pseudo R²
  null_deviance <- model$null.deviance
  residual_deviance <- model$deviance
  mcfadden_r2 <- 1 - (residual_deviance / null_deviance)
  
  return(list(
    hosmer_lemeshow = hl_test,
    auc = auc_value,
    confusion_matrix = conf_matrix,
    mcfadden_r2 = mcfadden_r2
  ))
}
```

#### 3. Thêm EFA Prerequisites

```r
# Thêm vào factor-analysis.R
check_efa_assumptions <- function(data, variables) {
  # KMO test
  kmo_result <- psych::KMO(data[variables])
  
  # Bartlett's test
  bartlett_result <- psych::cortest.bartlett(
    cor(data[variables], use = "complete.obs"),
    n = nrow(data)
  )
  
  # Parallel analysis
  parallel_result <- psych::fa.parallel(
    data[variables],
    fa = "fa"
  )
  
  return(list(
    kmo = kmo_result,
    bartlett = bartlett_result,
    parallel_analysis = parallel_result
  ))
}
```

### 📊 Đánh Giá Tổng Thể

| Component | Điểm | Ghi chú |
|-----------|------|---------|
| Data Health | 9/10 | Excellent, cần điều chỉnh quality score |
| Descriptive Stats | 10/10 | Perfect |
| T-Tests | 10/10 | Excellent với effect sizes |
| ANOVA | 9/10 | Good, RM-ANOVA cần cải thiện |
| Chi-Square | 10/10 | Excellent |
| Linear Regression | 7/10 | Thiếu diagnostics |
| Logistic Regression | 6/10 | Thiếu validation |
| Multilevel | 8/10 | Good, cần thêm ICC |
| EFA | 7/10 | Thiếu assumption checks |
| CFA | 10/10 | Excellent |
| SEM | 10/10 | Excellent |
| Mediation | 10/10 | Excellent |
| API Structure | 7/10 | Cần security và persistence |

**Điểm trung bình: 8.6/10**

### 🎯 Ưu Tiên Thực Hiện

1. **Ngay lập tức** (1-2 tuần):
   - Thêm regression diagnostics
   - Thêm logistic regression validation
   - Implement API authentication

2. **Ngắn hạn** (1 tháng):
   - Thêm EFA prerequisites
   - Cải thiện RM-ANOVA
   - Data persistence

3. **Trung hạn** (2-3 tháng):
   - Memory management
   - Rate limiting
   - Comprehensive testing suite

---

**Ngày rà soát**: 2025-11-09
**Người thực hiện**: Kiro AI Assistant
**Phiên bản**: 2.0.0
