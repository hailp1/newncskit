# Factor Analysis Endpoints
# EFA and CFA functions

library(psych)
library(lavaan)

#* Exploratory Factor Analysis (EFA)
#* @param project_id Project identifier
#* @post /analysis/efa
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    variables <- body$variables
    n_factors <- body$n_factors
    rotation <- ifelse(is.null(body$rotation), "varimax", body$rotation)
    
    # Perform EFA
    efa_result <- psych::fa(data[variables], nfactors = n_factors, rotate = rotation)
    
    results <- list(
      success = TRUE,
      results = list(
        loadings = unclass(efa_result$loadings),
        communalities = efa_result$communality,
        variance_explained = efa_result$Vaccounted,
        rotation = rotation,
        n_factors = n_factors
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}

#* Confirmatory Factor Analysis (CFA)
#* @param project_id Project identifier
#* @post /analysis/cfa
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    model_syntax <- body$model_syntax
    
    # Perform CFA
    cfa_result <- lavaan::cfa(model_syntax, data = data)
    
    # Get fit indices
    fit_indices <- lavaan::fitMeasures(cfa_result, c("chisq", "df", "pvalue", "cfi", "tli", "rmsea", "srmr"))
    
    results <- list(
      success = TRUE,
      results = list(
        fit_indices = as.list(fit_indices),
        parameter_estimates = lavaan::parameterEstimates(cfa_result),
        summary = capture.output(summary(cfa_result, fit.measures = TRUE))
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}
