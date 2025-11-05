# Advanced Analysis Endpoints
# Functions for cluster analysis, time series, survival analysis, etc.

library(cluster)
library(factoextra)
library(survival)
library(forecast)
library(arules)
library(arulesViz)
library(conjoint)

#' Perform Cluster Analysis
#' @param data Data frame
#' @param variables Variables for clustering
#' @param method Clustering method ("kmeans", "hierarchical", "pam")
#' @param k Number of clusters (if NULL, will determine optimal)
perform_cluster_analysis <- function(data, variables, method = "kmeans", k = NULL) {
  # Prepare data
  cluster_data <- data[variables]
  cluster_data <- na.omit(cluster_data)
  
  # Standardize variables
  cluster_data_scaled <- scale(cluster_data)
  
  # Determine optimal number of clusters if not specified
  if (is.null(k)) {
    # Elbow method
    wss <- sapply(1:10, function(k) {
      if (method == "kmeans") {
        kmeans(cluster_data_scaled, k, nstart = 25)$tot.withinss
      } else {
        sum(cluster::pam(cluster_data_scaled, k)$objective)
      }
    })
    
    # Silhouette method
    sil_scores <- sapply(2:10, function(k) {
      if (method == "kmeans") {
        km <- kmeans(cluster_data_scaled, k, nstart = 25)
        sil <- silhouette(km$cluster, dist(cluster_data_scaled))
      } else {
        pam_result <- cluster::pam(cluster_data_scaled, k)
        sil <- silhouette(pam_result$clustering, dist(cluster_data_scaled))
      }
      mean(sil[, 3])
    })
    
    k <- which.max(sil_scores) + 1  # +1 because we start from k=2
  }
  
  # Perform clustering
  if (method == "kmeans") {
    cluster_result <- kmeans(cluster_data_scaled, k, nstart = 25)
    clusters <- cluster_result$cluster
    centers <- cluster_result$centers
    
    results <- list(
      clusters = clusters,
      centers = centers,
      within_ss = cluster_result$withinss,
      total_ss = cluster_result$totss,
      between_ss = cluster_result$betweenss,
      size = cluster_result$size
    )
  } else if (method == "hierarchical") {
    dist_matrix <- dist(cluster_data_scaled)
    hc_result <- hclust(dist_matrix, method = "ward.D2")
    clusters <- cutree(hc_result, k = k)
    
    results <- list(
      clusters = clusters,
      dendrogram = hc_result,
      height = hc_result$height
    )
  } else if (method == "pam") {
    pam_result <- cluster::pam(cluster_data_scaled, k)
    clusters <- pam_result$clustering
    
    results <- list(
      clusters = clusters,
      medoids = pam_result$medoids,
      silhouette = pam_result$silinfo
    )
  }
  
  # Calculate silhouette scores
  sil <- silhouette(clusters, dist(cluster_data_scaled))
  avg_sil_width <- mean(sil[, 3])
  
  # Cluster validation
  results$validation <- list(
    silhouette_score = avg_sil_width,
    silhouette_plot_data = sil
  )
  
  results$method <- method
  results$k <- k
  results$variables <- variables
  results$n_observations <- nrow(cluster_data)
  
  return(results)
}

#' Perform Time Series Analysis
#' @param data Data frame with time series data
#' @param value_col Column name for values
#' @param date_col Column name for dates
#' @param forecast_periods Number of periods to forecast
perform_time_series_analysis <- function(data, value_col, date_col, forecast_periods = 12) {
  # Prepare time series data
  ts_data <- data[order(data[[date_col]]), ]
  values <- ts_data[[value_col]]
  
  # Create time series object
  ts_obj <- ts(values, frequency = 12)  # Assuming monthly data
  
  # Decomposition
  decomp <- decompose(ts_obj, type = "additive")
  
  # ARIMA model
  arima_model <- auto.arima(ts_obj)
  
  # Forecast
  forecast_result <- forecast(arima_model, h = forecast_periods)
  
  # Accuracy measures
  accuracy_measures <- accuracy(arima_model)
  
  results <- list(
    original_data = values,
    decomposition = list(
      trend = as.numeric(decomp$trend),
      seasonal = as.numeric(decomp$seasonal),
      residual = as.numeric(decomp$random)
    ),
    arima_model = list(
      order = arima_model$arma[c(1, 6, 2)],
      aic = AIC(arima_model),
      bic = BIC(arima_model),
      coefficients = coef(arima_model)
    ),
    forecast = list(
      point_forecast = as.numeric(forecast_result$mean),
      lower_80 = as.numeric(forecast_result$lower[, 1]),
      upper_80 = as.numeric(forecast_result$upper[, 1]),
      lower_95 = as.numeric(forecast_result$lower[, 2]),
      upper_95 = as.numeric(forecast_result$upper[, 2])
    ),
    accuracy = accuracy_measures,
    n_observations = length(values)
  )
  
  return(results)
}

