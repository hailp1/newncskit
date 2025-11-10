# R Analytics Module - Audit Report

**Date:** November 10, 2024  
**Reviewer:** Based on user feedback  
**Status:** ⚠️ **CRITICAL ISSUES FOUND**

---

## Executive Summary

Rà soát module R Analytics phát hiện **5 vấn đề nghiêm trọng** cần fix ngay trước khi deploy production. Module hiện tại có kiến trúc không nhất quán, thiếu bảo mật, và có nhiều edge cases chưa xử lý.

### Risk Level: **HIGH** 🔴

---

## 1. ⚠️ CRITICAL: Kiến Trúc Không Nhất Quán

### Vấn Đề:
`analysis_server.R` gọi các helper functions như:
- `calculate_descriptive_stats()`
- `calculate_correlation_matrix()`
- `perform_linear_regression()`
- `perform_efa()`
- `perform_sem()`

**NHƯNG** các functions này KHÔNG được định nghĩa!

### Hiện Trạng:
```r
# analysis_server.R line ~150
results$descriptive <- calculate_descriptive_stats(df, variables)
# ❌ ERROR: object 'calculate_descriptive_stats' not found
```

Các file trong `endpoints/` như `descriptive-stats.R`, `regression.R` chỉ định nghĩa helper functions nhưng KHÔNG được source vào `analysis_server.R`.

### Impact:
- ❌ **100% endpoints sẽ lỗi khi chạy**
- ❌ API không thể hoạt động
- ❌ Blocking deployment

### Giải Pháp:

#### Option A: Source Helper Files (Recommended)
```r
# Thêm vào đầu analysis_server.R
source("endpoints/descriptive-stats.R")
source("endpoints/regression.R")
source("endpoints/factor-analysis.R")
source("endpoints/sem.R")
```

#### Option B: Inline Helpers
Chuyển tất cả helper functions vào `analysis_server.R`

#### Option C: Plumber Router
```r
# analysis_server.R
pr <- plumber$new()
pr$mount("/descriptive", plumber$new("endpoints/descriptive-stats.R"))
pr$mount("/regression", plumber$new("endpoints/regression.R"))
```

**Recommendation:** Option A (nhanh nhất, ít thay đổi)

---

## 2. 🔴 CRITICAL: Global State Không An Toàn

### Vấn Đề:
```r
# Dữ liệu được lưu trong RAM
analysis_data <- new.env()
```

### Rủi Ro:
1. **Mất dữ liệu khi restart** - Không có persistence
2. **Race condition** - Không có locking mechanism
3. **Memory leak** - Không có TTL hoặc cleanup
4. **Multi-process** - Không sync giữa các process
5. **Ghi đè dữ liệu** - Concurrent requests có thể conflict

### Impact:
- ⚠️ Dữ liệu phân tích bị mất
- ⚠️ Kết quả không nhất quán
- ⚠️ Production không stable

### Giải Pháp:

#### Short-term (Quick Fix):
```r
# Thêm project_id key và TTL
analysis_data <- new.env()

store_data <- function(project_id, data) {
  key <- paste0("project_", project_id)
  analysis_data[[key]] <- list(
    data = data,
    timestamp = Sys.time(),
    ttl = 3600  # 1 hour
  )
}

get_data <- function(project_id) {
  key <- paste0("project_", project_id)
  stored <- analysis_data[[key]]
  
  if (is.null(stored)) return(NULL)
  
  # Check TTL
  if (difftime(Sys.time(), stored$timestamp, units = "secs") > stored$ttl) {
    rm(list = key, envir = analysis_data)
    return(NULL)
  }
  
  return(stored$data)
}

# Cleanup old data
cleanup_expired <- function() {
  keys <- ls(analysis_data)
  for (key in keys) {
    stored <- analysis_data[[key]]
    if (difftime(Sys.time(), stored$timestamp, units = "secs") > stored$ttl) {
      rm(list = key, envir = analysis_data)
    }
  }
}
```

#### Long-term (Recommended):
```r
# Sử dụng Supabase hoặc PostgreSQL
library(RPostgres)

con <- dbConnect(Postgres(),
  host = Sys.getenv("DB_HOST"),
  dbname = Sys.getenv("DB_NAME"),
  user = Sys.getenv("DB_USER"),
  password = Sys.getenv("DB_PASSWORD")
)

store_data <- function(project_id, data) {
  # Serialize data
  data_json <- toJSON(data)
  
  # Store in database
  dbExecute(con, 
    "INSERT INTO analysis_cache (project_id, data, created_at, expires_at)
     VALUES ($1, $2, NOW(), NOW() + INTERVAL '1 hour')
     ON CONFLICT (project_id) DO UPDATE SET data = $2, created_at = NOW()",
    params = list(project_id, data_json)
  )
}
```

---

