# Design Document: CSV Analysis Workflow Fix

## Overview

This design addresses the critical issue where the CSV analysis workflow fails because it attempts to connect to the R Analytics server immediately upon file upload, blocking users from configuring their analysis. The solution defers R server connectivity checks until the actual analysis execution phase, allowing users to complete the full workflow (upload → group → configure → analyze) even when the R server is temporarily unavailable.

### Responsibility Division

**JavaScript (Client-side) - Data Preparation & Basic Analysis:**
- CSV upload, parsing, and validation
- Data health check (missing values, outliers, data type detection)
- Descriptive statistics (mean, median, std, min, max, quartiles)
- Data quality scoring
- Variable auto-grouping
- Demographic configuration
- Data summary and preview

**R Server - Advanced Quantitative Analysis:**
- Cronbach's Alpha (Reliability Analysis)
- EFA (Exploratory Factor Analysis)
- CFA (Confirmatory Factor Analysis)
- SEM (Structural Equation Modeling)
- ANOVA (One-way, Two-way)
- Multiple Regression
- VIF (Variance Inflation Factor)
- Post-hoc tests and model fit indices

## Architecture

### Current (Broken) Flow

```
User uploads CSV
    ↓
❌ Check R server (FAILS if offline)
    ↓
BLOCKED - Cannot proceed
```

### Fixed Flow

```
User uploads CSV
    ↓
✓ Parse & validate CSV (JavaScript)
    ↓
✓ Calculate data health metrics (JavaScript)
    ↓
✓ Auto-group variables (JavaScript)
    ↓
✓ Configure demographics (Save to DB)
    ↓
✓ Select analysis types (Save to DB)
    ↓
User clicks "Execute Analysis"
    ↓
Check R server availability
    ↓
IF available → Execute analysis
IF not → Show clear error with instructions
```

## Components Modified

### 1. Data Upload Component
**File**: `frontend/src/components/analysis/data-upload.tsx`

**Changes**:
- Remove any R server health checks
- Keep only CSV parsing and validation
- Calculate basic statistics using JavaScript
- Auto-proceed to next step after successful upload

### 2. Data Health Service (NEW)
**File**: `frontend/src/services/data-health.service.ts`

**Purpose**: Client-side data quality analysis without R server

**Functions**:
```typescript
class DataHealthService {
  // Calculate missing values per column
  static analyzeMissingValues(data: any[][]): MissingValueReport;
  
  // Detect outliers using IQR method
  static detectOutliers(values: number[]): OutlierReport;
  
  // Calculate basic statistics
  static calculateBasicStats(values: number[]): BasicStats;
  
  // Detect data types
  static detectDataType(values: any[]): DataType;
  
  // Calculate overall quality score
  static calculateQualityScore(report: DataHealthReport): number;
}
```

**Implementation Details**:

```typescript
// Missing Values Analysis
analyzeMissingValues(data: any[][]): MissingValueReport {
  const headers = data[0];
  const rows = data.slice(1);
  
  const report = headers.map((header, colIndex) => {
    const columnValues = rows.map(row => row[colIndex]);
    const missingCount = columnValues.filter(v => 
      v === null || v === undefined || v === '' || v === 'NA'
    ).length;
    
    return {
      variable: header,
      totalCount: columnValues.length,
      missingCount,
      missingPercentage: (missingCount / columnValues.length) * 100
    };
  });
  
  return {
    variables: report,
    totalMissing: report.reduce((sum, v) => sum + v.missingCount, 0),
    overallPercentage: report.reduce((sum, v) => sum + v.missingPercentage, 0) / report.length
  };
}

// Outlier Detection (IQR Method)
detectOutliers(values: number[]): OutlierReport {
  const sorted = values.filter(v => !isNaN(v)).sort((a, b) => a - b);
  const n = sorted.length;
  
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values
    .map((v, index) => ({ value: v, index }))
    .filter(({ value }) => value < lowerBound || value > upperBound);
  
  return {
    outlierCount: outliers.length,
    outlierPercentage: (outliers.length / values.length) * 100,
    outlierIndices: outliers.map(o => o.index),
    outlierValues: outliers.map(o => o.value),
    bounds: { lower: lowerBound, upper: upperBound },
    quartiles: { q1, q3, iqr }
  };
}

// Basic Statistics
calculateBasicStats(values: number[]): BasicStats {
  const validValues = values.filter(v => !isNaN(v));
  const n = validValues.length;
  
  if (n === 0) return null;
  
  const sum = validValues.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  
  const variance = validValues.reduce((sum, v) => 
    sum + Math.pow(v - mean, 2), 0
  ) / n;
  const std = Math.sqrt(variance);
  
  const sorted = [...validValues].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  return {
    count: n,
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    std: Number(std.toFixed(3)),
    min: Math.min(...validValues),
    max: Math.max(...validValues),
    range: Math.max(...validValues) - Math.min(...validValues)
  };
}

// Quality Score Calculation
calculateQualityScore(report: DataHealthReport): number {
  let score = 100;
  
  // Deduct for missing values
  const missingPenalty = Math.min(report.missingData.percentageMissing * 0.5, 30);
  score -= missingPenalty;
  
  // Deduct for outliers
  const outlierPenalty = Math.min(report.outliers.totalOutliers * 0.1, 20);
  score -= outlierPenalty;
  
  // Deduct for data type issues
  if (report.dataTypes.text > report.dataTypes.numeric + report.dataTypes.categorical) {
    score -= 10;
  }
  
  return Math.max(0, Math.round(score));
}
```