#' Perform Market Basket Analysis
#' @param data Transaction data frame
#' @param transaction_col Column name for transaction ID
#' @param item_col Column name for items
#' @param min_support Minimum support threshold
#' @param min_confidence Minimum confidence threshold
perform_market_basket_analysis <- function(data, transaction_col, item_col, 
                                         min_support = 0.01, min_confidence = 0.5) {
  # Prepare transaction data
  transactions <- split(data[[item_col]], data[[transaction_col]])
  trans_obj <- as(transactions, "transactions")
  
  # Generate frequent itemsets
  frequent_items <- apriori(trans_obj, 
                           parameter = list(support = min_support, 
                                          confidence = min_confidence,
                                          target = "frequent itemsets"))
  
  # Generate association rules
  rules <- apriori(trans_obj, 
                   parameter = list(support = min_support, 
                                  confidence = min_confidence,
                                  target = "rules"))
  
  # Sort rules by lift
  rules_sorted <- sort(rules, by = "lift", decreasing = TRUE)
  
  # Extract rule metrics
  rule_metrics <- data.frame(
    lhs = labels(lhs(rules_sorted)),
    rhs = labels(rhs(rules_sorted)),
    support = quality(rules_sorted)$support,
    confidence = quality(rules_sorted)$confidence,
    lift = quality(rules_sorted)$lift,
    count = quality(rules_sorted)$count
  )
  
  results <- list(
    rules = rule_metrics,
    frequent_itemsets = frequent_items,
    summary = list(
      n_transactions = length(trans_obj),
      n_items = length(itemLabels(trans_obj)),
      n_rules = length(rules),
      avg_transaction_size = mean(size(trans_obj))
    ),
    parameters = list(
      min_support = min_support,
      min_confidence = min_confidence
    )
  )
  
  return(results)
}

#' Perform Survival Analysis
#' @param data Data frame
#' @param time_col Column name for time to event
#' @param event_col Column name for event indicator (1 = event, 0 = censored)
#' @param group_col Optional grouping variable
perform_survival_analysis <- function(data, time_col, event_col, group_col = NULL) {
  # Create survival object
  surv_obj <- Surv(data[[time_col]], data[[event_col]])
  
  # Kaplan-Meier estimator
  if (is.null(group_col)) {
    km_fit <- survfit(surv_obj ~ 1, data = data)
    formula_used <- paste("Surv(", time_col, ",", event_col, ") ~ 1")
  } else {
    km_fit <- survfit(surv_obj ~ data[[group_col]], data = data)
    formula_used <- paste("Surv(", time_col, ",", event_col, ") ~", group_col)
  }
  
  # Extract survival probabilities
  km_summary <- summary(km_fit)
  
  # Log-rank test (if groups exist)
  logrank_test <- NULL
  if (!is.null(group_col)) {
    logrank_test <- survdiff(surv_obj ~ data[[group_col]], data = data)
  }
  
  # Cox proportional hazards model (if groups exist)
  cox_model <- NULL
  if (!is.null(group_col)) {
    cox_formula <- as.formula(paste("surv_obj ~", group_col))
    cox_model <- coxph(cox_formula, data = data)
  }
  
  results <- list(
    kaplan_meier = list(
      time = km_summary$time,
      n_risk = km_summary$n.risk,
      n_event = km_summary$n.event,
      survival = km_summary$surv,
      std_err = km_summary$std.err,
      lower_ci = km_summary$lower,
      upper_ci = km_summary$upper
    ),
    median_survival = summary(km_fit)$table[, "median"],
    logrank_test = if (!is.null(logrank_test)) {
      list(
        chisq = logrank_test$chisq,
        df = length(logrank_test$n) - 1,
        p_value = 1 - pchisq(logrank_test$chisq, length(logrank_test$n) - 1)
      )
    } else NULL,
    cox_model = if (!is.null(cox_model)) {
      list(
        coefficients = summary(cox_model)$coefficients,
        hazard_ratios = exp(coef(cox_model)),
        concordance = cox_model$concordance
      )
    } else NULL,
    formula = formula_used,
    n_observations = nrow(data),
    n_events = sum(data[[event_col]])
  )
  
  return(results)
}

#' Perform Conjoint Analysis
#' @param data Data frame with conjoint data
#' @param rating_col Column name for ratings
#' @param attribute_cols Vector of attribute column names
perform_conjoint_analysis <- function(data, rating_col, attribute_cols) {
  # Prepare design matrix
  design_matrix <- data[attribute_cols]
  ratings <- data[[rating_col]]
  
  # Perform conjoint analysis
  conjoint_result <- lm(ratings ~ ., data = design_matrix)
  
  # Calculate part-worth utilities
  part_worths <- coef(conjoint_result)
  
  # Calculate relative importance
  ranges <- sapply(attribute_cols, function(attr) {
    attr_coeffs <- part_worths[grepl(attr, names(part_worths))]
    max(attr_coeffs) - min(attr_coeffs)
  })
  
  relative_importance <- ranges / sum(ranges) * 100
  
  results <- list(
    part_worth_utilities = part_worths,
    relative_importance = relative_importance,
    model_summary = summary(conjoint_result),
    r_squared = summary(conjoint_result)$r.squared,
    attributes = attribute_cols,
    n_observations = nrow(data)
  )
  
  return(results)
}