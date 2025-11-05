# Structural Equation Modeling Endpoints
# Functions for SEM analysis

library(lavaan)
library(semPlot)

#' Perform Structural Equation Modeling
#' @param data Data frame
#' @param model_syntax Lavaan model syntax
#' @param estimator Estimation method ("ML", "MLR", "WLSMV")
perform_sem <- function(data, model_syntax, estimator = "ML") {
  # Fit SEM model
  sem_fit <- sem(model_syntax, data = data, estimator = estimator)
  
  # Extract fit indices
  fit_measures <- fitMeasures(sem_fit, c("chisq", "df", "pvalue", "cfi", "tli", 
                                         "rmsea", "rmsea.ci.lower", "rmsea.ci.upper",
                                         "srmr", "aic", "bic", "gfi", "agfi"))
  
  # Parameter estimates
  param_estimates <- parameterEstimates(sem_fit, standardized = TRUE)
  
  # R-squared for endogenous variables
  r_squared <- inspect(sem_fit, "r2")
  
  # Modification indices
  mod_indices <- modificationIndices(sem_fit, sort = TRUE, maximum.number = 10)
  
  # Direct, indirect, and total effects
  effects <- tryCatch({
    list(
      direct = parameterEstimates(sem_fit, standardized = TRUE)[param_estimates$op == "~", ],
      indirect = NULL,  # Will be calculated if mediation exists
      total = NULL      # Will be calculated if mediation exists
    )
  }, error = function(e) {
    list(direct = param_estimates[param_estimates$op == "~", ])
  })
  
  # Check for mediation paths and calculate indirect effects
  regression_paths <- param_estimates[param_estimates$op == "~", ]
  if (nrow(regression_paths) > 1) {
    tryCatch({
      # Calculate indirect effects using bootstrap
      indirect_effects <- parameterEstimates(sem_fit, 
                                            standardized = TRUE, 
                                            boot.ci.type = "bca.simple")
      effects$indirect <- indirect_effects[grepl(":=", indirect_effects$label), ]
    }, error = function(e) {
      # If bootstrap fails, use delta method
      effects$indirect <- NULL
    })
  }
  
  results <- list(
    fit_indices = list(
      chisq = fit_measures["chisq"],
      df = fit_measures["df"],
      pvalue = fit_measures["pvalue"],
      cfi = fit_measures["cfi"],
      tli = fit_measures["tli"],
      rmsea = fit_measures["rmsea"],
      rmsea_ci_lower = fit_measures["rmsea.ci.lower"],
      rmsea_ci_upper = fit_measures["rmsea.ci.upper"],
      srmr = fit_measures["srmr"],
      gfi = fit_measures["gfi"],
      agfi = fit_measures["agfi"],
      aic = fit_measures["aic"],
      bic = fit_measures["bic"]
    ),
    parameter_estimates = param_estimates,
    r_squared = r_squared,
    effects = effects,
    modification_indices = mod_indices,
    model_syntax = model_syntax,
    estimator = estimator,
    n_observations = nrow(data)
  )
  
  return(results)
}

#' Perform Path Analysis (simplified SEM)
#' @param data Data frame
#' @param paths List of path specifications
perform_path_analysis <- function(data, paths) {
  # Build model syntax from paths
  model_syntax <- ""
  
  for (path in paths) {
    if (path$type == "regression") {
      model_syntax <- paste0(model_syntax, path$to, " ~ ", path$from, "\n")
    } else if (path$type == "covariance") {
      model_syntax <- paste0(model_syntax, path$var1, " ~~ ", path$var2, "\n")
    }
  }
  
  # Fit path model
  path_fit <- sem(model_syntax, data = data)
  
  # Extract results similar to SEM
  results <- perform_sem(data, model_syntax)
  results$paths <- paths
  
  return(results)
}

#' Perform Mediation Analysis
#' @param data Data frame
#' @param x Independent variable
#' @param m Mediator variable
#' @param y Dependent variable
#' @param covariates Additional covariates
perform_mediation_analysis <- function(data, x, m, y, covariates = NULL) {
  # Build mediation model
  if (is.null(covariates)) {
    model_syntax <- paste0(
      "# Direct effect\n",
      y, " ~ c*", x, "\n",
      "# Mediator\n",
      m, " ~ a*", x, "\n",
      y, " ~ b*", m, "\n",
      "# Indirect effect (a*b)\n",
      "ab := a*b\n",
      "# Total effect\n",
      "total := c + (a*b)\n"
    )
  } else {
    cov_string <- paste(covariates, collapse = " + ")
    model_syntax <- paste0(
      "# Direct effect\n",
      y, " ~ c*", x, " + ", cov_string, "\n",
      "# Mediator\n",
      m, " ~ a*", x, " + ", cov_string, "\n",
      y, " ~ b*", m, "\n",
      "# Indirect effect (a*b)\n",
      "ab := a*b\n",
      "# Total effect\n",
      "total := c + (a*b)\n"
    )
  }
  
  # Fit mediation model with bootstrap
  mediation_fit <- sem(model_syntax, data = data, se = "bootstrap", bootstrap = 1000)
  
  # Extract parameter estimates
  param_estimates <- parameterEstimates(mediation_fit, standardized = TRUE, boot.ci.type = "bca.simple")
  
  # Extract specific effects
  direct_effect <- param_estimates[param_estimates$label == "c", ]
  indirect_effect <- param_estimates[param_estimates$label == "ab", ]
  total_effect <- param_estimates[param_estimates$label == "total", ]
  
  # Path a (X -> M)
  path_a <- param_estimates[param_estimates$label == "a", ]
  # Path b (M -> Y)
  path_b <- param_estimates[param_estimates$label == "b", ]
  
  results <- list(
    direct_effect = direct_effect,
    indirect_effect = indirect_effect,
    total_effect = total_effect,
    path_a = path_a,
    path_b = path_b,
    all_estimates = param_estimates,
    model_syntax = model_syntax,
    variables = list(x = x, m = m, y = y, covariates = covariates),
    n_observations = nrow(data)
  )
  
  return(results)
}