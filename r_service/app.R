# NCSKIT R Microservice
# Statistical Analysis and Topic Modeling Service

# Load required libraries
library(plumber)
library(jsonlite)
library(dplyr)
library(tm)
library(topicmodels)
library(wordcloud)
library(RColorBrewer)
library(ggplot2)
library(corrplot)
library(cluster)

# Enable CORS
options(plumber.cors = TRUE)

#* @apiTitle NCSKIT R Analytics Service
#* @apiDescription Statistical analysis and topic modeling for research data
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    service = "NCSKIT R Analytics",
    version = "1.0.0",
    timestamp = Sys.time()
  )
}

#* Topic modeling from research abstracts
#* @param abstracts:list List of research paper abstracts
#* @param num_topics:int Number of topics to extract (default: 5)
#* @post /analyze/topics
function(abstracts, num_topics = 5) {
  tryCatch({
    # Validate input
    if (is.null(abstracts) || length(abstracts) == 0) {
      return(list(error = "No abstracts provided"))
    }
    
    # Create corpus
    corpus <- Corpus(VectorSource(abstracts))
    
    # Text preprocessing
    corpus <- tm_map(corpus, content_transformer(tolower))
    corpus <- tm_map(corpus, removePunctuation)
    corpus <- tm_map(corpus, removeNumbers)
    corpus <- tm_map(corpus, removeWords, stopwords("english"))
    corpus <- tm_map(corpus, stripWhitespace)
    
    # Create document-term matrix
    dtm <- DocumentTermMatrix(corpus)
    
    # Remove empty documents
    dtm <- dtm[rowSums(as.matrix(dtm)) > 0, ]
    
    if (nrow(dtm) == 0) {
      return(list(error = "No valid documents after preprocessing"))
    }
    
    # Perform topic modeling
    lda_model <- LDA(dtm, k = as.numeric(num_topics), control = list(seed = 123))
    
    # Extract topics
    topics <- terms(lda_model, 10)
    topic_probs <- posterior(lda_model)$topics
    
    # Prepare results
    result <- list(
      topics = apply(topics, 2, function(x) list(terms = x)),
      document_topic_probabilities = topic_probs,
      num_documents = nrow(dtm),
      num_topics = as.numeric(num_topics),
      perplexity = perplexity(lda_model)
    )
    
    return(result)
    
  }, error = function(e) {
    return(list(error = paste("Topic modeling failed:", e$message)))
  })
}

#* Statistical analysis of research metrics
#* @param data:list Research metrics data (citations, impact factors, etc.)
#* @post /analyze/statistics
function(data) {
  tryCatch({
    # Convert to data frame
    df <- data.frame(data)
    
    # Basic statistics
    numeric_cols <- sapply(df, is.numeric)
    
    if (sum(numeric_cols) == 0) {
      return(list(error = "No numeric columns found"))
    }
    
    stats <- list()
    
    for (col in names(df)[numeric_cols]) {
      values <- df[[col]]
      values <- values[!is.na(values)]
      
      if (length(values) > 0) {
        stats[[col]] <- list(
          mean = mean(values),
          median = median(values),
          sd = sd(values),
          min = min(values),
          max = max(values),
          q25 = quantile(values, 0.25),
          q75 = quantile(values, 0.75),
          count = length(values)
        )
      }
    }
    
    # Correlation matrix if multiple numeric columns
    if (sum(numeric_cols) > 1) {
      cor_matrix <- cor(df[numeric_cols], use = "complete.obs")
      stats$correlations <- cor_matrix
    }
    
    return(stats)
    
  }, error = function(e) {
    return(list(error = paste("Statistical analysis failed:", e$message)))
  })
}

#* Research trend analysis
#* @param publications:list List of publications with years and metrics
#* @post /analyze/trends
function(publications) {
  tryCatch({
    # Convert to data frame
    df <- data.frame(publications)
    
    if (!"year" %in% names(df)) {
      return(list(error = "Year column is required"))
    }
    
    # Group by year and calculate metrics
    yearly_stats <- df %>%
      group_by(year) %>%
      summarise(
        count = n(),
        avg_citations = if("citations" %in% names(df)) mean(citations, na.rm = TRUE) else NA,
        total_citations = if("citations" %in% names(df)) sum(citations, na.rm = TRUE) else NA,
        .groups = 'drop'
      )
    
    # Calculate trends
    if (nrow(yearly_stats) > 1) {
      # Linear trend for publication count
      count_trend <- lm(count ~ year, data = yearly_stats)
      
      trends <- list(
        yearly_data = yearly_stats,
        publication_trend = list(
          slope = coef(count_trend)[2],
          r_squared = summary(count_trend)$r.squared,
          p_value = summary(count_trend)$coefficients[2, 4]
        )
      )
      
      # Citation trend if available
      if ("citations" %in% names(df) && sum(!is.na(yearly_stats$avg_citations)) > 1) {
        citation_trend <- lm(avg_citations ~ year, data = yearly_stats)
        trends$citation_trend <- list(
          slope = coef(citation_trend)[2],
          r_squared = summary(citation_trend)$r.squared,
          p_value = summary(citation_trend)$coefficients[2, 4]
        )
      }
      
      return(trends)
    } else {
      return(list(error = "Insufficient data for trend analysis"))
    }
    
  }, error = function(e) {
    return(list(error = paste("Trend analysis failed:", e$message)))
  })
}

