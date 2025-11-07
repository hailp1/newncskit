# Sentiment Analysis Module
library(tm)
library(sentimentr)

analyze_sentiment <- function(text) {
  start_time <- Sys.time()
  
  # Clean text
  text_clean <- gsub("[^[:alnum:][:space:]]", "", text)
  text_clean <- tolower(text_clean)
  
  # Perform sentiment analysis using sentimentr
  sentiment_result <- sentiment(text_clean)
  
  # Calculate overall sentiment score
  avg_sentiment <- mean(sentiment_result$sentiment, na.rm = TRUE)
  
  # Determine label based on score
  label <- if (avg_sentiment > 0.05) {
    "positive"
  } else if (avg_sentiment < -0.05) {
    "negative"
  } else {
    "neutral"
  }
  
  # Calculate confidence (normalized absolute value)
  confidence <- min(abs(avg_sentiment) * 2, 1.0)
  
  end_time <- Sys.time()
  processing_time <- as.numeric(difftime(end_time, start_time, units = "secs"))
  
  list(
    score = round(avg_sentiment, 4),
    label = label,
    confidence = round(confidence, 4),
    sentenceCount = nrow(sentiment_result),
    processingTime = round(processing_time, 3)
  )
}
