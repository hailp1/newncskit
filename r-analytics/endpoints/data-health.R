# Data Health Check Endpoints
# Functions for data quality assessment and validation

library(dplyr)
library(moments)

#' Perform comprehensive data health check
#' @param data Data frame
#' @param variables Vector of variable names (optional)
perform_data_health_check <- function(data, variables = NULL) {
  if (is.null(variables)) {
    variables <- names(data)
  }
  
  results <- list()
  
  # Overall data summary
  results$overview <- list(
    n_rows = nrow(data),
    n_cols = ncol(data),
    total_cells = nrow(data) * ncol(data),
    memory_size = format(object.size(data), units = "MB")
  )
  
  # Missing values analysis
  missing_analysis <- data.frame(
    variable = variables,
    missing_count = sapply(data[variables], function(x) sum(is.na(x))),
    missing_percent = sapply(data[variables], function(x) round(sum(is.na(x)) / length(x) * 100, 2)),
    complete_count = sapply(data[variables], function(x) sum(!is.na(x)))
  )
  results$missing_values <- missing_analysis
  
  # Data types
  results$data_types <- sapply(data[variables], class)
  
  # Numeric variables analysis
  numeric_vars <- variables[sapply(data[variables], is.numeric)]
  if (length(numeric_vars) > 0) {
    numeric_health <- list()
    
    for (var in numeric_vars) {
      var_data <- data[[var]][!is.na(data[[var]])]
      
      if (length(var_data) > 0) {
        # Outlier detection using IQR method
        q1 <- quantile(var_data, 0.25)
        q3 <- quantile(var_data, 0.75)
        iqr <- q3 - q1
        lower_bound <- q1 - 1.5 * iqr
        upper_bound <- q3 + 1.5 * iqr
        outliers <- var_data[var_data < lower_bound | var_data > upper_bound]
        
        # Normality tests
        normality_test <- NULL
        if (length(var_data) >= 3 && length(var_data) <= 5000) {
          normality_test <- tryCatch({
            shapiro.test(var_data)
          }, error = function(e) NULL)
        }
        
        numeric_health[[var]] <- list(
          mean = mean(var_data),
          median = median(var_data),
          sd = sd(var_data),
          min = min(var_data),
          max = max(var_data),
          range = max(var_data) - min(var_data),
          skewness = skewness(var_data),
          kurtosis = kurtosis(var_data),
          outliers = list(
            count = length(outliers),
            percent = round(length(outliers) / length(var_data) * 100, 2),
            values = if(length(outliers) <= 10) outliers else head(outliers, 10)
          ),
          normality = if (!is.null(normality_test)) {
            list(
              test = "Shapiro-Wilk",
              statistic = normality_test$statistic,
              p_value = normality_test$p.value,
              is_normal = normality_test$p.value > 0.05
            )
          } else {
            list(test = "Not performed", reason = "Sample size out of range")
          },
          zeros_count = sum(var_data == 0),
          unique_values = length(unique(var_data))
        )
      }
    }
    results$numeric_variables <- numeric_health
  }
  
  # Categorical variables analysis
  categorical_vars <- variables[sapply(data[variables], function(x) is.factor(x) || is.character(x))]
  if (length(categorical_vars) > 0) {
    categorical_health <- list()
    
    for (var in categorical_vars) {
      var_data <- data[[var]][!is.na(data[[var]])]
      freq_table <- table(var_data)
      
      categorical_health[[var]] <- list(
        unique_values = length(unique(var_data)),
        most_frequent = names(freq_table)[which.max(freq_table)],
        most_frequent_count = max(freq_table),
        least_frequent = names(freq_table)[which.min(freq_table)],
        least_frequent_count = min(freq_table),
        frequency_table = if(length(freq_table) <= 20) as.list(freq_table) else head(as.list(freq_table), 20)
      )
    }
    results$categorical_variables <- categorical_health
  }
  
  # Duplicate rows check
  duplicate_rows <- duplicated(data[variables])
  results$duplicates <- list(
    count = sum(duplicate_rows),
    percent = round(sum(duplicate_rows) / nrow(data) * 100, 2)
  )
  
  # Correlation issues (multicollinearity check for numeric vars)
  if (length(numeric_vars) >= 2) {
    cor_matrix <- cor(data[numeric_vars], use = "complete.obs")
    high_cor_pairs <- which(abs(cor_matrix) > 0.9 & cor_matrix != 1, arr.ind = TRUE)
    
    if (nrow(high_cor_pairs) > 0) {
      high_cor_list <- lapply(1:nrow(high_cor_pairs), function(i) {
        list(
          var1 = rownames(cor_matrix)[high_cor_pairs[i, 1]],
          var2 = colnames(cor_matrix)[high_cor_pairs[i, 2]],
          correlation = cor_matrix[high_cor_pairs[i, 1], high_cor_pairs[i, 2]]
        )
      })
      results$high_correlations <- high_cor_list
    } else {
      results$high_correlations <- list()
    }
  }
  
  # Data quality score (0-100)
  quality_score <- 100
  quality_score <- quality_score - (mean(missing_analysis$missing_percent) * 0.5)  # Penalize missing data
  quality_score <- quality_score - (results$duplicates$percent * 0.3)  # Penalize duplicates
  if (length(numeric_vars) > 0) {
    outlier_percent <- mean(sapply(results$numeric_variables, function(x) x$outliers$percent))
    quality_score <- quality_score - (outlier_percent * 0.2)  # Penalize outliers
  }
  results$quality_score <- max(0, min(100, round(quality_score, 2)))
  
  return(results)
}

