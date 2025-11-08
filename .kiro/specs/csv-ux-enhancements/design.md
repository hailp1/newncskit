# Design Document: CSV Analysis UX Enhancements

## Overview

This document outlines the technical design for enhancing the user experience of the CSV Analysis Workflow. The enhancements focus on four key areas: workflow navigation, advanced visualizations, comprehensive error handling, and enhanced loading states.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────┐
│              Enhanced Workflow Container                 │
├─────────────────────────────────────────────────────────┤
│  - WorkflowStepper (Navigation)                         │
│  - WorkflowStateManager (Auto-save, Progress)           │
│  - ErrorBoundary (Global error handling)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Enhanced Components                     │
├─────────────────────────────────────────────────────────┤
│  - AdvancedCharts (Recharts/D3)                         │
│  - LoadingStates (Skeletons, Progress)                  │
│  - ErrorDisplay (User-friendly messages)                │
│  - TooltipProvider (Contextual help)                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    State Management                      │
├─────────────────────────────────────────────────────────┤
│  - Zustand Store (Workflow state)                       │
│  - React Query (API caching)                            │
│  - Local Storage (Backup state)                         │
└─────────────────────────────────────────────────────────┘
```

## Data Models

### Workflow State Types

```typescript
interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  projectId: string;
  lastSaved: Date | null;
  isDirty: boolean;
  progress: number; // 0-100
}

type WorkflowStep = 
  | 'upload'
  | 'health-check'
  | 'grouping'
  | 'demographic'
  | 'analysis-selection'
  | 'execution'
  | 'results';

interface StepConfig {
  id: WorkflowStep;
  label: string;
  description: string;
  icon: React.ComponentType;
  isComplete: boolean;
  isAccessible: boolean;
}
```

### Loading State Types

```typescript
interface LoadingState {
  isLoading: boolean;
  loadingType: LoadingType;
  progress?: number;
  message?: string;
  estimatedTime?: number;
  canCancel?: boolean;
}

type LoadingType =
  | 'upload'
  | 'parsing'
  | 'health-check'
  | 'grouping'
  | 'analysis'
  | 'export';

interface OperationProgress {
  current: number;
  total: number;
  currentItem?: string;
  startTime: Date;
}
```

### Error State Types

```typescript
interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  field?: string;
  suggestions: string[];
  canRetry: boolean;
  canReport: boolean;
}

type ErrorType = 'warning' | 'error' | 'critical';

