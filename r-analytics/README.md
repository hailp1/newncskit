# R Analytics Service

Statistical analysis service for NCSKIT platform using R and Plumber.

## Features

- Sentiment Analysis
- Clustering (K-means)
- Topic Modeling
- Health Check endpoint

## Quick Start

### Using Docker (Recommended)

```bash
# Build and start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Manual Setup

```bash
# Install R packages
R -e "install.packages(c('plumber', 'jsonlite'), repos='https://cloud.r-project.org/')"

# Run the service
R -e "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"
```

## API Endpoints

### Health Check
```
GET /health
```

### Sentiment Analysis
```
POST /analyze/sentiment
Body: {
  "data": [...],
  "text_column": "text"
}
```

### Clustering
```
POST /analyze/cluster
Body: {
  "data": [...],
  "n_clusters": 3,
  "columns": ["col1", "col2"]
}
```

### Topic Modeling
```
POST /analyze/topics
Body: {
  "data": [...],
  "text_column": "text",
  "n_topics": 5
}
```

## Development

The service is organized as follows:

```
r-analytics/
├── api.R              # Main Plumber API
├── modules/
│   ├── sentiment.R    # Sentiment analysis
│   ├── clustering.R   # Clustering analysis
│   └── topics.R       # Topic modeling
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test sentiment analysis
curl -X POST http://localhost:8000/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"data": [{"text": "This is great!"}], "text_column": "text"}'
```
