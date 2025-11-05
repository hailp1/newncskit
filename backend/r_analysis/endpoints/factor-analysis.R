# Factor Analysis Endpoints
# Functions for exploratory and confirmatory factor analysis

library(psych)
library(lavaan)
library(GPArotation)

#' Perform Exploratory Factor Analysis (EFA)
#' @param data Data frame
#' @param variables Vector of variable names
#' @param n_factors Number of factors (if NULL, will determine optimal)
#' @param rotation Rotation method ("varimax", "promax", "oblimin")
perform_efa <- function(data, variables, n_factors = NULL, rotation = "varimax") {
  # Select variables
  analysis_data <- data[variables]
  
  # Remove missing values
  analysis_data <- na.omit(analysis_data)
  
  if (nrow(analysis_data) < 50) {
    stop("Insufficient sample size for factor analysis (minimum 50 cases)")
  }
  
  # Kaiser-Meyer-Olkin test
  kmo_result <- KMO(analysis_data)
  
  # Bartlett's test of sphericity
  bartlett_result <- cortest.bartlett(analysis_data)
  
  # Determine optimal number of factors if not specified
  if (is.null(n_factors)) {
    # Parallel analysis
    pa_result <- fa.parallel(analysis_data, plot = FALSE)
    n_factors <- pa_result$nfact
  }
  
  # Perform EFA
  efa_result <- fa(analysis_data, 
                   nfactors = n_factors, 
                   rotate = rotation, 
                   fm = "ml")  # Maximum likelihood
  
  # Extract results
  results <- list(
    loadings = unclass(efa_result$loadings),
    communalities = efa_result$communality,
    eigenvalues = efa_result$values,
    variance_explained = efa_result$Vaccounted,
    fit_indices = list(
      chi_square = efa_result$STATISTIC,
      df = efa_result$dof,
      p_value = efa_result$PVAL,
      rmsea = efa_result$RMSEA[1],
      tli = efa_result$TLI,
      bic = efa_result$BIC
    ),
    kmo = list(
      overall = kmo_result$MSA,
      individual = kmo_result$MSAi
    ),
    bartlett = list(
      chi_square = bartlett_result$chisq,
      df = bartlett_result$df,
      p_value = bartlett_result$p.value
    ),
    n_factors = n_factors,
    rotation = rotation,
    n_observations = nrow(analysis_data)
  )
  
  return(results)
}

#' Perform Confirmatory Factor Analysis (CFA)
#' @param data Data frame
#' @param model_syntax Lavaan model syntax
perform_cfa <- function(data, model_syntax) {
  # Fit CFA model
  cfa_fit <- cfa(model_syntax, data = data, estimator = "ML")
  
  # Extract fit indices
  fit_measures <- fitMeasures(cfa_fit, c("chisq", "df", "pvalue", "cfi", "tli", 
                                         "rmsea", "rmsea.ci.lower", "rmsea.ci.upper",
                                         "srmr", "aic", "bic"))
  
  # Parameter estimates
  param_estimates <- parameterEstimates(cfa_fit, standardized = TRUE)
  
  # Factor loadings
  loadings <- param_estimates[param_estimates$op == "=~", ]
  
  # Reliability analysis
  reliability_results <- list()
  
  # Extract factor structure for reliability
  factor_items <- split(loadings$rhs, loadings$lhs)
  
  for (factor_name in names(factor_items)) {
    items <- factor_items[[factor_name]]
    if (length(items) > 1) {
      alpha_result <- alpha(data[items])
      reliability_results[[factor_name]] <- list(
        cronbach_alpha = alpha_result$total$raw_alpha,
        composite_reliability = calculate_composite_reliability(loadings[loadings$lhs == factor_name, ])
      )
    }
  }
  
  results <- list(
    fit = list(
      chisq = fit_measures["chisq"],
      df = fit_measures["df"],
      pvalue = fit_measures["pvalue"],
      cfi = fit_measures["cfi"],
      tli = fit_measures["tli"],
      rmsea = fit_measures["rmsea"],
      rmsea_ci_lower = fit_measures["rmsea.ci.lower"],
      rmsea_ci_upper = fit_measures["rmsea.ci.upper"],
      srmr = fit_measures["srmr"],
      aic = fit_measures["aic"],
      bic = fit_measures["bic"]
    ),
    loadings = loadings,
    parameter_estimates = param_estimates,
    reliability = reliability_results,
    model_syntax = model_syntax,
    n_observations = nrow(data)
  )
  
  return(results)
}

#' Calculate composite reliability
calculate_composite_reliability <- function(loadings) {
  std_loadings <- loadings$std.all
  sum_loadings_sq <- sum(std_loadings^2)
  sum_error_var <- sum(1 - std_loadings^2)
  
  cr <- sum_loadings_sq / (sum_loadings_sq + sum_error_var)
  return(cr)
}