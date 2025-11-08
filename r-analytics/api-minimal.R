# NCSKIT R Analytics API - Minimal Version
# Simplified version for testing

library(plumber)
library(jsonlite)

# Global data storage
analysis_data <- new.env()

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiDescription Minimal version for testing
#* @apiVersion 1.0.0

# CORS Filter
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

# Health Check
#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    version = "1.0.0",
    service = "ncskit-r-analytics-minimal"
  )
}

# Upload Data
#* Upload analysis data
#* @post /data/upload
#* @param project_id:character Project identifier
function(req, project_id) {
  tryCatch({
    body_data <- fromJSON(req$postBody)
    data <- as.data.frame(body_data$data)
    analysis_data[[project_id]] <- data
    
    list(
      success = TRUE,
      message = "Data uploaded successfully",
      n_rows = nrow(data),
      n_cols = ncol(data)
    )
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}

# Get Data Preview
#* Get data preview
#* @get /data/preview/<project_id>
function(project_id) {
  if (!exists(project_id, envir = analysis_data)) {
    return(list(success = FALSE, error = "Project data not found"))
  }
  
  data <- analysis_data[[project_id]]
  list(
    success = TRUE,
    preview = head(data, 10),
    n_rows = nrow(data),
    n_cols = ncol(data)
  )
}

# Simple Descriptive Stats
#* Calculate basic descriptive statistics
#* @post /analysis/descriptive
#* @param project_id:character Project identifier
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    numeric_cols <- names(data)[sapply(data, is.numeric)]
    
    if (length(numeric_cols) == 0) {
      return(list(success = FALSE, error = "No numeric columns found"))
    }
    
    stats <- lapply(data[numeric_cols], function(x) {
      list(
        mean = mean(x, na.rm = TRUE),
        median = median(x, na.rm = TRUE),
        sd = sd(x, na.rm = TRUE),
        min = min(x, na.rm = TRUE),
        max = max(x, na.rm = TRUE),
        n = sum(!is.na(x))
      )
    })
    
    list(success = TRUE, results = stats)
    
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}

# Simple Correlation
#* Calculate correlation matrix
#* @post /analysis/correlation
#* @param project_id:character Project identifier
function(req, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- analysis_data[[project_id]]
    numeric_cols <- names(data)[sapply(data, is.numeric)]
    
    if (length(numeric_cols) < 2) {
      return(list(success = FALSE, error = "Need at least 2 numeric columns"))
    }
    
    cor_matrix <- cor(data[numeric_cols], use = "pairwise.complete.obs")
    
    list(
      success = TRUE,
      results = list(
        correlation_matrix = cor_matrix,
        variables = numeric_cols
      )
    )
    
  }, error = function(e) {
    list(success = FALSE, error = as.character(e))
  })
}

# Available Methods
#* Get available analysis methods
#* @get /methods
function() {
  list(
    available_methods = c("descriptive", "correlation"),
    status = "minimal_version",
    note = "This is a minimal version for testing. Full version includes EFA, CFA, SEM, regression, etc."
  )
}
