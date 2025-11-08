# Implementation Plan: CSV Analysis Workflow

## Overview

This implementation plan breaks down the CSV Analysis Workflow feature into manageable tasks. Each task builds incrementally on previous work.

---

## Phase 1: Database Schema & Core Infrastructure

### Task 1: Database Schema Setup

- [ ] 1.1 Create database migration files
  - Create `analysis_projects` table with all fields
  - Create `analysis_variables` table with relationships
  - Create `variable_groups` table
  - Create `demographic_ranks` table
  - Create `ordinal_categories` table
  - Create `analysis_configurations` table
  - Create `analysis_results` table
  - Add all necessary indexes
  - _Requirements: All requirements depend on data persistence_

- [ ] 1.2 Create TypeScript types and interfaces
  - Define all database model types
  - Define API request/response types
  - Define component prop types
  - Create type guards and validators
  - _Requirements: All requirements_

- [ ] 1.3 Setup Supabase storage bucket
  - Create `analysis-csv-files` bucket
  - Configure bucket policies for user access
  - Setup file size limits (50MB)
  - Configure allowed file types (CSV only)
  - _Requirements: 1.1, 1.5, 10.1_

---

## Phase 2: CSV Upload & Parsing

### Task 2: CSV Upload Component

- [ ] 2.1 Create CSVUploader component
  - Implement drag & drop interface
  - Add file validation (format, size)
  - Show upload progress indicator
  - Display error messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2.2 Create CSV upload API endpoint
  - Implement POST /api/analysis/upload
  - Validate file format and size
  - Upload file to Supabase Storage
  - Parse CSV headers
  - Create project record in database
  - Return preview of first 10 rows
  - _Requirements: 1.1, 1.4, 1.5, 10.1_

- [ ] 2.3 Create CSVParserService
  - Implement CSV parsing with papaparse
  - Add data type detection logic
  - Create preview generation function
  - Add validation methods
  - Handle encoding issues (UTF-8, UTF-16)
  - _Requirements: 1.5, 2.1_

---

## Phase 3: Data Health Check

### Task 3: Data Health Analysis

- [ ] 3.1 Create DataHealthService
  - Implement missing value detection
  - Implement outlier detection (IQR method)
  - Implement data type inference
  - Calculate quality score algorithm
  - Generate recommendations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.2 Create health check API endpoint
  - Implement POST /api/analysis/health
  - Load CSV from storage
  - Run health analysis
  - Save variable metadata to database
  - Return health report
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3.3 Create DataHealthDashboard component
  - Display overall quality score with color coding
  - Show missing data visualization (chart)
  - Display outlier detection results
  - Show data type distribution
  - List recommendations
  - Add "Continue" button
  - _Requirements: 2.6_

---

## Phase 4: Variable Grouping

### Task 4: Automatic Variable Grouping

- [ ] 4.1 Create VariableGroupService
  - Implement naming pattern analysis
  - Detect common prefixes (Q1_, Q2_, etc.)
  - Implement correlation-based grouping
  - Generate grouping suggestions with confidence scores
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4.2 Create variable grouping API endpoint
  - Implement POST /api/analysis/group
  - Load variables from database
  - Run grouping analysis
  - Return suggestions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Create VariableGroupEditor component
  - Display suggested groups
  - Implement drag & drop for variables
  - Add group creation/editing interface
  - Add accept/reject suggestion buttons
  - Show variable list with search/filter
  - _Requirements: 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

---

## Phase 5: Demographic Configuration

### Task 5: Demographic Variable Setup

- [ ] 5.1 Create DemographicConfig component
  - Display all variables in selectable list
  - Highlight suggested demographic variables
  - Add semantic name input field
  - Add variable type selector (categorical/ordinal/continuous)
  - Show demographic summary panel
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.2.1-4.2.9_

- [ ] 5.2 Create RankCreator component
  - Display rank creation interface
  - Add rank definition form (label, min, max)
  - Implement range validation (no overlaps)
  - Support open-ended ranges (< and >)
  - Show real-time distribution preview
  - Display count per rank
  - Add/edit/delete rank buttons
  - _Requirements: 4.1.1-4.1.10_

- [ ] 5.3 Create DemographicService
  - Implement rank creation logic
  - Implement data categorization into ranks
  - Validate rank definitions
  - Generate rank distribution preview
  - Handle ordinal category ordering
  - _Requirements: 4.1.1-4.1.10, 4.2.1-4.2.9_

