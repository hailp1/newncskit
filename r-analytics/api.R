# NCSKIT R Analytics API
# Main Plumber API file for quantitative research analysis

library(plumber)
library(jsonlite)
library(dplyr)

# Source all endpoint modules
source("endpoints/data-health.R")
source("endpoints/descriptive-stats.R")
source("endpoints/hypothesis-tests.R")
source("endpoints/factor-analysis.R")
source("endpoints/regression.R")
source("endpoints/sem.R")

# Global data storage (in production, integrate with database)
analysis_data <- new.env()

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiDescription Comprehensive quantitative research analysis API
#* @apiVersion 2.0.0

# ============================================================================
# CORS FILTER
# ============================================================================

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

# ============================================================================
# HEALTH CHECK
# ============================================================================

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    version = "2.0.0",
    service = "ncskit-r-analytics",
    uptime = as.numeric(Sys.time() - .GlobalEnv$.start_time, units = "secs")
  )
}

# ============================================================================
# DATA MANAGEMENT
# ============================================================================

#* Upload analysis data
#* @post /data/upload
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (is.null(req$body) || req$body == "") {
      return(list(success = FALSE, error = "No data provided"))
    }
    
    # Parse JSON data
    body_data <- fromJSON(req$postBody)
    data <- as.data.frame(body_data$data)
    
    # Store data
    analysis_data[[project_id]] <- data
    
    list(
      success = TRUE,
      message = "Data uploaded successfully",
      summary = list(
        n_rows = nrow(data),
        n_cols = ncol(data),
        columns = names(data),
        column_types = sapply(data, class)
      )
    )
  }, error = function(e) {
    list(success = FALSE, error = paste("Upload failed:", e$message))
  })
}

#* Get data preview
#* @get /data/preview/<project_id>
#* @param project_id:character Project identifier
#* @serializer json
function(project_id) {
  if (!exists(project_id, envir = analysis_data)) {
    return(list(success = FALSE, error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  list(
    success = TRUE,
    preview = head(data, 10),
    summary = list(
      n_rows = nrow(data),
      n_cols = ncol(data),
      columns = names(data)
    )
  )
}

# ============================================================================
# DATA HEALTH CHECK
# ============================================================================

#* Perform comprehensive data health check
#* @post /analysis/health-check
#* @param project_id:character Project identifier
#* @param variables:[character] Variables to check (optional)
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    variables <- body_data$variables
    
    result <- perform_data_health_check(data, variables)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Health check failed:", e$message))
  })
}

#* Check missing data patterns
#* @post /analysis/missing-patterns
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    variables <- body_data$variables
    
    result <- check_missing_patterns(data, variables)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Analysis failed:", e$message))
  })
}

#* Detect outliers
#* @post /analysis/outliers
#* @param project_id:character Project identifier
#* @param variable:character Variable name
#* @param methods:[character] Detection methods
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- detect_outliers(data, body_data$variable, body_data$methods)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Outlier detection failed:", e$message))
  })
}

#* Test normality
#* @post /analysis/normality
#* @param project_id:character Project identifier
#* @param variables:[character] Variables to test
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- test_normality(data, body_data$variables)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Normality test failed:", e$message))
  })
}

# ============================================================================
# DESCRIPTIVE STATISTICS
# ============================================================================

#* Calculate descriptive statistics
#* @post /analysis/descriptive
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    variables <- body_data$variables
    
    result <- calculate_descriptive_stats(data, variables)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Analysis failed:", e$message))
  })
}

#* Calculate correlation matrix
#* @post /analysis/correlation
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- calculate_correlation_matrix(data, body_data$variables, body_data$method)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Correlation analysis failed:", e$message))
  })
}

# ============================================================================
# HYPOTHESIS TESTS
# ============================================================================

#* Independent samples t-test
#* @post /analysis/ttest-independent
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_independent_ttest(
      data, 
      body_data$dependent_var, 
      body_data$group_var,
      body_data$var_equal %||% FALSE,
      body_data$alternative %||% "two.sided"
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("T-test failed:", e$message))
  })
}

