# Requirements Document

## Introduction

This specification addresses the incomplete automation in the CSV analysis workflow. Currently, after a successful CSV upload, the system automatically runs a health check but then stops, requiring manual user intervention to proceed to variable grouping. This creates friction in the user experience and prevents the "automatic grouping" feature from working as expected. The system should automatically fetch grouping suggestions immediately after the health check completes, allowing users to see suggested variable groups without additional clicks.

## Glossary

- **CSV Analysis Workflow**: The multi-step process for analyzing survey data: Upload → Health Check → Variable Grouping → Demographics → Analysis → Results
- **Health Check Step**: Automated data quality validation that runs after CSV upload
- **Variable Grouping Step**: Step where the system suggests variable groups and allows user configuration
- **Grouping API**: Backend endpoint `/api/analysis/group` that generates variable grouping suggestions
- **Workflow Automation**: Automatic progression through workflow steps without requiring manual user clicks
- **Auto-Continue**: Automatic transition from one workflow step to the next when conditions are met
- **Loading State**: Visual indicator showing that background processing is occurring
- **Variable Role Tag**: Label assigned to a variable or group indicating its role in statistical analysis (IV, DV, Mediator, Moderator, Control, Latent)
- **Independent Variable (IV)**: Predictor variable that influences the dependent variable
- **Dependent Variable (DV)**: Outcome variable being predicted or explained
- **Mediator Variable**: Variable that explains the relationship between IV and DV
- **Moderator Variable**: Variable that affects the strength/direction of the IV-DV relationship
- **Control Variable**: Variable held constant to isolate the effect of other variables
- **Latent Variable**: Unobserved construct measured by multiple indicator variables (for CFA/SEM)

## Requirements

### Requirement 1: Automatic Grouping After Health Check

**User Story:** As a researcher, I want the system to automatically fetch variable grouping suggestions after the health check completes, so that I can immediately see and configure my variable groups without clicking "Continue".

#### Acceptance Criteria

1. WHEN the health check completes successfully, THE System SHALL automatically call the grouping API endpoint
2. WHEN the grouping API is called, THE System SHALL pass the project ID, headers, and preview data
3. WHEN the grouping API returns suggestions, THE System SHALL automatically transition to the grouping step
4. WHEN the grouping API call is in progress, THE System SHALL display a loading indicator with message "Analyzing variables..."
5. WHEN the grouping API fails, THE System SHALL display an error message and allow manual retry

### Requirement 2: Seamless Workflow Progression

**User Story:** As a researcher, I want the workflow to progress smoothly from upload to grouping, so that I can focus on configuring my analysis rather than clicking through steps.

#### Acceptance Criteria

1. WHEN a CSV file is uploaded successfully, THE System SHALL automatically run the health check without user action
2. WHEN the health check completes, THE System SHALL automatically fetch grouping suggestions without user action
3. WHEN grouping suggestions are loaded, THE System SHALL display the grouping UI with suggestions pre-populated
4. WHEN any automatic step fails, THE System SHALL stop progression and display the error
5. WHEN the user navigates back to a previous step, THE System SHALL not re-trigger automatic progression

### Requirement 3: Loading State Management

**User Story:** As a researcher, I want clear visual feedback during automatic workflow progression, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. WHEN the health check is running, THE System SHALL display "Checking data quality..." message
2. WHEN the grouping API is being called, THE System SHALL display "Analyzing variables for grouping..." message
3. WHEN loading states change, THE System SHALL update the progress indicator smoothly
4. WHEN automatic steps complete, THE System SHALL show a brief success indicator before transitioning
5. WHEN the user is on the health step, THE System SHALL show both health results AND loading state for grouping

### Requirement 4: Error Handling for Auto-Continue

**User Story:** As a researcher, I want clear error messages when automatic workflow progression fails, so that I can understand what went wrong and how to proceed.

#### Acceptance Criteria

