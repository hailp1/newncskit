# Design Document

## Overview

This design addresses five critical issues in the R Analytics module that prevent production deployment: broken helper function architecture, unsafe global state, unrestricted CORS, unhandled edge cases, and missing error handling. The fixes ensure the Plumber-based R API is functional, secure, and stable.

**Critical Issues:**
1. Helper functions not sourced → 100% endpoint failures
2. Unsafe global state → data loss and race conditions
3. Open CORS → security vulnerability
4. Edge cases (sd=0, small n) → crashes
5. No error handling → cryptic failures

## Architecture

### Current Architecture (Broken)

```
┌─────────────────────────────────────┐
│   analysis_server.R                 │
│   ┌───────────────────────────┐     │
│   │  Plumber Routes           │     │
│   │  - POST /analyze          │     │
│   │  - POST /descriptive      │     │
│   │  - POST /regression       │     │
│   └───────────────────────────┘     │
│                                     │
│   ❌ Calls: calculate_descriptive_stats()
│   ❌ ERROR: object not found        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   endpoints/descriptive-stats.R     │
│   ✅ Defines: calculate_descriptive_stats()
│   ❌ NOT SOURCED!                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Global State                      │
│   analysis_data <- new.env()        │
│   ❌ No TTL                          │
│   ❌ No locking                      │
│   ❌ No cleanup                      │
└─────────────────────────────────────┘
```

### Proposed Architecture (Fixed)

```
┌──────────────────────────────────────────────┐
│   analysis_server.R                          │
│   ┌────────────────────────────────────┐     │
│   │  Initialization                    │     │
│   │  - Source all helper files         │     │
│   │  - Verify functions loaded         │     │
│   │  - Initialize data store with TTL  │     │
│   │  - Start cleanup scheduler         │     │
│   └────────────────────────────────────┘     │
│                                              │
│   ┌────────────────────────────────────┐     │
│   │  CORS Filter                       │     │
│   │  - Check allowed origins           │     │
│   │  - Validate API key                │     │
│   │  - Handle OPTIONS preflight        │     │
│   └────────────────────────────────────┘     │
│                                              │
│   ┌────────────────────────────────────┐     │
│   │  Error Handler Filter              │     │
│   │  - Wrap all endpoints in tryCatch  │     │
│   │  - Return JSON errors              │     │
│   │  - Log with correlation ID         │     │
│   └────────────────────────────────────┘     │
│                                              │
│   ┌────────────────────────────────────┐     │
│   │  Plumber Routes                    │     │
│   │  - POST /analyze                   │     │
│   │  - POST /descriptive               │     │
│   │  - POST /regression                │     │
│   │  - GET /health                     │     │
│   │  ✅ Calls helper functions         │     │
│   └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│   Helper Functions (Sourced)                 │
│   ┌────────────────────────────────────┐     │
│   │  endpoints/descriptive-stats.R     │     │
│   │  - calculate_descriptive_stats()   │     │
│   │  - detect_outliers_safe()          │     │
│   │  - test_normality_safe()           │     │
│   └────────────────────────────────────┘     │
│   ┌────────────────────────────────────┐     │
│   │  endpoints/regression.R            │     │
│   │  - perform_linear_regression()     │     │
│   │  - validate_sample_size()          │     │
│   └────────────────────────────────────┘     │
│   ┌────────────────────────────────────┐     │
│   │  endpoints/factor-analysis.R       │     │
│   │  - perform_efa()                   │     │
│   │  - perform_cfa()                   │     │
│   └────────────────────────────────────┘     │
│   ┌────────────────────────────────────┐     │
│   │  endpoints/sem.R                   │     │
│   │  - perform_sem()                   │     │
│   │  - validate_model_syntax()         │     │
│   └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│   Safe Data Store                            │
│   ┌────────────────────────────────────┐     │
│   │  analysis_data (environment)       │     │
│   │  - project_id as key               │     │
│   │  - timestamp + TTL (3600s)         │     │
│   │  - Cleanup every 300s              │     │
│   │  - Lock mechanism for concurrency  │     │
│   └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Main Server File Updates

**File:** `backend/r_analysis/analysis_server.R`

```r
# Load required libraries
library(plumber)
library(jsonlite)
library(later)