#* Paired samples t-test
#* @post /analysis/ttest-paired
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_paired_ttest(
      data,
      body_data$var1,
      body_data$var2,
      body_data$alternative %||% "two.sided"
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Paired t-test failed:", e$message))
  })
}

#* One-way ANOVA
#* @post /analysis/anova-oneway
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_oneway_anova(
      data,
      body_data$dependent_var,
      body_data$group_var,
      body_data$post_hoc %||% TRUE
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("ANOVA failed:", e$message))
  })
}

#* Two-way ANOVA
#* @post /analysis/anova-twoway
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_twoway_anova(
      data,
      body_data$dependent_var,
      body_data$factor1,
      body_data$factor2
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Two-way ANOVA failed:", e$message))
  })
}

#* Repeated measures ANOVA
#* @post /analysis/anova-repeated
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_repeated_anova(
      data,
      body_data$dependent_var,
      body_data$within_var,
      body_data$subject_var
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Repeated measures ANOVA failed:", e$message))
  })
}

#* Chi-square test
#* @post /analysis/chisquare
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_chisquare_test(data, body_data$var1, body_data$var2)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Chi-square test failed:", e$message))
  })
}

# ============================================================================
# FACTOR ANALYSIS
# ============================================================================

#* Exploratory Factor Analysis (EFA)
#* @post /analysis/efa
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_efa(
      data,
      body_data$variables,
      body_data$n_factors,
      body_data$rotation %||% "varimax"
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("EFA failed:", e$message))
  })
}

#* Confirmatory Factor Analysis (CFA)
#* @post /analysis/cfa
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_cfa(data, body_data$model_syntax)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("CFA failed:", e$message))
  })
}

# ============================================================================
# REGRESSION ANALYSIS
# ============================================================================

#* Linear regression
#* @post /analysis/regression-linear
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    formula_obj <- as.formula(body_data$formula)
    
    result <- perform_linear_regression(data, formula_obj, body_data$robust %||% FALSE)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Linear regression failed:", e$message))
  })
}

#* Logistic regression
#* @post /analysis/regression-logistic
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    formula_obj <- as.formula(body_data$formula)
    
    result <- perform_logistic_regression(data, formula_obj)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Logistic regression failed:", e$message))
  })
}

#* Multilevel regression
#* @post /analysis/regression-multilevel
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    formula_obj <- as.formula(body_data$formula)
    
    result <- perform_multilevel_regression(data, formula_obj, body_data$group_var)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Multilevel regression failed:", e$message))
  })
}

# ============================================================================
# STRUCTURAL EQUATION MODELING
# ============================================================================

#* Structural Equation Modeling (SEM)
#* @post /analysis/sem
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_sem(data, body_data$model_syntax, body_data$estimator %||% "ML")
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("SEM failed:", e$message))
  })
}

#* Mediation analysis
#* @post /analysis/mediation
#* @param project_id:character Project identifier
#* @serializer json
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    body_data <- fromJSON(req$postBody)
    
    result <- perform_mediation_analysis(
      data,
      body_data$x,
      body_data$m,
      body_data$y,
      body_data$covariates
    )
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(success = FALSE, error = paste("Mediation analysis failed:", e$message))
  })
}

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

#* Get available analysis methods
#* @get /methods
#* @serializer json
function() {
  list(
    data_health = c("health_check", "missing_patterns", "outliers", "normality"),
    descriptive = c("descriptive_stats", "correlation"),
    hypothesis_tests = c("ttest_independent", "ttest_paired", "anova_oneway", "anova_twoway", "anova_repeated", "chisquare"),
    factor_analysis = c("efa", "cfa", "cronbach_alpha"),
    regression = c("linear", "logistic", "multilevel", "vif"),
    sem = c("sem", "mediation", "path_analysis")
  )
}

# Initialize start time
.GlobalEnv$.start_time <- Sys.time()
