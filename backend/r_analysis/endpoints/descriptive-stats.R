# Descriptive Statistics Helper Functions
# Safe implementations with edge case handling

library(psych)

# Safe descriptive statistics with edge case handling
calculate_descriptive_stats <- function(data, variables) {
  results <- list()
  
  for (var in variables) {
    # Check if variable exists
    if (!var %in% names(data)) {
      results[[var]] <- list(
        success = FALSE,
        error = "Variable not found"
      )
      next
    }
    
    x <- data[[var]]
    
    # Remove NA
    x_clean <- x[!is.na(x)]
    
    # Check sample size
    if (length(x_clean) < 1) {
      results[[var]] <- list(
        success = FALSE,
        error = "No valid observations"
      )
      next
    }
    
    # Calculate basic stats
    stats <- list(
      n = length(x_clean),
      mean = mean(x_clean),
      median = median(x_clean),
      sd = sd(x_clean),
      min = min(x_clean),
      max = max(x_clean)
    )
    
    # Check for zero variance
    if (is.na(stats$sd) || stats$sd == 0) {
      stats$warning <- "Zero variance detected"
      stats$z_scores <- rep(NA, length(x_clean))
    } else {
      # Calculate z-scores safely
      stats$z_scores <- (x_clean - stats$mean) / stats$sd
    }
    
    # Normality test (safe)
    stats$normality <- test_normality_safe(x_clean)
    
    # Outlier detection (safe)
    stats$outliers <- detect_outliers_safe(x, x_clean)
    
    results[[var]] <- list(
      success = TRUE,
      data = stats
    )
  }
  
  return(results)
}

# Safe normality test
test_normality_safe <- function(x_clean) {
  # Check sample size
  if (length(x_clean) < 3) {
    return(list(
      test = "insufficient_data",
      p_value = NA,
      message = "Sample size < 3",
      normal = NA
    ))
  }
  
  # Check for constant values
  if (length(unique(x_clean)) == 1) {
    return(list(
      test = "constant_variable",
      p_value = NA,
      message = "All values are identical",
      normal = NA
    ))
  }
  
  # Check sd
  sd_val <- sd(x_clean)
  if (is.na(sd_val) || sd_val == 0) {
    return(list(
      test = "zero_variance",
      p_value = NA,
      message = "Standard deviation is zero",
      normal = NA
    ))
  }
  
  # Run Shapiro-Wilk test
  tryCatch({
    result <- shapiro.test(x_clean)
    return(list(
      test = "shapiro_wilk",
      statistic = result$statistic,
      p_value = result$p.value,
      normal = result$p.value > 0.05,
      message = if (result$p.value > 0.05) "Data appears normally distributed" else "Data may not be normally distributed"
    ))
  }, error = function(e) {
    return(list(
      test = "error",
      p_value = NA,
      error = e$message,
      normal = NA
    ))
  })
}

# Safe outlier detection with correct index mapping
detect_outliers_safe <- function(x_original, x_clean) {
  # Check for zero variance
  sd_val <- sd(x_clean)
  if (is.na(sd_val) || sd_val == 0) {
    return(list(
      indices = integer(0),
      values = numeric(0),
      z_scores = numeric(0),
      warning = "Zero variance - no outliers detected"
    ))
  }
  
  # Calculate z-scores
  z_scores <- (x_clean - mean(x_clean)) / sd_val
  
  # Find outliers (|z| > 3)
  outlier_positions <- which(abs(z_scores) > 3)
  
  if (length(outlier_positions) == 0) {
    return(list(
      indices = integer(0),
      values = numeric(0),
      z_scores = numeric(0),
      count = 0
    ))
  }
  
  # Map back to original indices
  valid_indices <- which(!is.na(x_original))
  outlier_indices <- valid_indices[outlier_positions]
  
  return(list(
    indices = outlier_indices,
    values = x_original[outlier_indices],
    z_scores = z_scores[outlier_positions],
    count = length(outlier_indices)
  ))
}

# Safe correlation analysis
calculate_correlation_safe <- function(data, variables) {
  # Check for zero variance variables
  zero_var_vars <- c()
  valid_vars <- c()
  
  for (var in variables) {
    if (var %in% names(data)) {
      x <- data[[var]]
      x_clean <- x[!is.na(x)]
      
      if (length(x_clean) > 0) {
        sd_val <- sd(x_clean)
        if (is.na(sd_val) || sd_val == 0) {
          zero_var_vars <- c(zero_var_vars, var)
          cat("[Correlation] Warning: Variable", var, "has zero variance, excluding\n")
        } else {
          valid_vars <- c(valid_vars, var)
        }
      }
    }
  }
  
  if (length(valid_vars) < 2) {
    return(list(
      success = FALSE,
      error = "Need at least 2 variables with non-zero variance",
      excluded_variables = zero_var_vars
    ))
  }
  
  # Calculate correlation matrix
  tryCatch({
    cor_data <- data[, valid_vars, drop = FALSE]
    cor_matrix <- cor(cor_data, use = "pairwise.complete.obs")
    
    return(list(
      success = TRUE,
      correlation_matrix = cor_matrix,
      variables_used = valid_vars,
      excluded_variables = zero_var_vars
    ))
  }, error = function(e) {
    return(list(
      success = FALSE,
      error = e$message
    ))
  })
}
