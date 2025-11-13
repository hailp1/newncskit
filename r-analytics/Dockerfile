# R Analytics Service Dockerfile
FROM r-base:4.3.2

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('plumber', 'jsonlite'), repos='https://cloud.r-project.org/')"

# Create app directory
WORKDIR /app

# Copy R scripts
COPY api.R /app/
COPY modules/ /app/modules/

# Expose port
EXPOSE 8000

# Run the API
CMD ["R", "-e", "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"]
