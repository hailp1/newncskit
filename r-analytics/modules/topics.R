# Topic Modeling Module
library(tm)
library(topicmodels)

extract_topics <- function(texts, n_topics = 5) {
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
  dtm <- removeSparseTerms(dtm, 0.98)
  
  # Remove empty documents
  row_sums <- apply(dtm, 1, sum)
  dtm <- dtm[row_sums > 0, ]
  
  # Adjust n_topics if necessary
  actual_topics <- min(n_topics, nrow(dtm), ncol(dtm))
  
  if (nrow(dtm) > 0 && ncol(dtm) > 0 && actual_topics > 0) {
    # Perform LDA topic modeling
    lda_model <- LDA(dtm, k = actual_topics, control = list(seed = 1234))
    
    # Extract top terms for each topic
    topics_terms <- terms(lda_model, 10)
    
    # Get topic probabilities for documents
    doc_topics <- posterior(lda_model)$topics
    
    # Organize results
    topics_list <- lapply(1:actual_topics, function(i) {
      # Get top words for this topic
      top_words <- topics_terms[, i]
      
      # Get word weights from beta matrix
      topic_beta <- posterior(lda_model)$terms[i, ]
      word_weights <- topic_beta[top_words]
      
      words_list <- lapply(1:length(top_words), function(j) {
        list(
          word = top_words[j],
          weight = round(word_weights[j], 4)
        )
      })
      
      # Get documents most associated with this topic
      doc_probs <- doc_topics[, i]
      top_docs <- order(doc_probs, decreasing = TRUE)[1:min(5, length(doc_probs))]
      
      list(
        id = i,
        words = words_list,
        documents = top_docs - 1  # Convert to 0-indexed
      )
    })
  } else {
    # Fallback: simple word frequency
    topics_list <- list(
      list(
        id = 1,
        words = list(list(word = "insufficient", weight = 1.0)),
        documents = c(0)
      )
    )
  }
  
  end_time <- Sys.time()
  processing_time <- as.numeric(difftime(end_time, start_time, units = "secs"))
  
  list(
    topics = topics_list,
    nTopics = length(topics_list),
    processingTime = round(processing_time, 3)
  )
}
