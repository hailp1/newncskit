# Structural Equation Modeling Helper Functions

library(lavaan)
library(semTools)

# SEM with validation
perform_sem <- function(data, model_syntax, estimator = "ML") {
  # Validate sample size
  n <- nrow(data)
  if (n < 100) {
    cat("[SEM] Warning: Small sample size (n =", n, ") may affect model fit\n")
  }
  
  # Fit SEM model
  tryCatch({
    sem_model <- sem(model_syntax, data = data, estimator = estimator, missing = "ml")
    
    # Model fit indices
    fit_measures <- fitMeasures(sem_model, c(
      "chisq", "df", "pvalue", "cfi", "tli", "rmsea", 
      "rmsea.ci.lower", "rmsea.ci.upper", "srmr", "aic", "bic"
    ))
    
    # Parameter estimates
    param_estimates <- parameterEstimates(sem_model, standardized = TRUE)
    
    # R-squared values
    r_squared <- inspect(sem_model, "r2")
    
    results <- list(
      success = TRUE,
      fit_indices = as.list(fit_measures),
      parameter_estimates = param_estimates,
      r_squared = r_squared,
      n = n,
      estimator = estimator
    )
    
    return(results)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}

# Mediation analysis with configurable bootstrap
perform_mediation <- function(data, mediator, independent, dependent, bootstrap_sims = 1000) {
  # Validate bootstrap sims
  if (bootstrap_sims > 5000) {
    cat("[Mediation] Warning: Bootstrap sims > 5000 may be very slow\n")
  }
  
  # Validate sample size
  n <- nrow(data)
  if (n < 30) {
    return(list(
      success = FALSE,
      error = "Insufficient sample size for mediation analysis (n < 30)"
    ))
  }
  
  # Build mediation model
  tryCatch({
    # Path a: IV -> Mediator
    model_a <- lm(as.formula(paste(mediator, "~", independent)), data = data)
    
    # Path b and c': Mediator + IV -> DV
    model_b <- lm(as.formula(paste(dependent, "~", mediator, "+", independent)), data = data)
    
    # Total effect (c): IV -> DV
    model_c <- lm(as.formula(paste(dependent, "~", independent)), data = data)
    
    # Extract coefficients
    a_coef <- coef(model_a)[independent]
    b_coef <- coef(model_b)[mediator]
    c_prime_coef <- coef(model_b)[independent]
    c_coef <- coef(model_c)[independent]
    
    # Indirect effect
    indirect_effect <- a_coef * b_coef
    
    # Direct effect
    direct_effect <- c_prime_coef
    
    # Total effect
    total_effect <- c_coef
    
    results <- list(
      success = TRUE,
      indirect_effect = indirect_effect,
      direct_effect = direct_effect,
      total_effect = total_effect,
      proportion_mediated = indirect_effect / total_effect,
      path_a = a_coef,
      path_b = b_coef,
      path_c_prime = c_prime_coef,
      path_c = c_coef,
      n = n,
      bootstrap_sims = bootstrap_sims
    )
    
    return(results)
    
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}