#* Collaboration network analysis
#* @param collaborations:list List of author collaborations
#* @post /analyze/network
function(collaborations) {
  tryCatch({
    # Convert to data frame
    df <- data.frame(collaborations)
    
    if (!"author1" %in% names(df) || !"author2" %in% names(df)) {
      return(list(error = "author1 and author2 columns are required"))
    }
    
    # Create adjacency matrix
    authors <- unique(c(df$author1, df$author2))
    n_authors <- length(authors)
    
    # Basic network metrics
    network_stats <- list(
      total_authors = n_authors,
      total_collaborations = nrow(df),
      unique_pairs = nrow(unique(df[c("author1", "author2")])),
      density = (2 * nrow(df)) / (n_authors * (n_authors - 1))
    )
    
    # Author collaboration counts
    author_counts <- table(c(df$author1, df$author2))
    network_stats$top_collaborators <- head(sort(author_counts, decreasing = TRUE), 10)
    
    return(network_stats)
    
  }, error = function(e) {
    return(list(error = paste("Network analysis failed:", e$message)))
  })
}

#* Research domain clustering
#* @param keywords:list List of research keywords for each paper
#* @param num_clusters:int Number of clusters (default: 3)
#* @post /analyze/clustering
function(keywords, num_clusters = 3) {
  tryCatch({
    # Validate input
    if (is.null(keywords) || length(keywords) == 0) {
      return(list(error = "No keywords provided"))
    }
    
    # Create keyword frequency matrix
    all_keywords <- unique(unlist(keywords))
    
    # Create binary matrix (paper x keyword)
    keyword_matrix <- matrix(0, nrow = length(keywords), ncol = length(all_keywords))
    colnames(keyword_matrix) <- all_keywords
    
    for (i in 1:length(keywords)) {
      if (length(keywords[[i]]) > 0) {
        keyword_matrix[i, keywords[[i]]] <- 1
      }
    }
    
    # Remove empty rows and columns
    keyword_matrix <- keyword_matrix[rowSums(keyword_matrix) > 0, colSums(keyword_matrix) > 0]
    
    if (nrow(keyword_matrix) < as.numeric(num_clusters)) {
      return(list(error = "Not enough papers for clustering"))
    }
    
    # Perform k-means clustering
    clusters <- kmeans(keyword_matrix, centers = as.numeric(num_clusters), nstart = 25)
    
    # Analyze clusters
    cluster_analysis <- list()
    for (i in 1:as.numeric(num_clusters)) {
      cluster_papers <- which(clusters$cluster == i)
      cluster_keywords <- colMeans(keyword_matrix[cluster_papers, , drop = FALSE])
      top_keywords <- head(sort(cluster_keywords, decreasing = TRUE), 10)
      
      cluster_analysis[[paste0("cluster_", i)]] <- list(
        size = length(cluster_papers),
        papers = cluster_papers,
        top_keywords = names(top_keywords),
        keyword_scores = top_keywords
      )
    }
    
    result <- list(
      clusters = cluster_analysis,
      total_papers = nrow(keyword_matrix),
      num_clusters = as.numeric(num_clusters),
      within_ss = clusters$tot.withinss,
      between_ss = clusters$betweenss
    )
    
    return(result)
    
  }, error = function(e) {
    return(list(error = paste("Clustering analysis failed:", e$message)))
  })
}

#* Generate research recommendations
#* @param user_profile:list User research profile and interests
#* @param available_papers:list Available papers database
#* @post /recommend/papers
function(user_profile, available_papers) {
  tryCatch({
    # Simple recommendation based on keyword matching
    user_keywords <- tolower(unlist(user_profile$research_domains))
    
    if (length(user_keywords) == 0) {
      return(list(error = "No research domains specified"))
    }
    
    # Score papers based on keyword overlap
    paper_scores <- sapply(available_papers, function(paper) {
      paper_keywords <- tolower(unlist(paper$keywords))
      overlap <- length(intersect(user_keywords, paper_keywords))
      return(overlap / length(union(user_keywords, paper_keywords)))
    })
    
    # Get top recommendations
    top_indices <- head(order(paper_scores, decreasing = TRUE), 10)
    recommendations <- available_papers[top_indices]
    
    # Add scores
    for (i in 1:length(recommendations)) {
      recommendations[[i]]$relevance_score <- paper_scores[top_indices[i]]
    }
    
    return(list(
      recommendations = recommendations,
      total_papers = length(available_papers),
      user_domains = user_keywords
    ))
    
  }, error = function(e) {
    return(list(error = paste("Recommendation failed:", e$message)))
  })
}