interface ValidationError extends ErrorState {
  field: string;
  value: any;
  constraint: string;
}
```


## Component Design

### 1. Workflow Stepper Component

**Component:** `WorkflowStepper`

**Props:**
```typescript
interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  steps: StepConfig[];
  onStepClick: (step: WorkflowStep) => void;
  progress: number;
  compact?: boolean; // for smaller screens
}
```

**Features:**
- Visual step indicator with icons
- Progress bar showing completion percentage
- Click navigation to completed steps
- Disabled state for incomplete steps
- Responsive design (horizontal on desktop, vertical/compact on mobile)
- Animated transitions between steps
- Checkmark indicators for completed steps

**Implementation:**
```typescript
// Uses Framer Motion for animations
// Tailwind CSS for styling
// Lucide React for icons
```

### 2. Advanced Visualization Components

#### Quality Score Gauge

**Component:** `QualityScoreGauge`

**Props:**
```typescript
interface QualityScoreGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}
```

**Features:**
- Circular gauge with color gradient (red → yellow → green)
- Animated fill on mount
- Responsive sizing
- Accessibility labels

#### Missing Data Chart

**Component:** `MissingDataChart`

**Props:**
```typescript
interface MissingDataChartProps {
  data: Array<{
    variable: string;
    missingCount: number;
    totalCount: number;
    percentage: number;
  }>;
  onVariableClick?: (variable: string) => void;
}
```

**Features:**
- Horizontal bar chart
- Percentage labels
- Color coding by severity
- Interactive tooltips
- Click to view details

#### Correlation Heatmap

**Component:** `CorrelationHeatmap`

**Props:**
```typescript
interface CorrelationHeatmapProps {
  data: number[][]; // correlation matrix
  variables: string[];
  onCellClick?: (row: number, col: number) => void;
  showValues?: boolean;
}
```

**Features:**
- Color-coded cells (-1 to 1)
- Hover tooltips with exact values
- Zoom and pan capabilities
- Export as PNG
- Responsive grid


#### Box Plot Visualization

**Component:** `BoxPlotChart`

**Props:**
```typescript
interface BoxPlotChartProps {
  data: Array<{
    variable: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
  }>;
  orientation?: 'horizontal' | 'vertical';
}
```

**Features:**
- Standard box plot with whiskers
- Outlier points highlighted
- Interactive tooltips
- Responsive layout

#### Factor Structure Diagram

**Component:** `FactorDiagram`

**Props:**
```typescript
interface FactorDiagramProps {
  factors: Array<{
    name: string;
    variables: Array<{
      name: string;
      loading: number;
    }>;
  }>;
  threshold?: number; // minimum loading to display
}
```

**Features:**
- Visual representation of factor structure
- Line thickness based on loading strength
- Color coding for factors
- Interactive hover states

### 3. Error Handling Components

#### Error Display

**Component:** `ErrorDisplay`

**Props:**
```typescript
interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;
}
```

**Features:**
- Icon based on error type
- Clear error message
- Actionable suggestions
- Retry button (if applicable)
- Report issue button
- Dismissible for warnings

#### Field Validation Error

**Component:** `FieldError`

**Props:**
```typescript
interface FieldErrorProps {
  error: ValidationError;
  inline?: boolean;
}
```

**Features:**
- Inline display below field
- Red border highlight on field
- Clear constraint explanation
- Auto-dismiss on field change


#### Error Boundary

**Component:** `ErrorBoundary`

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

**Features:**
- Catches React component errors
- Displays fallback UI
- Logs errors to monitoring service
- Provides reset functionality
- Preserves user data when possible

### 4. Loading State Components

#### Upload Progress

**Component:** `UploadProgress`

**Props:**
```typescript
interface UploadProgressProps {
  progress: number; // 0-100
  fileName: string;
  fileSize: number;
  onCancel?: () => void;
}
```

**Features:**
- Progress bar with percentage
- File name and size display
- Upload speed indicator
- Cancel button
- Success animation on completion

#### Analysis Progress

**Component:** `AnalysisProgress`

**Props:**
```typescript
interface AnalysisProgressProps {
  currentAnalysis: string;
  completedAnalyses: string[];
  totalAnalyses: number;
  estimatedTime?: number;
  onCancel?: () => void;
}
```

**Features:**
- List of analyses with status
- Current analysis highlighted
- Progress indicator
- Time remaining estimate
- Cancel button

#### Skeleton Loader

**Component:** `SkeletonLoader`

**Props:**
```typescript
interface SkeletonLoaderProps {
  type: 'table' | 'chart' | 'card' | 'text';
  rows?: number;
  columns?: number;
  height?: number;
}
```

**Features:**
- Animated shimmer effect
- Matches content layout
- Responsive sizing
- Multiple variants


### 5. Tooltip and Help Components

#### Contextual Tooltip

**Component:** `Tooltip`

**Props:**
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
```

**Features:**
- Hover-triggered display
- Configurable placement
- Delay before showing
- Accessible (ARIA labels)
- Portal rendering

#### Info Icon with Tooltip

**Component:** `InfoTooltip`

**Props:**
```typescript
interface InfoTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  learnMoreUrl?: string;
}
```

**Features:**
- Info icon trigger
- Rich content support
- Optional "Learn More" link
- Keyboard accessible

#### Guided Tour

**Component:** `GuidedTour`

**Props:**
```typescript
interface GuidedTourProps {
  steps: Array<{
    target: string; // CSS selector
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
  }>;
  onComplete?: () => void;
  onSkip?: () => void;
}
```

**Features:**
- Step-by-step walkthrough
- Spotlight on target elements
- Next/Previous navigation
- Skip tour option
- Progress indicator
- Stores completion in localStorage

## State Management

### Zustand Store Structure

```typescript
interface WorkflowStore {
  // State
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  projectId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  markStepComplete: (step: WorkflowStep) => void;
  setProjectId: (id: string) => void;
  markDirty: () => void;
  markClean: () => void;
  updateLastSaved: () => void;
  
  // Computed
  progress: () => number;
  canNavigateTo: (step: WorkflowStep) => boolean;
}
```


### React Query Configuration

```typescript
// API caching and state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hooks
function useAnalysisProject(projectId: string) {
  return useQuery(['project', projectId], () => fetchProject(projectId));
}

function useAnalysisResults(projectId: string) {
  return useQuery(['results', projectId], () => fetchResults(projectId), {
    enabled: !!projectId,
  });
}
```

### Local Storage Backup

```typescript
interface BackupState {
  projectId: string;
  step: WorkflowStep;
  timestamp: Date;
  formData: Record<string, any>;
}

// Auto-save to localStorage every 30 seconds
function useAutoSave() {
  const state = useWorkflowStore();
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isDirty) {
        localStorage.setItem('workflow-backup', JSON.stringify({
          projectId: state.projectId,
          step: state.currentStep,
          timestamp: new Date(),
          formData: state.formData,
        }));
        state.markClean();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state]);
}
```

## Animation and Transitions

### Framer Motion Variants

```typescript
// Step transition animations
const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Loading spinner
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Success checkmark
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};
```


