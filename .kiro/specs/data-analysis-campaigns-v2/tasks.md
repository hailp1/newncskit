# Implementation Plan

## Phase 1: Data Analysis Workflow Standardization

### - [ ] 1. Update Workflow Store with Step Change Events
- Add `onStepChange` event emitter to workflowStore
- Add `navigateToStep()` helper method
- Add `completeCurrentAndNavigate()` helper method
- Update store to emit events when `currentStep` changes
- _Requirements: 3.1, 3.2, 3.3_

### - [ ] 2. Create Analysis Workflow Container Page
- [ ] 2.1 Create `frontend/src/app/analysis/[projectId]/page.tsx`
  - Subscribe to `workflowStore.currentStep`
  - Fetch project variables using `useProjectVariables` hook
  - Conditionally render panels based on `currentStep`
  - Add `key` prop to force remount on step changes
  - _Requirements: 3.1, 3.2_

- [ ] 2.2 Create `frontend/src/app/analysis/[projectId]/layout.tsx`
  - Add shared layout with WorkflowStepper
  - Add navigation breadcrumbs
  - Add auto-save indicator in header
  - _Requirements: 3.1_

- [ ] 2.3 Update routing configuration
  - Update Next.js app router structure
  - Add redirects from old routes to new structure
  - Update navigation links throughout app
  - _Requirements: 3.1_

### - [ ] 3. Fix Variable Grouping Auto-Detection
- [ ] 3.1 Update VariableGroupingPanel useEffect dependencies
  - Add `currentStep` to dependency array
  - Add condition to only run when `currentStep === 'grouping'`
  - Ensure detection runs on component mount
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 3.2 Add loading state management
  - Set `isDetecting = true` before detection starts
  - Set `isDetecting = false` after 500ms delay
  - Show skeleton loading UI while detecting
  - _Requirements: 1.4, 4.3_

- [ ] 3.3 Add animated result display
  - Implement fade-in animation for suggestion cards
  - Add staggered animation delays (50ms per card)
  - Implement slide-up animation on mount
  - _Requirements: 1.2, 4.4_

### - [ ] 4. Fix Demographic Auto-Detection
- [ ] 4.1 Update DemographicSelectionPanel useEffect dependencies
  - Add `currentStep` to dependency array
  - Add condition to only run when `currentStep === 'demographic'`
  - Ensure detection runs on component mount
  - _Requirements: 2.1, 2.2, 4.1, 4.2_

- [ ] 4.2 Implement auto-selection logic
  - Filter suggestions with `confidence > 0.8`
  - Map to DemographicVariable format
  - Set as initial demographics state
  - Display "X auto-selected" badge
  - _Requirements: 2.2, 2.3_

- [ ] 4.3 Add detection state UI
  - Show skeleton loading for variable rows
  - Display "Detecting Demographics..." message
  - Show animated banner with detection results
  - _Requirements: 2.4, 4.3_

- [ ] 4.4 Implement smooth scroll to auto-selected items
  - Scroll first auto-selected item into view
  - Use smooth scroll behavior
  - Center item in viewport
  - _Requirements: 2.5_

### - [ ] 5. Enhance Auto-Save System
- [ ] 5.1 Implement three-tier persistence
  - Tier 1: Immediate localStorage backup on every change
  - Tier 2: Periodic database save every 30s if dirty
  - Tier 3: Manual save with retry logic (3 attempts)
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 5.2 Add localStorage recovery prompt
  - Check localStorage on component mount
  - Compare timestamps with server data
  - Show modal asking user to restore if newer
  - Implement restore functionality
  - _Requirements: 5.3_

- [ ] 5.3 Implement exponential backoff retry
  - Retry failed saves with 2^n second delays
  - Maximum 3 retry attempts
  - Keep data in localStorage during retries
  - Show retry status to user
  - _Requirements: 5.4, 5.5_

