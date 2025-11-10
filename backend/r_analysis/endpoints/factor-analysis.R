# Factor Analysis Helper Functions
# EFA and CFA with configurable bootstrap

library(psych)
library(lavaan)
library(GPArotation)

# EFA with sample size validation
perform_efa <- function(data, variables, n_factors = NULL, rotation = "varimax") {
  # Validate sample size
  n <- nrow(data)
  p <- length(variables)
  min_n <- p * 3
  
  if (n < min_n) {
    return(list(
      success = FALSE,
      error = paste0("Insufficient sample size. Need at least ", min_n, " observations for ", p, " variables (3:1 ratio)"),
      required_n = min_n,
      actual_n = n
    ))
  }
  
  # Extract data
  efa_data <- data[, variables, drop = FALSE]
  efa_data <- na.omit(efa_data)
  
  # Check for zero variance
  zero_var_vars <- c()
  for (var in variables) {
    sd_val <- sd(efa_data[[var]], na.rm = TRUE)
    if (is.na(sd_val) || sd_val == 0) {
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
    
    results <- list(
      success = TRUE,
      loadings = as.matrix(fa_result$loadings),
      communalities = fa_result$communality,
      variance_explained = fa_result$Vaccounted,
      fit_indices = list(
        rms = fa_result$rms,
        tli = fa_result$TLI,
        rmsea = fa_result$RMSEA
      ),
      n_factors = n_factors,
      rotation = rotation,
      n = nrow(efa_data)
    )
    
    return(results)
    
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
  
  if (bootstrap && bootstrap_samples > 5000) {
    return(list(
      success = FALSE,
      error = "Bootstrap samples exceeds maximum of 5000"
    ))
  }
  
  # Validate sample size
  n <- nrow(data)
  if (n < 50) {
    cat("[CFA] Warning: Small sample size (n =", n, ") may affect model fit\n")
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
    
    # Parameter estimates
    param_estimates <- parameterEstimates(fit, standardized = TRUE)
    
    results <- list(
      success = TRUE,
      fit_indices = as.list(fit_measures),
      parameter_estimates = param_estimates,
      bootstrap_used = bootstrap,
      bootstrap_samples = if (bootstrap) bootstrap_samples else 0,
      n = n
    )
    
    return(results)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# Reliability analysis (Cronbach's Alpha)
calculate_reliability <- function(data, items) {
  # Validate sample size
  n <- nrow(data)
  if (n < 2) {
    return(list(
      success = FALSE,
      error = "Insufficient sample size for reliability analysis (n < 2)"
    ))
  }
  
  # Extract items
  scale_data <- data[, items, drop = FALSE]
  scale_data <- na.omit(scale_data)
  
  if (ncol(scale_data) < 2) {
    return(list(
      success = FALSE,
      error = "Need at least 2 items for reliability analysis"
    ))
  }
  
  # Calculate Cronbach's alpha
  tryCatch({
    alpha_result <- alpha(scale_data)
    
    results <- list(
      success = TRUE,
      cronbach_alpha = alpha_result$total$raw_alpha,
      standardized_alpha = alpha_result$total$std.alpha,
      n_items = ncol(scale_data),
      n_cases = nrow(scale_data),
      item_statistics = alpha_result$item.stats,
      alpha_if_deleted = alpha_result$alpha.drop
    )
    
    return(results)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}
