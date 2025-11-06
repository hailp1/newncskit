# NCSKIT R Analysis Server
# Statistical Analysis Backend using Academic R Libraries

# Load required libraries
library(plumber)
library(jsonlite)
library(readr)
library(dplyr)
library(psych)
library(lavaan)
library(semTools)
library(car)
library(corrplot)
library(ggplot2)
library(gridExtra)
library(openxlsx)
library(VIM)
library(mice)
library(Hmisc)
library(GPArotation)
library(nFactors)
library(mediation)
library(interactions)
library(boot)
library(pwr)
library(MASS)

# Enable CORS
options(plumber.cors = TRUE)

#* @apiTitle NCSKIT Statistical Analysis API
#* @apiDescription Advanced statistical analysis using R academic libraries
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time(),
    r_version = R.version.string,
    libraries = c("psych", "lavaan", "semTools", "car", "corrplot")
  )
}

#* Data health check and preprocessing
#* @post /data/health-check
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)$data
    df <- as.data.frame(data)
    
    # Basic data info
    n_rows <- nrow(df)
    n_cols <- ncol(df)
    
    # Missing data analysis
    missing_summary <- df %>%
      summarise_all(~sum(is.na(.))) %>%
      gather(variable, missing_count) %>%
      mutate(missing_percent = round(missing_count / n_rows * 100, 2))
    
    # Data types detection
    column_types <- sapply(df, function(x) {
      if (is.numeric(x)) {
        if (length(unique(x[!is.na(x)])) <= 10) "ordinal" else "numeric"
      } else if (is.character(x) || is.factor(x)) {
        if (length(unique(x[!is.na(x)])) <= 20) "categorical" else "text"
      } else {
        "unknown"
      }
    })
    
    # Basic statistics for numeric columns
    numeric_stats <- df %>%
      select_if(is.numeric) %>%
      summarise_all(list(
        mean = ~round(mean(., na.rm = TRUE), 3),
        sd = ~round(sd(., na.rm = TRUE), 3),
        min = ~round(min(., na.rm = TRUE), 3),
        max = ~round(max(., na.rm = TRUE), 3),
        unique = ~length(unique(.[!is.na(.)]))
      )) %>%
      gather(key, value) %>%
      separate(key, c("variable", "statistic"), sep = "_(?=[^_]*$)") %>%
      spread(statistic, value)
    
    # Outlier detection
    outliers <- df %>%
      select_if(is.numeric) %>%
      summarise_all(~sum(abs(scale(.)) > 3, na.rm = TRUE)) %>%
      gather(variable, outlier_count)
    
    list(
      status = "success",
      summary = list(
        rows = n_rows,
        columns = n_cols,
        missing_data = missing_summary,
        column_types = column_types,
        numeric_stats = numeric_stats,
        outliers = outliers
      ),
      recommendations = generate_data_recommendations(df)
    )
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Descriptive statistics
#* @post /analysis/descriptive
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    variables <- data$variables
    
    results <- list()
    
    # Overall descriptive statistics
    if (length(variables$numeric) > 0) {
      numeric_df <- df[, variables$numeric, drop = FALSE]
      results$descriptive <- describe(numeric_df)
      
      # Normality tests
      results$normality <- sapply(numeric_df, function(x) {
        if (length(unique(x[!is.na(x)])) > 2) {
          shapiro.test(x[!is.na(x)])$p.value
        } else {
          NA
        }
      })
    }
    
    # Frequency tables for categorical variables
    if (length(variables$categorical) > 0) {
      results$frequencies <- lapply(variables$categorical, function(var) {
        table(df[[var]], useNA = "ifany")
      })
      names(results$frequencies) <- variables$categorical
    }
    
    # Correlation matrix
    if (length(variables$numeric) > 1) {
      cor_matrix <- cor(df[, variables$numeric], use = "pairwise.complete.obs")
      results$correlation <- list(
        matrix = cor_matrix,
        significance = cor.test.matrix(df[, variables$numeric])
      )
    }
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Reliability analysis (Cronbach's Alpha)
#* @post /analysis/reliability
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    scales <- data$scales
    
    results <- list()
    
    for (scale_name in names(scales)) {
      items <- scales[[scale_name]]
      scale_data <- df[, items, drop = FALSE]
      
      # Remove rows with all missing values
      scale_data <- scale_data[rowSums(is.na(scale_data)) != ncol(scale_data), ]
      
      if (ncol(scale_data) >= 2) {
        alpha_result <- alpha(scale_data)
        
        results[[scale_name]] <- list(
          cronbach_alpha = alpha_result$total$raw_alpha,
          standardized_alpha = alpha_result$total$std.alpha,
          items = alpha_result$item.stats,
          if_item_deleted = alpha_result$alpha.drop,
          n_items = ncol(scale_data),
          n_cases = nrow(scale_data)
        )
      }
    }
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Enhanced Exploratory Factor Analysis (EFA)
#* @post /analysis/efa
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    variables <- data$variables
    n_factors <- data$n_factors %||% NULL
    rotation <- data$rotation %||% "varimax"
    extraction <- data$extraction %||% "ml"
    
    efa_data <- df[, variables, drop = FALSE]
    efa_data <- na.omit(efa_data)
    
    # Determine optimal number of factors using multiple criteria
    if (is.null(n_factors)) {
      # Kaiser criterion (eigenvalues > 1)
      ev <- eigen(cor(efa_data))
      kaiser_factors <- sum(ev$values > 1)
      
      # Scree test
      scree_result <- nScree(efa_data)
      scree_factors <- scree_result$Components[1, "noc"]
      
      # Parallel analysis
      parallel_result <- fa.parallel(efa_data, plot = FALSE)
      parallel_factors <- parallel_result$nfact
      
      # Use parallel analysis as primary criterion
      n_factors <- parallel_factors
      
      factor_selection <- list(
        kaiser_criterion = kaiser_factors,
        scree_test = scree_factors,
        parallel_analysis = parallel_factors,
        selected = n_factors
      )
    } else {
      factor_selection <- list(selected = n_factors)
    }
    
    # KMO and Bartlett's test
    kmo_result <- KMO(efa_data)
    bartlett_result <- cortest.bartlett(cor(efa_data), n = nrow(efa_data))
    
    # EFA with specified rotation and extraction
    efa_result <- fa(efa_data, nfactors = n_factors, rotate = rotation, fm = extraction)
    
    # Factor loadings matrix
    loadings_matrix <- as.matrix(efa_result$loadings)
    
    # Pattern matrix (for oblique rotations)
    pattern_matrix <- if (rotation %in% c("oblimin", "promax")) {
      as.matrix(efa_result$loadings)
    } else {
      NULL
    }
    
    # Structure matrix (for oblique rotations)
    structure_matrix <- if (rotation %in% c("oblimin", "promax")) {
      as.matrix(efa_result$Structure)
    } else {
      NULL
    }
    
    # Factor correlations (for oblique rotations)
    factor_correlations <- if (rotation %in% c("oblimin", "promax")) {
      efa_result$Phi
    } else {
      NULL
    }
    
    # Item-factor correlations
    item_factor_cors <- cor(efa_data, efa_result$scores)
    
    # Factor score adequacy
    factor_adequacy <- efa_result$weights
    
    results <- list(
      factor_selection = factor_selection,
      kmo = kmo_result$MSA,
      kmo_individual = kmo_result$MSAi,
      bartlett_chi2 = bartlett_result$chisq,
      bartlett_p = bartlett_result$p.value,
      n_factors = n_factors,
      eigenvalues = efa_result$values,
      variance_explained = efa_result$Vaccounted,
      factor_loadings = loadings_matrix,
      pattern_matrix = pattern_matrix,
      structure_matrix = structure_matrix,
      factor_correlations = factor_correlations,
      communalities = efa_result$communality,
      uniquenesses = efa_result$uniquenesses,
      item_factor_correlations = item_factor_cors,
      factor_scores = efa_result$scores,
      fit_indices = list(
        rms = efa_result$rms,
        tli = efa_result$TLI,
        rmsea = efa_result$RMSEA,
        bic = efa_result$BIC,
        chi_square = efa_result$STATISTIC,
        df = efa_result$dof,
        p_value = efa_result$PVAL
      ),
      rotation_method = rotation,
      extraction_method = extraction
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Enhanced Confirmatory Factor Analysis (CFA)
#* @post /analysis/cfa
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    model_syntax <- data$model_syntax
    estimator <- data$estimator %||% "ML"
    bootstrap <- data$bootstrap %||% FALSE
    bootstrap_samples <- data$bootstrap_samples %||% 1000
    
    # Fit CFA model with advanced options
    if (bootstrap) {
      cfa_model <- cfa(model_syntax, data = df, 
                      estimator = estimator,
                      se = "bootstrap",
                      bootstrap = bootstrap_samples,
                      missing = "ml")
    } else {
      cfa_model <- cfa(model_syntax, data = df, 
                      estimator = estimator,
                      missing = "ml")
    }
    
    # Comprehensive model fit indices
    fit_measures <- fitMeasures(cfa_model, c(
      "chisq", "df", "pvalue", "chisq.scaled", "df.scaled", "pvalue.scaled",
      "cfi", "tli", "cfi.scaled", "tli.scaled", "cfi.robust", "tli.robust",
      "rmsea", "rmsea.ci.lower", "rmsea.ci.upper", "rmsea.pvalue",
      "rmsea.scaled", "rmsea.ci.lower.scaled", "rmsea.ci.upper.scaled",
      "srmr", "srmr_bentler", "gfi", "agfi", "pgfi", "mfi",
      "aic", "bic", "sabic", "hqc", "bic2"
    ))
    
    # Parameter estimates with standardized solutions
    param_estimates <- parameterEstimates(cfa_model, standardized = TRUE, 
                                         ci = TRUE, level = 0.95)
    
    # Reliability and validity measures
    reliability_measures <- tryCatch({
      list(
        composite_reliability = reliability(cfa_model),
        cronbach_alpha = reliability(cfa_model, return.total = TRUE),
        ave = AVE(cfa_model),  # Average Variance Extracted
        htmt = htmt(cfa_model)  # Heterotrait-Monotrait ratio
      )
    }, error = function(e) NULL)
    
    # Modification indices with expected parameter changes
    mod_indices <- modificationIndices(cfa_model, sort = TRUE, maximum.number = 20)
    
    # Residual correlations
    residuals_cor <- residuals(cfa_model, type = "cor")
    residuals_std <- residuals(cfa_model, type = "standardized")
    
    # Factor scores and factor score determinacy
    factor_scores <- tryCatch({
      predict(cfa_model)
    }, error = function(e) NULL)
    
    # Model-implied correlation matrix
    implied_cor <- fitted(cfa_model)$cov
    
    # Discriminant validity assessment (Fornell-Larcker criterion)
    discriminant_validity <- tryCatch({
      ave_values <- AVE(cfa_model)
      factor_cors <- inspect(cfa_model, "cor.lv")
      
      # Check if square root of AVE > factor correlations
      sqrt_ave <- sqrt(ave_values)
      discriminant_check <- outer(sqrt_ave, sqrt_ave, function(x, y) pmin(x, y)) > abs(factor_cors)
      
      list(
        ave_values = ave_values,
        sqrt_ave = sqrt_ave,
        factor_correlations = factor_cors,
        discriminant_validity_met = discriminant_check
      )
    }, error = function(e) NULL)
    
    # Local fit assessment
    local_fit <- tryCatch({
      list(
        standardized_residuals = residuals_std,
        largest_residuals = head(sort(abs(residuals_std), decreasing = TRUE), 10)
      )
    }, error = function(e) NULL)
    
    results <- list(
      fit_indices = fit_measures,
      parameter_estimates = param_estimates,
      reliability_validity = reliability_measures,
      discriminant_validity = discriminant_validity,
      modification_indices = mod_indices,
      residual_correlations = residuals_cor,
      local_fit = local_fit,
      factor_scores = factor_scores,
      implied_correlations = implied_cor,
      model_syntax = model_syntax,
      sample_size = nrow(df),
      estimator = estimator,
      bootstrap_used = bootstrap
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Structural Equation Modeling (SEM)
#* @post /analysis/sem
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    model_syntax <- data$model_syntax
    
    # Fit SEM model
    sem_model <- sem(model_syntax, data = df, missing = "ml")
    
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
      fit_indices = fit_measures,
      parameter_estimates = param_estimates,
      r_squared = r_squared,
      modification_indices = modificationIndices(sem_model, sort = TRUE)[1:10, ]
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Variance Inflation Factor (VIF) analysis
#* @post /analysis/vif
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    dependent <- data$dependent
    independent <- data$independent
    
    # Create formula
    formula_str <- paste(dependent, "~", paste(independent, collapse = " + "))
    model_formula <- as.formula(formula_str)
    
    # Fit linear model
    lm_model <- lm(model_formula, data = df)
    
    # Calculate VIF
    vif_values <- vif(lm_model)
    
    # Tolerance values
    tolerance <- 1 / vif_values
    
    results <- list(
      vif = vif_values,
      tolerance = tolerance,
      interpretation = ifelse(vif_values > 10, "High multicollinearity", 
                             ifelse(vif_values > 5, "Moderate multicollinearity", "Low multicollinearity"))
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* ANOVA analysis
#* @post /analysis/anova
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    dependent <- data$dependent
    independent <- data$independent
    
    # Create formula
    formula_str <- paste(dependent, "~", paste(independent, collapse = " * "))
    model_formula <- as.formula(formula_str)
    
    # Fit ANOVA model
    anova_model <- aov(model_formula, data = df)
    anova_summary <- summary(anova_model)
    
    # Post-hoc tests if significant
    posthoc_results <- list()
    if (length(independent) == 1) {
      tukey_result <- TukeyHSD(anova_model)
      posthoc_results$tukey <- tukey_result
    }
    
    # Effect sizes
    eta_squared <- etaSquared(anova_model)
    
    results <- list(
      anova_table = anova_summary,
      effect_sizes = eta_squared,
      posthoc = posthoc_results,
      assumptions = list(
        normality = shapiro.test(residuals(anova_model))$p.value,
        homogeneity = bartlett.test(residuals(anova_model), df[[independent[1]]])$p.value
      )
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* T-test analysis
#* @post /analysis/ttest
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    dependent <- data$dependent
    independent <- data$independent
    test_type <- data$test_type %||% "independent"
    
    results <- list()
    
    if (test_type == "independent") {
      # Independent samples t-test
      t_result <- t.test(df[[dependent]] ~ df[[independent]])
      
      # Effect size (Cohen's d)
      group1 <- df[df[[independent]] == levels(as.factor(df[[independent]]))[1], dependent]
      group2 <- df[df[[independent]] == levels(as.factor(df[[independent]]))[2], dependent]
      cohens_d <- (mean(group1, na.rm = TRUE) - mean(group2, na.rm = TRUE)) / 
                  sqrt(((length(group1) - 1) * var(group1, na.rm = TRUE) + 
                        (length(group2) - 1) * var(group2, na.rm = TRUE)) / 
                       (length(group1) + length(group2) - 2))
      
      results <- list(
        t_statistic = t_result$statistic,
        df = t_result$parameter,
        p_value = t_result$p.value,
        confidence_interval = t_result$conf.int,
        mean_difference = diff(t_result$estimate),
        cohens_d = cohens_d,
        assumptions = list(
          normality_group1 = shapiro.test(group1)$p.value,
          normality_group2 = shapiro.test(group2)$p.value,
          equal_variances = var.test(group1, group2)$p.value
        )
      )
    }
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

# Helper functions
generate_data_recommendations <- function(df) {
  recommendations <- c()
  
  # Missing data recommendations
  missing_percent <- sapply(df, function(x) sum(is.na(x)) / length(x) * 100)
  high_missing <- names(missing_percent[missing_percent > 20])
  
  if (length(high_missing) > 0) {
    recommendations <- c(recommendations, 
      paste("Consider removing or imputing variables with high missing data:", 
            paste(high_missing, collapse = ", ")))
  }
  
  # Sample size recommendations
  if (nrow(df) < 100) {
    recommendations <- c(recommendations, 
      "Small sample size may affect statistical power. Consider collecting more data.")
  }
  
  # Multicollinearity warning
  numeric_vars <- sapply(df, is.numeric)
  if (sum(numeric_vars) > 1) {
    cor_matrix <- cor(df[, numeric_vars], use = "pairwise.complete.obs")
    high_cor <- which(abs(cor_matrix) > 0.9 & cor_matrix != 1, arr.ind = TRUE)
    
    if (nrow(high_cor) > 0) {
      recommendations <- c(recommendations, 
        "High correlations detected between some variables. Check for multicollinearity.")
    }
  }
  
  return(recommendations)
}

# Correlation test matrix helper
cor.test.matrix <- function(x) {
  n <- ncol(x)
  p_matrix <- matrix(NA, n, n)
  colnames(p_matrix) <- rownames(p_matrix) <- colnames(x)
  
  for (i in 1:(n-1)) {
    for (j in (i+1):n) {
      test_result <- cor.test(x[,i], x[,j])
      p_matrix[i,j] <- p_matrix[j,i] <- test_result$p.value
    }
  }
  
  return(p_matrix)
}

# Start the API server
#* @plumber
function(pr) {
  pr %>%
    pr_set_api_spec(function(spec) {
      spec$info$title <- "NCSKIT Statistical Analysis API"
      spec$info$description <- "Advanced statistical analysis using R academic libraries"
      spec
    })
}