## Responsive Design Strategy

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};
```

### Responsive Patterns

#### Workflow Stepper
- **Desktop (lg+)**: Horizontal stepper with full labels
- **Tablet (md-lg)**: Horizontal stepper with abbreviated labels
- **Mobile (sm)**: Vertical compact stepper or dropdown selector

#### Charts
- **Desktop**: Full-size interactive charts
- **Tablet**: Scaled charts with touch interactions
- **Mobile**: Simplified charts, swipeable for multiple views

#### Tables
- **Desktop**: Full table with all columns
- **Tablet**: Scrollable table with sticky headers
- **Mobile**: Card-based layout or accordion

## Accessibility Implementation

### WCAG 2.1 Level AA Compliance

```typescript
// Color contrast ratios
const colors = {
  text: {
    primary: '#1a1a1a',    // 16:1 contrast on white
    secondary: '#4a4a4a',  // 9:1 contrast on white
  },
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
  },
  interactive: {
    primary: '#2563eb',    // 4.5:1 contrast
    hover: '#1d4ed8',
    focus: '#1e40af',
  },
};

// Focus indicators
const focusRing = 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
```

### Keyboard Navigation

```typescript
// Keyboard shortcuts
const shortcuts = {
  'Ctrl+S': 'Save progress',
  'Ctrl+Enter': 'Continue to next step',
  'Escape': 'Close modal/cancel operation',
  'Tab': 'Navigate between elements',
  'Arrow keys': 'Navigate stepper steps',
};

// Implementation
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProgress();
      }
      // ... other shortcuts
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### Screen Reader Support

```typescript
// ARIA labels and live regions
<div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  {progress}% complete
</div>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>

<button aria-label="Upload CSV file" aria-describedby="upload-help">
  Upload
</button>
<span id="upload-help" className="sr-only">
  Select a CSV file up to 50MB to begin analysis
</span>
```


## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const CorrelationHeatmap = lazy(() => import('./CorrelationHeatmap'));
const FactorDiagram = lazy(() => import('./FactorDiagram'));
const ResultsViewer = lazy(() => import('./ResultsViewer'));

// Usage with Suspense
<Suspense fallback={<SkeletonLoader type="chart" />}>
  <CorrelationHeatmap data={correlationData} />
</Suspense>
```

### Virtual Scrolling

```typescript
// For large variable lists
import { FixedSizeList } from 'react-window';

