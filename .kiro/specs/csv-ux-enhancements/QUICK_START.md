# Quick Start Guide - CSV UX Enhancements

## 🚀 Getting Started

### 1. View the Demo

```bash
# Start the development server
cd frontend
npm run dev

# Open browser to:
http://localhost:3000/analysis/workflow-demo
```

### 2. Explore Components

The demo page showcases all implemented components with interactive examples:

- **Workflow Stepper** - Click "Complete Current Step" to advance
- **Quality Gauges** - View three different score levels
- **Error Display** - Click "Show Error" to see error handling
- **Upload Progress** - Click "Simulate Upload" for animation
- **Skeleton Loaders** - Click "Show Loading States"
- **Missing Data Chart** - Hover and click on bars
- **Box Plot Chart** - Hover to see statistics
- **Field Error** - Click "Show Field Error" for validation
- **Error Boundary** - Click "Trigger Error" to test crash protection

---

## 📦 Using Components in Your Code

### WorkflowStepper

```tsx
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { useWorkflowStore } from '@/stores/workflowStore';

function MyPage() {
  const { currentStep, completedSteps, setCurrentStep, getProgress } = useWorkflowStore();

  return (
    <WorkflowStepper
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={setCurrentStep}
      progress={getProgress()}
    />
  );
}
```

### ErrorDisplay

```tsx
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { NetworkError } from '@/lib/errors';

function MyComponent() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleRetry = async () => {
    try {
      await fetchData();
      setError(null);
    } catch (e) {
      setError(new NetworkError('Failed to fetch data'));
    }
  };

  return error ? (
    <ErrorDisplay
      error={error}
      onRetry={handleRetry}
      onDismiss={() => setError(null)}
    />
  ) : (
    <div>Content</div>
  );
}
```

### ErrorBoundary

```tsx
import ErrorBoundary from '@/components/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponents />
    </ErrorBoundary>
  );
}
```

### QualityScoreGauge

```tsx
import { QualityScoreGauge } from '@/components/charts/QualityScoreGauge';

function DataQuality() {
  return (
    <QualityScoreGauge
      score={85}
      size="lg"
      showLabel
      animated
    />
  );
}
```

### MissingDataChart

```tsx
import { MissingDataChart } from '@/components/charts/MissingDataChart';

function MissingDataView() {
  const data = [
    { variable: 'Age', missingCount: 5, totalCount: 100, percentage: 5 },
    { variable: 'Income', missingCount: 15, totalCount: 100, percentage: 15 },
  ];

  return (
    <MissingDataChart
      data={data}
      onVariableClick={(variable) => console.log('Clicked:', variable)}
    />
  );
}
```

### BoxPlotChart

```tsx
import { BoxPlotChart } from '@/components/charts/BoxPlotChart';

function OutlierAnalysis() {
  const data = [
    {
      variable: 'Age',
      min: 18,
      q1: 25,
      median: 35,
      q3: 45,
      max: 65,
      outliers: [15, 70, 75],
    },
  ];

  return <BoxPlotChart data={data} />;
}
```

### SkeletonLoader

```tsx
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';

function LoadingState() {
  const { isLoading, data } = useQuery('data', fetchData);

  if (isLoading) {
    return <SkeletonLoader type="table" rows={5} columns={4} />;
  }

  return <DataTable data={data} />;
}
```

### UploadProgress

```tsx
import { UploadProgress } from '@/components/loading/UploadProgress';

function FileUpload() {
  const [progress, setProgress] = useState(0);

  return (
    <UploadProgress
      progress={progress}
      fileName="data.csv"
      fileSize={2500000}
      uploadSpeed={250000}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### FieldError

```tsx
import { FieldError } from '@/components/errors/FieldError';
import { ValidationError } from '@/lib/errors';

function FormField() {
  const [error, setError] = useState<ValidationError | null>(null);

  return (
    <div>
      <input
        type="email"
        className={error ? 'border-red-300' : 'border-gray-300'}
      />
      {error && <FieldError error={error} inline />}
    </div>
  );
}
```

---

## 🎣 Using Hooks

### useWorkflowStore

```tsx
import { useWorkflowStore } from '@/stores/workflowStore';

function MyComponent() {
  const {
    currentStep,
    completedSteps,
    setCurrentStep,
    markStepComplete,
    getProgress,
    canNavigateTo,
  } = useWorkflowStore();

  // Use the store...
}
```

### useAutoSave

```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

