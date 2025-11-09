# Requirements Document

## Introduction

This specification addresses two critical improvements to the NCSKit platform:

**Phase 1**: Standardize and fix the data analysis workflow to ensure automatic variable grouping and demographic detection are properly triggered at the first step of the analysis process.

**Phase 2**: Complete the campaigns feature implementation by connecting frontend components to backend APIs and implementing missing functionality.

## Glossary

- **System**: The NCSKit web application
- **User**: Researcher or analyst using the platform
- **Analysis Workflow**: Multi-step process for CSV data analysis (upload → health-check → grouping → demographic → analysis-selection → execution → results)
- **Variable Grouping**: Automatic detection and organization of related variables into logical groups
- **Demographic Detection**: Automatic identification of demographic variables (age, gender, location, etc.)
- **Campaign**: Survey distribution campaign with participant targeting and token rewards
- **Auto-detection**: Automatic pattern recognition that runs on component mount
- **Workflow Store**: Zustand state management for workflow progress

## Requirements

### Phase 1: Data Analysis Workflow Standardization

#### Requirement 1: Automatic Variable Grouping Activation

**User Story:** As a researcher, I want variable grouping suggestions to appear automatically when I reach the grouping step, so that I don't have to manually trigger the detection process.

##### Acceptance Criteria

1. WHEN THE User navigates to the grouping step, THE System SHALL automatically trigger variable grouping detection within 500ms
2. WHEN THE grouping detection completes, THE System SHALL display detected group suggestions with visual feedback (animated cards)
3. WHEN THE User has no variables to group, THE System SHALL display an empty state message with guidance
4. WHILE THE detection is running, THE System SHALL show a loading skeleton with "Detecting Grouping Patterns..." message
5. WHEN THE detection finds 0 groups, THE System SHALL hide the suggestions section and show only the "Create New Group" option

#### Requirement 2: Automatic Demographic Detection Activation

**User Story:** As a researcher, I want demographic variables to be automatically detected and pre-selected when I reach the demographic step, so that I can quickly configure my analysis without manual selection.

##### Acceptance Criteria

1. WHEN THE User navigates to the demographic step, THE System SHALL automatically trigger demographic detection within 500ms
2. WHEN THE detection completes, THE System SHALL auto-select variables with confidence > 80%
3. WHEN THE System auto-selects variables, THE System SHALL display a banner showing "X auto-selected" count
4. WHILE THE detection is running, THE System SHALL show skeleton loading for variable rows
5. WHEN THE detection finds high-confidence demographics, THE System SHALL scroll them into view with smooth animation

#### Requirement 3: Workflow Step Integration

**User Story:** As a researcher, I want the workflow to guide me through each step sequentially, ensuring all auto-detection processes run at the right time.

##### Acceptance Criteria

1. WHEN THE User completes the health-check step, THE System SHALL automatically navigate to the grouping step
2. WHEN THE User navigates to the grouping step, THE System SHALL mark it as the current step in the workflow store
3. WHEN THE grouping step becomes active, THE System SHALL trigger the useEffect hook that runs auto-detection
4. WHEN THE User completes the grouping step, THE System SHALL automatically navigate to the demographic step
5. WHEN THE demographic step becomes active, THE System SHALL trigger the useEffect hook that runs auto-detection

#### Requirement 4: Detection State Management

**User Story:** As a researcher, I want to see clear visual feedback during detection processes, so that I know the system is working and when results are ready.

##### Acceptance Criteria

1. WHEN THE detection starts, THE System SHALL set isDetecting state to true
2. WHEN THE detection completes, THE System SHALL set isDetecting state to false after 500ms delay
3. WHILE isDetecting is true, THE System SHALL display animated loading indicators (spinning icons, skeleton screens)
4. WHEN THE detection completes, THE System SHALL animate the results into view with fade-in and slide-in effects
5. WHEN THE detection fails, THE System SHALL display an error message with retry option

#### Requirement 5: Data Persistence and Recovery

**User Story:** As a researcher, I want my grouping and demographic selections to be saved automatically, so that I don't lose work if I navigate away or refresh the page.

##### Acceptance Criteria

