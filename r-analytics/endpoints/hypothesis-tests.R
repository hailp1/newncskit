# Hypothesis Testing Endpoints
# Functions for t-tests, ANOVA, and other hypothesis tests

library(car)
library(effsize)
library(multcomp)

#' Perform Independent Samples T-Test
#' @param data Data frame
#' @param dependent_var Dependent variable name
#' @param group_var Grouping variable name
#' @param var_equal Assume equal variances (default: FALSE)
#' @param alternative Alternative hypothesis ("two.sided", "less", "greater")
perform_independent_ttest <- function(data, dependent_var, group_var, var_equal = FALSE, alternative = "two.sided") {
  # Prepare data
  formula_obj <- as.formula(paste(dependent_var, "~", group_var))
  
  # Check for exactly 2 groups
  groups <- unique(data[[group_var]])
  if (length(groups) != 2) {
    stop("Independent t-test requires exactly 2 groups")
  }
  
  # Perform t-test
  t_result <- t.test(formula_obj, data = data, var.equal = var_equal, alternative = alternative)
  
  # Levene's test for equality of variances
  levene_result <- tryCatch({
    leveneTest(formula_obj, data = data)
  }, error = function(e) NULL)
  
  # Effect size (Cohen's d)
  group1_data <- data[[dependent_var]][data[[group_var]] == groups[1]]
  group2_data <- data[[dependent_var]][data[[group_var]] == groups[2]]
  
  cohens_d <- tryCatch({
    cohen.d(group1_data, group2_data, na.rm = TRUE)
  }, error = function(e) NULL)
  
  # Descriptive statistics by group
  descriptives <- data %>%
    group_by(!!sym(group_var)) %>%
    summarise(
      n = sum(!is.na(!!sym(dependent_var))),
      mean = mean(!!sym(dependent_var), na.rm = TRUE),
      sd = sd(!!sym(dependent_var), na.rm = TRUE),
      se = sd / sqrt(n),
      ci_lower = mean - qt(0.975, n - 1) * se,
      ci_upper = mean + qt(0.975, n - 1) * se
    )
  
  results <- list(
    test = "Independent Samples T-Test",
    statistic = t_result$statistic,
    df = t_result$parameter,
    p_value = t_result$p.value,
    confidence_interval = t_result$conf.int,
    mean_difference = diff(t_result$estimate),
    group_means = t_result$estimate,
    alternative = alternative,
    method = t_result$method,
    levene_test = if (!is.null(levene_result)) {
      list(
        f_statistic = levene_result$`F value`[1],
        df1 = levene_result$Df[1],
        df2 = levene_result$Df[2],
        p_value = levene_result$`Pr(>F)`[1],
        equal_variances = levene_result$`Pr(>F)`[1] > 0.05
      )
    } else NULL,
    effect_size = if (!is.null(cohens_d)) {
      list(
        cohens_d = cohens_d$estimate,
        magnitude = cohens_d$magnitude,
        ci_lower = cohens_d$conf.int[1],
        ci_upper = cohens_d$conf.int[2]
      )
    } else NULL,
    descriptives = descriptives,
    groups = groups
  )
  
  return(results)
}

#' Perform Paired Samples T-Test
#' @param data Data frame
#' @param var1 First variable name
#' @param var2 Second variable name
#' @param alternative Alternative hypothesis
perform_paired_ttest <- function(data, var1, var2, alternative = "two.sided") {
  # Extract paired data
  paired_data <- data[complete.cases(data[[var1]], data[[var2]]), ]
  
  # Perform paired t-test
  t_result <- t.test(paired_data[[var1]], paired_data[[var2]], 
                     paired = TRUE, alternative = alternative)
  
  # Calculate differences
  differences <- paired_data[[var1]] - paired_data[[var2]]
  
  # Effect size (Cohen's d for paired samples)
  cohens_d <- tryCatch({
    cohen.d(paired_data[[var1]], paired_data[[var2]], paired = TRUE, na.rm = TRUE)
  }, error = function(e) NULL)
  
  # Normality test on differences
  normality_test <- NULL
  if (length(differences) >= 3 && length(differences) <= 5000) {
    normality_test <- tryCatch({
      shapiro.test(differences)
    }, error = function(e) NULL)
  }
  
  results <- list(
    test = "Paired Samples T-Test",
    statistic = t_result$statistic,
    df = t_result$parameter,
    p_value = t_result$p.value,
    confidence_interval = t_result$conf.int,
    mean_difference = t_result$estimate,
    alternative = alternative,
    method = t_result$method,
    descriptives = list(
      var1 = list(
        name = var1,
        mean = mean(paired_data[[var1]], na.rm = TRUE),
        sd = sd(paired_data[[var1]], na.rm = TRUE)
      ),
      var2 = list(
        name = var2,
        mean = mean(paired_data[[var2]], na.rm = TRUE),
        sd = sd(paired_data[[var2]], na.rm = TRUE)
      ),
      differences = list(
        mean = mean(differences, na.rm = TRUE),
        sd = sd(differences, na.rm = TRUE),
        min = min(differences, na.rm = TRUE),
        max = max(differences, na.rm = TRUE)
      )
    ),
    effect_size = if (!is.null(cohens_d)) {
      list(
        cohens_d = cohens_d$estimate,
        magnitude = cohens_d$magnitude,
        ci_lower = cohens_d$conf.int[1],
        ci_upper = cohens_d$conf.int[2]
      )
    } else NULL,
    normality_test = if (!is.null(normality_test)) {
      list(
        test = "Shapiro-Wilk",
        statistic = normality_test$statistic,
        p_value = normality_test$p.value,
        is_normal = normality_test$p.value > 0.05
      )
    } else NULL,
    n_pairs = nrow(paired_data)
  )
  
  return(results)
}

