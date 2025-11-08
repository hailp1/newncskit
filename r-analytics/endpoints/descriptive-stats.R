# Descriptive Statistics Endpoints
# Basic statistical analysis functions

library(dplyr)
library(psych)

#* Descriptive statistics for variables
#* @param project_id Project identifier
#* @post /analysis/descriptive
function(req, res, project_id) {
  tryCatch({
    # Get data from global environment
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    
    # Parse request body
    body <- jsonlite::fromJSON(req$postBody)
    variables <- body$variables
    
    if (is.null(variables)) {
      variables <- names(data)
    }
    
    # Calculate descriptive statistics
    numeric_vars <- variables[sapply(data[variables], is.numeric)]
    
    if (length(numeric_vars) == 0) {
      return(list(success = FALSE, error = "No numeric variables found"))
    }
    
    stats <- psych::describe(data[numeric_vars])
    
    results <- list(
      success = TRUE,
      results = list(
        variables = numeric_vars,
        statistics = as.data.frame(stats),
        n_variables = length(numeric_vars),
        n_observations = nrow(data)
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}

#* Correlation matrix
#* @param project_id Project identifier
#* @post /analysis/correlation
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    variables <- body$variables
    method <- ifelse(is.null(body$method), "pearson", body$method)
    
    if (is.null(variables)) {
      variables <- names(data)[sapply(data, is.numeric)]
    }
    
    # Calculate correlation
    cor_matrix <- cor(data[variables], use = "pairwise.complete.obs", method = method)
    
    results <- list(
      success = TRUE,
      results = list(
        correlation_matrix = cor_matrix,
        method = method,
        variables = variables
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}