1. WHEN THE User makes changes to groups or demographics, THE System SHALL mark the data as dirty (hasUnsavedChanges = true)
2. WHEN THE data is dirty for 30 seconds, THE System SHALL automatically save to localStorage
3. WHEN THE User returns to a step with saved data, THE System SHALL prompt to restore from localStorage
4. WHEN THE User explicitly saves, THE System SHALL persist to database with retry logic (3 attempts)
5. WHEN THE save fails after retries, THE System SHALL keep data in localStorage and show error notification

### Phase 2: Campaigns Feature Completion

#### Requirement 6: Backend API Integration

**User Story:** As a researcher, I want to create and manage survey campaigns through a complete backend API, so that campaigns are properly stored and tracked in the database.

##### Acceptance Criteria

1. WHEN THE User submits a campaign creation form, THE System SHALL POST data to /api/survey-campaigns endpoint
2. WHEN THE campaign is created, THE System SHALL return a campaign ID and store it in the database
3. WHEN THE User launches a campaign, THE System SHALL POST to /api/survey-campaigns/:id/launch endpoint
4. WHEN THE campaign is launched, THE System SHALL update status to 'active' and set launchedAt timestamp
5. WHEN THE User requests campaign list, THE System SHALL GET from /api/survey-campaigns with filtering and pagination

#### Requirement 7: Campaign Creation Workflow

**User Story:** As a researcher, I want to create campaigns through a guided wizard, so that I can configure all settings correctly before launching.

##### Acceptance Criteria

1. WHEN THE User clicks "Create Campaign", THE System SHALL display a 6-step wizard (basic → targeting → rewards → scheduling → survey → preview)
2. WHEN THE User completes each step, THE System SHALL validate inputs before allowing navigation to next step
3. WHEN THE validation fails, THE System SHALL display field-specific error messages with suggestions
4. WHEN THE User reaches the preview step, THE System SHALL display a summary of all configured settings
5. WHEN THE User submits the campaign, THE System SHALL create it in 'draft' status and redirect to campaign dashboard

#### Requirement 8: Campaign Management Operations

**User Story:** As a researcher, I want to control campaign lifecycle (launch, pause, resume, complete), so that I can manage participant recruitment effectively.

##### Acceptance Criteria

1. WHEN THE User clicks "Launch" on a draft campaign, THE System SHALL validate prerequisites (survey exists, sufficient tokens) before launching
2. WHEN THE campaign is launched, THE System SHALL change status to 'active' and start accepting participants
3. WHEN THE User clicks "Pause" on an active campaign, THE System SHALL change status to 'paused' and stop accepting new participants
4. WHEN THE User clicks "Resume" on a paused campaign, THE System SHALL change status to 'active' and resume accepting participants
5. WHEN THE User clicks "Complete" on an active campaign, THE System SHALL change status to 'completed' and finalize all rewards

#### Requirement 9: Campaign Analytics Display

**User Story:** As a researcher, I want to view detailed analytics for my campaigns, so that I can understand participation patterns and campaign effectiveness.

##### Acceptance Criteria

1. WHEN THE User clicks "Analytics" on a campaign, THE System SHALL fetch and display participation metrics (views, clicks, conversion rate, completion rate)
2. WHEN THE analytics load, THE System SHALL display demographic breakdowns (age, gender, location, education)
3. WHEN THE analytics include time-series data, THE System SHALL display charts for daily participation and hourly engagement
4. WHEN THE User selects a time range filter, THE System SHALL update all analytics to reflect the selected period
5. WHEN THE User clicks "Export", THE System SHALL generate a downloadable report in the selected format (CSV, Excel, PDF)

#### Requirement 10: Token Balance and Cost Management

**User Story:** As a researcher, I want to see estimated costs and verify token balance before creating campaigns, so that I don't create campaigns I cannot afford.

##### Acceptance Criteria

1. WHEN THE User enters target participants and reward amount, THE System SHALL calculate and display estimated total cost (rewards + admin fee)
2. WHEN THE User submits a campaign, THE System SHALL verify token balance is sufficient for estimated cost
3. WHEN THE token balance is insufficient, THE System SHALL display an error message with current balance and required amount
4. WHEN THE campaign is launched, THE System SHALL reserve the estimated cost from user's token balance
5. WHEN THE campaign completes, THE System SHALL distribute rewards to participants and collect admin fees

#### Requirement 11: Campaign Templates

**User Story:** As a researcher, I want to use pre-configured campaign templates, so that I can quickly create common campaign types without manual configuration.