- [ ] 5.4 Create demographic configuration API endpoint
  - Implement POST /api/analysis/config
  - Save variable groups to database
  - Save demographic designations
  - Save rank definitions
  - Save ordinal categories
  - Update project status to 'configured'
  - _Requirements: 4.1-4.7, 4.1.1-4.1.10, 4.2.1-4.2.9, 10.2, 10.3, 10.4_

---

## Phase 6: Analysis Selection & Configuration

### Task 6: Analysis Type Selection

- [ ] 6.1 Create AnalysisSelector component
  - Display available analysis types with descriptions
  - Add checkbox selection for each type
  - Show prerequisites for each analysis
  - Display configuration options per analysis
  - Validate prerequisites are met
  - Show estimated execution time
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 6.2 Create analysis configuration forms
  - Descriptive stats options (by group, confidence level)
  - Reliability analysis options (scale selection)
  - EFA options (rotation method, factor count)
  - CFA options (model specification)
  - Correlation options (method: Pearson/Spearman)
  - ANOVA options (post-hoc tests)
  - Regression options (model specification)
  - SEM options (model syntax, estimator)
  - _Requirements: 6.1-6.7_

---

## Phase 7: Analysis Execution

### Task 7: Execute R Analytics

- [ ] 7.1 Create AnalysisService
  - Implement data preparation for R
  - Apply demographic ranks/categories
  - Format data for each analysis type
  - Call R Analytics API endpoints
  - Handle analysis errors
  - Save results to database
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.5_

- [ ] 7.2 Create analysis execution API endpoint
  - Implement POST /api/analysis/execute
  - Load project configuration
  - Load and prepare CSV data
  - Execute selected analyses sequentially
  - Update project status during execution
  - Return job ID for progress tracking
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 7.3 Integrate with R Analytics endpoints
  - Call /analysis/descriptive for descriptive stats
  - Call /analysis/reliability for Cronbach's Alpha
  - Call /analysis/efa for exploratory factor analysis
  - Call /analysis/cfa for confirmatory factor analysis
  - Call /analysis/correlation for correlation matrix
  - Call /analysis/anova-oneway for ANOVA
  - Call /analysis/regression-linear for regression
  - Call /analysis/sem for structural equation modeling
  - _Requirements: 7.1, 7.6_

- [ ] 7.4 Create progress tracking component
  - Display analysis progress indicator
  - Show current analysis being executed
  - Add cancel button
  - Poll for status updates
  - Handle completion/error states
  - _Requirements: 7.2, 7.3_

---

## Phase 8: Results Visualization

### Task 8: Display Analysis Results

- [ ] 8.1 Create ResultsViewer component
  - Implement tabbed interface for different analyses
  - Display descriptive statistics tables
  - Show reliability analysis results
  - Display factor loadings tables with highlighting
  - Show correlation heatmap
  - Display ANOVA results with post-hoc tests
  - Show regression coefficients and diagnostics
  - Display SEM path diagram and fit indices
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 8.2 Create results API endpoint
  - Implement GET /api/analysis/results/:projectId
  - Load project details
  - Load all analysis results
  - Format results for display
  - Return structured data
  - _Requirements: 8.1-8.6, 10.5_

- [ ] 8.3 Create visualization components
  - DescriptiveStatsTable component
  - ReliabilityTable component (with alpha if deleted)
  - FactorLoadingsTable component (with highlighting)
  - CorrelationHeatmap component
  - ANOVAResultsTable component
  - RegressionTable component
  - SEMDiagram component (path diagram)
  - FitIndicesTable component
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

---

## Phase 9: Export Functionality

### Task 9: Professional Export Formats

- [ ] 9.1 Create ResultFormatterService
  - Implement Excel formatting (SPSS-style)
  - Implement PDF formatting (professional report)
  - Format descriptive stats tables
  - Format factor loadings with highlighting
  - Format correlation matrix with significance stars
  - Format SEM path coefficients
  - Format model fit indices
  - Add significance indicators (*, **, ***)
  - _Requirements: 8.6_