function EditForm() {
  const { saveNow, isSaving } = useAutoSave({
    interval: 30000, // 30 seconds
    onSave: async (data) => {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    enabled: true,
  });

  return (
    <div>
      <button onClick={saveNow} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Now'}
      </button>
    </div>
  );
}
```

### useKeyboardShortcuts

```tsx
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

function MyPage() {
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.SAVE,
      handler: () => console.log('Save triggered'),
    },
    {
      ...COMMON_SHORTCUTS.CONTINUE,
      handler: () => console.log('Continue triggered'),
    },
  ]);

  return <div>Press Ctrl+S to save, Ctrl+Enter to continue</div>;
}
```

### useAnalysisProject

```tsx
import { useAnalysisProject, useAnalysisResults } from '@/hooks/useAnalysisProject';

function ProjectView({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useAnalysisProject(projectId);
  const { data: results } = useAnalysisResults(projectId);

  if (isLoading) return <SkeletonLoader type="card" />;

  return (
    <div>
      <h1>{project.name}</h1>
      {/* Display results */}
    </div>
  );
}
```

---

## 🛠️ Error Handling

### Creating Custom Errors

```tsx
import { AppError, ValidationError, NetworkError, AnalysisError } from '@/lib/errors';

// Validation error
throw new ValidationError(
  'email',
  'Invalid email format',
  ['Use format: user@example.com']
);

// Network error
throw new NetworkError('Failed to connect to server');

// Analysis error
throw new AnalysisError('Correlation', 'Insufficient data points');

// Custom error
throw new AppError(
  'Custom error message',
  'error',
  ['Suggestion 1', 'Suggestion 2'],
  true // canRetry
);
```

### Logging Errors

```tsx
import { ErrorLogger } from '@/lib/errors';

try {
  await riskyOperation();
} catch (error) {
  ErrorLogger.log(error as Error, {
    userId: user.id,
    projectId: project.id,
    step: 'data-upload',
  });
  throw error;
}
```

### Retry Logic

```tsx
import { withRetry } from '@/lib/errors';

const data = await withRetry(
  () => fetch('/api/data').then(r => r.json()),
  3, // max retries
  1000 // delay in ms
);
```

---

## 🎨 Styling

All components use Tailwind CSS and are fully customizable:

```tsx
<ErrorDisplay
  error={error}
  className="my-custom-class"
/>

<QualityScoreGauge
  score={85}
  className="mx-auto"
/>
```

---

## 📱 Responsive Design

Components are responsive by default. For custom responsive behavior:

```tsx
<WorkflowStepper
  currentStep={currentStep}
  completedSteps={completedSteps}
  onStepClick={setCurrentStep}
  progress={getProgress()}
  compact={isMobile} // Use compact view on mobile
/>
```

---

## ♿ Accessibility

All components are accessible:
- Keyboard navigation supported
- ARIA labels included
- Focus indicators visible
- Screen reader compatible

Test with:
- Tab key for navigation
- Enter/Space for activation
- Escape for dismissal
- Arrow keys for stepper navigation

---

## 🧪 Testing

### Manual Testing
Visit `/analysis/workflow-demo` and interact with all components.

### Integration Testing (Future)
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';

test('navigates to completed step', () => {
  const onStepClick = jest.fn();
  render(
    <WorkflowStepper
      currentStep="demographic"
      completedSteps={['upload', 'health-check']}
      onStepClick={onStepClick}
      progress={28}
    />
  );

  fireEvent.click(screen.getByText('Upload'));
  expect(onStepClick).toHaveBeenCalledWith('upload');
});
```

---

## 📚 Additional Resources

- **Full Documentation:** `.kiro/specs/csv-ux-enhancements/`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Session Summary:** `SESSION_SUMMARY.md`
- **Design Document:** `design.md`
- **Requirements:** `requirements.md`
- **Tasks:** `tasks.md`

---

## 🆘 Troubleshooting

### Components not rendering?
- Check imports are correct
- Ensure Tailwind CSS is configured
- Verify dependencies are installed

### TypeScript errors?
- Run `npm run type-check`
- Check all imports resolve
- Ensure types are imported from correct paths

### Animations not working?
- Verify Framer Motion is installed
- Check browser supports CSS animations
- Ensure no conflicting CSS

### Charts not displaying?
- Verify Recharts is installed
- Check data format matches expected interface
- Ensure ResponsiveContainer has height

---

## 💬 Support

For issues or questions:
1. Check the demo page for examples
2. Review component source code
3. Check TypeScript types for prop interfaces
4. Refer to design document for architecture

---

**Happy Coding! 🚀**
