# Analysis Workflow Refactor (November 2025)

## Overview

The data analysis experience has been reorganized around a dedicated feature module. The goal is to make the workflow easier to reason about, reduce duplicate logic across API handlers, and give the frontend a predictable state container for multi-step interactions.

## What Changed

- **API layer**
  - Shared helpers live under `frontend/src/app/api/analysis/lib/` (`errors`, `supabase`, `storage`, `parser`).
  - Core endpoints (`upload`, `health`, `group`, `variables`, `execute`, `groups/load`) now use a consistent pattern with correlation IDs, structured errors, and Supabase JS client helpers.
  - Storage uploads always report whether the CSV lives in the bucket or inline fallback.

- **Frontend workflow**
  - The old monolithic `analysis/new/page.tsx` was replaced with `AnalysisWorkflow` inside `frontend/src/features/analysis/`.
  - Zustand store (`store/workflow-store.ts`) centralises step state, project context, and selections.
  - Reusable UI such as the stepper lives in `features/analysis/components/`.
  - Existing presentation components (`CSVUploader`, `DataHealthDashboard`, `VariableGroupingPanel`, etc.) are orchestrated by the feature module instead of the page.

- **Testing**
  - A lightweight Vitest suite (`workflow-store.test.ts`) validates store transitions and ensures the reset behaviour is stable.

## File Map

```
frontend/
  src/
    app/
      api/
        analysis/
          lib/
            errors.ts
            parser.ts
            storage.ts
            supabase.ts
    features/
      analysis/
        AnalysisWorkflow.tsx
        components/WorkflowStepper.tsx
        index.ts
        store/
          workflow-store.ts
          workflow-store.test.ts
```

## Follow-up Ideas

- Expand API refactor to cover `groups/save`, demographic endpoints, and export routes.
- Add integration tests that mount `AnalysisWorkflow` with mocked fetch responses.
- Wire structured logs to a central collector (e.g. Supabase Logflare or Sentry breadcrumb trail).

Keep this document updated as we continue polishing the analysis experience.

