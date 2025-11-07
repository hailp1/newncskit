# NCSKIT R Analytics Module

Comprehensive statistical analysis API for quantitative research, providing advanced analytics capabilities including descriptive statistics, hypothesis testing, factor analysis, regression, and structural equation modeling.

## Features

### 1. Data Health Check
- Comprehensive data quality assessment
- Missing value analysis and patterns
- Outlier detection (IQR, Z-score, MAD methods)
- Normality testing (Shapiro-Wilk, Kolmogorov-Smirnov)
- Data quality scoring

### 2. Descriptive Statistics
- Mean, median, standard deviation, quartiles
- Skewness and kurtosis
- Correlation matrices (Pearson, Spearman, Kendall)
- Frequency distributions

### 3. Hypothesis Testing
- **T-Tests**: Independent samples, Paired samples
- **ANOVA**: One-way, Two-way, Repeated measures
- **Chi-Square**: Test of independence
- Effect sizes (Cohen's d, Eta-squared, Cramér's V)
- Post-hoc tests (Tukey HSD, Bonferroni)

### 4. Factor Analysis
- **EFA** (Exploratory Factor Analysis)
  - KMO and Bartlett's tests
  - Parallel analysis for factor determination
  - Multiple rotation methods
- **CFA** (Confirmatory Factor Analysis)
  - Comprehensive fit indices
  - Cronbach's Alpha
  - Composite Reliability

### 5. Regression Analysis
- **Linear Regression** with diagnostics
  - VIF (Variance Inflation Factor)
  - Durbin-Watson test
  - Breusch-Pagan test
- **Logistic Regression**
  - Odds ratios with confidence intervals
  - Classification metrics
- **Multilevel/Hierarchical Models**
  - ICC calculation
  - Random effects

### 6. Structural Equation Modeling (SEM)
- Full SEM with fit indices (CFI, TLI, RMSEA, SRMR)
- Mediation analysis with bootstrap
- Path analysis
- Direct, indirect, and total effects

## Project Structure

```
r-analytics/
├── api.R                           # Main API entry point
├── endpoints/
│   ├── data-health.R              # Data quality checks
│   ├── descriptive-stats.R        # Descriptive statistics
│   ├── hypothesis-tests.R         # T-tests, ANOVA, Chi-square
│   ├── factor-analysis.R          # EFA, CFA
│   ├── regression.R               # Linear, Logistic, Multilevel
│   └── sem.R                      # SEM, Mediation
├── Dockerfile                      # Docker image configuration
├── docker-compose.yml             # Docker Compose setup
├── .dockerignore
├── .gitignore
└── README.md
```

## API Endpoints

### Health & Data Management

#### Health Check
```
GET /health
```
Returns service status and uptime.

#### Upload Data
```
POST /data/upload?project_id={id}
Content-Type: application/json

{
  "data": [
    {"var1": 1, "var2": 2},
    {"var1": 3, "var2": 4}
  ]
}
```

#### Get Data Preview
```
GET /data/preview/{project_id}
```

### Data Health Check

#### Comprehensive Health Check
```
POST /analysis/health-check?project_id={id}
Content-Type: application/json

{
  "variables": ["var1", "var2"]  // optional
}
```

Returns:
- Missing values analysis
- Outlier detection
- Data types
- Quality score (0-100)
- Normality tests
- Duplicate detection

#### Missing Patterns
```
POST /analysis/missing-patterns?project_id={id}
```

#### Outlier Detection
```
POST /analysis/outliers?project_id={id}
Content-Type: application/json

{
  "variable": "score",
  "methods": ["iqr", "zscore", "mad"]
}
```

#### Normality Test
```
POST /analysis/normality?project_id={id}
Content-Type: application/json

{
  "variables": ["var1", "var2"]
}
```

### Descriptive Statistics

#### Descriptive Stats
```
POST /analysis/descriptive?project_id={id}
Content-Type: application/json

{
  "variables": ["var1", "var2"]  // optional
}
```

#### Correlation Matrix
```
POST /analysis/correlation?project_id={id}
Content-Type: application/json

{
  "variables": ["var1", "var2"],
  "method": "pearson"  // pearson, spearman, kendall
}
```

### Hypothesis Tests

#### Independent T-Test
```
POST /analysis/ttest-independent?project_id={id}
Content-Type: application/json

{
  "dependent_var": "score",
  "group_var": "group",
  "var_equal": false,
  "alternative": "two.sided"
}
```

#### Paired T-Test
```
POST /analysis/ttest-paired?project_id={id}
Content-Type: application/json

{
  "var1": "pre_test",
  "var2": "post_test",
  "alternative": "two.sided"
}
```

#### One-Way ANOVA
```
POST /analysis/anova-oneway?project_id={id}
Content-Type: application/json

{
  "dependent_var": "score",
  "group_var": "treatment",
  "post_hoc": true
}
```

#### Two-Way ANOVA
```
POST /analysis/anova-twoway?project_id={id}
Content-Type: application/json

{
  "dependent_var": "score",
  "factor1": "treatment",
  "factor2": "gender"
}
```

#### Chi-Square Test
```
POST /analysis/chisquare?project_id={id}
Content-Type: application/json

{
  "var1": "category1",
  "var2": "category2"
}
```

