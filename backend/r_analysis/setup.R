# NCSKIT R Analysis Server Setup
# Install required R packages for statistical analysis

# List of required packages
required_packages <- c(
  "plumber",        # API framework
  "jsonlite",       # JSON handling
  "later",          # Scheduled execution
  "readr",          # Data reading
  "dplyr",          # Data manipulation
  "psych",          # Psychological statistics
  "lavaan",         # Latent variable analysis
  "semTools",       # SEM tools
  "car",            # Companion to Applied Regression
  "mediation",      # Mediation analysis
  "corrplot",       # Correlation plots
  "ggplot2",        # Graphics
  "gridExtra",      # Grid graphics
  "openxlsx",       # Excel files
  "VIM",            # Visualization and Imputation of Missing values
  "mice",           # Multiple imputation
  "Hmisc",          # Harrell Miscellaneous
  "GPArotation",    # Factor rotation
  "nFactors"        # Factor analysis
)

# Function to install packages if not already installed
install_if_missing <- function(packages) {
  for (package in packages) {
    if (!require(package, character.only = TRUE)) {
      cat(paste("Installing", package, "...\n"))
      install.packages(package, dependencies = TRUE)
      
      if (!require(package, character.only = TRUE)) {
        cat(paste("Failed to install", package, "\n"))
      } else {
        cat(paste("Successfully installed", package, "\n"))
      }
    } else {
      cat(paste(package, "is already installed\n"))
    }
  }
}

# Install packages
cat("Setting up NCSKIT R Analysis Server...\n")
cat("Installing required packages...\n\n")

install_if_missing(required_packages)

cat("\n=== Setup Complete ===\n")
cat("All required packages have been installed.\n")
cat("You can now start the analysis server with:\n")
cat("Rscript -e \"plumber::plumb('analysis_server.R')$run(host='0.0.0.0', port=8000)\"\n")