#' Check for missing data patterns
#' @param data Data frame
#' @param variables Vector of variable names
check_missing_patterns <- function(data, variables = NULL) {
  if (is.null(variables)) {
    variables <- names(data)
  }
  
  # Create missing indicator matrix
  missing_matrix <- is.na(data[variables])
  
  # Count missing patterns
  pattern_counts <- table(apply(missing_matrix, 1, paste, collapse = ""))
  
  # Identify variables with missing data
  vars_with_missing <- variables[colSums(missing_matrix) > 0]
  
  results <- list(
    total_patterns = length(pattern_counts),
    variables_with_missing = vars_with_missing,
    missing_by_variable = colSums(missing_matrix),
    complete_cases = sum(complete.cases(data[variables])),
    complete_cases_percent = round(sum(complete.cases(data[variables])) / nrow(data) * 100, 2)
  )
  
  return(results)
}

#' Detect outliers using multiple methods
#' @param data Data frame
#' @param variable Variable name
#' @param methods Vector of methods ("iqr", "zscore", "mad")
detect_outliers <- function(data, variable, methods = c("iqr", "zscore")) {
  var_data <- data[[variable]][!is.na(data[[variable]])]
  
  if (!is.numeric(var_data)) {
    stop("Variable must be numeric for outlier detection")
  }
  
  results <- list()
  
  # IQR method
  if ("iqr" %in% methods) {
    q1 <- quantile(var_data, 0.25)
    q3 <- quantile(var_data, 0.75)
    iqr <- q3 - q1
    lower_bound <- q1 - 1.5 * iqr
    upper_bound <- q3 + 1.5 * iqr
    outliers_iqr <- which(var_data < lower_bound | var_data > upper_bound)
    
    results$iqr <- list(
      method = "IQR (1.5 * IQR)",
      lower_bound = lower_bound,
      upper_bound = upper_bound,
      outlier_indices = outliers_iqr,
      outlier_count = length(outliers_iqr),
      outlier_values = var_data[outliers_iqr]
    )
  }
  
  # Z-score method
  if ("zscore" %in% methods) {
    z_scores <- (var_data - mean(var_data)) / sd(var_data)
    outliers_z <- which(abs(z_scores) > 3)
    
    results$zscore <- list(
      method = "Z-score (|z| > 3)",
      threshold = 3,
      outlier_indices = outliers_z,
      outlier_count = length(outliers_z),
      outlier_values = var_data[outliers_z],
      z_scores = z_scores[outliers_z]
    )
  }
  
  # MAD method (Median Absolute Deviation)
  if ("mad" %in% methods) {
    median_val <- median(var_data)
    mad_val <- mad(var_data)
    modified_z <- 0.6745 * (var_data - median_val) / mad_val
    outliers_mad <- which(abs(modified_z) > 3.5)
    
    results$mad <- list(
      method = "MAD (Modified Z-score > 3.5)",
      threshold = 3.5,
      outlier_indices = outliers_mad,
      outlier_count = length(outliers_mad),
      outlier_values = var_data[outliers_mad]
    )
  }
  
  return(results)
}

#' Test normality of variables
#' @param data Data frame
#' @param variables Vector of variable names
test_normality <- function(data, variables) {
  results <- list()
  
  for (var in variables) {
    var_data <- data[[var]][!is.na(data[[var]])]
    
    if (!is.numeric(var_data)) {
      results[[var]] <- list(error = "Variable must be numeric")
      next
    }
    
    if (length(var_data) < 3) {
      results[[var]] <- list(error = "Insufficient data points")
      next
    }
    
    # Shapiro-Wilk test (for n <= 5000)
    shapiro_result <- NULL
    if (length(var_data) <= 5000) {
      shapiro_result <- tryCatch({
        shapiro.test(var_data)
      }, error = function(e) NULL)
    }
    
    # Kolmogorov-Smirnov test
    ks_result <- tryCatch({
      ks.test(var_data, "pnorm", mean(var_data), sd(var_data))
    }, error = function(e) NULL)
    
    # Descriptive measures
    skew <- skewness(var_data)
    kurt <- kurtosis(var_data)
    
    results[[var]] <- list(
      shapiro_wilk = if (!is.null(shapiro_result)) {
        list(
          statistic = shapiro_result$statistic,
          p_value = shapiro_result$p.value,
          is_normal = shapiro_result$p.value > 0.05
        )
      } else {
        list(note = "Not performed (sample size > 5000)")
      },
      kolmogorov_smirnov = if (!is.null(ks_result)) {
        list(
          statistic = ks_result$statistic,
          p_value = ks_result$p.value,
          is_normal = ks_result$p.value > 0.05
        )
      } else {
        list(error = "Test failed")
      },
      skewness = skew,
      kurtosis = kurt,
      interpretation = list(
        skewness = if (abs(skew) < 0.5) "approximately symmetric" else if (skew > 0) "right-skewed" else "left-skewed",
        kurtosis = if (abs(kurt - 3) < 0.5) "approximately normal" else if (kurt > 3) "heavy-tailed" else "light-tailed"
      )
    )
  }
  
  return(results)
}
