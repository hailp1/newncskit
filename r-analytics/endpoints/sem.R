# Structural Equation Modeling Endpoints
# SEM and mediation analysis

library(lavaan)
library(mediation)

#* Structural Equation Modeling (SEM)
#* @param project_id Project identifier
#* @post /analysis/sem
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    model_syntax <- body$model_syntax
    estimator <- ifelse(is.null(body$estimator), "ML", body$estimator)
    
    # Perform SEM
    sem_result <- lavaan::sem(model_syntax, data = data, estimator = estimator)
    
    # Get fit indices
    fit_indices <- lavaan::fitMeasures(sem_result, c(
      "chisq", "df", "pvalue", 
      "cfi", "tli", "rmsea", "rmsea.ci.lower", "rmsea.ci.upper",
      "srmr", "aic", "bic"
    ))
    
    results <- list(
      success = TRUE,
      results = list(
        fit_indices = as.list(fit_indices),
        parameter_estimates = lavaan::parameterEstimates(sem_result),
        r_squared = lavaan::inspect(sem_result, "r2"),
        summary = capture.output(summary(sem_result, fit.measures = TRUE, standardized = TRUE))
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}

#* Mediation Analysis
#* @param project_id Project identifier
#* @post /analysis/mediation
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    x_var <- body$x  # Independent variable
    m_var <- body$m  # Mediator
    y_var <- body$y  # Dependent variable
    covariates <- body$covariates  # Optional covariates
    
    # Build formulas
    if (is.null(covariates) || length(covariates) == 0) {
      mediator_formula <- as.formula(paste(m_var, "~", x_var))
      outcome_formula <- as.formula(paste(y_var, "~", x_var, "+", m_var))
    } else {
      cov_str <- paste(covariates, collapse = " + ")
      mediator_formula <- as.formula(paste(m_var, "~", x_var, "+", cov_str))
      outcome_formula <- as.formula(paste(y_var, "~", x_var, "+", m_var, "+", cov_str))
    }
    
    # Fit models
    mediator_model <- lm(mediator_formula, data = data)
    outcome_model <- lm(outcome_formula, data = data)
    
    # Perform mediation analysis
    med_result <- mediation::mediate(
      mediator_model, 
      outcome_model,
      treat = x_var,
      mediator = m_var,
      boot = TRUE,
      sims = 1000
    )
    
    results <- list(
      success = TRUE,
      results = list(
        acme = med_result$d0,  # Average Causal Mediation Effect
        acme_ci_lower = med_result$d0.ci[1],
        acme_ci_upper = med_result$d0.ci[2],
        acme_p = med_result$d0.p,
        ade = med_result$z0,  # Average Direct Effect
        ade_ci_lower = med_result$z0.ci[1],
        ade_ci_upper = med_result$z0.ci[2],
        ade_p = med_result$z0.p,
        total_effect = med_result$tau.coef,
        total_effect_ci_lower = med_result$tau.ci[1],
        total_effect_ci_upper = med_result$tau.ci[2],
        total_effect_p = med_result$tau.p,
        prop_mediated = med_result$n0,
        prop_mediated_ci_lower = med_result$n0.ci[1],
        prop_mediated_ci_upper = med_result$n0.ci[2],
        prop_mediated_p = med_result$n0.p
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}
