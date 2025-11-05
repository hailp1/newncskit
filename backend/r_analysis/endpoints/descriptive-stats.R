# Descriptive Statistics Endpoints
# Functions for basic descriptive analysis

#' Calculate descriptive statistics
#' @param data Data frame
#' @param variables Vector of variable names
calculate_descriptive_stats <- function(data, variables = NULL) {
  if (is.null(variables)) {
    variables <- names(data)
  }
  
  # Select only numeric variables
  numeric_vars <- variables[sapply(data[variables], is.numeric)]
  categorical_vars <- variables[sapply(data[variables], function(x) is.factor(x) || is.character(x))]
  
  results <- list()
  
  # Numeric variables
  if (length(numeric_vars) > 0) {
    numeric_stats <- data[numeric_vars] %>%
      summarise_all(list(
        mean = ~mean(., na.rm = TRUE),
        median = ~median(., na.rm = TRUE),
        sd = ~sd(., na.rm = TRUE),
        min = ~min(., na.rm = TRUE),
        max = ~max(., na.rm = TRUE),
        q25 = ~quantile(., 0.25, na.rm = TRUE),
        q75 = ~quantile(., 0.75, na.rm = TRUE),
        missing = ~sum(is.na(.)),
        n = ~sum(!is.na(.))
      ))
    
    results$numeric <- numeric_stats
  }
  
  # Categorical variables
  if (length(categorical_vars) > 0) {
    categorical_stats <- list()
    for (var in categorical_vars) {
      freq_table <- table(data[[var]], useNA = "ifany")
      categorical_stats[[var]] <- list(
        frequencies = as.list(freq_table),
        missing = sum(is.na(data[[var]])),
        unique_values = length(unique(data[[var]][!is.na(data[[var]])]))
      )
    }
    results$categorical <- categorical_stats
  }
  
  return(results)
}

#' Generate correlation matrix
#' @param data Data frame
#' @param variables Vector of variable names
#' @param method Correlation method ("pearson", "spearman", "kendall")
calculate_correlation_matrix <- function(data, variables = NULL, method = "pearson") {
  if (is.null(variables)) {
    variables <- names(data)[sapply(data, is.numeric)]
  }
  
  # Select only numeric variables
  numeric_data <- data[variables][sapply(data[variables], is.numeric)]
  
  if (ncol(numeric_data) < 2) {
    stop("Need at least 2 numeric variables for correlation analysis")
  }
  
  # Calculate correlation matrix
  cor_matrix <- cor(numeric_data, use = "complete.obs", method = method)
  
  # Calculate p-values
  cor_test_results <- list()
  n_vars <- ncol(numeric_data)
  p_matrix <- matrix(NA, n_vars, n_vars)
  colnames(p_matrix) <- rownames(p_matrix) <- colnames(numeric_data)
  
  for (i in 1:(n_vars-1)) {
    for (j in (i+1):n_vars) {
      test_result <- cor.test(numeric_data[,i], numeric_data[,j], method = method)
      p_matrix[i,j] <- p_matrix[j,i] <- test_result$p.value
    }
  }
  
  return(list(
    correlation_matrix = cor_matrix,
    p_values = p_matrix,
    method = method,
    n_observations = nrow(numeric_data)
  ))
}