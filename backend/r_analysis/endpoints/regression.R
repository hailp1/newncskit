# Regression Analysis Endpoints
# Functions for linear, logistic, and multilevel regression

library(lme4)
library(car)
library(broom)

#' Perform Linear Regression
#' @param data Data frame
#' @param formula Regression formula
#' @param robust Use robust standard errors
perform_linear_regression <- function(data, formula, robust = FALSE) {
  # Fit linear model
  model <- lm(formula, data = data)
  
  # Model summary
  model_summary <- summary(model)
  
  # ANOVA
  anova_result <- anova(model)
  
  # Diagnostics
  diagnostics <- list(
    residuals = residuals(model),
    fitted_values = fitted(model),
    standardized_residuals = rstandard(model),
    cooks_distance = cooks.distance(model),
    leverage = hatvalues(model)
  )
  
  # VIF for multicollinearity (if multiple predictors)
  vif_values <- NULL
  if (length(coefficients(model)) > 2) {
    tryCatch({
      vif_values <- vif(model)
    }, error = function(e) {
      vif_values <- NULL
    })
  }
  
  # Durbin-Watson test for autocorrelation
  dw_test <- durbinWatsonTest(model)
  
  # Breusch-Pagan test for heteroscedasticity
  bp_test <- tryCatch({
    ncvTest(model)
  }, error = function(e) {
    list(ChiSquare = NA, Df = NA, p = NA)
  })
  
  results <- list(
    coefficients = tidy(model),
    model_summary = list(
      r_squared = model_summary$r.squared,
      adj_r_squared = model_summary$adj.r.squared,
      f_statistic = model_summary$fstatistic[1],
      f_p_value = pf(model_summary$fstatistic[1], 
                     model_summary$fstatistic[2], 
                     model_summary$fstatistic[3], 
                     lower.tail = FALSE),
      residual_se = model_summary$sigma,
      df = model_summary$df
    ),
    anova = anova_result,
    diagnostics = diagnostics,
    assumptions = list(
      vif = vif_values,
      durbin_watson = list(
        statistic = dw_test$dw,
        p_value = dw_test$p
      ),
      breusch_pagan = list(
        chi_square = bp_test$ChiSquare,
        p_value = bp_test$p
      )
    ),
    formula = deparse(formula),
    n_observations = nrow(model$model)
  )
  
  return(results)
}

#' Perform Logistic Regression
#' @param data Data frame
#' @param formula Regression formula
perform_logistic_regression <- function(data, formula) {
  # Fit logistic model
  model <- glm(formula, data = data, family = binomial())
  
  # Model summary
  model_summary <- summary(model)
  
  # Odds ratios
  odds_ratios <- exp(coefficients(model))
  odds_ratios_ci <- exp(confint(model))
  
  # Hosmer-Lemeshow test
  hl_test <- tryCatch({
    library(ResourceSelection)
    hoslem.test(model$y, fitted(model))
  }, error = function(e) {
    list(statistic = NA, p.value = NA)
  })
  
  # Pseudo R-squared measures
  null_deviance <- model$null.deviance
  residual_deviance <- model$deviance
  
  mcfadden_r2 <- 1 - (residual_deviance / null_deviance)
  cox_snell_r2 <- 1 - exp((residual_deviance - null_deviance) / nrow(data))
  nagelkerke_r2 <- cox_snell_r2 / (1 - exp(-null_deviance / nrow(data)))
  
  # Classification table
  predicted_probs <- fitted(model)
  predicted_class <- ifelse(predicted_probs > 0.5, 1, 0)
  actual_class <- model$y
  
  confusion_matrix <- table(Predicted = predicted_class, Actual = actual_class)
  accuracy <- sum(diag(confusion_matrix)) / sum(confusion_matrix)
  
  results <- list(
    coefficients = tidy(model),
    odds_ratios = data.frame(
      term = names(odds_ratios),
      odds_ratio = odds_ratios,
      ci_lower = odds_ratios_ci[,1],
      ci_upper = odds_ratios_ci[,2]
    ),
    model_fit = list(
      aic = AIC(model),
      bic = BIC(model),
      log_likelihood = logLik(model)[1],
      deviance = residual_deviance,
      null_deviance = null_deviance,
      df_residual = model$df.residual
    ),
    pseudo_r_squared = list(
      mcfadden = mcfadden_r2,
      cox_snell = cox_snell_r2,
      nagelkerke = nagelkerke_r2
    ),
    classification = list(
      confusion_matrix = confusion_matrix,
      accuracy = accuracy,
      sensitivity = confusion_matrix[2,2] / sum(confusion_matrix[,2]),
      specificity = confusion_matrix[1,1] / sum(confusion_matrix[,1])
    ),
    hosmer_lemeshow = list(
      statistic = hl_test$statistic,
      p_value = hl_test$p.value
    ),
    formula = deparse(formula),
    n_observations = nrow(model$model)
  )
  
  return(results)
}

#' Perform Multilevel/Hierarchical Linear Modeling
#' @param data Data frame
#' @param formula Mixed effects formula
#' @param group_var Grouping variable
perform_multilevel_regression <- function(data, formula, group_var) {
  # Fit multilevel model
  model <- lmer(formula, data = data)
  
  # Model summary
  model_summary <- summary(model)
  
  # Random effects
  random_effects <- VarCorr(model)
  
  # Fixed effects
  fixed_effects <- fixef(model)
  
  # ICC calculation
  var_components <- as.data.frame(random_effects)
  between_var <- var_components$vcov[var_components$grp == group_var]
  within_var <- var_components$vcov[var_components$grp == "Residual"]
  icc <- between_var / (between_var + within_var)
  
  # Model comparison with null model
  null_formula <- update(formula, . ~ 1 + (1 | !!sym(group_var)))
  null_model <- lmer(null_formula, data = data)
  
  model_comparison <- anova(null_model, model)
  
  results <- list(
    fixed_effects = data.frame(
      term = names(fixed_effects),
      estimate = fixed_effects,
      std_error = model_summary$coefficients[,"Std. Error"],
      t_value = model_summary$coefficients[,"t value"]
    ),
    random_effects = random_effects,
    variance_components = var_components,
    icc = icc,
    model_fit = list(
      aic = AIC(model),
      bic = BIC(model),
      log_likelihood = logLik(model)[1],
      deviance = deviance(model)
    ),
    model_comparison = model_comparison,
    formula = deparse(formula),
    group_variable = group_var,
    n_observations = nrow(data),
    n_groups = length(unique(data[[group_var]]))
  )
  
  return(results)
}