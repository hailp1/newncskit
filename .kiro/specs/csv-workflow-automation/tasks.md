# Implementation Plan

- [x] 1. Update type definitions for role tagging





  - Create or update `frontend/src/types/analysis.ts` with new types
  - Add `VariableRole` enum type
  - Add `VariableRoleTag` interface
  - Add `GroupRoleTag` interface
  - Add `RoleSuggestion` interface
  - Add `AnalysisModelValidation` interface
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Create RoleSuggestionService





  - [x] 2.1 Create service file and basic structure


    - Create `frontend/src/services/role-suggestion.service.ts`
    - Define keyword arrays for each role type (DV, Control, Mediator)
    - Export RoleSuggestionService class
    - _Requirements: 12.1, 12.2, 12.3_


  - [x] 2.2 Implement suggestRoles method

    - Implement keyword matching logic for DV detection
    - Implement keyword matching logic for Control detection
    - Implement keyword matching logic for Mediator detection
    - Calculate confidence scores based on matches
    - Return RoleSuggestion array with reasons
    - _Requirements: 12.1, 12.2, 12.3, 12.4_


  - [x] 2.3 Implement suggestLatentVariables method

    - Filter groups with 3+ variables
    - Generate latent variable suggestions
    - Include confidence scores and reasons
    - _Requirements: 12.3, 11.3_

- [x] 3. Create RoleValidationService








  - [x] 3.1 Implement regression validation

    - Create `frontend/src/services/role-validation.service.ts`
    - Implement `validateForRegression` method
    - Check for exactly 1 DV
    - Check for at least 1 IV
    - Generate warnings for >10 IVs
    - Suggest control variables if missing
    - _Requirements: 11.1, 11.2_

  - [x] 3.2 Implement SEM validation

    - Implement `validateForSEM` method
    - Check for at least 2 latent variables
    - Validate each latent has 3+ indicators
    - Check for dependent variables
    - Generate appropriate warnings
    - _Requirements: 11.3, 11.4_


  - [x] 3.3 Implement mediation validation




    - Implement `validateForMediation` method
    - Check for IV, DV, and Mediator presence
    - Warn about multiple mediators
    - _Requirements: 11.1, 11.2_


  - [x] 3.4 Implement combined validation






    - Implement `validateAll` method
    - Combine results from all validation methods
    - Return aggregated analysis types, errors, warnings
    - _Requirements: 11.4, 11.5_

- [x] 4. Create RoleTagSelector component


  - Create `frontend/src/components/analysis/RoleTagSelector.tsx`
  - Implement role dropdown with all options (None, IV, DV, Mediator, Moderator, Control, Latent)
  - Add color coding for each role type
  - Display suggestion button when available
  - Show confidence percentage for suggestions
  - Handle role change events
  - Add disabled state support
  - _Requirements: 10.1, 10.2, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 5. Create ModelPreview component
  - [x] 5.1 Create component structure


    - Create `frontend/src/components/analysis/ModelPreview.tsx`
    - Add validation status display
    - Add error/warning sections
    - _Requirements: 14.1, 11.4_

  - [x] 5.2 Implement Mermaid diagram generation

    - Implement `generateMermaidDiagram` function
    - Generate nodes for IVs, DVs, Mediators
    - Generate relationship arrows
    - Handle mediation paths (IV → M → DV)
    - Handle direct paths (IV → DV)
    - Add control variable dotted lines
    - Sanitize variable names for Mermaid syntax
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

  - [x] 5.3 Implement RoleSummary component

    - Create RoleSummary sub-component
    - Display count for each role type
    - Show variable names in summary
    - Add visual styling per role
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 6. Update VariableGroupingPanel component
  - [x] 6.1 Add role tagging state management


    - Import new types and services
    - Add `roleTags` state
    - Add `roleSuggestions` state
    - Add `validationResult` state
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 6.2 Implement role suggestion generation


    - Add useEffect to generate suggestions on mount
    - Call RoleSuggestionService.suggestRoles
    - Initialize roleTags with 'none' for all variables
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 6.3 Implement real-time validation


    - Add useEffect to validate on roleTags/groups change
    - Call RoleValidationService.validateAll
    - Update validationResult state
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 6.4 Add role change handlers


    - Implement handleRoleChange for individual variables
    - Implement handleGroupRoleChange for groups
    - Update roleTags state with isUserAssigned flag
    - _Requirements: 10.2, 10.3_

  - [x] 6.5 Update UI with role selectors


    - Add role tagging section to JSX
    - Render RoleTagSelector for each group
    - Render RoleTagSelector for each variable in group
    - Pass suggestions to selectors
    - _Requirements: 10.1, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 6.6 Add ModelPreview to UI


    - Import and render ModelPreview component
    - Pass roleTags, groups, and validationResult
    - Position below role selectors
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 6.7 Update save button with validation



    - Disable save button when validation fails
    - Show analysis types in button text when valid
    - Show error message when invalid
    - _Requirements: 11.4, 11.5_

