# Run NCSKIT R Microservice
library(plumber)

# Load the API
api <- plumb("app.R")

# Configure CORS
api$filter("cors", function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
})

# Print startup message
cat("🚀 Starting NCSKIT R Analytics Service...\n")
cat("📊 Available endpoints:\n")
cat("   GET  /health - Health check\n")
cat("   POST /analyze/topics - Topic modeling\n")
cat("   POST /analyze/statistics - Statistical analysis\n")
cat("   POST /analyze/trends - Research trend analysis\n")
cat("   POST /analyze/network - Collaboration network analysis\n")
cat("   POST /analyze/clustering - Research domain clustering\n")
cat("   POST /recommend/papers - Paper recommendations\n")
cat("\n")
cat("🌐 Service running on: http://localhost:8001\n")
cat("📖 API docs available at: http://localhost:8001/__docs__/\n")

# Run the API
api$run(host = "0.0.0.0", port = 8001)