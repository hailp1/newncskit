# Advanced Analysis Helper Functions
# Mediation, moderation, and other advanced methods

library(mediation)

# Mediation analysis with configurable bootstrap
perform_mediation <- function(data, treatment, mediator, outcome, covariates = NULL, sims = 1000) {
  # Validate bootstrap simulations
  if (sims > 5000) {
    cat("[Mediation] Warning: High bootstrap simulations (", sims, ") may take several minutes\n")
    return(list(
      success = FALSE,
      error = "Bootstrap simulations exceeds maximum of 5000"
    ))
  }
  
  if (sims < 0) {
    return(list(
      success = FALSE,
      error = "Bootstrap simulations must be non-negative"
    ))
  }
  
  # Validate sample size
  n <- nrow(data)
  if (n < 30) {
    cat("[Mediation] Warning: Small sample size (n =", n, ") may affect reliability\n")
  }
  
  # Build formulas
  if (!is.null(covariates) && length(covariates) > 0) {
    mediator_formula <- as.formula(paste(mediator, "~", treatment, "+", paste(covariates, collapse = " + ")))
    outcome_formula <- as.formula(paste(outcome, "~", treatment, "+", mediator, "+", paste(covariates, collapse = " + ")))
  } else {
    mediator_formula <- as.formula(paste(mediator, "~", treatment))
    outcome_formula <- as.formula(paste(outcome, "~", treatment, "+", mediator))
  }
  
  # Fit models
  tryCatch({
    # Mediator model
    med_fit <- lm(mediator_formula, data = data)
    
    # Outcome model
    out_fit <- lm(outcome_formula, data = data)
    
    # Mediation analysis
    if (sims > 0) {
      med_result <- mediate(med_fit, out_fit, treat = treatment, mediator = mediator, 
                           boot = TRUE, sims = sims)
    } else {
      med_result <- mediate(med_fit, out_fit, treat = treatment, mediator = mediator, 
                           boot = FALSE)
    }
    
    results <- list(
      success = TRUE,
      acme = med_result$d.avg,  # Average Causal Mediation Effect
      acme_ci = c(med_result$d.avg.ci[1], med_result$d.avg.ci[2]),
      ade = med_result$z.avg,   # Average Direct Effect
      ade_ci = c(med_result$z.avg.ci[1], med_result$z.avg.ci[2]),
      total_effect = med_result$tau.coef,
      total_effect_ci = c(med_result$tau.ci[1], med_result$tau.ci[2]),
      prop_mediated = med_result$n.avg,
      prop_mediated_ci = c(med_result$n.avg.ci[1], med_result$n.avg.ci[2]),
      p_value_acme = med_result$d.avg.p,
      p_value_ade = med_result$z.avg.p,
      bootstrap_used = sims > 0,
      bootstrap_sims = sims,
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

# Moderation analysis (interaction effects)
perform_moderation <- function(data, dependent, independent, moderator, covariates = NULL) {
  # Validate sample size
  n <- nrow(data)
  min_n <- 4 + length(covariates)
  
  if (n < min_n) {
    return(list(
      success = FALSE,
      error = paste0("Insufficient sample size. Need at least ", min_n, " observations, got ", n)
    ))
  }
  
  # Center variables for interpretation
  data[[paste0(independent, "_c")]] <- scale(data[[independent]], center = TRUE, scale = FALSE)
  data[[paste0(moderator, "_c")]] <- scale(data[[moderator]], center = TRUE, scale = FALSE)
  
  # Create interaction term
  data$interaction <- data[[paste0(independent, "_c")]] * data[[paste0(moderator, "_c")]]
  
  # Build formula
  if (!is.null(covariates) && length(covariates) > 0) {
    formula_str <- paste(dependent, "~", paste0(independent, "_c"), "+", 
                        paste0(moderator, "_c"), "+ interaction +", 
                        paste(covariates, collapse = " + "))
  } else {
    formula_str <- paste(dependent, "~", paste0(independent, "_c"), "+", 
                        paste0(moderator, "_c"), "+ interaction")
  }
  
  formula_obj <- as.formula(formula_str)
  
  # Fit model
  tryCatch({
    model <- lm(formula_obj, data = data)
    summary_obj <- summary(model)
    
    results <- list(
      success = TRUE,
      coefficients = as.data.frame(coef(summary_obj)),
      r_squared = summary_obj$r.squared,
      adj_r_squared = summary_obj$adj.r.squared,
      interaction_significant = coef(summary_obj)["interaction", "Pr(>|t|)"] < 0.05,
      formula = formula_str,
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

cat("[Init] Advanced analysis module loaded (mediation, moderation)\n")
