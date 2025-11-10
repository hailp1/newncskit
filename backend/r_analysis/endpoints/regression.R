# Regression Analysis Helper Functions
# Safe implementations with validation

library(car)

# Safe linear regression with validation
perform_linear_regression <- function(data, dependent, independent) {
  # Validate sample size
  n <- nrow(data)
  min_n <- length(independent) + 2
  
  if (n < min_n) {
    return(list(
      success = FALSE,
      error = paste0("Insufficient sample size. Need at least ", min_n, " observations, got ", n),
      required_n = min_n,
      actual_n = n
    ))
  }
  
  # Convert factors if needed
  for (var in independent) {
    if (is.character(data[[var]])) {
      data[[var]] <- as.factor(data[[var]])
      cat("[Regression] Converted", var, "to factor\n")
    }
  }
  
  # Build formula
  formula_str <- paste(dependent, "~", paste(independent, collapse = " + "))
  formula_obj <- as.formula(formula_str)
  
  # Fit model
  tryCatch({
    model <- lm(formula_obj, data = data)
    
    # Extract results
    summary_obj <- summary(model)
    
    # VIF for multicollinearity (if multiple predictors)
    vif_values <- NULL
    if (length(independent) > 1) {
      tryCatch({
        vif_values <- vif(model)
      }, error = function(e) {
        cat("[Regression] Could not calculate VIF:", e$message, "\n")
      })
    }
    
    results <- list(
      success = TRUE,
      coefficients = as.data.frame(coef(summary_obj)),
      r_squared = summary_obj$r.squared,
      adj_r_squared = summary_obj$adj.r.squared,
      f_statistic = summary_obj$fstatistic,
      residuals = residuals(model),
      fitted = fitted(model),
      vif = vif_values,
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

# ANOVA with factor conversion
perform_anova <- function(data, dependent, independent) {
  # Validate sample size
  n <- nrow(data)
  if (n < 3) {
    return(list(
      success = FALSE,
      error = "Insufficient sample size for ANOVA (n < 3)"
    ))
  }
  
  # Convert grouping variables to factors
  for (var in independent) {
    if (!is.factor(data[[var]])) {
      data[[var]] <- as.factor(data[[var]])
      cat("[ANOVA] Converted", var, "to factor\n")
    }
  }
  
  # Build formula
  formula_str <- paste(dependent, "~", paste(independent, collapse = " * "))
  formula_obj <- as.formula(formula_str)
  
  # Fit ANOVA model
  tryCatch({
    anova_model <- aov(formula_obj, data = data)
    anova_summary <- summary(anova_model)
    
    # Effect sizes
    eta_squared <- tryCatch({
      etaSquared(anova_model)
    }, error = function(e) NULL)
    
    results <- list(
      success = TRUE,
      anova_table = anova_summary,
      effect_sizes = eta_squared,
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

# T-test with factor conversion
perform_ttest <- function(data, dependent, independent) {
  # Validate sample size
  n <- nrow(data)
  if (n < 2) {
    return(list(
      success = FALSE,
      error = "Insufficient sample size for t-test (n < 2)"
    ))
  }
  
  # Convert grouping variable to factor
  if (!is.factor(data[[independent]])) {
    data[[independent]] <- as.factor(data[[independent]])
    cat("[T-test] Converted", independent, "to factor\n")
  }
  
  # Check number of groups
  groups <- levels(data[[independent]])
  if (length(groups) != 2) {
    return(list(
      success = FALSE,
      error = paste0("T-test requires exactly 2 groups, found ", length(groups))
    ))
  }
  
  # Perform t-test
  tryCatch({
    t_result <- t.test(data[[dependent]] ~ data[[independent]])
    
    # Effect size (Cohen's d)
    group1 <- data[data[[independent]] == groups[1], dependent]
    group2 <- data[data[[independent]] == groups[2], dependent]
    
    cohens_d <- (mean(group1, na.rm = TRUE) - mean(group2, na.rm = TRUE)) / 
                sqrt(((length(group1) - 1) * var(group1, na.rm = TRUE) + 
                      (length(group2) - 1) * var(group2, na.rm = TRUE)) / 
                     (length(group1) + length(group2) - 2))
    
    results <- list(
      success = TRUE,
      t_statistic = t_result$statistic,
      df = t_result$parameter,
      p_value = t_result$p.value,
      confidence_interval = t_result$conf.int,
      mean_difference = diff(t_result$estimate),
      cohens_d = cohens_d,
      groups = groups,
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