- [ ] 5.4 Add unsaved changes indicator
  - Show floating save button when `hasUnsavedChanges = true`
  - Display last saved timestamp
  - Show spinning icon during save
  - Animate button entrance/exit
  - _Requirements: 5.1_

### - [ ] 6. Add Visual Feedback and Animations
- [ ] 6.1 Implement loading skeletons
  - Create skeleton for suggestion cards
  - Create skeleton for variable rows
  - Add pulse animation
  - _Requirements: 4.3_

- [ ] 6.2 Add entry animations
  - Fade-in animation for results
  - Slide-up animation for cards
  - Staggered delays for list items
  - _Requirements: 4.4_

- [ ] 6.3 Add state transition animations
  - Fade transitions between panels
  - Slide animations for step changes
  - Scale animations for button interactions
  - _Requirements: 4.4_

### - [ ] 7. Update Error Handling
- [ ] 7.1 Add detection error handling
  - Catch errors from detection services
  - Show user-friendly error messages
  - Provide fallback to manual mode
  - Add retry button
  - _Requirements: 4.5_

- [ ] 7.2 Add save error handling
  - Show warning for localStorage failures
  - Display retry status during retries
  - Show persistent error after max retries
  - Keep data safe in localStorage
  - _Requirements: 5.5_



## Phase 2: Campaigns Feature Completion

### - [ ] 8. Database Schema and Migrations
- [ ] 8.1 Create survey_campaigns table migration
  - Define table schema with all columns
  - Add constraints (CHECK, UNIQUE, NOT NULL)
  - Add foreign key relationships
  - _Requirements: 6.2_

- [ ] 8.2 Create campaign_participants table migration
  - Define participant tracking schema
  - Add status tracking columns
  - Add reward tracking columns
  - Add quality metrics columns
  - _Requirements: 6.2_

- [ ] 8.3 Create campaign_analytics table migration
  - Define daily metrics schema
  - Add aggregation columns
  - Add unique constraint on campaign_id + date
  - _Requirements: 9.1, 9.2_

- [ ] 8.4 Create database indexes
  - Add indexes for common query patterns
  - Add composite indexes for filtering
  - Add indexes for foreign keys
  - _Requirements: 6.5_

- [ ] 8.5 Create materialized views for dashboard stats
  - Create campaign_stats materialized view
  - Add refresh schedule (every 5 minutes)
  - Add indexes on materialized view
  - _Requirements: 6.5_

### - [ ] 9. Backend API - Campaign CRUD
- [ ] 9.1 Implement POST /api/survey-campaigns (Create)
  - Validate request body with Zod schema
  - Check user authentication
  - Verify token balance
  - Insert campaign into database
  - Return created campaign
  - _Requirements: 6.1, 6.2, 10.2_

- [ ] 9.2 Implement GET /api/survey-campaigns (List)
  - Parse query parameters (status, projectId, limit, offset)
  - Apply filters to database query
  - Implement pagination
  - Return campaigns with total count
  - _Requirements: 6.5_

- [ ] 9.3 Implement GET /api/survey-campaigns/[id] (Get One)
  - Validate campaign ID
  - Check user authorization
  - Fetch campaign from database
  - Return campaign details
  - _Requirements: 6.5_

- [ ] 9.4 Implement PUT /api/survey-campaigns/[id] (Update)
  - Validate request body
  - Check user authorization
  - Verify campaign is in draft status
  - Update campaign in database
  - Return updated campaign
  - _Requirements: 6.2_

- [ ] 9.5 Implement DELETE /api/survey-campaigns/[id] (Delete)
  - Check user authorization
  - Verify campaign can be deleted (draft or cancelled only)
  - Delete campaign from database
  - Return success response
  - _Requirements: 6.2_

### - [ ] 10. Backend API - Campaign Lifecycle
- [ ] 10.1 Implement POST /api/survey-campaigns/[id]/launch
  - Validate campaign is in draft status
  - Verify survey exists
  - Check token balance
  - Reserve tokens
  - Update status to 'active'
  - Send launch notifications
  - _Requirements: 8.1, 8.2, 10.4_

