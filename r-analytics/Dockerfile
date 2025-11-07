FROM rocker/r-ver:4.3.2

# Metadata
LABEL maintainer="NCSKIT Team"
LABEL description="R Analytics Module for Quantitative Research Analysis"
LABEL version="2.0.0"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libpq-dev \
    libgsl-dev \
    libgmp3-dev \
    libmpfr-dev \
    libglpk-dev \
    libgfortran5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install R packages for statistical analysis
RUN R -e "install.packages(c( \
    # API Framework
    'plumber', \
    'jsonlite', \
    # Data Manipulation
    'dplyr', \
    'tidyr', \
    'reshape2', \
    # Descriptive Statistics
    'psych', \
    'moments', \
    'Hmisc', \
    # Hypothesis Testing
    'car', \
    'effsize', \
    'multcomp', \
    # Factor Analysis
    'GPArotation', \
    'lavaan', \
    'semTools', \
    'semPlot', \
    # Regression
    'lme4', \
    'lmerTest', \
    'broom', \
    'MASS', \
    # Advanced Analysis
    'mediation', \
    'interactions', \
    'boot', \
    'pwr' \
  ), repos='https://cran.rstudio.com/', dependencies=TRUE)"

# Create app directory
WORKDIR /app

# Copy R scripts
COPY api.R /app/
COPY endpoints/ /app/endpoints/

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV R_MAX_MEMORY=8G
ENV R_MAX_CORES=4
ENV TZ=UTC

# Run plumber API
CMD ["R", "-e", "options(warn=-1); pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000, swagger=TRUE)"]
