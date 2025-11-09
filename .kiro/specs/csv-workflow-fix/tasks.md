op# Implementation Plan: CSV Analysis Workflow Fix

## Overview
Fix the CSV analysis workflow to defer R server connectivity until analysis execution, allowing users to complete data upload, health check, variable grouping, and demographic configuration without requiring R server availability.

---

## Phase 1: Client-Side Data Health Service

- [x] 1. Create data health service with JavaScript-based analysis


  - Create `frontend/src/services/data-health.service.ts`
  - Implement missing value analysis function
  - Implement outlier detection using IQR method
  - Implement basic statistics calculation (mean, median, std, min, max, quartiles)
  - Implement data type detection (numeric, categorical, text, date)
  - Implement quality score calculation algorithm
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Create statistical utilities module


  - Create `frontend/src/lib/statistics.ts`
  - Implement quartile calculation
  - Implement IQR outlier detection
  - Implement variance and standard deviation
  - Implement median calculation
  - _Requirements: 5.3, 5.4_

- [x] 3. Add TypeScript interfaces for data health


  - Update `frontend/src/types/analysis.ts`
  - Add `DataHealthReport` interface
  - Add `MissingValueReport` interface
  - Add `OutlierReport` interface
  - Add `BasicStats` interface
  - Add `QualityMetrics` interface
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Phase 2: Variable Grouping Service

- [x] 4. Create variable grouping service



  - Create `frontend/src/services/variable-grouping.service.ts`
  - Implement prefix pattern detection (e.g., Q1_, Q2_)
  - Implement numbering pattern detection (e.g., Item1, Item2)
  - Implement semantic similarity grouping
  - Implement group suggestion algorithm
  - _Requirements: 1.2, 2.2_

- [ ] 5. Add grouping suggestion UI
  - Update `frontend/src/components/analysis/VariableGroupEditor.tsx`
  - Display auto-generated group suggestions
  - Add accept/reject suggestion buttons
  - Add manual group creation
  - Add drag-and-drop variable assignment
  - _Requirements: 2.2_

---

## Phase 3: Remove R Server Dependency from Upload Flow

- [-] 6. Update data upload component

  - Modify `frontend/src/components/analysis/data-upload.tsx`
  - Remove all R server health check calls
  - Keep only CSV parsing and validation
  - Integrate client-side data health service
  - Auto-calculate statistics after upload
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Update analysis page to remove initial R check
  - Modify `frontend/src/app/(dashboard)/analysis/page.tsx`
  - Remove R server health check from `useEffect`
  - Remove blocking error states for R server
  - Allow workflow progression without R server
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

---

## Phase 4: Defer R Server Check to Execution

- [x] 8. Update analysis service with deferred R check


  - Modify `frontend/src/services/analysis.service.ts`
  - Create `checkRServerAvailability()` function
  - Update `executeAnalysis()` to check R server first
  - Add timeout handling (5 seconds)
  - Return detailed error with instructions
  - _Requirements: 1.4, 1.5, 3.1, 3.2, 3.3, 3.4_

- [x] 9. Create R server error class

  - Add to `frontend/src/lib/errors.ts`
  - Create `RServerUnavailableError` class
  - Include instructions property
  - Include server URL property
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Create R server error display component



  - Create `frontend/src/components/errors/RServerErrorDisplay.tsx`
  - Display clear error message
  - Show startup instructions with code blocks
  - Add "Retry Connection" button
  - Add "Check Server Status" button (opens Swagger docs)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

---

## Phase 5: Update Analysis Execution Flow

- [ ] 11. Update analysis execution handler
  - Modify analysis execution in main page
  - Add R server availability check before execution
  - Handle `RServerUnavailableError` specifically
  - Display R server error component when needed
  - Allow retry after R server starts
  - _Requirements: 1.4, 1.5, 3.5, 4.3, 4.4_

- [ ] 12. Update analysis API routes
  - Modify `frontend/src/app/api/analysis/execute/route.ts`
  - Add R server health check at API level
  - Return appropriate error responses
  - Include server status in response
  - _Requirements: 1.4, 1.5_

---

## Phase 6: Configuration Persistence

