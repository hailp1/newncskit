# NCSKIT R Analysis API
# Main Plumber API file that orchestrates all analysis endpoints

library(plumber)
library(dplyr)
library(jsonlite)

# Source all endpoint files
source("endpoints/descriptive-stats.R")
source("endpoints/factor-analysis.R")
source("endpoints/regression.R")
source("endpoints/sem.R")
source("endpoints/advanced-analysis.R")

# Global data storage (in production, use proper database)
analysis_data <- list()

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiDescription Comprehensive statistical analysis API for research data
#* @apiVersion 1.0.0

#* Enable CORS
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

# ============================================================================
# DATA MANAGEMENT ENDPOINTS
# ============================================================================

#* Upload and store analysis data
#* @param project_id Project identifier
#* @post /data/upload
function(req, project_id) {
  tryCatch({
    # Parse uploaded data
    if (is.null(req$body)) {
      return(list(error = "No data provided"))
    }
    
    # Assume CSV data is sent in request body
    data <- read.csv(text = req$body, stringsAsFactors = FALSE)
    
    # Store data
    analysis_data[[project_id]] <<- data
    
    # Return data summary
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
    list(error = paste("Upload failed:", e$message))
  })
}

#* Get data preview
#* @param project_id Project identifier
#* @get /data/preview/<project_id>
function(project_id) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  list(
    preview = head(data, 10),
    summary = list(
      n_rows = nrow(data),
      n_cols = ncol(data),
      columns = names(data)
    )
  )
}

# ============================================================================
# DESCRIPTIVE STATISTICS ENDPOINTS
# ============================================================================

#* Calculate descriptive statistics
#* @param project_id Project identifier
#* @param variables:list Variables to analyze (optional)
#* @post /analysis/descriptive/<project_id>
function(project_id, variables = NULL) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- calculate_descriptive_stats(data, variables)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Analysis failed:", e$message))
  })
}

#* Calculate correlation matrix
#* @param project_id Project identifier
#* @param variables:list Variables to analyze (optional)
#* @param method Correlation method (pearson, spearman, kendall)
#* @post /analysis/correlation/<project_id>
function(project_id, variables = NULL, method = "pearson") {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- calculate_correlation_matrix(data, variables, method)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Analysis failed:", e$message))
  })
}

# ============================================================================
# FACTOR ANALYSIS ENDPOINTS
# ============================================================================

#* Perform Exploratory Factor Analysis
#* @param project_id Project identifier
#* @param variables:list Variables for factor analysis
#* @param n_factors Number of factors (optional)
#* @param rotation Rotation method
#* @post /analysis/efa/<project_id>
function(project_id, variables, n_factors = NULL, rotation = "varimax") {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_efa(data, variables, n_factors, rotation)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("EFA failed:", e$message))
  })
}

#* Perform Confirmatory Factor Analysis
#* @param project_id Project identifier
#* @param model_syntax Lavaan model syntax
#* @post /analysis/cfa/<project_id>
function(project_id, model_syntax) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_cfa(data, model_syntax)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("CFA failed:", e$message))
  })
}

# ============================================================================
# REGRESSION ANALYSIS ENDPOINTS
# ============================================================================

#* Perform Linear Regression
#* @param project_id Project identifier
#* @param formula Regression formula
#* @param robust Use robust standard errors
#* @post /analysis/linear-regression/<project_id>
function(project_id, formula, robust = FALSE) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    formula_obj <- as.formula(formula)
    result <- perform_linear_regression(data, formula_obj, robust)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Linear regression failed:", e$message))
  })
}

#* Perform Logistic Regression
#* @param project_id Project identifier
#* @param formula Regression formula
#* @post /analysis/logistic-regression/<project_id>
function(project_id, formula) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    formula_obj <- as.formula(formula)
    result <- perform_logistic_regression(data, formula_obj)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Logistic regression failed:", e$message))
  })
}

