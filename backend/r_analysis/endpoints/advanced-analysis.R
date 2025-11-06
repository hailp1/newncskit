# Advanced Statistical Analysis Endpoints
# SEM, Mediation, Moderation, Multi-group Analysis

library(lavaan)
library(semTools)
library(mediation)
library(interactions)
library(boot)

#* Structural Equation Modeling with advanced features
#* @post /analysis/sem-advanced
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    model_syntax <- data$model_syntax
    estimator <- data$estimator %||% "ML"
    bootstrap <- data$bootstrap %||% FALSE
    bootstrap_samples <- data$bootstrap_samples %||% 1000
    
    # Fit SEM model with advanced options
    if (bootstrap) {
      sem_model <- sem(model_syntax, data = df, 
                      estimator = estimator,
                      se = "bootstrap",
                      bootstrap = bootstrap_samples,
                      missing = "ml")
    } else {
      sem_model <- sem(model_syntax, data = df, 
                      estimator = estimator,
                      missing = "ml")
    }
    
    # Comprehensive fit indices
    fit_measures <- fitMeasures(sem_model, c(
      "chisq", "df", "pvalue", "chisq.scaled", "df.scaled", "pvalue.scaled",
      "cfi", "tli", "cfi.scaled", "tli.scaled",
      "rmsea", "rmsea.ci.lower", "rmsea.ci.upper", "rmsea.pvalue",
      "rmsea.scaled", "rmsea.ci.lower.scaled", "rmsea.ci.upper.scaled",
      "srmr", "srmr_bentler", "aic", "bic", "bic2"
    ))
    
    # Parameter estimates with standardized solutions
    param_estimates <- parameterEstimates(sem_model, standardized = TRUE, 
                                         ci = TRUE, level = 0.95)
    
    # R-squared values
    r_squared <- inspect(sem_model, "r2")
    
    # Reliability measures
    reliability_measures <- tryCatch({
      reliability(sem_model)
    }, error = function(e) NULL)
    
    # Modification indices
    mod_indices <- modificationIndices(sem_model, sort = TRUE, maximum.number = 20)
    
    # Residual correlations
    residuals_cor <- residuals(sem_model, type = "cor")
    
    # Factor scores (if applicable)
    factor_scores <- tryCatch({
      predict(sem_model)
    }, error = function(e) NULL)
    
    results <- list(
      fit_indices = fit_measures,
      parameter_estimates = param_estimates,
      r_squared = r_squared,
      reliability = reliability_measures,
      modification_indices = mod_indices,
      residual_correlations = residuals_cor,
      factor_scores = factor_scores,
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

#* Multi-group SEM analysis
#* @post /analysis/multigroup-sem
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    model_syntax <- data$model_syntax
    group_variable <- data$group_variable
    estimator <- data$estimator %||% "ML"
    
    # Fit configural model (no constraints)
    configural_model <- sem(model_syntax, data = df, 
                           group = group_variable,
                           estimator = estimator,
                           missing = "ml")
    
    # Fit metric invariance model (factor loadings constrained)
    metric_model <- sem(model_syntax, data = df, 
                       group = group_variable,
                       group.equal = c("loadings"),
                       estimator = estimator,
                       missing = "ml")
    
    # Fit scalar invariance model (loadings + intercepts constrained)
    scalar_model <- sem(model_syntax, data = df, 
                       group = group_variable,
                       group.equal = c("loadings", "intercepts"),
                       estimator = estimator,
                       missing = "ml")
    
    # Model comparisons
    configural_fit <- fitMeasures(configural_model, c("chisq", "df", "cfi", "rmsea", "srmr"))
    metric_fit <- fitMeasures(metric_model, c("chisq", "df", "cfi", "rmsea", "srmr"))
    scalar_fit <- fitMeasures(scalar_model, c("chisq", "df", "cfi", "rmsea", "srmr"))
    
    # Chi-square difference tests
    metric_vs_configural <- anova(configural_model, metric_model)
    scalar_vs_metric <- anova(metric_model, scalar_model)
    
    # Group-specific parameter estimates
    configural_params <- parameterEstimates(configural_model, standardized = TRUE)
    
    results <- list(
      configural_model = list(
        fit_indices = configural_fit,
        parameters = configural_params
      ),
      metric_model = list(
        fit_indices = metric_fit
      ),
      scalar_model = list(
        fit_indices = scalar_fit
      ),
      invariance_tests = list(
        metric_vs_configural = metric_vs_configural,
        scalar_vs_metric = scalar_vs_metric
      ),
      group_variable = group_variable,
      groups = unique(df[[group_variable]])
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Mediation analysis using bootstrap
#* @post /analysis/mediation
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    x_var <- data$x_variable
    m_var <- data$mediator
    y_var <- data$y_variable
    covariates <- data$covariates %||% NULL
    bootstrap_samples <- data$bootstrap_samples %||% 5000
    
    # Create formula strings
    if (is.null(covariates)) {
      mediator_formula <- as.formula(paste(m_var, "~", x_var))
      outcome_formula <- as.formula(paste(y_var, "~", x_var, "+", m_var))
    } else {
      cov_string <- paste(covariates, collapse = " + ")
      mediator_formula <- as.formula(paste(m_var, "~", x_var, "+", cov_string))
      outcome_formula <- as.formula(paste(y_var, "~", x_var, "+", m_var, "+", cov_string))
    }
    
    # Fit models
    mediator_model <- lm(mediator_formula, data = df)
    outcome_model <- lm(outcome_formula, data = df)
    
    # Bootstrap mediation analysis
    mediation_result <- mediate(mediator_model, outcome_model, 
                               treat = x_var, mediator = m_var,
                               boot = TRUE, sims = bootstrap_samples)
    
    # Extract results
    results <- list(
      mediation_summary = summary(mediation_result),
      acme = mediation_result$d0,  # Average Causal Mediation Effect
      acme_ci = c(mediation_result$d0.ci[1], mediation_result$d0.ci[2]),
      ade = mediation_result$z0,   # Average Direct Effect
      ade_ci = c(mediation_result$z0.ci[1], mediation_result$z0.ci[2]),
      total_effect = mediation_result$tau.coef,
      total_effect_ci = c(mediation_result$tau.ci[1], mediation_result$tau.ci[2]),
      prop_mediated = mediation_result$n0,
      prop_mediated_ci = c(mediation_result$n0.ci[1], mediation_result$n0.ci[2]),
      mediator_model_summary = summary(mediator_model),
      outcome_model_summary = summary(outcome_model),
      bootstrap_samples = bootstrap_samples
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Moderation analysis with simple slopes
#* @post /analysis/moderation
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    x_var <- data$x_variable
    w_var <- data$moderator
    y_var <- data$y_variable
    covariates <- data$covariates %||% NULL
    
    # Center variables for interpretation
    df[[paste0(x_var, "_c")]] <- scale(df[[x_var]], center = TRUE, scale = FALSE)[,1]
    df[[paste0(w_var, "_c")]] <- scale(df[[w_var]], center = TRUE, scale = FALSE)[,1]
    
    # Create interaction term
    df$interaction <- df[[paste0(x_var, "_c")]] * df[[paste0(w_var, "_c")]]
    
    # Create formula
    if (is.null(covariates)) {
      formula_str <- paste(y_var, "~", paste0(x_var, "_c"), "+", paste0(w_var, "_c"), "+ interaction")
    } else {
      cov_string <- paste(covariates, collapse = " + ")
      formula_str <- paste(y_var, "~", paste0(x_var, "_c"), "+", paste0(w_var, "_c"), "+ interaction +", cov_string)
    }
    
    # Fit moderation model
    mod_model <- lm(as.formula(formula_str), data = df)
    
    # Simple slopes analysis
    # Calculate slopes at -1 SD, mean, and +1 SD of moderator
    w_sd <- sd(df[[w_var]], na.rm = TRUE)
    w_mean <- mean(df[[w_var]], na.rm = TRUE)
    
    simple_slopes <- list(
      low_moderator = list(
        value = w_mean - w_sd,
        slope = coef(mod_model)[paste0(x_var, "_c")] + coef(mod_model)["interaction"] * (-w_sd)
      ),
      mean_moderator = list(
        value = w_mean,
        slope = coef(mod_model)[paste0(x_var, "_c")]
      ),
      high_moderator = list(
        value = w_mean + w_sd,
        slope = coef(mod_model)[paste0(x_var, "_c")] + coef(mod_model)["interaction"] * w_sd
      )
    )
    
    # Johnson-Neyman technique for regions of significance
    jn_result <- tryCatch({
      johnson_neyman(mod_model, pred = paste0(x_var, "_c"), modx = paste0(w_var, "_c"))
    }, error = function(e) NULL)
    
    results <- list(
      model_summary = summary(mod_model),
      interaction_effect = coef(mod_model)["interaction"],
      interaction_p_value = summary(mod_model)$coefficients["interaction", "Pr(>|t|)"],
      simple_slopes = simple_slopes,
      johnson_neyman = jn_result,
      r_squared = summary(mod_model)$r.squared,
      adj_r_squared = summary(mod_model)$adj.r.squared
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Longitudinal analysis with growth curve modeling
#* @post /analysis/longitudinal
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    time_var <- data$time_variable
    outcome_var <- data$outcome_variable
    id_var <- data$id_variable
    covariates <- data$covariates %||% NULL
    
    # Reshape data to long format if needed
    # Assuming data is already in long format
    
    # Create time-centered variable
    df$time_centered <- df[[time_var]] - min(df[[time_var]], na.rm = TRUE)
    
    # Fit linear growth model
    if (is.null(covariates)) {
      growth_syntax <- paste0("
        # Growth factors
        intercept =~ 1*", outcome_var, "
        slope =~ ", paste(unique(df$time_centered), collapse = "*"), "*", outcome_var, "
        
        # Variances
        intercept ~~ intercept
        slope ~~ slope
        intercept ~~ slope
        
        # Residual variances
        ", outcome_var, " ~~ ", outcome_var)
    } else {
      # Include covariates predicting growth factors
      cov_string <- paste(covariates, collapse = " + ")
      growth_syntax <- paste0("
        # Growth factors
        intercept =~ 1*", outcome_var, "
        slope =~ ", paste(unique(df$time_centered), collapse = "*"), "*", outcome_var, "
        
        # Regressions on covariates
        intercept ~ ", cov_string, "
        slope ~ ", cov_string, "
        
        # Variances
        intercept ~~ intercept
        slope ~~ slope
        intercept ~~ slope
        
        # Residual variances
        ", outcome_var, " ~~ ", outcome_var)
    }
    
    # Fit growth model
    growth_model <- growth(growth_syntax, data = df, missing = "ml")
    
    # Extract results
    fit_measures <- fitMeasures(growth_model, c("chisq", "df", "pvalue", "cfi", "tli", "rmsea", "srmr"))
    param_estimates <- parameterEstimates(growth_model, standardized = TRUE)
    
    # Growth factor means and variances
    growth_factors <- inspect(growth_model, "est")
    
    results <- list(
      fit_indices = fit_measures,
      parameter_estimates = param_estimates,
      growth_factors = growth_factors,
      model_syntax = growth_syntax,
      sample_size = length(unique(df[[id_var]])),
      time_points = length(unique(df[[time_var]]))
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Robust statistical methods with bootstrap confidence intervals
#* @post /analysis/robust-methods
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    df <- as.data.frame(data$data)
    analysis_type <- data$analysis_type
    variables <- data$variables
    bootstrap_samples <- data$bootstrap_samples %||% 2000
    
    results <- list()
    
    if (analysis_type == "robust_correlation") {
      # Robust correlation using bootstrap
      cor_matrix <- cor(df[variables], use = "pairwise.complete.obs", method = "spearman")
      
      # Bootstrap confidence intervals for correlations
      boot_cors <- replicate(bootstrap_samples, {
        boot_sample <- df[sample(nrow(df), replace = TRUE), ]
        cor(boot_sample[variables], use = "pairwise.complete.obs", method = "spearman")
      }, simplify = FALSE)
      
      # Calculate CI for each correlation
      cor_cis <- array(NA, dim = c(length(variables), length(variables), 2))
      for (i in 1:length(variables)) {
        for (j in 1:length(variables)) {
          if (i != j) {
            boot_values <- sapply(boot_cors, function(x) x[i, j])
            cor_cis[i, j, ] <- quantile(boot_values, c(0.025, 0.975), na.rm = TRUE)
          }
        }
      }
      
      results <- list(
        correlation_matrix = cor_matrix,
        confidence_intervals = cor_cis,
        method = "Spearman with bootstrap CI"
      )
      
    } else if (analysis_type == "robust_regression") {
      # Robust regression using M-estimators
      formula_str <- paste(variables[1], "~", paste(variables[-1], collapse = " + "))
      
      # Fit robust regression
      robust_model <- rlm(as.formula(formula_str), data = df, method = "MM")
      
      # Bootstrap for confidence intervals
      boot_coefs <- replicate(bootstrap_samples, {
        boot_sample <- df[sample(nrow(df), replace = TRUE), ]
        boot_model <- rlm(as.formula(formula_str), data = boot_sample, method = "MM")
        coef(boot_model)
      })
      
      # Calculate bootstrap CIs
      coef_cis <- apply(boot_coefs, 1, quantile, c(0.025, 0.975), na.rm = TRUE)
      
      results <- list(
        coefficients = coef(robust_model),
        confidence_intervals = t(coef_cis),
        residual_scale = robust_model$s,
        weights = weights(robust_model),
        method = "MM-estimation with bootstrap CI"
      )
    }
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}

#* Power analysis for various statistical tests
#* @post /analysis/power-analysis
function(req) {
  tryCatch({
    data <- fromJSON(req$postBody)
    analysis_type <- data$analysis_type
    effect_size <- data$effect_size
    alpha <- data$alpha %||% 0.05
    power <- data$power %||% 0.80
    sample_size <- data$sample_size %||% NULL
    
    results <- list()
    
    if (analysis_type == "correlation") {
      if (is.null(sample_size)) {
        # Calculate required sample size
        n_required <- pwr.r.test(r = effect_size, sig.level = alpha, power = power)$n
        results$required_sample_size <- ceiling(n_required)
      } else {
        # Calculate achieved power
        achieved_power <- pwr.r.test(r = effect_size, n = sample_size, sig.level = alpha)$power
        results$achieved_power <- achieved_power
      }
      results$effect_size <- effect_size
      results$alpha <- alpha
      
    } else if (analysis_type == "ttest") {
      if (is.null(sample_size)) {
        n_required <- pwr.t.test(d = effect_size, sig.level = alpha, power = power, type = "two.sample")$n
        results$required_sample_size <- ceiling(n_required)
      } else {
        achieved_power <- pwr.t.test(d = effect_size, n = sample_size, sig.level = alpha, type = "two.sample")$power
        results$achieved_power <- achieved_power
      }
      
    } else if (analysis_type == "anova") {
      k <- data$groups %||% 3  # number of groups
      if (is.null(sample_size)) {
        n_required <- pwr.anova.test(k = k, f = effect_size, sig.level = alpha, power = power)$n
        results$required_sample_size <- ceiling(n_required)
      } else {
        achieved_power <- pwr.anova.test(k = k, f = effect_size, n = sample_size, sig.level = alpha)$power
        results$achieved_power <- achieved_power
      }
    }
    
    results$analysis_type <- analysis_type
    results$assumptions <- list(
      alpha = alpha,
      effect_size = effect_size,
      power_target = power
    )
    
    list(status = "success", results = results)
    
  }, error = function(e) {
    list(status = "error", message = e$message)
  })
}