#' Perform One-Way ANOVA
#' @param data Data frame
#' @param dependent_var Dependent variable name
#' @param group_var Grouping variable name
#' @param post_hoc Perform post-hoc tests (default: TRUE)
perform_oneway_anova <- function(data, dependent_var, group_var, post_hoc = TRUE) {
  # Create formula
  formula_obj <- as.formula(paste(dependent_var, "~", group_var))
  
  # Perform ANOVA
  anova_model <- aov(formula_obj, data = data)
  anova_summary <- summary(anova_model)
  
  # Levene's test for homogeneity of variances
  levene_result <- tryCatch({
    leveneTest(formula_obj, data = data)
  }, error = function(e) NULL)
  
  # Effect size (Eta-squared and Omega-squared)
  ss_total <- sum(anova_summary[[1]]$`Sum Sq`)
  ss_between <- anova_summary[[1]]$`Sum Sq`[1]
  ss_within <- anova_summary[[1]]$`Sum Sq`[2]
  df_between <- anova_summary[[1]]$Df[1]
  df_within <- anova_summary[[1]]$Df[2]
  ms_within <- anova_summary[[1]]$`Mean Sq`[2]
  
  eta_squared <- ss_between / ss_total
  omega_squared <- (ss_between - df_between * ms_within) / (ss_total + ms_within)
  
  # Descriptive statistics by group
  descriptives <- data %>%
    group_by(!!sym(group_var)) %>%
    summarise(
      n = sum(!is.na(!!sym(dependent_var))),
      mean = mean(!!sym(dependent_var), na.rm = TRUE),
      sd = sd(!!sym(dependent_var), na.rm = TRUE),
      se = sd / sqrt(n),
      ci_lower = mean - qt(0.975, n - 1) * se,
      ci_upper = mean + qt(0.975, n - 1) * se
    )
  
  results <- list(
    test = "One-Way ANOVA",
    f_statistic = anova_summary[[1]]$`F value`[1],
    df_between = df_between,
    df_within = df_within,
    p_value = anova_summary[[1]]$`Pr(>F)`[1],
    sum_squares = list(
      between = ss_between,
      within = ss_within,
      total = ss_total
    ),
    mean_squares = list(
      between = anova_summary[[1]]$`Mean Sq`[1],
      within = ms_within
    ),
    effect_size = list(
      eta_squared = eta_squared,
      omega_squared = omega_squared,
      interpretation = if (eta_squared < 0.06) "small" else if (eta_squared < 0.14) "medium" else "large"
    ),
    levene_test = if (!is.null(levene_result)) {
      list(
        f_statistic = levene_result$`F value`[1],
        df1 = levene_result$Df[1],
        df2 = levene_result$Df[2],
        p_value = levene_result$`Pr(>F)`[1],
        homogeneous_variances = levene_result$`Pr(>F)`[1] > 0.05
      )
    } else NULL,
    descriptives = descriptives
  )
  
  # Post-hoc tests
  if (post_hoc && anova_summary[[1]]$`Pr(>F)`[1] < 0.05) {
    # Tukey HSD
    tukey_result <- TukeyHSD(anova_model)
    
    # Bonferroni correction
    pairwise_result <- pairwise.t.test(data[[dependent_var]], data[[group_var]], 
                                       p.adjust.method = "bonferroni")
    
    results$post_hoc <- list(
      tukey_hsd = tukey_result,
      bonferroni = pairwise_result
    )
  }
  
  return(results)
}