- [ ] 10.2 Implement POST /api/survey-campaigns/[id]/pause
  - Validate campaign is active
  - Update status to 'paused'
  - Stop accepting new participants
  - Return updated campaign
  - _Requirements: 8.3_

- [ ] 10.3 Implement POST /api/survey-campaigns/[id]/resume
  - Validate campaign is paused
  - Update status to 'active'
  - Resume accepting participants
  - Return updated campaign
  - _Requirements: 8.4_

- [ ] 10.4 Implement POST /api/survey-campaigns/[id]/complete
  - Validate campaign is active
  - Update status to 'completed'
  - Finalize all rewards
  - Release unreserved tokens
  - Collect admin fees
  - _Requirements: 8.5_

### - [ ] 11. Backend API - Analytics and Reporting
- [ ] 11.1 Implement GET /api/survey-campaigns/[id]/analytics
  - Fetch campaign data
  - Fetch participant data
  - Calculate participation metrics
  - Calculate quality metrics
  - Aggregate demographics
  - Calculate financial metrics
  - Generate time series data
  - Return analytics object
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 11.2 Implement GET /api/survey-campaigns/[id]/participants
  - Parse query parameters (status, limit, offset)
  - Fetch participants with filters
  - Include participation details
  - Return paginated results
  - _Requirements: 9.2_

- [ ] 11.3 Implement GET /api/survey-campaigns/[id]/export
  - Parse format parameter (json, csv, excel, pdf)
  - Fetch campaign and participant data
  - Generate export file
  - Return file as download
  - _Requirements: 9.5_

### - [ ] 12. Backend API - Utility Endpoints
- [ ] 12.1 Implement POST /api/survey-campaigns/validate
  - Validate campaign configuration
  - Check business rules
  - Return validation result with errors/warnings
  - _Requirements: 7.2_

- [ ] 12.2 Implement POST /api/survey-campaigns/[id]/clone
  - Fetch source campaign
  - Create copy with new ID
  - Set status to draft
  - Update title with " (Copy)"
  - Return cloned campaign
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 12.3 Implement GET /api/survey-campaigns/templates
  - Return list of default templates
  - Include template configurations
  - Include tips and best practices
  - _Requirements: 11.1, 11.2_

- [ ] 12.4 Implement POST /api/survey-campaigns/eligible-participants
  - Parse eligibility criteria
  - Query users matching criteria
  - Return count of eligible participants
  - _Requirements: 7.2, 10.2_

- [ ] 12.5 Implement GET /api/tokens/balance
  - Get authenticated user
  - Fetch token balance from database
  - Return balance
  - _Requirements: 10.1, 10.2_

### - [ ] 13. Token Management System
- [ ] 13.1 Implement token reservation logic
  - Create user_token_reservations table
  - Implement reserveTokens() function
  - Update user balance (subtract reserved amount)
  - Track reservation by campaign
  - _Requirements: 10.4, 10.5_

- [ ] 13.2 Implement token distribution logic
  - Implement distributeRewards() function
  - Transfer tokens from reserved pool to participants
  - Update campaign.total_tokens_awarded
  - Record transaction history
  - _Requirements: 10.5_

- [ ] 13.3 Implement token release logic
  - Implement releaseReservedTokens() function
  - Return unreserved tokens to creator
  - Update reservation status
  - _Requirements: 10.5_

- [ ] 13.4 Implement admin fee collection
  - Calculate admin fee from total rewards
  - Transfer fee to platform account
  - Update campaign.admin_fees_collected
  - _Requirements: 10.5_

### - [ ] 14. Frontend Service Layer Updates
- [ ] 14.1 Remove mock implementations from survey-campaigns.ts
  - Replace all mock data with real API calls
  - Implement proper error handling
  - Add TypeScript types for responses
  - _Requirements: 6.1_