1. WHEN the grouping API fails with network error, THE System SHALL display "Failed to fetch grouping suggestions. Check your connection."
2. WHEN the grouping API fails with server error, THE System SHALL display the error message from the API response
3. WHEN an automatic step fails, THE System SHALL provide a "Retry" button to attempt the step again
4. WHEN the user clicks "Retry", THE System SHALL re-attempt the failed step with the same parameters
5. WHEN automatic progression fails, THE System SHALL log the error with correlation ID for debugging

### Requirement 5: Manual Override Option

**User Story:** As a researcher, I want the option to skip automatic grouping if needed, so that I can proceed with manual configuration when the suggestions are not helpful.

#### Acceptance Criteria

1. WHEN the grouping step loads, THE System SHALL display a "Skip Auto-Grouping" button
2. WHEN the user clicks "Skip Auto-Grouping", THE System SHALL clear suggestions and show empty grouping UI
3. WHEN the user skips auto-grouping, THE System SHALL allow manual group creation
4. WHEN the user returns to the grouping step later, THE System SHALL not re-fetch suggestions automatically
5. WHEN the user explicitly clicks "Refresh Suggestions", THE System SHALL re-call the grouping API

### Requirement 6: Preserve User Control

**User Story:** As a researcher, I want to maintain control over the workflow, so that I can review each step carefully if needed.

#### Acceptance Criteria

1. WHEN the health check completes, THE System SHALL display health results for at least 2 seconds before auto-continuing
2. WHEN the user is actively interacting with the health dashboard, THE System SHALL not auto-continue
3. WHEN the user clicks "Back" during auto-continue, THE System SHALL cancel the automatic progression
4. WHEN the user manually navigates to a step, THE System SHALL respect that navigation and not override it
5. WHEN the system auto-continues, THE System SHALL update the URL to reflect the current step

### Requirement 7: Performance Optimization

**User Story:** As a researcher, I want the workflow to progress quickly, so that I don't waste time waiting between steps.

#### Acceptance Criteria

1. WHEN the health check completes, THE System SHALL call the grouping API within 500ms
2. WHEN the grouping API is called, THE System SHALL use cached headers and preview data from upload
3. WHEN multiple API calls are needed, THE System SHALL execute them in parallel where possible
4. WHEN the grouping API response is received, THE System SHALL transition to the grouping step within 200ms
5. WHEN the workflow auto-continues, THE System SHALL preload the next step's UI components

### Requirement 8: State Persistence

**User Story:** As a researcher, I want my workflow progress to be saved, so that I can resume if I refresh the page or navigate away.

#### Acceptance Criteria

1. WHEN the workflow progresses to a new step, THE System SHALL save the current step to localStorage
2. WHEN the user refreshes the page, THE System SHALL restore the last completed step
3. WHEN grouping suggestions are fetched, THE System SHALL cache them in localStorage
4. WHEN the user returns to the grouping step, THE System SHALL load cached suggestions if available
5. WHEN the user completes the entire workflow, THE System SHALL clear the localStorage cache

### Requirement 9: Logging and Debugging

**User Story:** As a developer, I want detailed logs of the automatic workflow progression, so that I can debug issues when they occur.

#### Acceptance Criteria

1. WHEN each workflow step starts, THE System SHALL log the step name and timestamp
2. WHEN an API call is made during auto-continue, THE System SHALL log the endpoint, method, and correlation ID
3. WHEN an automatic step completes, THE System SHALL log the duration and result
4. WHEN an error occurs during auto-continue, THE System SHALL log the full error details and stack trace
5. WHEN the workflow completes, THE System SHALL log a summary of all steps and their durations

### Requirement 10: Variable Role Tagging

**User Story:** As a researcher, I want to assign roles (IV, DV, Mediator, Moderator, Control, Latent) to variables or groups, so that the system can automatically configure advanced analyses like regression, CFA, and SEM.

#### Acceptance Criteria