function VariableList({ variables }: { variables: Variable[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={variables.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <VariableItem variable={variables[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### Debouncing and Throttling

```typescript
// Debounce search input
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      performSearch(value);
    },
    500
  );
  
  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}

// Throttle scroll events
import { useThrottledCallback } from 'use-debounce';

function ScrollHandler() {
  const throttledScroll = useThrottledCallback(
    () => {
      handleScroll();
    },
    200
  );
  
  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);
}
```

### Image and Asset Optimization

```typescript
// Optimize chart exports
async function exportChartAsPNG(chartRef: RefObject<HTMLDivElement>) {
  const canvas = await html2canvas(chartRef.current!, {
    scale: 2, // Retina quality
    backgroundColor: '#ffffff',
  });
  
  // Compress before download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      downloadFile(url, 'chart.png');
      URL.revokeObjectURL(url);
    }
  }, 'image/png', 0.9);
}
```


## Error Handling Strategy

### Error Classification

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public suggestions: string[] = [],
    public canRetry: boolean = false,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(field: string, message: string, suggestions: string[]) {
    super(message, 'warning', suggestions, false, field);
    this.name = 'ValidationError';
  }
}

class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'error', ['Check your internet connection', 'Try again'], true);
    this.name = 'NetworkError';
  }
}

class AnalysisError extends AppError {
  constructor(analysisType: string, message: string) {
    super(
      `${analysisType} analysis failed: ${message}`,
      'error',
      ['Check your data configuration', 'Review variable selections'],
      true
    );
    this.name = 'AnalysisError';
  }
}
```

### Error Logging Service

```typescript
interface ErrorLog {
  timestamp: Date;
  error: Error;
  context: {
    userId?: string;
    projectId?: string;
    step?: WorkflowStep;
    userAgent: string;
  };
  stackTrace?: string;
}

class ErrorLogger {
  static log(error: Error, context: Partial<ErrorLog['context']>) {
    const log: ErrorLog = {
      timestamp: new Date(),
      error,
      context: {
        ...context,
        userAgent: navigator.userAgent,
      },
      stackTrace: error.stack,
    };
    
    // Send to monitoring service (e.g., Sentry)
    console.error('Error logged:', log);
    
    // Store locally for debugging
    this.storeLocal(log);
  }
  
  private static storeLocal(log: ErrorLog) {
    const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
    logs.push(log);
    // Keep only last 50 errors
    if (logs.length > 50) logs.shift();
    localStorage.setItem('error-logs', JSON.stringify(logs));
  }
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const data = await withRetry(() => fetchAnalysisResults(projectId));
```


## Technology Stack

### Core Libraries

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0",
    
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-progress": "^1.0.3",
    
    "react-window": "^1.8.10",
    "use-debounce": "^10.0.0",
    "html2canvas": "^1.4.1",
    
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

### Chart Library Selection: Recharts

**Rationale:**
- Built specifically for React
- Declarative API
- Good performance for medium datasets
- Responsive by default
- Accessible
- Smaller bundle size than D3

**Alternative considered:** D3.js (more powerful but steeper learning curve)

### Animation Library: Framer Motion

**Rationale:**
- Declarative animations
- Great performance
- Built-in gesture support
- Layout animations
- Accessibility features

### State Management: Zustand

**Rationale:**
- Minimal boilerplate
- TypeScript-first
- No providers needed
- Small bundle size (1KB)
- Easy to test

**Alternative considered:** Redux Toolkit (more complex, larger bundle)

## Testing Strategy

### Unit Tests

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowStepper } from './WorkflowStepper';

describe('WorkflowStepper', () => {
  it('highlights current step', () => {
    render(<WorkflowStepper currentStep="grouping" steps={mockSteps} />);
    expect(screen.getByText('Variable Grouping')).toHaveClass('active');
  });
  
  it('allows navigation to completed steps', () => {
    const onStepClick = jest.fn();
    render(
      <WorkflowStepper 
        currentStep="demographic" 
        steps={mockSteps}
        onStepClick={onStepClick}
      />
    );
    
    fireEvent.click(screen.getByText('Upload'));
    expect(onStepClick).toHaveBeenCalledWith('upload');
  });
});
```

### Integration Tests

```typescript
// Testing workflow state management
import { renderHook, act } from '@testing-library/react';
import { useWorkflowStore } from './store';

describe('Workflow Store', () => {
  it('updates progress when steps are completed', () => {
    const { result } = renderHook(() => useWorkflowStore());
    
    act(() => {
      result.current.markStepComplete('upload');
      result.current.markStepComplete('health-check');
    });
    
    expect(result.current.progress()).toBe(28); // 2/7 steps
  });
});
```


### E2E Tests

```typescript
// Playwright tests for complete workflow
import { test, expect } from '@playwright/test';

test('complete analysis workflow with UX enhancements', async ({ page }) => {
  await page.goto('/analysis/new');
  
  // Upload file
  await page.setInputFiles('input[type="file"]', 'test-data.csv');
  await expect(page.locator('.upload-progress')).toBeVisible();
  await expect(page.locator('.success-animation')).toBeVisible();
  
  // Navigate through stepper
  await page.click('button:has-text("Continue")');
  await expect(page.locator('.workflow-stepper .step-2')).toHaveClass(/active/);
  
  // Check loading states
  await expect(page.locator('.skeleton-loader')).toBeVisible();
  await expect(page.locator('.skeleton-loader')).not.toBeVisible({ timeout: 10000 });
  
  // Verify charts are rendered
  await expect(page.locator('.quality-score-gauge')).toBeVisible();
  await expect(page.locator('.missing-data-chart')).toBeVisible();
  
  // Test error handling
  await page.click('button:has-text("Skip Required Field")');
  await expect(page.locator('.error-display')).toBeVisible();
  await expect(page.locator('.error-display')).toContainText('This field is required');
});
```

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Set up Zustand store
- Implement WorkflowStepper component
- Add basic error boundaries
- Implement skeleton loaders

### Phase 2: Visualizations (Week 2)
- Integrate Recharts
- Build QualityScoreGauge
- Build MissingDataChart
- Build CorrelationHeatmap
- Build BoxPlotChart

### Phase 3: Error Handling (Week 3)
- Implement error classification system
- Build ErrorDisplay component
- Add field validation errors
- Implement retry logic
- Set up error logging

### Phase 4: Loading States (Week 4)
- Enhance UploadProgress
- Improve AnalysisProgress
- Add operation cancellation
- Implement time estimates

### Phase 5: Polish & Accessibility (Week 5)
- Add tooltips and help text
- Implement guided tour
- Ensure WCAG compliance
- Add keyboard shortcuts
- Responsive design refinements

### Phase 6: Testing & Documentation (Week 6)
- Write unit tests
- Write integration tests
- Write E2E tests
- Create user documentation
- Performance optimization

## Deployment Considerations

### Bundle Size Optimization

```typescript
// Analyze bundle
npm run build -- --analyze

// Expected bundle sizes
// Main bundle: ~200KB (gzipped)
// Recharts: ~50KB (lazy loaded)
// Framer Motion: ~30KB
// Total initial load: ~230KB
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

**Version**: 1.0.0  
**Date**: 2024-11-08  
**Status**: Ready for Review
