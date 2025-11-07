# Text Clustering Module
library(tm)
library(text2vec)
library(cluster)

cluster_texts <- function(texts, n_clusters = 5) {
  start_time <- Sys.time()
  
  # Create corpus
  corpus <- Corpus(VectorSource(texts))
  
  # Text preprocessing
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, removeNumbers)
  corpus <- tm_map(corpus, removeWords, stopwords("english"))
  corpus <- tm_map(corpus, stripWhitespace)
  
  # Create document-term matrix
  dtm <- DocumentTermMatrix(corpus)
  
  # Remove sparse terms
  dtm <- removeSparseTerms(dtm, 0.99)
  
  # Convert to matrix
  dtm_matrix <- as.matrix(dtm)
  
  # Handle case where we have fewer documents than clusters
  actual_clusters <- min(n_clusters, nrow(dtm_matrix) - 1)
  
  # Perform k-means clustering
  if (nrow(dtm_matrix) >= actual_clusters) {
    kmeans_result <- kmeans(dtm_matrix, centers = actual_clusters, nstart = 25)
    
    # Calculate silhouette score
    if (nrow(dtm_matrix) > actual_clusters) {
      dist_matrix <- dist(dtm_matrix)
      sil <- silhouette(kmeans_result$cluster, dist_matrix)
      silhouette_score <- mean(sil[, 3])
    } else {
      silhouette_score <- 0
    }
    
    # Organize results by cluster
    clusters_list <- lapply(1:actual_clusters, function(i) {
      cluster_indices <- which(kmeans_result$cluster == i)
      list(
        id = i,
        texts = texts[cluster_indices],
        size = length(cluster_indices),
        centroid = as.vector(kmeans_result$centers[i, ])
      )
    })
  } else {
    # Fallback: each text is its own cluster
    clusters_list <- lapply(1:length(texts), function(i) {
      list(
        id = i,
        texts = texts[i],
        size = 1,
        centroid = as.vector(dtm_matrix[i, ])
      )
    })
    silhouette_score <- 0
  }
  
  end_time <- Sys.time()
  processing_time <- as.numeric(difftime(end_time, start_time, units = "secs"))
  
  list(
    clusters = clusters_list,
    silhouetteScore = round(silhouette_score, 4),
    nClusters = length(clusters_list),
    processingTime = round(processing_time, 3)
  )
}