### Factor Analysis

#### EFA
```
POST /analysis/efa?project_id={id}
Content-Type: application/json

{
  "variables": ["item1", "item2", "item3"],
  "n_factors": 2,  // optional, auto-determined if null
  "rotation": "varimax"
}
```

Returns:
- Factor loadings
- Communalities
- KMO test
- Bartlett's test
- Fit indices

#### CFA
```
POST /analysis/cfa?project_id={id}
Content-Type: application/json

{
  "model_syntax": "Factor1 =~ item1 + item2 + item3\nFactor2 =~ item4 + item5"
}
```

Returns:
- Fit indices (CFI, TLI, RMSEA, SRMR)
- Factor loadings
- Cronbach's Alpha
- Composite Reliability

### Regression Analysis

#### Linear Regression
```
POST /analysis/regression-linear?project_id={id}
Content-Type: application/json

{
  "formula": "y ~ x1 + x2 + x3",
  "robust": false
}
```

Returns:
- Coefficients with p-values
- R², Adjusted R²
- VIF values
- Diagnostic tests

#### Logistic Regression
```
POST /analysis/regression-logistic?project_id={id}
Content-Type: application/json

{
  "formula": "outcome ~ predictor1 + predictor2"
}
```

Returns:
- Coefficients and odds ratios
- Pseudo R²
- Classification metrics
- Hosmer-Lemeshow test

#### Multilevel Regression
```
POST /analysis/regression-multilevel?project_id={id}
Content-Type: application/json

{
  "formula": "outcome ~ predictor + (1 | group)",
  "group_var": "group"
}
```

### Structural Equation Modeling

#### SEM
```
POST /analysis/sem?project_id={id}
Content-Type: application/json

{
  "model_syntax": "# Measurement model\nF1 =~ x1 + x2\n# Structural model\nY ~ F1",
  "estimator": "ML"
}
```

Returns:
- Comprehensive fit indices
- Parameter estimates
- R² for endogenous variables
- Modification indices

#### Mediation Analysis
```
POST /analysis/mediation?project_id={id}
Content-Type: application/json

{
  "x": "independent",
  "m": "mediator",
  "y": "dependent",
  "covariates": ["control1", "control2"]
}
```

Returns:
- Direct effect
- Indirect effect (with bootstrap CI)
- Total effect
- Path coefficients

## Running the Service

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker

```bash
# Build image
docker build -t ncskit-r-analytics .

# Run container
docker run -d \
  --name ncskit-r-analytics \
  -p 8000:8000 \
  -e R_MAX_MEMORY=8G \
  -e R_MAX_CORES=4 \
  ncskit-r-analytics
```

### Manual Run (Development)

```bash
# Install R and required packages
R -e "install.packages('plumber')"

# Run API
R -e "pr <- plumber::plumb('api.R'); pr$run(host='0.0.0.0', port=8000)"
```

## Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Test Analysis Endpoint
```bash
curl -X POST http://localhost:8000/analysis/descriptive?project_id=test \
  -H "Content-Type: application/json" \
  -d '{"variables": ["var1", "var2"]}'
```

## Configuration

### Environment Variables

- `R_MAX_MEMORY`: Maximum memory allocation (default: 8G)
- `R_MAX_CORES`: Maximum CPU cores (default: 4)
- `TZ`: Timezone (default: UTC)
- `LOG_LEVEL`: Logging level (default: INFO)

### Resource Limits

Docker Compose configuration includes:
- CPU limit: 4 cores
- Memory limit: 8GB
- CPU reservation: 2 cores
- Memory reservation: 2GB

## Dependencies

### R Packages

- **API**: plumber, jsonlite
- **Data**: dplyr, tidyr, reshape2
- **Statistics**: psych, moments, Hmisc, car, effsize, multcomp
- **Factor Analysis**: GPArotation, lavaan, semTools, semPlot
- **Regression**: lme4, lmerTest, broom, MASS
- **Advanced**: mediation, interactions, boot, pwr

## API Documentation

Interactive API documentation (Swagger UI) is available at:
```
http://localhost:8000/__docs__/
```

## Error Handling

All endpoints return standardized responses:

**Success:**
```json
{
  "success": true,
  "results": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Performance Considerations

- Data is stored in memory per project_id
- Large datasets (>100k rows) may require increased memory limits
- Bootstrap methods (mediation, SEM) can be time-intensive
- Consider caching results for repeated analyses

## Security

- No authentication implemented (add API key validation in production)
- CORS enabled for all origins (restrict in production)
- Input validation on all endpoints
- No persistent data storage (integrate with database for production)

## Troubleshooting

### Container won't start
- Check Docker logs: `docker-compose logs r-analytics`
- Verify port 8000 is available
- Ensure sufficient system resources

### Analysis fails
- Verify data format and types
- Check for missing values
- Ensure sufficient sample size
- Review error message in response

### Out of memory
- Increase `R_MAX_MEMORY` environment variable
- Increase Docker memory limits
- Reduce dataset size or use sampling

## Support

For issues or questions:
- Check logs: `docker-compose logs r-analytics`
- Review API documentation: `http://localhost:8000/__docs__/`
- Contact: NCSKIT Team

## Version

Current version: 2.0.0

## License

[Your License Here]
