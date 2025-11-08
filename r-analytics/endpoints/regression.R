# Regression Analysis Endpoints
# Linear, logistic, and multilevel regression

library(lme4)
library(lmerTest)
library(broom)

#* Linear Regression
#* @param project_id Project identifier
#* @post /analysis/regression-linear
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    formula_str <- body$formula
    
    # Perform linear regression
    model <- lm(as.formula(formula_str), data = data)
    
    # Get model summary
    model_summary <- summary(model)
    
    results <- list(
      success = TRUE,
      results = list(
        coefficients = broom::tidy(model),
        model_fit = broom::glance(model),
        r_squared = model_summary$r.squared,
        adj_r_squared = model_summary$adj.r.squared,
        f_statistic = model_summary$fstatistic[1],
        p_value = pf(model_summary$fstatistic[1], 
                     model_summary$fstatistic[2], 
                     model_summary$fstatistic[3], 
                     lower.tail = FALSE)
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}

#* Logistic Regression
#* @param project_id Project identifier
#* @post /analysis/regression-logistic
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    formula_str <- body$formula
    
    # Perform logistic regression
    model <- glm(as.formula(formula_str), data = data, family = binomial())
    
    results <- list(
      success = TRUE,
      results = list(
        coefficients = broom::tidy(model, exponentiate = TRUE),
        model_fit = broom::glance(model),
        deviance = model$deviance,
        null_deviance = model$null.deviance,
        aic = model$aic
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}

#* Multilevel Regression
#* @param project_id Project identifier
#* @post /analysis/regression-multilevel
function(req, res, project_id) {
  tryCatch({
    if (!exists(project_id, envir = analysis_data)) {
      res$status <- 404
      return(list(success = FALSE, error = "Project data not found"))
    }
    
    data <- get(project_id, envir = analysis_data)
    body <- jsonlite::fromJSON(req$postBody)
    
    formula_str <- body$formula
    
    # Perform multilevel regression
    model <- lmerTest::lmer(as.formula(formula_str), data = data)
    
    results <- list(
      success = TRUE,
      results = list(
        fixed_effects = broom.mixed::tidy(model, effects = "fixed"),
        random_effects = broom.mixed::tidy(model, effects = "ran_pars"),
        model_fit = broom.mixed::glance(model)
      )
    )
    
    return(results)
    
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = as.character(e)))
  })
}
