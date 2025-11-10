# NCSKIT R Analysis Server
# Statistical Analysis Backend with Security and Error Handling

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
  cat("[Init] ✓ Loaded descriptive-stats.R\n")
  
  source("endpoints/regression.R")
  cat("[Init] ✓ Loaded regression.R\n")
  
  source("endpoints/factor-analysis.R")
  cat("[Init] ✓ Loaded factor-analysis.R\n")
  
  source("endpoints/sem.R")
  cat("[Init] ✓ Loaded sem.R\n")
  
  source("endpoints/advanced-analysis.R")
  cat("[Init] ✓ Loaded advanced-analysis.R\n")
  
  cat("[Init] ✓ All helper functions loaded successfully\n")
}, error = function(e) {
  cat("[Init] ✗ Failed to load helper functions:", e$message, "\n")
  stop("Server initialization failed")
})

# ============================================
# 2. VERIFY HELPER FUNCTIONS ARE LOADED
# ============================================
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

if (length(missing_functions) > 0) {
  cat("[Init] ✗ Missing required functions:", paste(missing_functions, collapse = ", "), "\n")
  stop("Server initialization failed: missing helper functions")
}

cat("[Init] ✓ All required helper functions verified\n")

# ============================================
# 3. INITIALIZE SAFE DATA STORE
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
    if (!is.null(stored)) {
      elapsed <- as.numeric(difftime(Sys.time(), stored$timestamp, units = "secs"))
      
      if (elapsed > stored$ttl) {
        rm(list = key, envir = analysis_data)
        removed_count <- removed_count + 1
      }
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
# 4. CORS FILTER WITH AUTHENTICATION
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
      error = "Unauthorized: Invalid or missing API key",
      timestamp = Sys.time()
    ))
  }
  
  plumber::forward()
}

# ============================================
# 5. ERROR HANDLER FILTER
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
# 6. HEALTH CHECK ENDPOINT
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
    r_version = R.version.string,
    timestamp = Sys.time()
  ))
}

# ============================================
# 7. ANALYSIS ENDPOINTS
# ============================================
# Note: Actual analysis logic is in helper files
# These endpoints will call the helper functions

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiDescription Advanced statistical analysis with security and error handling
#* @apiVersion 2.0.0