- [ ] 9.2 Create Excel export functionality
  - Implement multi-sheet workbook creation
  - Sheet 1: Descriptive Statistics
  - Sheet 2: Reliability Analysis
  - Sheet 3: Factor Loadings (EFA)
  - Sheet 4: Model Fit (CFA/SEM)
  - Sheet 5: Path Coefficients (SEM)
  - Sheet 6: Correlation Matrix
  - Sheet 7: ANOVA Results
  - Sheet 8: Regression Results
  - Apply professional formatting (borders, colors, bold)
  - Add formulas where appropriate
  - _Requirements: 8.6_

- [ ] 9.3 Create PDF export functionality
  - Generate cover page with project info
  - Add data overview section
  - Format each analysis in separate section
  - Include charts and visualizations
  - Add interpretation notes
  - Create appendices with detailed tables
  - Apply professional styling
  - _Requirements: 8.6_

- [ ] 9.4 Create export API endpoints
  - Implement POST /api/analysis/export/excel
  - Implement POST /api/analysis/export/pdf
  - Generate export files
  - Upload to temporary storage
  - Return download URL with expiration
  - Clean up expired files
  - _Requirements: 8.6, 10.6_

- [ ] 9.5 Add export buttons to UI
  - Add "Export to Excel" button
  - Add "Export to PDF" button
  - Show export options dialog
  - Display download progress
  - Handle download errors
  - _Requirements: 8.6_

---

## Phase 10: Workflow Navigation & Polish

### Task 10: Complete Workflow Integration

- [ ] 10.1 Create workflow stepper component
  - Display step indicator (1. Upload → 2. Health → 3. Group → 4. Demographic → 5. Analyze → 6. Results)
  - Highlight current step
  - Allow navigation to previous steps
  - Prevent skipping required steps
  - Show completion status per step
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10.2 Create main analysis page
  - Implement /analysis/new route
  - Integrate all workflow components
  - Handle step transitions
  - Save progress automatically
  - Show save indicators
  - _Requirements: 9.1-9.5, 10.1-10.6_

- [ ] 10.3 Create project list page
  - Display user's analysis projects
  - Show project status badges
  - Add search and filter
  - Add sort options (date, name, status)
  - Add delete project functionality
  - _Requirements: 10.5, 10.6_

- [ ] 10.4 Create project detail page
  - Implement /analysis/[id] route
  - Display project overview
  - Show configuration summary
  - Display all results
  - Add re-run analysis button
  - Add export buttons
  - _Requirements: 10.5_

- [ ] 10.5 Add error handling and validation
  - Validate all user inputs
  - Show clear error messages
  - Handle API errors gracefully
  - Add retry mechanisms
  - Log errors to monitoring service
  - _Requirements: All requirements_

- [ ] 10.6 Add loading states and feedback
  - Show loading spinners during operations
  - Display progress indicators
  - Show success/error toasts
  - Add skeleton loaders
  - Implement optimistic UI updates
  - _Requirements: All requirements_

---

## Phase 11: Testing & Documentation

### Task 11: Testing

- [ ]* 11.1 Write unit tests
  - Test CSV parsing logic
  - Test data type detection
  - Test outlier detection
  - Test rank categorization
  - Test variable grouping suggestions
  - Test result formatting
  - _Requirements: All requirements_

- [ ]* 11.2 Write integration tests
  - Test API endpoint workflows
  - Test database operations
  - Test R Analytics integration
  - Test file upload/download
  - Test export generation
  - _Requirements: All requirements_

- [ ]* 11.3 Write E2E tests
  - Test complete workflow from upload to results
  - Test demographic rank creation
  - Test analysis execution
  - Test results export
  - _Requirements: All requirements_

### Task 12: Documentation

- [ ]* 12.1 Create user documentation
  - Write user guide for CSV upload
  - Document variable grouping process
  - Explain demographic configuration
  - Document analysis types and options
  - Create export format examples
  - _Requirements: All requirements_

- [ ]* 12.2 Create developer documentation
  - Document API endpoints
  - Document database schema
  - Document service interfaces
  - Add code examples
  - Document R Analytics integration
  - _Requirements: All requirements_

---

## Notes

- Tasks marked with `*` are optional and can be implemented after core functionality
- Each task should be completed and tested before moving to the next
- Database migrations should be run in development environment first
- R Analytics Service must be running for Phase 7 and beyond
- Consider implementing Phase 9 (Export) in parallel with Phase 8 (Results)

---

**Total Tasks**: 12 main tasks with 60+ sub-tasks  
**Estimated Time**: 4-6 weeks for full implementation  
**Priority**: High (Core feature for research platform)