- [x] 7. Implement auto-continue from health to grouping







  - [x] 7.1 Update NewAnalysisPage with auto-continue logic

    - Open `frontend/src/app/(dashboard)/analysis/new/page.tsx`
    - Add useEffect to detect health step completion
    - Auto-call handleHealthContinue when conditions met
    - Add loading state for grouping API call
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_


  - [x] 7.2 Add error handling for auto-continue

    - Catch errors from grouping API
    - Display error message with retry button
    - Implement retry logic
    - Log errors with correlation ID

    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.3 Add loading feedback

    - Show "Analyzing variables for grouping..." message
    - Update progress indicator
    - Show brief success indicator before transition
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Update grouping API to include role suggestions





  - Open `frontend/src/app/api/analysis/group/route.ts`
  - Import RoleSuggestionService
  - Generate role suggestions for variables
  - Generate latent suggestions for groups
  - Add roleSuggestions to API response
  - Update response type definition
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9. Create database migration for role tags





  - Create migration file for `variable_role_tags` table
  - Add columns: id, project_id, variable_id, group_id, role, is_user_assigned, confidence, reason
  - Add CHECK constraint for role enum values
  - Add CHECK constraint for entity (variable XOR group)
  - Create indexes on project_id, variable_id, group_id
  - Add default_role column to variable_groups table
  - _Requirements: 10.4_

- [x] 10. Create API endpoint for saving role tags





  - [x] 10.1 Create save endpoint


    - Create `frontend/src/app/api/analysis/roles/save/route.ts`
    - Accept projectId and roleTags in request body
    - Validate request data
    - _Requirements: 10.4_

  - [x] 10.2 Implement database operations


    - Delete existing role tags for project
    - Insert new role tags
    - Handle errors and rollback on failure
    - Return success response
    - _Requirements: 10.4, 10.5_

- [x] 11. Implement state persistence






  - [x] 11.1 Add localStorage caching

    - Save roleTags to localStorage on change
    - Save validationResult to localStorage
    - Implement debounced save (every 30s)
    - _Requirements: 8.1, 8.3_


  - [x] 11.2 Implement state restoration

    - Load roleTags from localStorage on mount
    - Load cached grouping suggestions
    - Clear cache after successful database save
    - _Requirements: 8.2, 8.4, 8.5_

- [x] 12. Add manual override options





  - Add "Skip Auto-Grouping" button to UI
  - Implement skip handler to clear suggestions
  - Add "Refresh Suggestions" button
  - Implement refresh handler to re-fetch suggestions
  - Prevent auto-fetch on return to step
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Implement user control features





  - Add 2-second delay before auto-continue
  - Detect user interaction with health dashboard
  - Cancel auto-continue on user interaction
  - Handle back navigation during auto-continue
  - Update URL on step transition
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 14. Add logging and debugging





  - Log workflow step transitions with timestamps
  - Log API calls with correlation IDs
  - Log step durations
  - Log errors with full details and stack traces
  - Log workflow completion summary
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 15. Implement backward compatibility





  - Check if project is new or existing
  - Skip auto-continue for existing projects at health step
  - Load saved groups for existing projects
  - Don't override saved groups with new suggestions
  - Add feature flag support for auto-continue
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16. Add performance optimizations





  - Implement lazy loading for RoleTagSelector
  - Add React.memo to RoleTagSelector
  - Memoize validation results
  - Memoize model preview diagram
  - Debounce validation by 300ms
  - Cache role suggestions in localStorage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17. Write unit tests






  - [x]* 17.1 Test RoleSuggestionService


    - Test keyword detection for DV
    - Test keyword detection for Control
    - Test keyword detection for Mediator
    - Test confidence scoring
    - Test edge cases (empty names, special characters)
    - _Requirements: 12.1, 12.2, 12.3_

  - [x]* 17.2 Test RoleValidationService


    - Test regression validation rules
    - Test SEM validation rules
    - Test mediation validation rules
    - Test combined validation
    - Test error/warning generation
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x]* 17.3 Test auto-continue logic


    - Test useEffect triggers correctly
    - Test loading states
    - Test error handling
    - Test retry mechanism
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

- [ ] 18. Manual testing and validation
  - [ ] 18.1 Test auto-continue workflow
    - Upload CSV and verify auto-progression
    - Verify grouping suggestions appear immediately
    - Test error scenarios and retry
    - Test skip option
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 18.2 Test role assignment
    - Assign IV role to variables
    - Assign DV role to variables
    - Verify "Ready for Regression" appears
    - Assign Latent role to groups
    - Verify SEM validation
    - Test invalid configurations
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 18.3 Test role suggestions
    - Verify suggestions appear for appropriate variables
    - Test accepting suggestions
    - Test rejecting suggestions
    - Verify confidence scores
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 18.4 Test model preview
    - Verify diagram renders correctly
    - Test different model configurations
    - Verify validation messages
    - Test role summaries
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 18.5 Test persistence and state
    - Test role tags persist after save
    - Test state restoration after refresh
    - Test backward navigation
    - Test localStorage caching
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