- [ ] 14.2 Update campaign-service.ts
  - Connect to new API endpoints
  - Remove mock data
  - Add error handling
  - _Requirements: 6.1_

- [ ] 14.3 Create token.service.ts
  - Implement getBalance()
  - Implement reserveTokens()
  - Implement releaseReservedTokens()
  - Implement distributeRewards()
  - _Requirements: 10.1, 10.2, 10.3_

### - [ ] 15. Update Campaign Creation Wizard
- [ ] 15.1 Remove "Coming Soon" alert
  - Replace alert with real submission logic
  - Add loading state during submission
  - Add success/error notifications
  - Redirect to campaign page on success
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 15.2 Implement real-time cost calculation
  - Calculate cost on input change
  - Display estimated total cost
  - Show admin fee breakdown
  - Update when any field changes
  - _Requirements: 10.1_

- [ ] 15.3 Add token balance check
  - Fetch user token balance
  - Display current balance
  - Show warning if insufficient
  - Disable submit if balance too low
  - _Requirements: 10.2, 10.3_

- [ ] 15.4 Implement step validation
  - Validate each step before allowing next
  - Show field-specific errors
  - Highlight invalid fields
  - Provide actionable error messages
  - _Requirements: 7.2, 7.3_

### - [ ] 16. Update Campaign Dashboard
- [ ] 16.1 Remove "Coming Soon" alerts for bulk operations
  - Implement real bulk delete
  - Implement real bulk export
  - Implement real bulk status update
  - Add confirmation dialogs
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 16.2 Connect to real campaign data
  - Fetch campaigns from API
  - Implement real-time updates
  - Add loading states
  - Handle empty states
  - _Requirements: 6.5_

- [ ] 16.3 Implement campaign actions
  - Connect launch button to API
  - Connect pause button to API
  - Connect resume button to API
  - Connect complete button to API
  - Add confirmation dialogs
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 16.4 Add real-time stats
  - Fetch campaign stats from API
  - Display total campaigns by status
  - Show total participants
  - Show total tokens spent
  - Auto-refresh every 30 seconds
  - _Requirements: 6.5_

### - [ ] 17. Update Campaign Analytics Dashboard
- [ ] 17.1 Remove "Coming Soon" alert for export
  - Implement real CSV export
  - Implement real Excel export
  - Implement real PDF export
  - Add download progress indicator
  - _Requirements: 9.5_

- [ ] 17.2 Connect to real analytics data
  - Fetch analytics from API
  - Display participation funnel
  - Show demographic breakdowns
  - Display time series charts
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 17.3 Implement time range filtering
  - Add time range selector (7d, 30d, 90d, all)
  - Fetch filtered data from API
  - Update all charts with filtered data
  - _Requirements: 9.4_

- [ ] 17.4 Add real-time updates
  - Poll for new data every 60 seconds
  - Show "Updated X seconds ago" indicator
  - Animate chart updates
  - _Requirements: 9.1_

### - [ ] 18. Implement Campaign Templates
- [ ] 18.1 Create template data structure
  - Define CampaignTemplate interface
  - Create default templates (academic, market, social, health)
  - Add template metadata (tips, best practices)
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 18.2 Create template selection UI
  - Build template gallery page
  - Display template cards with previews
  - Add template details modal
  - Implement template selection
  - _Requirements: 11.1_

- [ ] 18.3 Implement template application
  - Pre-fill wizard with template values
  - Allow user to modify all fields
  - Show which fields came from template
  - _Requirements: 11.2, 11.3_

- [ ] 18.4 Add save as template feature
  - Add "Save as Template" button
  - Prompt for template name and description
  - Save to user's custom templates
  - _Requirements: 11.4_

### - [ ] 19. Implement Notification System
- [ ] 19.1 Create notification templates
  - Define template structure
  - Create default templates (launch, reminder, thank you, reward)
  - Add variable placeholders
  - _Requirements: 13.1, 13.2_

