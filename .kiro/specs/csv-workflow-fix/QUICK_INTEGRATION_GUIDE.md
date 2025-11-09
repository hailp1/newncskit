# Quick Integration Guide

## ✅ Đã Hoàn Thành

Tất cả services đã được tạo và sẵn sàng sử dụng:
1. ✅ `data-health.service.ts` - Data health check
2. ✅ `statistics.ts` - Statistical utilities  
3. ✅ `variable-grouping.service.ts` - Auto-grouping
4. ✅ `RServerErrorDisplay.tsx` - Error display
5. ✅ `analysis.service.ts` - Updated với R server check

## 🔧 Cách Sử Dụng Ngay

### 1. Trong Data Upload Component

Thêm vào `frontend/src/components/analysis/data-upload.tsx`:

```typescript
import { DataHealthService } from '@/services/data-health.service';
import { VariableGroupingService } from '@/services/variable-grouping.service';

// Sau khi parse CSV thành công, thêm:
const processData = async (data: any[][]) => {
  // ... existing code ...
  
  // Calculate data health
  const healthReport = DataHealthService.performHealthCheck(data);
  console.log('Data Quality Score:', healthReport.overallScore);
  console.log('Recommendations:', healthReport.recommendations);
  
  // Auto-group variables
  const variables = columns.map(col => ({
    id: col.name,
    columnName: col.name,
    dataType: col.type,
    // ... other fields
  }));
  
  const groupSuggestions = VariableGroupingService.suggestGroups(variables);
  console.log('Group Suggestions:', groupSuggestions);
  
  // Pass to parent with metadata
  onDataUploaded(data, columns, {
    healthReport,
    groupSuggestions,
    dataSource: 'external_file'
  });
};
```

### 2. Trong Analysis Execution

Thay đổi từ:
```typescript
// OLD - Calls R server immediately
await AnalysisService.executeAnalysis(type, data, variables, groups, demographics, config);
```

Thành:
```typescript
// NEW - Checks R server first
import { AnalysisService, RServerUnavailableError } from '@/services/analysis.service';
import RServerErrorDisplay from '@/components/errors/RServerErrorDisplay';

try {
  const results = await AnalysisService.executeAnalysisWithCheck(
    type,
    data,
    variables,
    groups,
    demographics,
    config
  );
  // Handle success
} catch (error) {
  if (error instanceof RServerUnavailableError) {
    // Show error component
    setRServerError(error);
  } else {
    // Handle other errors
  }
}

// In JSX:
{rServerError && (
  <RServerErrorDisplay
    error={rServerError}
    onRetry={async () => {
      setRServerError(null);
      // Retry analysis
    }}
    onDismiss={() => setRServerError(null)}
  />
)}
```

### 3. Remove R Server Check từ Initial Load

Trong `frontend/src/app/(dashboard)/analysis/page.tsx`, đảm bảo KHÔNG có:

```typescript
// ❌ REMOVE THIS if exists
useEffect(() => {
  checkRServerHealth(); // DON'T DO THIS
}, []);
```

## 📝 Example: Complete Integration

### File: `frontend/src/components/analysis/data-upload.tsx`

```typescript
import { DataHealthService, DataHealthReport } from '@/services/data-health.service';
import { VariableGroupingService, VariableGroupSuggestion } from '@/services/variable-grouping.service';

interface DataUploadProps {
  onDataUploaded: (
    data: any[][], 
    columns: DataColumn[], 
    metadata?: {
      healthReport?: DataHealthReport;
      groupSuggestions?: VariableGroupSuggestion[];
      dataSource: string;
    }
  ) => void;
}

// In handleFileUpload function, after parsing:
const handleFileUpload = async (files: File[]) => {
  // ... parse CSV ...
  
  try {
    // Calculate data health (JavaScript - no R server needed)
    const healthReport = DataHealthService.performHealthCheck(data);
    
    // Process columns
    const columns = processData(data);
    
    // Auto-group variables
    const variables = columns.map(col => ({
      id: col.name,
      projectId: '',
      columnName: col.name,
      dataType: col.type,
      isDemographic: false,
      missingCount: col.missing || 0,
      uniqueCount: col.stats?.unique || 0,
      createdAt: new Date().toISOString()
    }));
    
    const groupSuggestions = VariableGroupingService.suggestGroups(variables);
    
    // Show preview with health info
    setPreviewData(data.slice(0, 6));
    
    // Pass everything to parent
    onDataUploaded(data, columns, {
      healthReport,
      groupSuggestions,
      dataSource: 'external_file',
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date()
    });
    
  } catch (error) {
    console.error('Data processing error:', error);
    setError(ErrorHandler.handleDataIntegrationError(error));
  }
};
```