##### Acceptance Criteria

1. WHEN THE User clicks "From Template", THE System SHALL display a list of available campaign templates
2. WHEN THE User selects a template, THE System SHALL pre-fill the campaign wizard with template values
3. WHEN THE template is applied, THE System SHALL allow the user to modify all pre-filled values
4. WHEN THE User saves a campaign as template, THE System SHALL store it for future reuse
5. WHEN THE System provides default templates, THE System SHALL include templates for: academic research, market research, social research, health surveys

#### Requirement 12: Bulk Campaign Operations

**User Story:** As a researcher, I want to perform bulk operations on multiple campaigns, so that I can efficiently manage large numbers of campaigns.

##### Acceptance Criteria

1. WHEN THE User selects multiple campaigns, THE System SHALL display a bulk actions toolbar
2. WHEN THE User clicks "Bulk Export", THE System SHALL export data for all selected campaigns
3. WHEN THE User clicks "Bulk Delete", THE System SHALL prompt for confirmation before deleting all selected campaigns
4. WHEN THE User clicks "Bulk Status Update", THE System SHALL allow changing status for all selected campaigns (if valid)
5. WHEN THE bulk operation completes, THE System SHALL display a summary of successful and failed operations

#### Requirement 13: Participant Notification System

**User Story:** As a researcher, I want to send notifications to campaign participants, so that I can communicate important updates and reminders.

##### Acceptance Criteria

1. WHEN THE campaign is launched, THE System SHALL send launch notifications to eligible participants
2. WHEN THE User creates a custom notification, THE System SHALL allow selecting recipient groups (all, started, completed, dropped out)
3. WHEN THE notification is sent, THE System SHALL track delivery status (sent, failed) for each recipient
4. WHEN THE notification fails, THE System SHALL retry up to 3 times with exponential backoff
5. WHEN THE notification is scheduled, THE System SHALL send it at the specified time

#### Requirement 14: Campaign Cloning

**User Story:** As a researcher, I want to clone existing campaigns, so that I can quickly create similar campaigns without starting from scratch.

##### Acceptance Criteria

1. WHEN THE User clicks "Clone" on a campaign, THE System SHALL create a copy with all settings except ID and timestamps
2. WHEN THE campaign is cloned, THE System SHALL append " (Copy)" to the title
3. WHEN THE cloned campaign is created, THE System SHALL set status to 'draft'
4. WHEN THE User provides a custom title during cloning, THE System SHALL use the custom title instead of appending " (Copy)"
5. WHEN THE clone operation completes, THE System SHALL redirect to the cloned campaign's edit page

## Constraints

### Technical Constraints

1. Auto-detection processes MUST complete within 2 seconds to maintain good UX
2. Workflow state MUST be persisted to localStorage every 30 seconds when dirty
3. API calls MUST include retry logic with exponential backoff (3 attempts max)
4. Campaign creation MUST validate token balance before allowing submission
5. All animations MUST use CSS transitions for performance (no JavaScript animations)

### Business Constraints

1. Admin fee percentage MUST be configurable but default to 5%
2. Minimum campaign duration MUST be 1 day
3. Maximum campaign duration MUST be 365 days
4. Minimum token reward per participant MUST be 0.01 tokens
5. Maximum target participants per campaign MUST be 10,000

### User Experience Constraints

1. Loading states MUST be shown for any operation taking > 300ms
2. Error messages MUST include actionable suggestions for resolution
3. Success notifications MUST auto-dismiss after 5 seconds
4. Unsaved changes indicator MUST be visible when data is dirty
5. Workflow progress MUST be visible at all times during analysis

## Success Metrics

### Phase 1 Success Metrics

1. Auto-detection trigger rate: 100% of users reaching grouping/demographic steps
2. Detection completion time: < 1 second average
3. User satisfaction with auto-detection: > 80% positive feedback
4. Data loss incidents: 0 (due to auto-save)
5. Workflow completion rate: > 70% of users completing all steps

### Phase 2 Success Metrics

1. Campaign creation success rate: > 95%
2. Campaign launch success rate: > 98%
3. API response time: < 500ms for 95th percentile
4. Token balance validation accuracy: 100%
5. User adoption of campaign features: > 50% of researchers creating at least 1 campaign within 30 days
