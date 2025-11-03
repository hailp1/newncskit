# NCSKIT R Analytics Microservice

A specialized R-based microservice for statistical analysis, topic modeling, and research analytics within the NCSKIT research management platform.

## 🚀 Features

- **Topic Modeling**: Extract research topics from abstracts using LDA
- **Statistical Analysis**: Comprehensive statistical analysis of research metrics
- **Trend Analysis**: Analyze research publication and citation trends over time
- **Network Analysis**: Collaboration network analysis between researchers
- **Clustering**: Research domain clustering based on keywords
- **Recommendations**: AI-powered paper recommendations based on user profiles

## 📋 Prerequisites

- R (version 4.0 or higher)
- Required R packages (automatically installed)

## 🛠 Installation

1. **Install R packages**:
   ```bash
   Rscript install_packages.R
   ```

2. **Run the service**:
   ```bash
   Rscript run_service.R
   ```

The service will start on `http://localhost:8001`

## 📖 API Documentation

Once running, visit `http://localhost:8001/__docs__/` for interactive API documentation.

### Available Endpoints

#### Health Check
```
GET /health
```

#### Topic Modeling
```
POST /analyze/topics
{
  "abstracts": ["abstract1", "abstract2", ...],
  "num_topics": 5
}
```

#### Statistical Analysis
```
POST /analyze/statistics
{
  "data": {
    "citations": [10, 25, 5, 30],
    "impact_factor": [2.5, 3.1, 1.8, 4.2]
  }
}
```

#### Trend Analysis
```
POST /analyze/trends
{
  "publications": [
    {"year": 2020, "citations": 10},
    {"year": 2021, "citations": 25},
    ...
  ]
}
```

#### Network Analysis
```
POST /analyze/network
{
  "collaborations": [
    {"author1": "John Doe", "author2": "Jane Smith"},
    ...
  ]
}
```

#### Clustering Analysis
```
POST /analyze/clustering
{
  "keywords": [
    ["machine learning", "AI"],
    ["deep learning", "neural networks"],
    ...
  ],
  "num_clusters": 3
}
```

#### Paper Recommendations
```
POST /recommend/papers
{
  "user_profile": {
    "research_domains": ["machine learning", "healthcare"]
  },
  "available_papers": [
    {
      "title": "Paper Title",
      "keywords": ["ML", "health"],
      "abstract": "..."
    },
    ...
  ]
}
```

## 🔧 Configuration

The service runs on port 8001 by default. To change the port, modify the `run_service.R` file:

```r
api$run(host = "0.0.0.0", port = YOUR_PORT)
```

## 🐳 Docker Support

Create a Dockerfile for containerized deployment:

```dockerfile
FROM r-base:4.3.0

WORKDIR /app

COPY install_packages.R .
RUN Rscript install_packages.R

COPY . .

EXPOSE 8001

CMD ["Rscript", "run_service.R"]
```

## 🔗 Integration

This R service integrates with the NCSKIT Django backend through HTTP API calls. The Django backend can call these endpoints to perform advanced analytics and provide AI-powered insights to users.

## 📊 Example Usage

### Topic Modeling Example
```r
# Call from Django backend
import requests

response = requests.post('http://localhost:8001/analyze/topics', json={
    'abstracts': [
        'Machine learning applications in healthcare...',
        'Deep learning for medical image analysis...',
        'AI-powered diagnostic systems...'
    ],
    'num_topics': 3
})

topics = response.json()
```

## 🧪 Testing

Test the service endpoints using curl or any HTTP client:

```bash
# Health check
curl http://localhost:8001/health

# Topic modeling
curl -X POST http://localhost:8001/analyze/topics \
  -H "Content-Type: application/json" \
  -d '{"abstracts": ["sample abstract"], "num_topics": 2}'
```

## 📝 Logging

The service logs all requests and errors. Check the R console output for debugging information.

## 🤝 Contributing

This microservice is part of the larger NCSKIT platform. For contributions, please follow the main project guidelines.