### 3. Variable Grouping Service
**File**: `frontend/src/services/variable-grouping.service.ts`

**Purpose**: Auto-group variables based on naming patterns (client-side)

**Functions**:
```typescript
class VariableGroupingService {
  // Suggest groups based on naming patterns
  static suggestGroups(variables: AnalysisVariable[]): VariableGroupSuggestion[];
  
  // Detect common prefixes
  static detectPrefixPatterns(names: string[]): PrefixPattern[];
  
  // Detect numbering patterns
  static detectNumberingPatterns(names: string[]): NumberingPattern[];
  
  // Calculate semantic similarity
  static calculateSimilarity(name1: string, name2: string): number;
}
```

**Implementation**:

```typescript
suggestGroups(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
  const suggestions: VariableGroupSuggestion[] = [];
  
  // 1. Group by prefix patterns (e.g., Q1_, Q2_, Q3_)
  const prefixGroups = this.groupByPrefix(variables);
  suggestions.push(...prefixGroups);
  
  // 2. Group by numbering patterns (e.g., Item1, Item2, Item3)
  const numberGroups = this.groupByNumbering(variables);
  suggestions.push(...numberGroups);
  
  // 3. Group by semantic similarity
  const semanticGroups = this.groupBySemantic(variables);
  suggestions.push(...semanticGroups);
  
  return suggestions;
}

groupByPrefix(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
  const prefixMap = new Map<string, AnalysisVariable[]>();
  
  variables.forEach(variable => {
    // Extract prefix (e.g., "Q1_" from "Q1_satisfaction")
    const match = variable.columnName.match(/^([A-Za-z]+\d+)_/);
    if (match) {
      const prefix = match[1];
      if (!prefixMap.has(prefix)) {
        prefixMap.set(prefix, []);
      }
      prefixMap.get(prefix)!.push(variable);
    }
  });
  
  return Array.from(prefixMap.entries())
    .filter(([_, vars]) => vars.length >= 2)
    .map(([prefix, vars]) => ({
      suggestedName: this.generateGroupName(prefix),
      variables: vars.map(v => v.columnName),
      confidence: 0.9,
      reason: `Variables share common prefix "${prefix}"`
    }));
}

groupByNumbering(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
  const baseMap = new Map<string, AnalysisVariable[]>();
  
  variables.forEach(variable => {
    // Extract base name (e.g., "Item" from "Item1", "Item2")
    const match = variable.columnName.match(/^([A-Za-z_]+)\d+$/);
    if (match) {
      const base = match[1];
      if (!baseMap.has(base)) {
        baseMap.set(base, []);
      }
      baseMap.get(base)!.push(variable);
    }
  });
  
  return Array.from(baseMap.entries())
    .filter(([_, vars]) => vars.length >= 3)
    .map(([base, vars]) => ({
      suggestedName: this.generateGroupName(base),
      variables: vars.map(v => v.columnName),
      confidence: 0.85,
      reason: `Variables follow numbering pattern "${base}1, ${base}2, ..."`
    }));
}
```

### 4. Analysis Service (Modified)
**File**: `frontend/src/services/analysis.service.ts`

**Changes**:

```typescript
class AnalysisService {
  // NEW: Check R server availability (only called before execution)
  static async checkRServerAvailability(): Promise<RServerStatus> {
    try {
      const response = await fetch(`${this.R_ANALYTICS_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          available: true,
          status: data.status,
          version: data.version,
          uptime: data.uptime
        };
      }
      
      return {
        available: false,
        error: `Server returned status ${response.status}`
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        instructions: [
          'The R Analytics server is not running.',
          'To start the server, run:',
          '  cd r-analytics',
          '  .\\start.ps1',
          '',
          'Or using Docker Compose:',
          '  docker-compose up -d',
          '',
          'Expected URL: http://localhost:8000'
        ]
      };
    }
  }
  
  // MODIFIED: Execute analysis with pre-check
  static async executeAnalysis(
    type: AnalysisType,
    projectId: string,
    config: any
  ): Promise<AnalysisResult> {
    // Check R server availability first
    const serverStatus = await this.checkRServerAvailability();
    
    if (!serverStatus.available) {
      throw new RServerUnavailableError(
        'R Analytics Server is not available',
        serverStatus.instructions
      );
    }
    
    // Proceed with analysis execution
    return this.executeAnalysisInternal(type, projectId, config);
  }
}

// NEW: Custom error class
class RServerUnavailableError extends Error {
  constructor(
    message: string,
    public instructions: string[]
  ) {
    super(message);
    this.name = 'RServerUnavailableError';
  }
}
```

### 5. Analysis Page (Modified)
**File**: `frontend/src/app/(dashboard)/analysis/page.tsx`

**Changes**:

```typescript
// Remove R server check from initial load
useEffect(() => {
  // OLD: checkRServerHealth(); ❌ REMOVE THIS
  
  // NEW: Only load project data
  loadProjectData();
}, []);

// Add R server check only when executing analysis
const handleExecuteAnalysis = async () => {
  try {
    setIsExecuting(true);
    
    // Check R server availability
    const serverStatus = await AnalysisService.checkRServerAvailability();
    
    if (!serverStatus.available) {
      // Show user-friendly error with instructions
      setError({
        type: 'r-server-unavailable',
        message: 'R Analytics Server is not available',
        instructions: serverStatus.instructions,
        canRetry: true
      });
      return;
    }
    
    // Execute analysis
    const results = await AnalysisService.executeAnalysis(
      selectedAnalysisType,
      projectId,
      analysisConfig
    );
    
    setResults(results);
    
  } catch (error) {
    if (error instanceof RServerUnavailableError) {
      setError({
        type: 'r-server-unavailable',
        message: error.message,
        instructions: error.instructions,
        canRetry: true
      });
    } else {
      setError({
        type: 'analysis-error',
        message: error.message,
        canRetry: true
      });
    }
  } finally {
    setIsExecuting(false);
  }
};
```

## Data Models

### DataHealthReport (Client-Side)

```typescript
interface DataHealthReport {
  overallScore: number; // 0-100
  totalRows: number;
  totalColumns: number;
  
  missingData: {
    totalMissing: number;
    percentageMissing: number;
    variablesWithMissing: Array<{
      variable: string;
      missingCount: number;
      missingPercentage: number;
    }>;
  };
  
  outliers: {
    totalOutliers: number;
    variablesWithOutliers: Array<{
      variable: string;
      outlierCount: number;
      outlierPercentage: number;
      outlierIndices: number[];
    }>;
  };
  
  dataTypes: {
    numeric: number;
    categorical: number;
    text: number;
    date: number;
  };
  
  basicStats: Record<string, BasicStats>;
  
  recommendations: string[];
  calculatedAt: Date;
  calculationMethod: 'client-side'; // vs 'r-server'
}

interface BasicStats {
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  range: number;
}