# ============================================
# 1. SOURCE ALL HELPER FUNCTIONS
# ============================================
cat("[Init] Loading helper functions...\n")

tryCatch({
  source("endpoints/descriptive-stats.R")
  source("endpoints/regression.R")
  source("endpoints/factor-analysis.R")
  source("endpoints/sem.R")
  source("endpoints/advanced-analysis.R")
  
  cat("[Init] ✓ All helper functions loaded successfully\n")
}, error = function(e) {
  cat("[Init] ✗ Failed to load helper functions:", e$message, "\n")
  stop("Server initialization failed")
})

# ============================================
# 2. INITIALIZE SAFE DATA STORE
# ============================================
analysis_data <- new.env()

# Store data with TTL
store_data <- function(project_id, data) {
  key <- paste0("project_", project_id)
  analysis_data[[key]] <- list(
    data = data,
    timestamp = Sys.time(),
    ttl = 3600  # 1 hour
  )
  cat("[Store] Saved data for project:", project_id, "\n")
}

# Retrieve data with TTL check
get_data <- function(project_id) {
  key <- paste0("project_", project_id)
  stored <- analysis_data[[key]]
  
  if (is.null(stored)) {
    cat("[Store] No data found for project:", project_id, "\n")
    return(NULL)
  }
  
  # Check TTL
  elapsed <- as.numeric(difftime(Sys.time(), stored$timestamp, units = "secs"))
  if (elapsed > stored$ttl) {
    cat("[Store] Data expired for project:", project_id, "(", elapsed, "s)\n")
    rm(list = key, envir = analysis_data)
    return(NULL)
  }
  
  return(stored$data)
}

# Cleanup expired data
cleanup_expired <- function() {
  keys <- ls(analysis_data)
  removed_count <- 0
  
  for (key in keys) {
    stored <- analysis_data[[key]]
    elapsed <- as.numeric(difftime(Sys.time(), stored$timestamp, units = "secs"))
    
    if (elapsed > stored$ttl) {
      rm(list = key, envir = analysis_data)
      removed_count <- removed_count + 1
    }
  }
  
  if (removed_count > 0) {
    cat("[Cleanup] Removed", removed_count, "expired entries\n")
  }
}

# Schedule cleanup every 5 minutes
later::later(function() {
  cleanup_expired()
  later::later(function() {}, delay = 300)  # Reschedule
}, delay = 300)

cat("[Init] ✓ Data store initialized with TTL and cleanup\n")

