# PowerShell script to test R Analytics API endpoints
# Usage: .\test-endpoints.ps1

$BASE_URL = "http://localhost:8000"
$PROJECT_ID = "test_project"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "NCSKIT R Analytics API Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/10] Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    Write-Host "✓ Health Check: $($response.status)" -ForegroundColor Green
    Write-Host "  Version: $($response.version)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Upload Sample Data
Write-Host "[2/10] Uploading Sample Data..." -ForegroundColor Yellow
$sampleData = @{
    data = @(
        @{ id = 1; group = "A"; score = 85; pre_test = 70; post_test = 85; gender = "M"; treatment = "T1" }
        @{ id = 2; group = "A"; score = 90; pre_test = 75; post_test = 88; gender = "F"; treatment = "T1" }
        @{ id = 3; group = "B"; score = 75; pre_test = 65; post_test = 78; gender = "M"; treatment = "T2" }
        @{ id = 4; group = "B"; score = 80; pre_test = 70; post_test = 82; gender = "F"; treatment = "T2" }
        @{ id = 5; group = "A"; score = 88; pre_test = 72; post_test = 87; gender = "M"; treatment = "T1" }
        @{ id = 6; group = "B"; score = 78; pre_test = 68; post_test = 80; gender = "F"; treatment = "T2" }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/data/upload?project_id=$PROJECT_ID" -Method Post -Body $sampleData -ContentType "application/json"
    Write-Host "✓ Data Upload: $($response.message)" -ForegroundColor Green
    Write-Host "  Rows: $($response.summary.n_rows), Columns: $($response.summary.n_cols)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Data Upload Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Data Health Check
Write-Host "[3/10] Testing Data Health Check..." -ForegroundColor Yellow
$healthCheckData = @{
    variables = @("score", "pre_test", "post_test")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/health-check?project_id=$PROJECT_ID" -Method Post -Body $healthCheckData -ContentType "application/json"
    Write-Host "✓ Health Check Complete" -ForegroundColor Green
    Write-Host "  Quality Score: $($response.results.quality_score)/100" -ForegroundColor Gray
    Write-Host "  Missing Data: $($response.results.missing_values.missing_count -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Descriptive Statistics
Write-Host "[4/10] Testing Descriptive Statistics..." -ForegroundColor Yellow
$descriptiveData = @{
    variables = @("score", "pre_test", "post_test")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/descriptive?project_id=$PROJECT_ID" -Method Post -Body $descriptiveData -ContentType "application/json"
    Write-Host "✓ Descriptive Statistics Complete" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Descriptive Statistics Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Correlation Analysis
Write-Host "[5/10] Testing Correlation Analysis..." -ForegroundColor Yellow
$correlationData = @{
    variables = @("score", "pre_test", "post_test")
    method = "pearson"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/correlation?project_id=$PROJECT_ID" -Method Post -Body $correlationData -ContentType "application/json"
    Write-Host "✓ Correlation Analysis Complete" -ForegroundColor Green
    Write-Host "  Method: $($response.results.method)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Correlation Analysis Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Independent T-Test
Write-Host "[6/10] Testing Independent T-Test..." -ForegroundColor Yellow
$ttestData = @{
    dependent_var = "score"
    group_var = "group"
    var_equal = $false
    alternative = "two.sided"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/ttest-independent?project_id=$PROJECT_ID" -Method Post -Body $ttestData -ContentType "application/json"
    Write-Host "✓ Independent T-Test Complete" -ForegroundColor Green
    Write-Host "  t-statistic: $($response.results.statistic)" -ForegroundColor Gray
    Write-Host "  p-value: $($response.results.p_value)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Independent T-Test Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Paired T-Test
Write-Host "[7/10] Testing Paired T-Test..." -ForegroundColor Yellow
$pairedData = @{
    var1 = "pre_test"
    var2 = "post_test"
    alternative = "two.sided"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/ttest-paired?project_id=$PROJECT_ID" -Method Post -Body $pairedData -ContentType "application/json"
    Write-Host "✓ Paired T-Test Complete" -ForegroundColor Green
    Write-Host "  t-statistic: $($response.results.statistic)" -ForegroundColor Gray
    Write-Host "  p-value: $($response.results.p_value)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Paired T-Test Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 8: One-Way ANOVA
Write-Host "[8/10] Testing One-Way ANOVA..." -ForegroundColor Yellow
$anovaData = @{
    dependent_var = "score"
    group_var = "treatment"
    post_hoc = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/anova-oneway?project_id=$PROJECT_ID" -Method Post -Body $anovaData -ContentType "application/json"
    Write-Host "✓ One-Way ANOVA Complete" -ForegroundColor Green
    Write-Host "  F-statistic: $($response.results.f_statistic)" -ForegroundColor Gray
    Write-Host "  p-value: $($response.results.p_value)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ One-Way ANOVA Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 9: Linear Regression
Write-Host "[9/10] Testing Linear Regression..." -ForegroundColor Yellow
$regressionData = @{
    formula = "score ~ pre_test + post_test"
    robust = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/analysis/regression-linear?project_id=$PROJECT_ID" -Method Post -Body $regressionData -ContentType "application/json"
    Write-Host "✓ Linear Regression Complete" -ForegroundColor Green
    Write-Host "  R²: $($response.results.model_summary.r_squared)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Linear Regression Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 10: Get Available Methods
Write-Host "[10/10] Testing Available Methods..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/methods" -Method Get
    Write-Host "✓ Available Methods Retrieved" -ForegroundColor Green
    Write-Host "  Categories: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Get Methods Failed: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