## 3. 🔴 CRITICAL: CORS Mở Hoàn Toàn

### Vấn Đề:
```r
# analysis_server.R
options(plumber.cors = TRUE)
# Cho phép TẤT CẢ origins truy cập
```

### Rủi Ro:
- ⚠️ Bất kỳ website nào cũng có thể gọi API
- ⚠️ Dữ liệu nhạy cảm có thể bị lộ
- ⚠️ CSRF attacks
- ⚠️ Không có rate limiting

### Giải Pháp:
```r
# Giới hạn origins
#* @filter cors
function(req, res) {
  allowed_origins <- c(
    "https://ncskit.vercel.app",
    "https://your-domain.com",
    "http://localhost:3000"  # Dev only
  )
  
  origin <- req$HTTP_ORIGIN
  
  if (origin %in% allowed_origins) {
    res$setHeader("Access-Control-Allow-Origin", origin)
    res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
    res$setHeader("Access-Control-Allow-Credentials", "true")
  }
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

# Thêm API Key authentication
#* @filter auth
function(req, res) {
  api_key <- req$HTTP_X_API_KEY
  valid_key <- Sys.getenv("ANALYTICS_API_KEY")
  
  if (is.null(api_key) || api_key != valid_key) {
    res$status <- 401
    return(list(error = "Unauthorized"))
  }
  
  plumber::forward()
}
```

---

## 4. ⚠️ HIGH: Edge Cases Chưa Xử Lý

### 4.1 Division by Zero (sd = 0)

**Vấn đề:**
```r
# Khi biến hằng số (tất cả giá trị giống nhau)
sd_value <- sd(x)  # = 0
z_score <- (x - mean(x)) / sd_value  # Division by zero!
```

**Locations:**
- `perform_data_health_check()` - normality test
- `detect_outliers()` - z-score calculation
- Correlation functions

**Fix:**
```r
# Guard cho sd = 0
calculate_z_scores <- function(x) {
  sd_val <- sd(x, na.rm = TRUE)
  
  if (is.na(sd_val) || sd_val == 0) {
    warning("Standard deviation is zero or NA. Returning NA.")
    return(rep(NA, length(x)))
  }
  
  return((x - mean(x, na.rm = TRUE)) / sd_val)
}

# Normality test guard
test_normality <- function(x) {
  # Remove NA
  x_clean <- x[!is.na(x)]
  
  # Check sample size
  if (length(x_clean) < 3) {
    return(list(test = "insufficient_data", p_value = NA))
  }
  
  # Check for constant values
  if (length(unique(x_clean)) == 1) {
    return(list(test = "constant_variable", p_value = NA))
  }
  
  # Check sd
  sd_val <- sd(x_clean)
  if (sd_val == 0) {
    return(list(test = "zero_variance", p_value = NA))
  }
  
  # Run test
  tryCatch({
    result <- shapiro.test(x_clean)
    return(list(test = "shapiro", p_value = result$p.value))
  }, error = function(e) {
    return(list(test = "error", p_value = NA, error = e$message))
  })
}
```

### 4.2 Sample Size Too Small

**Vấn đề:**
```r
shapiro.test(x)  # Requires n >= 3
ks.test(x)       # Requires n >= 2
```

**Fix:**
```r
# Add sample size checks
if (length(x_clean) < 3) {
  return(list(error = "Sample size too small for normality test (n < 3)"))
}
```

### 4.3 Factor Conversion

**Vấn đề:**
```r
# ANOVA/t-test cần factor nhưng có thể nhận character
aov(y ~ group, data = df)  # Warning nếu group là character
```

**Fix:**
```r
# Ensure factor
perform_anova <- function(data, dependent, independent) {
  # Convert grouping variables to factors
  for (var in independent) {
    if (!is.factor(data[[var]])) {
      data[[var]] <- as.factor(data[[var]])
    }
  }
  
  # Continue with analysis...
}
```

### 4.4 Outlier Index Mapping

**Vấn đề:**
```r
detect_outliers <- function(x) {
  x_clean <- x[!is.na(x)]
  outlier_indices <- which(abs(scale(x_clean)) > 3)
  return(outlier_indices)  # ❌ Index của vector con, không phải data gốc
}
```

**Fix:**
```r
detect_outliers <- function(x) {
  # Keep track of original indices
  original_indices <- seq_along(x)
  valid_indices <- which(!is.na(x))
  x_clean <- x[valid_indices]
  
  # Detect outliers
  z_scores <- scale(x_clean)
  outlier_positions <- which(abs(z_scores) > 3)
  
  # Map back to original indices
  outlier_indices <- valid_indices[outlier_positions]
  
  return(list(
    indices = outlier_indices,
    values = x[outlier_indices],
    z_scores = z_scores[outlier_positions]
  ))
}
```

---

## 5. ⚠️ MEDIUM: Performance Issues