- [ ] 13. Ensure configuration saves without R server
  - Verify `frontend/src/app/api/analysis/config/save/route.ts`
  - Ensure saves work without R server check
  - Test variable group saving
  - Test demographic configuration saving
  - Test analysis selection saving
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 14. Update project status management
  - Modify project status updates
  - Set status to "configured" after configuration complete
  - Set status to "analyzing" when execution starts
  - Set status to "completed" after successful analysis
  - Set status to "error" on analysis failure
  - _Requirements: 4.5_

---

## Phase 7: Enhanced Error Messages

- [ ] 15. Update error message translations
  - Remove generic Vietnamese error messages
  - Add specific English error messages
  - Include R server startup commands
  - Include expected server URL
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 16. Add error recovery suggestions
  - Display "Start R Server" instructions
  - Show Docker Compose command
  - Show PowerShell script command
  - Link to R server documentation
  - _Requirements: 3.2, 3.3, 3.5_

---

## Phase 8: Testing & Validation

- [ ] 17. Test upload flow without R server
  - Upload CSV file
  - Verify data health calculation works
  - Verify statistics are calculated
  - Verify no R server errors appear
  - Verify workflow can proceed
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 18. Test variable grouping
  - Verify auto-grouping suggestions appear
  - Test accepting suggestions
  - Test rejecting suggestions
  - Test manual group creation
  - Verify groups save to database
  - _Requirements: 2.2_

- [ ] 19. Test demographic configuration
  - Configure demographic variables
  - Create rank categories
  - Verify saves without R server
  - Verify configuration persists
  - _Requirements: 2.3, 4.1, 4.2_

- [ ] 20. Test analysis execution with R server offline
  - Select analysis types
  - Click "Execute Analysis"
  - Verify clear error message appears
  - Verify instructions are displayed
  - Verify "Retry" button works
  - _Requirements: 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 21. Test analysis execution with R server online
  - Start R server
  - Click "Execute Analysis"
  - Verify R server check passes
  - Verify analysis executes successfully
  - Verify results display correctly
  - _Requirements: 1.4, 4.3, 4.4_

- [ ] 22. Test configuration reload
  - Save configuration
  - Close browser
  - Reopen project
  - Verify configuration loads without R server check
  - Verify can execute analysis with loaded config
  - _Requirements: 4.2, 4.3_

---

## Phase 9: Performance Optimization

- [ ] 23. Optimize large dataset handling
  - Implement data sampling for preview (first 10,000 rows)
  - Add Web Worker for heavy calculations
  - Add progress indicators for long calculations
  - Cache calculated statistics
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 24. Add loading states
  - Add skeleton loaders for data health
  - Add progress bar for statistics calculation
  - Add spinner for variable grouping
  - Improve user feedback during processing
  - _Requirements: 1.1, 1.2_

---

## Phase 10: Documentation & Cleanup

- [ ] 25. Update user documentation
  - Document new workflow (upload → health → group → configure → execute)
  - Document R server requirements
  - Document how to start R server
  - Add troubleshooting guide
  - _Requirements: 3.2, 3.3_

- [ ] 26. Code cleanup
  - Remove unused R server check code
  - Remove deprecated health check endpoints
  - Clean up console.log statements
  - Update comments and documentation
  - _Requirements: All_

- [ ] 27. Add monitoring and logging
  - Log workflow progression
  - Log R server availability checks
  - Log analysis execution attempts
  - Track error rates
  - _Requirements: 1.4, 1.5, 3.1_

---

## Success Criteria

✓ Users can upload CSV and see data health without R server
✓ Users can configure entire analysis without R server
✓ R server check only happens when executing analysis
✓ Clear error messages with instructions when R server unavailable
✓ Configuration persists and can be executed later
✓ All statistics calculated client-side (JavaScript)
✓ R server only used for: Cronbach, EFA, CFA, SEM, ANOVA, Regression, VIF

---

## Notes

- JavaScript handles: Upload, parsing, data health, descriptive stats, grouping, configuration
- R server handles: Cronbach's Alpha, EFA, CFA, SEM, ANOVA, Multiple Regression, VIF
- R server is running and healthy at http://localhost:8000
- Focus on user experience - allow workflow completion even when R server offline
- Provide clear, actionable error messages with exact commands to fix issues
