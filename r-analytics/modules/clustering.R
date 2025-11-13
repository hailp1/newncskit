# Clustering Analysis Module

#' Perform k-means clustering
#' @param data Data frame with numeric columns
#' @param n_clusters Number of clusters
#' @param columns Columns to use for clustering
#' @return List with clustering results
perform_clustering <- function(data, n_clusters = 3, columns = NULL) {
  # Select numeric columns if not specified
  if (is.null(columns)) {
    columns <- names(data)[sapply(data, is.numeric)]
  }
  
  if (length(columns) == 0) {
    stop("No numeric columns found for clustering")
  }
  
  # Prepare data
  cluster_data <- data[, columns, drop = FALSE]
  cluster_data <- na.omit(cluster_data)
  
  if (nrow(cluster_data) < n_clusters) {
    stop("Not enough data points for clustering")
  }
  
  # Perform k-means clustering
  set.seed(123)
  kmeans_result <- kmeans(cluster_data, centers = n_clusters, nstart = 25)
  
  # Prepare results
  results <- data.frame(
    cluster = kmeans_result$cluster,
    cluster_data
  )
  
  # Cluster centers
  centers <- as.data.frame(kmeans_result$centers)
  centers$cluster <- 1:n_clusters
  
  # Cluster sizes
  sizes <- as.data.frame(table(kmeans_result$cluster))
  names(sizes) <- c("cluster", "size")
  
  list(
    success = TRUE,
    results = results,
    centers = centers,
    sizes = sizes,
    total_ss = kmeans_result$totss,
    within_ss = kmeans_result$tot.withinss,
    between_ss = kmeans_result$betweenss,
    method = "kmeans"
  )
}