#' Perform Two-Way ANOVA
#' @param data Data frame
#' @param dependent_var Dependent variable name
#' @param factor1 First factor variable name
#' @param factor2 Second factor variable name
perform_twoway_anova <- function(data, dependent_var, factor1, factor2) {
  # Create formula with interaction
  formula_obj <- as.formula(paste(dependent_var, "~", factor1, "*", factor2))
  
  # Perform ANOVA
  anova_model <- aov(formula_obj, data = data)
  anova_summary <- summary(anova_model)
  
  # Type III ANOVA (for unbalanced designs)
  anova_type3 <- tryCatch({
    Anova(anova_model, type = "III")
  }, error = function(e) NULL)
  
  # Effect sizes
  ss_total <- sum(anova_summary[[1]]$`Sum Sq`)
  
  eta_squared <- list(
    factor1 = anova_summary[[1]]$`Sum Sq`[1] / ss_total,
    factor2 = anova_summary[[1]]$`Sum Sq`[2] / ss_total,
    interaction = anova_summary[[1]]$`Sum Sq`[3] / ss_total
  )
  
  # Descriptive statistics by groups
  descriptives <- data %>%
    group_by(!!sym(factor1), !!sym(factor2)) %>%
    summarise(
      n = sum(!is.na(!!sym(dependent_var))),
      mean = mean(!!sym(dependent_var), na.rm = TRUE),
      sd = sd(!!sym(dependent_var), na.rm = TRUE),
      .groups = "drop"
    )
  
  results <- list(
    test = "Two-Way ANOVA",
    anova_table = anova_summary[[1]],
    type3_anova = anova_type3,
    main_effects = list(
      factor1 = list(
        f_statistic = anova_summary[[1]]$`F value`[1],
        df = c(anova_summary[[1]]$Df[1], anova_summary[[1]]$Df[4]),
        p_value = anova_summary[[1]]$`Pr(>F)`[1]
      ),
      factor2 = list(
        f_statistic = anova_summary[[1]]$`F value`[2],
        df = c(anova_summary[[1]]$Df[2], anova_summary[[1]]$Df[4]),
        p_value = anova_summary[[1]]$`Pr(>F)`[2]
      )
    ),
    interaction_effect = list(
      f_statistic = anova_summary[[1]]$`F value`[3],
      df = c(anova_summary[[1]]$Df[3], anova_summary[[1]]$Df[4]),
      p_value = anova_summary[[1]]$`Pr(>F)`[3]
    ),
    effect_sizes = eta_squared,
    descriptives = descriptives
  )
  
  return(results)
}

#' Perform Repeated Measures ANOVA
#' @param data Data frame (long format)
#' @param dependent_var Dependent variable name
#' @param within_var Within-subjects factor
#' @param subject_var Subject identifier
perform_repeated_anova <- function(data, dependent_var, within_var, subject_var) {
  # Ensure factors are properly set
  data[[within_var]] <- as.factor(data[[within_var]])
  data[[subject_var]] <- as.factor(data[[subject_var]])
  
  # Create formula
  formula_obj <- as.formula(paste(dependent_var, "~", within_var, "+ Error(", subject_var, "/", within_var, ")"))
  
  # Perform repeated measures ANOVA
  rm_anova <- aov(formula_obj, data = data)
  rm_summary <- summary(rm_anova)
  
  # Mauchly's test for sphericity
  # Note: This is a simplified version; full implementation would require ezANOVA or similar
  
  # Descriptive statistics
  descriptives <- data %>%
    group_by(!!sym(within_var)) %>%
    summarise(
      n = n(),
      mean = mean(!!sym(dependent_var), na.rm = TRUE),
      sd = sd(!!sym(dependent_var), na.rm = TRUE),
      se = sd / sqrt(n),
      .groups = "drop"
    )
  
  results <- list(
    test = "Repeated Measures ANOVA",
    summary = rm_summary,
    descriptives = descriptives,
    note = "For full sphericity tests and corrections, consider using ezANOVA package"
  )
  
  return(results)
}

#' Perform Chi-Square Test of Independence
#' @param data Data frame
#' @param var1 First categorical variable
#' @param var2 Second categorical variable
perform_chisquare_test <- function(data, var1, var2) {
  # Create contingency table
  cont_table <- table(data[[var1]], data[[var2]])
  
  # Perform chi-square test
  chisq_result <- chisq.test(cont_table)
  
  # Effect size (Cramér's V)
  n <- sum(cont_table)
  min_dim <- min(nrow(cont_table), ncol(cont_table)) - 1
  cramers_v <- sqrt(chisq_result$statistic / (n * min_dim))
  
  # Expected frequencies
  expected_freq <- chisq_result$expected
  
  # Standardized residuals
  std_residuals <- chisq_result$stdres
  
  results <- list(
    test = "Chi-Square Test of Independence",
    chi_square = chisq_result$statistic,
    df = chisq_result$parameter,
    p_value = chisq_result$p.value,
    observed_frequencies = cont_table,
    expected_frequencies = expected_freq,
    standardized_residuals = std_residuals,
    effect_size = list(
      cramers_v = as.numeric(cramers_v),
      interpretation = if (cramers_v < 0.1) "negligible" else if (cramers_v < 0.3) "small" else if (cramers_v < 0.5) "medium" else "large"
    ),
    sample_size = n
  )
  
  return(results)
}