### 5.1 Heavy Bootstrap

**Vấn đề:**
```r
# Mediation analysis
mediate(model, sims = 1000)  # Mất 10-30 giây
```

**Fix:**
```r
# Cho phép client config
perform_mediation <- function(data, mediator, independent, dependent, 
                             bootstrap_sims = 1000) {
  # Validate sims
  if (bootstrap_sims > 5000) {
    warning("Bootstrap sims > 5000 may be slow. Consider reducing.")
  }
  
  # Run mediation
  result <- mediate(model, sims = bootstrap_sims)
  return(result)
}
```

### 5.2 CFA Bootstrap

**Vấn đề:**
```r
cfa(model, bootstrap = 1000)  # Rất nặng
```

**Fix:**
```r
# Default = FALSE, cho phép client enable
perform_cfa <- function(data, model_syntax, 
                       bootstrap = FALSE,
                       bootstrap_samples = 1000) {
  if (bootstrap && bootstrap_samples > 2000) {
    warning("High bootstrap samples may take several minutes")
  }
  
  # Continue...
}
```

---

## 6. ℹ️ LOW: Missing Tests & Documentation

### Vấn Đề:
- Không có unit tests
- Modules placeholder (`clustering.R`, `sentiment.R`, `topics.R`) không được dùng
- Không có documentation

### Giải Pháp:

#### Add Tests:
```r
# tests/testthat/test-descriptive-stats.R
library(testthat)

test_that("calculate_descriptive_stats handles empty data", {
  df <- data.frame()
  result <- calculate_descriptive_stats(df)
  expect_equal(length(result), 0)
})

test_that("calculate_descriptive_stats handles constant variable", {
  df <- data.frame(x = rep(5, 10))
  result <- calculate_descriptive_stats(df, "x")
  expect_equal(result$numeric$sd_x, 0)
})

test_that("detect_outliers handles NA values", {
  x <- c(1, 2, 3, NA, 100)
  result <- detect_outliers(x)
  expect_true(5 %in% result$indices)  # Index 5 is outlier
})
```

#### Remove/Mark Placeholders:
```r
# modules/clustering.R
# ⚠️ EXPERIMENTAL - NOT READY FOR PRODUCTION
# TODO: Implement k-means, hierarchical clustering
```

---

## Priority Action Items

### 🔴 CRITICAL (Must Fix Before Deploy):

1. **Fix Helper Function Architecture** (2 hours)
   - [ ] Source helper files in `analysis_server.R`
   - [ ] Test all endpoints work
   - [ ] Verify no "object not found" errors

2. **Fix Global State** (4 hours)
   - [ ] Add project_id keying
   - [ ] Add TTL mechanism
   - [ ] Add cleanup function
   - [ ] Test concurrent requests

3. **Fix CORS & Security** (2 hours)
   - [ ] Restrict origins
   - [ ] Add API key authentication
   - [ ] Add rate limiting
   - [ ] Test security

### ⚠️ HIGH (Fix This Week):

4. **Add Edge Case Guards** (4 hours)
   - [ ] sd = 0 guards
   - [ ] Sample size checks
   - [ ] Factor conversion
   - [ ] Outlier index mapping

5. **Performance Optimization** (2 hours)
   - [ ] Configurable bootstrap sims
   - [ ] Add warnings for heavy operations
   - [ ] Test performance

### ℹ️ MEDIUM (Fix Next Sprint):

6. **Add Tests** (8 hours)
   - [ ] Unit tests for all helpers
   - [ ] Integration tests for endpoints
   - [ ] Edge case tests

7. **Documentation** (4 hours)
   - [ ] API documentation
   - [ ] Function documentation
   - [ ] Usage examples

---

## Estimated Fix Time

- **Critical Issues:** 8 hours
- **High Priority:** 6 hours
- **Medium Priority:** 12 hours

**Total:** ~26 hours (3-4 days)

---

## Recommendations

### Immediate Actions (Today):
1. ✅ Fix helper function sourcing
2. ✅ Add basic guards for sd = 0
3. ✅ Test all endpoints manually

### This Week:
1. Implement proper data storage
2. Fix CORS and add authentication
3. Add comprehensive edge case handling

### Next Sprint:
1. Write comprehensive tests
2. Add documentation
3. Performance optimization

---

## Conclusion

Module R Analytics có **kiến trúc tốt** nhưng **implementation chưa hoàn chỉnh**. Các vấn đề critical có thể fix trong 1-2 ngày. Sau khi fix, module sẽ ổn định và ready for production.

**Current Status:** ❌ **NOT READY FOR PRODUCTION**  
**After Fixes:** ✅ **PRODUCTION READY**

---

**Prepared by:** Kiro AI Assistant  
**Date:** November 10, 2024  
**Next Steps:** Fix critical issues before Vercel deployment