interface OutlierReport {
  outlierCount: number;
  outlierPercentage: number;
  outlierIndices: number[];
  outlierValues: number[];
  bounds: {
    lower: number;
    upper: number;
  };
  quartiles: {
    q1: number;
    q3: number;
    iqr: number;
  };
}
```

### RServerStatus

```typescript
interface RServerStatus {
  available: boolean;
  status?: string;
  version?: string;
  uptime?: number;
  error?: string;
  instructions?: string[];
}
```

### VariableGroupSuggestion

```typescript
interface VariableGroupSuggestion {
  suggestedName: string;
  variables: string[];
  confidence: number; // 0-1
  reason: string;
  pattern?: {
    type: 'prefix' | 'numbering' | 'semantic';
    details: any;
  };
}
```

## Error Handling

### Error Display Component

```typescript
// Enhanced error display for R server unavailability
const RServerErrorDisplay = ({ error, onRetry }: Props) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" /* ... */ />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">
            {error.message}
          </h3>
          
          {error.instructions && (
            <div className="mt-4 bg-white rounded p-4 font-mono text-sm">
              {error.instructions.map((line, i) => (
                <div key={i} className="text-gray-700">
                  {line}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry Connection
            </button>
            
            <button
              onClick={() => window.open('http://localhost:8000/__docs__/', '_blank')}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              Check Server Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Testing Strategy

### Unit Tests

1. **DataHealthService**
   - Test missing value calculation
   - Test outlier detection (IQR method)
   - Test basic statistics calculation
   - Test quality score calculation

2. **VariableGroupingService**
   - Test prefix pattern detection
   - Test numbering pattern detection
   - Test semantic grouping

3. **AnalysisService**
   - Test R server availability check
   - Test error handling for unavailable server
   - Test analysis execution flow

### Integration Tests

1. **Upload Flow**
   - Upload CSV → Parse → Calculate health → Auto-group
   - Verify no R server calls during upload

2. **Configuration Flow**
   - Configure demographics → Save to DB
   - Select analysis types → Save to DB
   - Verify configuration persists

3. **Execution Flow**
   - Check R server → Execute analysis
   - Handle R server unavailable
   - Display results

### E2E Tests

1. **Complete Workflow (R Server Online)**
   - Upload CSV
   - Review data health
   - Accept variable grouping
   - Configure demographics
   - Select analysis
   - Execute successfully

2. **Complete Workflow (R Server Offline)**
   - Upload CSV
   - Review data health
   - Accept variable grouping
   - Configure demographics
   - Select analysis
   - See clear error message
   - Start R server
   - Retry successfully

## Performance Considerations

### Client-Side Calculations

- **Large datasets**: Limit client-side calculations to first 10,000 rows for preview
- **Web Workers**: Use Web Workers for heavy calculations to avoid blocking UI
- **Caching**: Cache calculated statistics to avoid recalculation

```typescript
// Use Web Worker for large dataset calculations
const calculateHealthInWorker = (data: any[][]) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/workers/data-health.worker.js');
    
    worker.postMessage({ data });
    
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
  });
};
```

### Database Optimization

- Index on `project_id` for fast configuration retrieval
- Store configuration as JSONB for flexible querying
- Cache frequently accessed projects

## Migration Plan

### Phase 1: Remove R Server Dependency from Upload
1. Remove R server health checks from data upload component
2. Implement client-side data health service
3. Test upload flow without R server

### Phase 2: Implement Client-Side Analysis
1. Implement variable grouping service
2. Add auto-grouping after upload
3. Test grouping suggestions

### Phase 3: Defer R Server Check
1. Move R server check to analysis execution
2. Implement enhanced error display
3. Test error handling

### Phase 4: Testing & Validation
1. Run full test suite
2. Test with R server online/offline
3. Validate all workflows

## Deployment

### Environment Variables

```env
# Frontend
NEXT_PUBLIC_R_ANALYTICS_URL=http://localhost:8000

# R Server (Docker)
R_MAX_MEMORY=8G
R_MAX_CORES=4
```

### Docker Compose Update

No changes needed - R server configuration is already correct:
- Container: `ncskit-r-analytics`
- Port: `8000:8000`
- Health check: Enabled
- Status: Running and healthy ✓

## Monitoring

### Metrics to Track

1. **Upload Success Rate**: % of successful CSV uploads
2. **Data Health Calculation Time**: Time to calculate health metrics
3. **Variable Grouping Accuracy**: User acceptance rate of suggestions
4. **R Server Availability**: Uptime percentage
5. **Analysis Execution Success Rate**: % of successful analysis executions

### Logging

```typescript
// Log workflow progression
logger.info('CSV uploaded', { projectId, rowCount, columnCount });
logger.info('Data health calculated', { projectId, qualityScore });
logger.info('Variables grouped', { projectId, groupCount });
logger.info('Demographics configured', { projectId, demographicCount });
logger.info('Analysis executed', { projectId, analysisType, duration });

// Log R server issues
logger.warn('R server unavailable', { projectId, attemptedUrl });
logger.error('Analysis execution failed', { projectId, error });
```

## Security Considerations

1. **File Upload Validation**
   - Validate file type and size
   - Sanitize file names
   - Scan for malicious content

2. **Data Privacy**
   - Store CSV files encrypted
   - Implement row-level security
   - Audit data access

3. **R Server Communication**
   - Use HTTPS in production
   - Implement API key authentication
   - Rate limit requests

---

**Version**: 1.0.0  
**Date**: 2024-11-09  
**Status**: Ready for Implementation
