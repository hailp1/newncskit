# Install required R packages for NCSKIT Analytics Service

cat("📦 Installing R packages for NCSKIT Analytics Service...\n\n")

# Set CRAN mirror
options(repos = c(CRAN = "https://cran.rstudio.com/"))

# Create user library directory if it doesn't exist
user_lib <- Sys.getenv("R_LIBS_USER")
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}

# List of required packages
packages <- c(
  "plumber",      # API framework
  "jsonlite",     # JSON handling
  "dplyr",        # Data manipulation
  "tm",           # Text mining
  "topicmodels",  # Topic modeling
  "wordcloud",    # Word clouds
  "RColorBrewer", # Color palettes
  "ggplot2",      # Plotting
  "corrplot",     # Correlation plots
  "cluster"       # Clustering algorithms
)

# Function to install packages if not already installed
install_if_missing <- function(package) {
  if (!require(package, character.only = TRUE, quietly = TRUE)) {
    cat(paste("Installing", package, "...\n"))
    # Install to user library to avoid permission issues
    install.packages(package, dependencies = TRUE, lib = user_lib, repos = "https://cran.rstudio.com/")
    library(package, character.only = TRUE, lib.loc = user_lib)
    cat(paste("✅", package, "installed successfully\n"))
  } else {
    cat(paste("✅", package, "already installed\n"))
  }
}

# Install all packages
for (package in packages) {
  install_if_missing(package)
}

cat("\n🎉 All packages installed successfully!\n")
cat("You can now run the R service with: Rscript run_service.R\n")