# ============================================
# 3. CORS FILTER WITH AUTHENTICATION
# ============================================
#* @filter cors
function(req, res) {
  # Get allowed origins from environment
  allowed_origins_str <- Sys.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://app.ncskit.org")
  allowed_origins <- strsplit(allowed_origins_str, ",")[[1]]
  
  origin <- req$HTTP_ORIGIN
  
  # Check if origin is allowed
  if (!is.null(origin) && origin %in% allowed_origins) {
    res$setHeader("Access-Control-Allow-Origin", origin)
    res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
    res$setHeader("Access-Control-Allow-Credentials", "true")
  }
  
  # Handle OPTIONS preflight
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

#* @filter auth
function(req, res) {
  # Skip auth for health check
  if (grepl("/health", req$PATH_INFO)) {
    plumber::forward()
    return()
  }
  
  # Check API key
  api_key <- req$HTTP_X_API_KEY
  valid_key <- Sys.getenv("ANALYTICS_API_KEY", "")
  
  if (valid_key == "" || is.null(api_key) || api_key != valid_key) {
    res$status <- 401
    return(list(
      success = FALSE,
      error = "Unauthorized: Invalid or missing API key"
    ))
  }
  
  plumber::forward()
}

# ============================================
# 4. ERROR HANDLER FILTER
# ============================================
#* @filter error-handler
function(req, res) {
  tryCatch({
    plumber::forward()
  }, error = function(e) {
    cat("[Error]", req$PATH_INFO, ":", e$message, "\n")
    res$status <- 500
    return(list(
      success = FALSE,
      error = e$message,
      timestamp = Sys.time()
    ))
  })
}

# ============================================
# 5. HEALTH CHECK ENDPOINT
# ============================================
#* @get /health
function() {
  # Check if helper functions are available
  required_functions <- c(
    "calculate_descriptive_stats",
    "perform_linear_regression",
    "perform_efa",
    "perform_sem"
  )
  
  missing_functions <- c()
  for (func_name in required_functions) {
    if (!exists(func_name)) {
      missing_functions <- c(missing_functions, func_name)
    }
  }
  
  # Get data store stats
  data_count <- length(ls(analysis_data))
  
  if (length(missing_functions) > 0) {
    return(list(
      status = "unhealthy",
      error = "Missing helper functions",
      missing = missing_functions,
      data_cached = data_count,
      timestamp = Sys.time()
    ))
  }
  
  return(list(
    status = "healthy",
    helper_functions = "loaded",
    data_cached = data_count,
    timestamp = Sys.time()
  ))
}

# ============================================
# 6. ANALYSIS ENDPOINTS (Keep existing)
# ============================================
# Existing endpoints will now work because helpers are sourced
```

### 2. Safe Helper Functions

**File:** `backend/r_analysis/endpoints/descriptive-stats.R`

```r
# Safe descriptive statistics with edge case handling

calculate_descriptive_stats <- function(data, variables) {
  results <- list()
  
  for (var in variables) {
    # Check if variable exists
    if (!var %in% names(data)) {
      results[[var]] <- list(error = "Variable not found")
      next
    }
    
    x <- data[[var]]
    
    # Remove NA
    x_clean <- x[!is.na(x)]
    
    # Check sample size
    if (length(x_clean) < 1) {
      results[[var]] <- list(error = "No valid observations")
      next
    }
    
    # Calculate basic stats
    stats <- list(
      n = length(x_clean),
      mean = mean(x_clean),
      median = median(x_clean),
      sd = sd(x_clean),
      min = min(x_clean),
      max = max(x_clean)
    )
    
    # Check for zero variance
    if (stats$sd == 0 || is.na(stats$sd)) {
      stats$warning <- "Zero variance detected"
      stats$z_scores <- rep(NA, length(x_clean))
    } else {
      # Calculate z-scores safely
      stats$z_scores <- (x_clean - stats$mean) / stats$sd
    }
    
    # Normality test (safe)
    stats$normality <- test_normality_safe(x_clean)
    
    # Outlier detection (safe)
    stats$outliers <- detect_outliers_safe(x, x_clean)
    
    results[[var]] <- stats
  }
  
  return(results)
}

# Safe normality test
test_normality_safe <- function(x_clean) {
  # Check sample size
  if (length(x_clean) < 3) {
    return(list(
      test = "insufficient_data",
      p_value = NA,
      message = "Sample size < 3"
    ))
  }
  
  # Check for constant values
  if (length(unique(x_clean)) == 1) {
    return(list(
      test = "constant_variable",
      p_value = NA,
      message = "All values are identical"
    ))
  }
  
  # Check sd
  if (sd(x_clean) == 0) {
    return(list(
      test = "zero_variance",
      p_value = NA,
      message = "Standard deviation is zero"
    ))
  }
  
  # Run Shapiro-Wilk test
  tryCatch({
    result <- shapiro.test(x_clean)
    return(list(
      test = "shapiro_wilk",
      statistic = result$statistic,
      p_value = result$p.value,
      normal = result$p.value > 0.05
    ))
  }, error = function(e) {
    return(list(
      test = "error",
      p_value = NA,
      error = e$message
    ))
  })
}

# Safe outlier detection with correct index mapping
detect_outliers_safe <- function(x_original, x_clean) {
  # Check for zero variance
  if (sd(x_clean) == 0 || is.na(sd(x_clean))) {
    return(list(
      indices = integer(0),
      values = numeric(0),
      z_scores = numeric(0),
      warning = "Zero variance - no outliers detected"
    ))
  }
  
  # Calculate z-scores
  z_scores <- (x_clean - mean(x_clean)) / sd(x_clean)
  
  # Find outliers (|z| > 3)
  outlier_positions <- which(abs(z_scores) > 3)
  
  if (length(outlier_positions) == 0) {
    return(list(
      indices = integer(0),
      values = numeric(0),
      z_scores = numeric(0)
    ))
  }
  
  # Map back to original indices
  valid_indices <- which(!is.na(x_original))
  outlier_indices <- valid_indices[outlier_positions]
  
  return(list(
    indices = outlier_indices,
    values = x_original[outlier_indices],
    z_scores = z_scores[outlier_positions]
  ))
}
```

### 3. Regression with Validation

**File:** `backend/r_analysis/endpoints/regression.R`

```r
# Safe linear regression with validation

perform_linear_regression <- function(data, dependent, independent) {
  # Validate sample size
  n <- nrow(data)
  min_n <- length(independent) + 2
  
  if (n < min_n) {
    return(list(
      success = FALSE,
      error = paste0("Insufficient sample size. Need at least ", min_n, " observations, got ", n)
    ))
  }
  
  # Convert factors if needed
  for (var in independent) {
    if (is.character(data[[var]])) {
      data[[var]] <- as.factor(data[[var]])
      cat("[Regression] Converted", var, "to factor\n")
    }
  }
  
  # Build formula
  formula_str <- paste(dependent, "~", paste(independent, collapse = " + "))
  formula_obj <- as.formula(formula_str)
  
  # Fit model
  tryCatch({
    model <- lm(formula_obj, data = data)
    
    # Extract results
    summary_obj <- summary(model)
    
    results <- list(
      success = TRUE,
      coefficients = coef(summary_obj),
      r_squared = summary_obj$r.squared,
      adj_r_squared = summary_obj$adj.r.squared,
      f_statistic = summary_obj$fstatistic,
      residuals = residuals(model),
      fitted = fitted(model)
    )
    
    return(results)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}
```

### 4. Factor Analysis with Bootstrap Config

**File:** `backend/r_analysis/endpoints/factor-analysis.R`

```r
library(psych)
library(lavaan)

# EFA with configurable options
perform_efa <- function(data, variables, n_factors = NULL, rotation = "varimax") {
  # Validate sample size
  n <- nrow(data)
  p <- length(variables)
  
  if (n < p * 3) {
    return(list(
      success = FALSE,
      error = paste0("Insufficient sample size. Need at least ", p * 3, " observations for ", p, " variables")
    ))
  }
  
  # Extract data
  efa_data <- data[, variables]
  
  # Check for zero variance
  zero_var_vars <- c()
  for (var in variables) {
    if (sd(efa_data[[var]], na.rm = TRUE) == 0) {
      zero_var_vars <- c(zero_var_vars, var)
    }
  }
  
  if (length(zero_var_vars) > 0) {
    return(list(
      success = FALSE,
      error = "Variables with zero variance detected",
      variables = zero_var_vars
    ))
  }
  
  # Perform EFA
  tryCatch({
    fa_result <- fa(efa_data, nfactors = n_factors, rotate = rotation)
    
    return(list(
      success = TRUE,
      loadings = fa_result$loadings,
      communalities = fa_result$communality,
      variance_explained = fa_result$Vaccounted,
      fit_indices = list(
        rms = fa_result$rms,
        tli = fa_result$TLI,
        rmsea = fa_result$RMSEA
      )
    ))
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# CFA with configurable bootstrap
perform_cfa <- function(data, model_syntax, bootstrap = FALSE, bootstrap_samples = 1000) {
  # Validate bootstrap samples
  if (bootstrap && bootstrap_samples > 2000) {
    cat("[CFA] Warning: High bootstrap samples (", bootstrap_samples, ") may take several minutes\n")
  }
  
  # Fit CFA model
  tryCatch({
    if (bootstrap) {
      fit <- cfa(model_syntax, data = data, se = "bootstrap", bootstrap = bootstrap_samples)
    } else {
      fit <- cfa(model_syntax, data = data)
    }
    
    # Extract fit indices
    fit_measures <- fitMeasures(fit, c("chisq", "df", "pvalue", "cfi", "tli", "rmsea", "srmr"))
    
    return(list(
      success = TRUE,
      fit_indices = as.list(fit_measures),
      parameter_estimates = parameterEstimates(fit),
      bootstrap_used = bootstrap
    ))
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}
```

## Data Models

### Data Store Entry

```r
list(
  data = <data.frame>,
  timestamp = <POSIXct>,
  ttl = 3600  # seconds
)
```

### API Response Format

```r
# Success
list(
  success = TRUE,
  data = <results>,
  timestamp = Sys.time()
)

# Error
list(
  success = FALSE,
  error = <message>,
  timestamp = Sys.time()
)
```

## Error Handling

### Error Categories

1. **Validation Errors (400)**
   - Insufficient sample size
   - Missing variables
   - Invalid parameters
   - Zero variance

2. **Server Errors (500)**
   - Statistical computation failures
   - Unexpected errors
   - Helper function not found

### Error Response Format

```r
list(
  success = FALSE,
  error = "Human-readable error message",
  details = "Technical details (optional)",
  timestamp = Sys.time()
)
```

## Testing Strategy

### Unit Tests

1. **Helper Function Tests**
   - Test with normal data
   - Test with zero variance
   - Test with small sample size
   - Test with missing values
   - Test with constant variables

2. **Data Store Tests**
   - Test store and retrieve
   - Test TTL expiration
   - Test cleanup function
   - Test concurrent access

### Integration Tests

1. **End-to-End Analysis**
   - Upload data
   - Run descriptive stats
   - Run regression
   - Run factor analysis
   - Verify results

2. **Error Handling**
   - Trigger validation errors
   - Trigger computation errors
   - Verify error responses

## Deployment Considerations

### Environment Variables

```bash
# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,https://app.ncskit.org

# API authentication
ANALYTICS_API_KEY=your-secure-api-key-here

# Optional: Logging level
LOG_LEVEL=INFO
```

### Docker Configuration

Update `Dockerfile` to ensure all dependencies are installed:

```dockerfile
FROM rocker/r-ver:4.3.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev

# Install R packages
RUN R -e "install.packages(c('plumber', 'jsonlite', 'psych', 'lavaan', 'later'))"

# Copy application files
COPY . /app
WORKDIR /app

# Expose port
EXPOSE 8000

# Start server
CMD ["R", "-e", "pr <- plumber::plumb('analysis_server.R'); pr$run(host='0.0.0.0', port=8000)"]
```

## Security Considerations

1. **API Key Authentication**
   - Require X-API-Key header
   - Validate against environment variable
   - Return 401 for invalid keys

2. **CORS Restrictions**
   - Whitelist allowed origins
   - Reject unauthorized origins
   - Support preflight requests

3. **Input Validation**
   - Validate all parameters
   - Sanitize variable names
   - Check data types

4. **Rate Limiting**
   - Implement per-IP rate limiting
   - Limit concurrent requests
   - Prevent DoS attacks

## Performance Optimization

1. **Data Caching**
   - Cache analysis results
   - Implement TTL
   - Cleanup expired entries

2. **Bootstrap Configuration**
   - Allow clients to configure bootstrap samples
   - Warn for high sample counts
   - Provide default values

3. **Memory Management**
   - Monitor memory usage
   - Cleanup expired data
   - Limit cache size

## Success Metrics

- Helper functions load successfully: 100%
- API endpoints return valid responses: >99%
- Zero variance handled gracefully: 100%
- Small sample size errors clear: 100%
- Data TTL working correctly: 100%
- CORS restrictions enforced: 100%
- API key authentication working: 100%