1. WHEN the grouping step displays a variable or group, THE System SHALL show a role tag dropdown with options: None, IV, DV, Mediator, Moderator, Control, Latent
2. WHEN a user selects a role tag for a group, THE System SHALL apply that role to all variables in the group
3. WHEN a user selects a role tag for an individual variable, THE System SHALL override the group-level role for that variable
4. WHEN the user saves the grouping configuration, THE System SHALL persist role tags to the database
5. WHEN the user proceeds to the analysis step, THE System SHALL use role tags to pre-configure analysis models

### Requirement 11: Role Tag Validation

**User Story:** As a researcher, I want the system to validate my role assignments, so that I don't configure invalid analysis models.

#### Acceptance Criteria

1. WHEN a user assigns multiple groups as DV for regression, THE System SHALL show a warning "Regression requires exactly one DV"
2. WHEN a user assigns no IV for regression, THE System SHALL show a warning "Regression requires at least one IV"
3. WHEN a user assigns Latent role without grouping variables, THE System SHALL show an error "Latent variables require at least 3 indicator variables"
4. WHEN role assignments are valid, THE System SHALL show a success indicator "Ready for [Analysis Type]"
5. WHEN the user attempts to proceed with invalid roles, THE System SHALL block progression and highlight errors

### Requirement 12: Smart Role Suggestions

**User Story:** As a researcher, I want the system to suggest appropriate roles based on variable names and patterns, so that I can quickly configure my analysis model.

#### Acceptance Criteria

1. WHEN a variable name contains "outcome", "result", "satisfaction", THE System SHALL suggest DV role
2. WHEN a variable name contains "age", "gender", "income", "education", THE System SHALL suggest Control role
3. WHEN variables are grouped with semantic meaning (e.g., "Trust", "Quality"), THE System SHALL suggest Latent role
4. WHEN the user accepts a role suggestion, THE System SHALL apply it immediately
5. WHEN the user rejects a role suggestion, THE System SHALL not suggest it again for that variable

### Requirement 13: Role Tag Visualization

**User Story:** As a researcher, I want clear visual indicators for variable roles, so that I can quickly understand my analysis model structure.

#### Acceptance Criteria

1. WHEN a variable has an IV role, THE System SHALL display it with a blue "IV" badge
2. WHEN a variable has a DV role, THE System SHALL display it with a green "DV" badge
3. WHEN a variable has a Mediator role, THE System SHALL display it with a purple "M" badge
4. WHEN a variable has a Moderator role, THE System SHALL display it with an orange "Mod" badge
5. WHEN a variable has a Control role, THE System SHALL display it with a gray "Ctrl" badge
6. WHEN a variable has a Latent role, THE System SHALL display it with a gold "Latent" badge and show its indicators

### Requirement 14: Analysis Model Preview

**User Story:** As a researcher, I want to see a preview of my analysis model based on role assignments, so that I can verify the configuration before running analyses.

#### Acceptance Criteria

1. WHEN the user assigns roles to variables, THE System SHALL display a model diagram showing relationships
2. WHEN the model is valid for regression, THE System SHALL show "IV → DV" arrows
3. WHEN the model includes mediators, THE System SHALL show "IV → M → DV" path
4. WHEN the model includes moderators, THE System SHALL show interaction effects
5. WHEN the model is valid for SEM, THE System SHALL show latent variables with their indicators

### Requirement 15: Backward Compatibility

**User Story:** As a system administrator, I want the automatic workflow to work with existing projects, so that users can continue their in-progress analyses.

#### Acceptance Criteria

1. WHEN a user loads an existing project at the health step, THE System SHALL not auto-continue to grouping
2. WHEN a user loads an existing project at the grouping step, THE System SHALL load saved groups if available
3. WHEN a user creates a new project, THE System SHALL use the automatic workflow
4. WHEN the automatic workflow is disabled via feature flag, THE System SHALL fall back to manual progression
5. WHEN the user has previously saved groups, THE System SHALL not override them with new suggestions

