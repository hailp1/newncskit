# R Analytics Service API
# Plumber API for statistical analysis

library(plumber)

#* @apiTitle NCSKIT R Analytics Service
#* @apiDescription Statistical analysis service for NCSKIT platform
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /health
#* @serializer json
function() {
  list(
    status = "healthy",
    service = "R Analytics Service",
    version = "1.0.0",
    timestamp = Sys.time()
  )
}

#* Echo test endpoint
#* @post /echo
#* @param data:object Input data to echo back
#* @serializer json
function(data) {
  list(
    success = TRUE,
    echo = data,
    timestamp = Sys.time()
  )
}

# Load analysis modules
source("modules/sentiment.R")
source("modules/clustering.R")
source("modules/topics.R")

#* Sentiment analysis endpoint
#* @post /analyze/sentiment
#* @param data:object Data frame with text column
#* @param text_column:character Name of text column (default: "text")
#* @serializer json
function(data, text_column = "text") {
  tryCatch({
    df <- as.data.frame(data)
    result <- analyze_sentiment(df, text_column)
    result
  }, error = function(e) {
    list(
      success = FALSE,
      error = as.character(e$message)
    )
  })
}

#* Clustering analysis endpoint
#* @post /analyze/cluster
#* @param data:object Data frame with numeric columns
#* @param n_clusters:int Number of clusters (default: 3)
#* @param columns:list Columns to use for clustering
#* @serializer json
function(data, n_clusters = 3, columns = NULL) {
  tryCatch({
    df <- as.data.frame(data)
    result <- perform_clustering(df, n_clusters, columns)
    result
  }, error = function(e) {
    list(
      success = FALSE,
      error = as.character(e$message)
    )
  })
}

#* Topic modeling endpoint
#* @post /analyze/topics
#* @param data:object Data frame with text column
#* @param text_column:character Name of text column (default: "text")
#* @param n_topics:int Number of topics (default: 5)
#* @serializer json
function(data, text_column = "text", n_topics = 5) {
  tryCatch({
    df <- as.data.frame(data)
    result <- perform_topic_modeling(df, text_column, n_topics)
    result
  }, error = function(e) {
    list(
      success = FALSE,
      error = as.character(e$message)
    )
  })
}
