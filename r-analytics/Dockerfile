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
    libsodium-dev \
    libnlopt-dev \
    libpng-dev \
    cmake \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install R packages for statistical analysis
# Split into smaller groups to avoid timeout and better error tracking
RUN R -e "install.packages(c('plumber', 'jsonlite'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('dplyr', 'tidyr', 'reshape2'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('psych', 'moments', 'Hmisc'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('car', 'effsize', 'multcomp'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('GPArotation', 'lavaan', 'semTools', 'semPlot'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('lme4', 'lmerTest', 'broom', 'MASS'), repos='https://cran.rstudio.com/', dependencies=TRUE)"
RUN R -e "install.packages(c('mediation', 'interactions', 'boot', 'pwr'), repos='https://cran.rstudio.com/', dependencies=TRUE)"

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