- [ ] 19.2 Implement notification queue
  - Set up job queue (BullMQ or pg-boss)
  - Create notification job processor
  - Implement retry logic with exponential backoff
  - Track delivery status
  - _Requirements: 13.3, 13.4_

- [ ] 19.3 Implement email sending
  - Integrate email service (SendGrid, AWS SES, or Resend)
  - Render templates with data
  - Send emails to recipients
  - Handle bounces and failures
  - _Requirements: 13.1, 13.3_

- [ ] 19.4 Add notification scheduling
  - Implement scheduled notifications
  - Support delay parameter
  - Queue jobs for future execution
  - _Requirements: 13.5_

- [ ] 19.5 Create notification UI
  - Build notification composer
  - Add recipient selection
  - Add template selection
  - Add preview functionality
  - _Requirements: 13.2_

### - [ ] 20. Implement Campaign Cloning
- [ ] 20.1 Add clone button to campaign cards
  - Add "Clone" action to dropdown menu
  - Show clone confirmation dialog
  - Prompt for new campaign title
  - _Requirements: 14.1, 14.4_

- [ ] 20.2 Implement clone API call
  - Call POST /api/survey-campaigns/[id]/clone
  - Handle success/error responses
  - Show success notification
  - Redirect to cloned campaign
  - _Requirements: 14.1, 14.2_

- [ ] 20.3 Handle clone edge cases
  - Ensure status is set to draft
  - Clear participation data
  - Reset timestamps
  - _Requirements: 14.3_

### - [ ] 21. Add Token Balance Widget
- [ ] 21.1 Create TokenBalanceWidget component
  - Display current balance
  - Show reserved tokens
  - Show available tokens
  - Add refresh button
  - _Requirements: 10.1_

- [ ] 21.2 Add to campaign pages
  - Show in campaign creation wizard
  - Show in campaign dashboard header
  - Update in real-time
  - _Requirements: 10.1, 10.2_

- [ ] 21.3 Add purchase tokens link
  - Link to token purchase page
  - Show when balance is low
  - Display pricing information
  - _Requirements: 10.3_

### - [ ] 22. Testing and Quality Assurance
- [ ] 22.1 Write unit tests for Phase 1
  - Test VariableGroupingService detection
  - Test DemographicService detection
  - Test useVariableGroupingAutoSave hook
  - Test workflowStore actions
  - _Requirements: All Phase 1_

- [ ] 22.2 Write unit tests for Phase 2
  - Test surveyCampaignService methods
  - Test validation functions
  - Test cost calculations
  - Test token service methods
  - _Requirements: All Phase 2_

- [ ] 22.3 Write integration tests
  - Test workflow navigation triggers detection
  - Test campaign creation flow
  - Test campaign lifecycle transitions
  - Test token reservation and distribution
  - _Requirements: All_

- [ ] 22.4 Write E2E tests
  - Test complete analysis workflow
  - Test complete campaign creation
  - Test campaign management operations
  - Test analytics viewing
  - _Requirements: All_

### - [ ] 23. Documentation and Deployment
- [ ] 23.1 Update API documentation
  - Document all new endpoints
  - Add request/response examples
  - Document error codes
  - Add authentication requirements
  - _Requirements: All Phase 2_

- [ ] 23.2 Create deployment guide
  - Document database migration steps
  - Document environment variables
  - Document deployment order
  - Add rollback procedures
  - _Requirements: All_

- [ ] 23.3 Set up monitoring
  - Add error tracking (Sentry)
  - Add performance monitoring
  - Set up alerts for critical errors
  - Create dashboard for key metrics
  - _Requirements: All_

- [ ] 23.4 Deploy to staging
  - Run database migrations
  - Deploy backend APIs
  - Deploy frontend changes
  - Run smoke tests
  - _Requirements: All_

- [ ] 23.5 Deploy to production
  - Enable features gradually with feature flags
  - Monitor error rates and performance
  - Collect user feedback
  - Fix critical issues
  - _Requirements: All_