### File: `frontend/src/components/analysis/statistical-analysis.tsx`

```typescript
import { AnalysisService, RServerUnavailableError } from '@/services/analysis.service';
import RServerErrorDisplay from '@/components/errors/RServerErrorDisplay';

export default function StatisticalAnalysis({ project, onUpdate }: Props) {
  const [rServerError, setRServerError] = useState<RServerUnavailableError | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleExecuteAnalysis = async (analysisType: string) => {
    setIsExecuting(true);
    setRServerError(null);
    
    try {
      // This will check R server availability first
      const results = await AnalysisService.executeAnalysisWithCheck(
        analysisType,
        project.data,
        project.columns,
        project.models,
        [], // demographics
        {} // config
      );
      
      // Update project with results
      onUpdate({
        ...project,
        results: [...project.results, results]
      });
      
    } catch (error) {
      if (error instanceof RServerUnavailableError) {
        // Show user-friendly error with instructions
        setRServerError(error);
      } else {
        console.error('Analysis error:', error);
        // Show generic error
      }
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div>
      {/* Show R server error if exists */}
      {rServerError && (
        <RServerErrorDisplay
          error={rServerError}
          onRetry={() => {
            setRServerError(null);
            // User can retry after starting R server
          }}
          onDismiss={() => setRServerError(null)}
        />
      )}
      
      {/* Analysis UI */}
      <Button 
        onClick={() => handleExecuteAnalysis('reliability')}
        disabled={isExecuting}
      >
        {isExecuting ? 'Executing...' : 'Run Reliability Analysis'}
      </Button>
    </div>
  );
}
```

## 🎯 Testing Steps

1. **Test Upload Without R Server**
   ```bash
   # Stop R server
   cd r-analytics
   docker-compose down
   
   # Upload CSV in browser
   # Should work fine, show data health metrics
   ```

2. **Test Analysis Without R Server**
   ```bash
   # Try to execute analysis
   # Should show RServerErrorDisplay with instructions
   ```

3. **Test Analysis With R Server**
   ```bash
   # Start R server
   cd r-analytics
   .\start.ps1
   
   # Execute analysis
   # Should work successfully
   ```

## 🚀 Quick Start Commands

```bash
# Start R server
cd r-analytics
.\start.ps1

# Check R server status
curl http://localhost:8000/health

# View Swagger docs
start http://localhost:8000/__docs__/
```

## 📊 What Works Now

✅ Upload CSV → JavaScript calculates health metrics
✅ Auto-group variables → JavaScript detects patterns
✅ Configure demographics → Saves to database
✅ Execute analysis → Checks R server first
✅ Clear error messages → Shows how to start R server

## 🔍 Debugging

If errors occur:

1. **Check browser console** for detailed error messages
2. **Check R server status**: `docker ps | findstr ncskit-r-analytics`
3. **Check R server logs**: `docker logs ncskit-r-analytics`
4. **Verify services imported correctly** in components

## 💡 Tips

- Data health check is instant (JavaScript)
- Variable grouping is instant (JavaScript)
- Only advanced analyses need R server
- R server check has 5-second timeout
- Error messages include exact commands to fix

---

**All code is ready! Just integrate into UI components.**