#* Perform Multilevel Regression
#* @param project_id Project identifier
#* @param formula Mixed effects formula
#* @param group_var Grouping variable
#* @post /analysis/multilevel-regression/<project_id>
function(project_id, formula, group_var) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    formula_obj <- as.formula(formula)
    result <- perform_multilevel_regression(data, formula_obj, group_var)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Multilevel regression failed:", e$message))
  })
}

# ============================================================================
# STRUCTURAL EQUATION MODELING ENDPOINTS
# ============================================================================

#* Perform Structural Equation Modeling
#* @param project_id Project identifier
#* @param model_syntax Lavaan model syntax
#* @param estimator Estimation method
#* @post /analysis/sem/<project_id>
function(project_id, model_syntax, estimator = "ML") {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_sem(data, model_syntax, estimator)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("SEM analysis failed:", e$message))
  })
}

#* Perform Mediation Analysis
#* @param project_id Project identifier
#* @param x Independent variable
#* @param m Mediator variable
#* @param y Dependent variable
#* @param covariates:list Additional covariates (optional)
#* @post /analysis/mediation/<project_id>
function(project_id, x, m, y, covariates = NULL) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_mediation_analysis(data, x, m, y, covariates)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Mediation analysis failed:", e$message))
  })
}

# ============================================================================
# ADVANCED ANALYSIS ENDPOINTS
# ============================================================================

#* Perform Cluster Analysis
#* @param project_id Project identifier
#* @param variables:list Variables for clustering
#* @param method Clustering method
#* @param k Number of clusters (optional)
#* @post /analysis/cluster/<project_id>
function(project_id, variables, method = "kmeans", k = NULL) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_cluster_analysis(data, variables, method, k)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Cluster analysis failed:", e$message))
  })
}

#* Perform Time Series Analysis
#* @param project_id Project identifier
#* @param value_col Value column name
#* @param date_col Date column name
#* @param forecast_periods Number of forecast periods
#* @post /analysis/time-series/<project_id>
function(project_id, value_col, date_col, forecast_periods = 12) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_time_series_analysis(data, value_col, date_col, forecast_periods)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Time series analysis failed:", e$message))
  })
}

#* Perform Market Basket Analysis
#* @param project_id Project identifier
#* @param transaction_col Transaction ID column
#* @param item_col Item column
#* @param min_support Minimum support threshold
#* @param min_confidence Minimum confidence threshold
#* @post /analysis/market-basket/<project_id>
function(project_id, transaction_col, item_col, min_support = 0.01, min_confidence = 0.5) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_market_basket_analysis(data, transaction_col, item_col, min_support, min_confidence)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Market basket analysis failed:", e$message))
  })
}

#* Perform Survival Analysis
#* @param project_id Project identifier
#* @param time_col Time to event column
#* @param event_col Event indicator column
#* @param group_col Grouping variable (optional)
#* @post /analysis/survival/<project_id>
function(project_id, time_col, event_col, group_col = NULL) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_survival_analysis(data, time_col, event_col, group_col)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Survival analysis failed:", e$message))
  })
}

#* Perform Conjoint Analysis
#* @param project_id Project identifier
#* @param rating_col Rating column name
#* @param attribute_cols:list Attribute column names
#* @post /analysis/conjoint/<project_id>
function(project_id, rating_col, attribute_cols) {
  if (!project_id %in% names(analysis_data)) {
    return(list(error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  
  tryCatch({
    result <- perform_conjoint_analysis(data, rating_col, attribute_cols)
    list(success = TRUE, results = result)
  }, error = function(e) {
    list(error = paste("Conjoint analysis failed:", e$message))
  })
}

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    version = "1.0.0"
  )
}

#* Get available analysis methods
#* @get /methods
function() {
  list(
    descriptive = c("descriptive_stats", "correlation"),
    factor_analysis = c("efa", "cfa"),
    regression = c("linear_regression", "logistic_regression", "multilevel_regression"),
    sem = c("sem", "mediation", "path_analysis"),
    advanced = c("cluster", "time_series", "market_basket", "survival", "conjoint")
  )
}