# Design Document

## Overview

This design document outlines the technical approach for implementing two major improvements to the NCSKit platform:

**Phase 1**: Fix and standardize the data analysis workflow to ensure automatic variable grouping and demographic detection trigger correctly when users navigate to those steps.

**Phase 2**: Complete the campaigns feature by implementing backend APIs, connecting frontend components, and adding missing functionality.

### Design Goals

1. **Reliability**: Auto-detection must trigger 100% of the time when users reach the appropriate workflow step
2. **Performance**: Detection processes must complete within 2 seconds
3. **User Experience**: Provide clear visual feedback during all async operations
4. **Data Integrity**: Prevent data loss through robust auto-save and recovery mechanisms
5. **Scalability**: Backend APIs must handle concurrent campaign operations efficiently

### Architecture Principles

- **Event-Driven**: Use React hooks and Zustand store to trigger actions on state changes
- **Progressive Enhancement**: Show loading states immediately, then animate results
- **Fail-Safe**: Implement retry logic and localStorage fallbacks for all save operations
- **API-First**: Design RESTful endpoints that can be consumed by multiple clients
- **Type-Safe**: Leverage TypeScript for compile-time safety across frontend and backend

## Phase 1: Data Analysis Workflow Architecture

### Current Problem Analysis

The current implementation has auto-detection logic in `useEffect` hooks, but these hooks don't trigger reliably because:

1. **Missing Dependency**: The `useEffect` in `VariableGroupingPanel` and `DemographicSelectionPanel` only depends on `variables`, not on workflow step changes
2. **No Integration**: The workflow stepper doesn't communicate with the panels about step transitions
3. **Race Conditions**: Components may mount before workflow store is updated

### Solution Architecture


#### Component Integration Flow

```
WorkflowStepper (Zustand Store)
    ↓ currentStep changes
    ↓
AnalysisWorkflowPage (Container)
    ↓ renders appropriate panel based on currentStep
    ↓
VariableGroupingPanel / DemographicSelectionPanel
    ↓ useEffect triggers on mount + currentStep change
    ↓
Auto-detection runs
    ↓
Results displayed with animations
```

#### State Management Strategy

**Zustand Workflow Store** (`workflowStore.ts`)
- Tracks `currentStep`, `completedSteps`, `projectId`
- Provides `setCurrentStep()` action
- Emits events when step changes

**Component-Level State** (Panel components)
- `isDetecting`: boolean - shows loading UI
- `suggestions`: array - stores detection results
- `demographics/groups`: array - stores user selections

**Persistence Layer**
- localStorage: Immediate backup on every change
- Database: Async save with retry logic every 30s
- Recovery: Prompt user to restore on mount if localStorage has newer data



### Workflow Integration Design

#### 1. Create Analysis Workflow Container Page

**File**: `frontend/src/app/analysis/[projectId]/page.tsx`

This new page will:
- Subscribe to `workflowStore.currentStep`
- Conditionally render the appropriate panel component
- Pass `projectId` and `variables` to child components
- Handle step transitions and validation

```typescript
// Pseudo-code structure
function AnalysisWorkflowPage({ params }: { params: { projectId: string } }) {
  const { currentStep } = useWorkflowStore()
  const { variables, isLoading } = useProjectVariables(params.projectId)
  
  return (
    <div>
      <WorkflowStepper />
      {currentStep === 'grouping' && (
        <VariableGroupingPanel 
          key={`grouping-${currentStep}`} // Force remount on step change
          variables={variables}
          projectId={params.projectId}
        />
      )}
      {currentStep === 'demographic' && (
        <DemographicSelectionPanel
          key={`demographic-${currentStep}`} // Force remount on step change
          variables={variables}
          projectId={params.projectId}
        />
      )}
    </div>
  )
}
```



#### 2. Fix Auto-Detection Triggers

**VariableGroupingPanel.tsx** - Updated useEffect:

```typescript
useEffect(() => {
  // Trigger detection when:
  // 1. Component mounts
  // 2. Variables change
  // 3. Current step becomes 'grouping'
  
  if (variables && variables.length > 0 && currentStep === 'grouping') {
    setIsDetecting(true)
    
    setTimeout(() => {
      const suggested = VariableGroupingService.suggestGroupsCaseInsensitive(variables)
      setSuggestions(suggested)
      setIsDetecting(false)
    }, 500)
  }
}, [variables, currentStep]) // Add currentStep dependency
```

**DemographicSelectionPanel.tsx** - Updated useEffect:

```typescript
useEffect(() => {
  if (variables && variables.length > 0 && currentStep === 'demographic') {
    setIsDetecting(true)
    
    setTimeout(() => {
      const detected = DemographicService.detectDemographics(variables)
      setSuggestions(detected)
      
      // Auto-select high-confidence (>80%)
      const autoSelected = detected
        .filter(s => s.confidence > 0.8)
        .map(s => ({ ...s.variable, /* ... */ }))
      
      setDemographics(autoSelected)
      setIsDetecting(false)
    }, 500)
  }
}, [variables, currentStep]) // Add currentStep dependency
```



#### 3. Enhanced Workflow Store

Add helper methods to `workflowStore.ts`:

```typescript
interface WorkflowStore {
  // ... existing properties
  
  // New methods
  navigateToStep: (step: WorkflowStep) => void
  completeCurrentAndNavigate: () => void
  
  // Event emitter for step changes
  onStepChange: (callback: (step: WorkflowStep) => void) => () => void
}

// Implementation
navigateToStep: (step: WorkflowStep) => {
  const { canNavigateTo, setCurrentStep, markStepComplete } = get()
  
  if (canNavigateTo(step)) {
    setCurrentStep(step)
    // Emit event for listeners
    get().stepChangeListeners.forEach(cb => cb(step))
  }
}
```

### Data Persistence Design

#### Auto-Save Architecture

**Three-Tier Persistence Strategy**:

1. **Immediate (localStorage)**: Save on every change
2. **Periodic (database)**: Save every 30s if dirty
3. **Manual (user-triggered)**: Save on explicit button click

**Implementation in `useVariableGroupingAutoSave` hook**:

```typescript
// Tier 1: Immediate localStorage backup
useEffect(() => {
  if (hasChanges) {
    localStorage.setItem(`analysis-${projectId}`, JSON.stringify({
      groups,
      demographics,
      timestamp: Date.now()
    }))
  }
}, [groups, demographics])

// Tier 2: Periodic database save
useEffect(() => {
  if (!hasUnsavedChanges || !enabled) return
  
  const timer = setTimeout(async () => {
    try {
      await onSave({ projectId, groups, demographics })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      // Keep in localStorage, will retry
      setRetryCount(prev => prev + 1)
    }
  }, interval)
  
  return () => clearTimeout(timer)
}, [hasUnsavedChanges, interval])

// Tier 3: Manual save with retry
const saveNow = async () => {
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      await onSave({ projectId, groups, demographics })
      clearUnsavedChanges()
      return
    } catch (error) {
      attempts++
      if (attempts < maxAttempts) {
        await delay(Math.pow(2, attempts) * 1000) // Exponential backoff
      }
    }
  }
  
  throw new Error('Failed to save after 3 attempts')
}
```



### UI/UX Design Patterns

#### Loading States

**Skeleton Screens** (while detecting):
```tsx
{isDetecting && (
  <div className="space-y-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
)}
```

**Progress Indicators**:
- Spinning icon during detection
- Progress bar for multi-step operations
- Percentage complete for long-running tasks

#### Animation Strategy

**Entry Animations** (when results appear):
```css
@keyframes fadeInSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-card {
  animation: fadeInSlideUp 0.3s ease-out;
  animation-delay: calc(var(--index) * 50ms);
}
```

**State Transitions**:
- Fade in/out for content changes
- Slide animations for panel transitions
- Scale animations for button interactions

#### Error Handling UI

**Error Display Hierarchy**:
1. **Inline errors**: Field-level validation (red border + message)
2. **Banner errors**: Section-level issues (yellow/red banner at top)
3. **Toast notifications**: Async operation failures (auto-dismiss after 5s)
4. **Modal dialogs**: Critical errors requiring user action



## Phase 2: Campaigns Feature Architecture

### Backend API Design

#### Database Schema

**survey_campaigns table** (Supabase/PostgreSQL):

```sql
CREATE TABLE survey_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  survey_id UUID REFERENCES surveys(id),
  created_by UUID REFERENCES users(id),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  tags TEXT[],
  
  -- Configuration
  target_participants INTEGER NOT NULL,
  token_reward_per_participant DECIMAL(10,2) NOT NULL,
  admin_fee_percentage DECIMAL(5,2) DEFAULT 5.0,
  duration_days INTEGER NOT NULL,
  
  -- Eligibility
  eligibility_criteria JSONB,
  demographic_filters JSONB,
  
  -- Status & Lifecycle
  status VARCHAR(20) DEFAULT 'draft',
  launched_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Participation Tracking
  current_participants INTEGER DEFAULT 0,
  completed_responses INTEGER DEFAULT 0,
  total_tokens_awarded DECIMAL(12,2) DEFAULT 0,
  admin_fees_collected DECIMAL(12,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT positive_participants CHECK (target_participants > 0),
  CONSTRAINT positive_reward CHECK (token_reward_per_participant >= 0)
);

CREATE INDEX idx_campaigns_status ON survey_campaigns(status);
CREATE INDEX idx_campaigns_created_by ON survey_campaigns(created_by);
CREATE INDEX idx_campaigns_project ON survey_campaigns(project_id);
```



**campaign_participants table**:

```sql
CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES survey_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Participation Status
  status VARCHAR(20) DEFAULT 'invited',
  invited_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  dropped_out_at TIMESTAMP,
  
  -- Rewards
  tokens_awarded DECIMAL(10,2) DEFAULT 0,
  reward_paid_at TIMESTAMP,
  
  -- Quality Metrics
  response_quality_score DECIMAL(3,2),
  completion_time_minutes INTEGER,
  
  CONSTRAINT valid_participant_status CHECK (status IN ('invited', 'started', 'completed', 'dropped_out')),
  CONSTRAINT unique_participant UNIQUE (campaign_id, user_id)
);

CREATE INDEX idx_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX idx_participants_user ON campaign_participants(user_id);
CREATE INDEX idx_participants_status ON campaign_participants(status);
```

**campaign_analytics table** (aggregated metrics):

```sql
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES survey_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily Metrics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  dropouts INTEGER DEFAULT 0,
  
  -- Aggregated Data
  avg_completion_time_minutes DECIMAL(6,2),
  avg_response_quality DECIMAL(3,2),
  tokens_distributed DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_campaign_date UNIQUE (campaign_id, date)
);

CREATE INDEX idx_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_analytics_date ON campaign_analytics(date);
```



#### REST API Endpoints

**Campaign CRUD Operations**:

```
POST   /api/survey-campaigns              Create new campaign
GET    /api/survey-campaigns              List campaigns (with filters)
GET    /api/survey-campaigns/:id          Get campaign details
PUT    /api/survey-campaigns/:id          Update campaign
DELETE /api/survey-campaigns/:id          Delete campaign
```

**Campaign Lifecycle Operations**:

```
POST   /api/survey-campaigns/:id/launch   Launch campaign (draft → active)
POST   /api/survey-campaigns/:id/pause    Pause campaign (active → paused)
POST   /api/survey-campaigns/:id/resume   Resume campaign (paused → active)
POST   /api/survey-campaigns/:id/complete Complete campaign (active → completed)
```

**Analytics & Reporting**:

```
GET    /api/survey-campaigns/:id/analytics          Get campaign analytics
GET    /api/survey-campaigns/:id/participants       List participants
GET    /api/survey-campaigns/:id/export             Export campaign data
```

**Utility Endpoints**:

```
POST   /api/survey-campaigns/validate               Validate campaign config
POST   /api/survey-campaigns/:id/clone              Clone existing campaign
GET    /api/survey-campaigns/templates              Get campaign templates
POST   /api/survey-campaigns/eligible-participants  Get eligible participants count
GET    /api/tokens/balance                          Check user token balance
```



#### API Implementation (Next.js Route Handlers)

**File**: `frontend/src/app/api/survey-campaigns/route.ts`

```typescript
// POST /api/survey-campaigns - Create campaign
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    
    const body = await request.json()
    
    // Validate campaign data
    const validation = await validateCampaignData(body)
    if (!validation.valid) {
      return Response.json({ error: validation.errors }, { status: 400 })
    }
    
    // Check token balance
    const cost = calculateCampaignCost(body)
    const balance = await getTokenBalance(session.user.id)
    if (balance < cost.totalCost) {
      return Response.json({ 
        error: 'Insufficient tokens',
        required: cost.totalCost,
        available: balance
      }, { status: 400 })
    }
    
    // Create campaign in database
    const campaign = await supabase
      .from('survey_campaigns')
      .insert({
        ...body,
        created_by: session.user.id,
        status: 'draft'
      })
      .select()
      .single()
    
    return Response.json(campaign, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/survey-campaigns - List campaigns
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('project_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabase
      .from('survey_campaigns')
      .select('*', { count: 'exact' })
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) query = query.eq('status', status)
    if (projectId) query = query.eq('project_id', projectId)
    
    const { data, count, error } = await query
    
    if (error) throw error
    
    return Response.json({
      campaigns: data,
      total: count,
      hasMore: count > offset + limit
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```



**File**: `frontend/src/app/api/survey-campaigns/[id]/launch/route.ts`

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) return new Response('Unauthorized', { status: 401 })
    
    // Get campaign
    const { data: campaign } = await supabase
      .from('survey_campaigns')
      .select('*')
      .eq('id', params.id)
      .eq('created_by', session.user.id)
      .single()
    
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    // Validate can launch
    if (campaign.status !== 'draft') {
      return Response.json({ 
        error: `Cannot launch campaign with status: ${campaign.status}` 
      }, { status: 400 })
    }
    
    // Verify survey exists
    const { data: survey } = await supabase
      .from('surveys')
      .select('id')
      .eq('id', campaign.survey_id)
      .single()
    
    if (!survey) {
      return Response.json({ 
        error: 'Associated survey not found' 
      }, { status: 400 })
    }
    
    // Check token balance again
    const cost = calculateCampaignCost(campaign)
    const balance = await getTokenBalance(session.user.id)
    if (balance < cost.totalCost) {
      return Response.json({ 
        error: 'Insufficient tokens',
        required: cost.totalCost,
        available: balance
      }, { status: 400 })
    }
    
    // Reserve tokens
    await reserveTokens(session.user.id, cost.totalCost, campaign.id)
    
    // Update campaign status
    const { data: updated } = await supabase
      .from('survey_campaigns')
      .update({
        status: 'active',
        launched_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    // Send launch notifications (async, don't wait)
    sendCampaignLaunchNotifications(campaign.id).catch(console.error)
    
    return Response.json(updated)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```



### Frontend Service Layer Updates

**Update `survey-campaigns.ts` service**:

```typescript
class SurveyCampaignService {
  private baseUrl = '/api/survey-campaigns'
  
  // Remove mock implementations, use real API calls
  async createCampaign(data: CampaignCreationData): Promise<SurveyCampaign> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create campaign')
    }
    
    return response.json()
  }
  
  async launchCampaign(campaignId: string): Promise<SurveyCampaign> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/launch`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to launch campaign')
    }
    
    return response.json()
  }
  
  // ... implement all other methods with real API calls
}
```

**Remove "Coming Soon" alerts from components**:

```typescript
// BEFORE (in campaign-creation-wizard.tsx):
const submitCampaign = async () => {
  alert('Campaign creation feature coming soon!')
}

// AFTER:
const submitCampaign = async () => {
  setIsSubmitting(true)
  try {
    const campaign = await surveyCampaignService.createCampaign(formData)
    showSuccess('Campaign Created', `Campaign "${campaign.title}" created successfully`)
    router.push(`/campaigns/${campaign.id}`)
  } catch (error) {
    showError('Creation Failed', error.message)
  } finally {
    setIsSubmitting(false)
  }
}
```



### Campaign Templates System

#### Template Data Structure

```typescript
interface CampaignTemplate {
  id: string
  name: string
  description: string
  category: 'academic' | 'market' | 'social' | 'health' | 'technology'
  icon: string
  
  // Pre-filled values
  defaultConfig: {
    targetParticipants: number
    tokenRewardPerParticipant: number
    duration: number
    eligibilityCriteria: EligibilityCriteria
    estimatedCompletionTime: number
  }
  
  // Guidance
  tips: string[]
  bestPractices: string[]
}
```

#### Default Templates

**Academic Research Template**:
```typescript
{
  id: 'academic-research',
  name: 'Academic Research Survey',
  description: 'Standard template for academic research studies',
  category: 'academic',
  defaultConfig: {
    targetParticipants: 200,
    tokenRewardPerParticipant: 10,
    duration: 30,
    eligibilityCriteria: {
      minAge: 18,
      requiredDemographics: ['age', 'education'],
      excludedGroups: []
    },
    estimatedCompletionTime: 15
  },
  tips: [
    'Clearly state research purpose and IRB approval',
    'Ensure informed consent is obtained',
    'Provide contact information for questions'
  ]
}
```

**Market Research Template**:
```typescript
{
  id: 'market-research',
  name: 'Market Research Survey',
  description: 'Template for product/service feedback collection',
  category: 'market',
  defaultConfig: {
    targetParticipants: 500,
    tokenRewardPerParticipant: 5,
    duration: 14,
    eligibilityCriteria: {
      minAge: 18,
      requiredDemographics: ['age', 'location', 'income'],
      excludedGroups: []
    },
    estimatedCompletionTime: 10
  },
  tips: [
    'Focus on specific product/service features',
    'Include screening questions for target audience',
    'Keep survey concise for better completion rates'
  ]
}
```



### Token Management System

#### Token Balance Service

**File**: `frontend/src/services/token.service.ts`

```typescript
class TokenService {
  async getBalance(userId: string): Promise<number> {
    const response = await fetch(`/api/tokens/balance`)
    const data = await response.json()
    return data.balance
  }
  
  async reserveTokens(amount: number, campaignId: string): Promise<void> {
    await fetch('/api/tokens/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, campaignId })
    })
  }
  
  async releaseReservedTokens(campaignId: string): Promise<void> {
    await fetch('/api/tokens/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    })
  }
  
  async distributeRewards(
    campaignId: string,
    participants: Array<{ userId: string; amount: number }>
  ): Promise<void> {
    await fetch('/api/tokens/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, participants })
    })
  }
}
```

#### Token Transaction Flow

```
Campaign Creation (Draft)
  ↓
  No tokens reserved yet
  ↓
Campaign Launch
  ↓
  Calculate total cost = (participants × reward) + admin_fee
  ↓
  Check balance >= total cost
  ↓
  Reserve tokens (mark as "reserved" in user_tokens table)
  ↓
  Update campaign status to 'active'
  ↓
Participant Completes Survey
  ↓
  Transfer tokens from reserved pool to participant
  ↓
  Update campaign.total_tokens_awarded
  ↓
Campaign Completes
  ↓
  Release any unreserved tokens back to creator
  ↓
  Collect admin fees
```



### Analytics & Reporting Design

#### Real-Time Analytics Aggregation

**Background Job** (runs every hour):

```typescript
// Aggregate daily analytics
async function aggregateCampaignAnalytics(campaignId: string, date: Date) {
  const { data: participants } = await supabase
    .from('campaign_participants')
    .select('*')
    .eq('campaign_id', campaignId)
    .gte('created_at', startOfDay(date))
    .lt('created_at', endOfDay(date))
  
  const analytics = {
    campaign_id: campaignId,
    date: date.toISOString().split('T')[0],
    views: await getViewCount(campaignId, date),
    clicks: await getClickCount(campaignId, date),
    starts: participants.filter(p => p.started_at).length,
    completions: participants.filter(p => p.completed_at).length,
    dropouts: participants.filter(p => p.dropped_out_at).length,
    avg_completion_time_minutes: calculateAverage(
      participants
        .filter(p => p.completion_time_minutes)
        .map(p => p.completion_time_minutes)
    ),
    avg_response_quality: calculateAverage(
      participants
        .filter(p => p.response_quality_score)
        .map(p => p.response_quality_score)
    ),
    tokens_distributed: participants.reduce((sum, p) => sum + p.tokens_awarded, 0)
  }
  
  await supabase
    .from('campaign_analytics')
    .upsert(analytics, { onConflict: 'campaign_id,date' })
}
```

#### Analytics API Response Format

```typescript
interface CampaignAnalytics {
  campaignId: string
  
  // Participation Funnel
  participationMetrics: {
    totalViews: number
    totalClicks: number
    conversionRate: number // clicks / views
    participationRate: number // starts / clicks
    completionRate: number // completions / starts
    dropoutRate: number // dropouts / starts
  }
  
  // Quality Metrics
  qualityMetrics: {
    averageResponseTime: number // minutes
    responseQualityScore: number // 0-5
    satisfactionScore: number // 0-5
    flaggedResponses: number
  }
  
  // Demographics (aggregated)
  demographics: {
    ageDistribution: Record<string, number>
    genderDistribution: Record<string, number>
    locationDistribution: Record<string, number>
    educationDistribution: Record<string, number>
  }
  
  // Financial
  financialMetrics: {
    totalCost: number
    costPerResponse: number
    adminFeesCollected: number
    roiScore: number
  }
  
  // Time Series
  timeSeriesData: {
    dailyParticipation: Array<{ date: string; responses: number }>
    hourlyEngagement: Array<{ hour: number; engagement: number }>
    completionTrends: Array<{ date: string; completionRate: number }>
  }
  
  // Device Breakdown
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
}
```



### Notification System Design

#### Notification Types & Templates

```typescript
type NotificationType = 
  | 'campaign_launch'
  | 'reminder'
  | 'completion_thank_you'
  | 'reward_notification'

interface NotificationTemplate {
  type: NotificationType
  subject: string
  body: string
  variables: string[] // Placeholders like {{campaign_title}}, {{reward_amount}}
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  campaign_launch: {
    type: 'campaign_launch',
    subject: 'New Survey Available: {{campaign_title}}',
    body: `
      Hi {{participant_name}},
      
      A new survey is now available that matches your profile:
      
      Title: {{campaign_title}}
      Estimated Time: {{completion_time}} minutes
      Reward: {{reward_amount}} tokens
      
      Click here to participate: {{survey_link}}
      
      This opportunity expires in {{duration}} days.
    `,
    variables: ['participant_name', 'campaign_title', 'completion_time', 'reward_amount', 'survey_link', 'duration']
  },
  
  reminder: {
    type: 'reminder',
    subject: 'Reminder: Complete {{campaign_title}}',
    body: `
      Hi {{participant_name}},
      
      You started the survey "{{campaign_title}}" but haven't completed it yet.
      
      Complete it now to earn {{reward_amount}} tokens!
      
      Continue survey: {{survey_link}}
    `,
    variables: ['participant_name', 'campaign_title', 'reward_amount', 'survey_link']
  },
  
  completion_thank_you: {
    type: 'completion_thank_you',
    subject: 'Thank you for completing {{campaign_title}}',
    body: `
      Hi {{participant_name}},
      
      Thank you for completing "{{campaign_title}}"!
      
      Your reward of {{reward_amount}} tokens has been added to your account.
      
      View your balance: {{balance_link}}
    `,
    variables: ['participant_name', 'campaign_title', 'reward_amount', 'balance_link']
  }
}
```

#### Notification Queue System

```typescript
// Use a job queue (e.g., BullMQ, pg-boss) for reliable delivery
interface NotificationJob {
  id: string
  type: NotificationType
  recipients: string[] // user IDs or emails
  templateData: Record<string, string>
  scheduledAt?: Date
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

async function queueNotification(job: NotificationJob) {
  await notificationQueue.add('send-notification', job, {
    attempts: job.maxAttempts,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    delay: job.scheduledAt 
      ? job.scheduledAt.getTime() - Date.now() 
      : 0
  })
}

// Worker process
notificationQueue.process('send-notification', async (job) => {
  const { type, recipients, templateData } = job.data
  const template = NOTIFICATION_TEMPLATES[type]
  
  // Render template with data
  const subject = renderTemplate(template.subject, templateData)
  const body = renderTemplate(template.body, templateData)
  
  // Send to all recipients
  const results = await Promise.allSettled(
    recipients.map(recipient => 
      sendEmail(recipient, subject, body)
    )
  )
  
  // Track delivery status
  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return { sent, failed }
})
```



## Data Models

### Phase 1 Data Models

#### WorkflowState (Zustand Store)

```typescript
interface WorkflowState {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  projectId: string | null
  lastSaved: Date | null
  isDirty: boolean
  progress: number
}

type WorkflowStep = 
  | 'upload'
  | 'health-check'
  | 'grouping'
  | 'demographic'
  | 'analysis-selection'
  | 'execution'
  | 'results'
```

#### LocalStorage Backup Format

```typescript
interface AnalysisBackup {
  projectId: string
  groups: VariableGroup[]
  demographics: DemographicVariable[]
  timestamp: number
  version: string // For migration compatibility
}
```

### Phase 2 Data Models

#### Campaign (Frontend)

```typescript
interface SurveyCampaign {
  id: string
  projectId: string
  surveyId: string
  createdBy: string
  
  // Basic Info
  title: string
  description?: string
  category?: string
  tags?: string[]
  
  // Configuration
  config: {
    targetParticipants: number
    tokenRewardPerParticipant: number
    adminFeePercentage: number
    duration: number // days
    eligibilityCriteria: EligibilityCriteria
    demographicFilters: Record<string, any>
  }
  
  // Status
  status: CampaignStatus
  launchedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  
  // Participation
  participation: {
    totalParticipants: number
    completedResponses: number
    totalTokensAwarded: number
    adminFeeCollected: number
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface EligibilityCriteria {
  minAge?: number
  maxAge?: number
  requiredDemographics: string[]
  excludedGroups: string[]
  customFilters?: Record<string, any>
}
```



## Component Structure

### Phase 1 Components

```
app/analysis/[projectId]/
├── page.tsx                          # Main workflow container
├── layout.tsx                        # Shared layout with navigation
└── components/
    ├── WorkflowStepper.tsx          # Progress indicator (existing)
    ├── VariableGroupingPanel.tsx    # Grouping step (update)
    ├── DemographicSelectionPanel.tsx # Demographic step (update)
    └── StepTransition.tsx           # Animated transitions between steps
```

**Key Changes**:
- Add `currentStep` prop to panels
- Add `key` prop based on step to force remount
- Update `useEffect` dependencies to include `currentStep`

### Phase 2 Components

```
app/campaigns/
├── page.tsx                          # Campaign dashboard
├── create/
│   └── page.tsx                     # Campaign creation wizard
├── [id]/
│   ├── page.tsx                     # Campaign details
│   ├── edit/
│   │   └── page.tsx                 # Edit campaign
│   ├── analytics/
│   │   └── page.tsx                 # Analytics dashboard
│   └── participants/
│       └── page.tsx                 # Participant management
└── templates/
    └── page.tsx                     # Template selection

components/campaigns/
├── CampaignDashboard.tsx            # Main dashboard (update)
├── CampaignCreationWizard.tsx      # Wizard (update)
├── CampaignAnalyticsDashboard.tsx  # Analytics (update)
├── CampaignCard.tsx                # Campaign list item
├── CampaignFilters.tsx             # Filter controls
├── BulkActionsToolbar.tsx          # Bulk operations
├── TemplateSelector.tsx            # Template selection
├── TokenBalanceWidget.tsx          # Balance display
└── ParticipantList.tsx             # Participant table
```



## Error Handling Strategy

### Phase 1 Error Scenarios

**Detection Failures**:
```typescript
try {
  const suggestions = await detectGroups(variables)
  setSuggestions(suggestions)
} catch (error) {
  showError('Detection Failed', 'Unable to analyze variables. Please try again.')
  // Fallback: Show manual grouping UI
  setShowManualMode(true)
}
```

**Save Failures**:
```typescript
// Tier 1: localStorage always succeeds (or shows browser error)
// Tier 2: Database save with retry
try {
  await saveToDatabase(data)
} catch (error) {
  // Data is safe in localStorage
  showWarning('Save Failed', 'Changes saved locally. Will retry automatically.')
  scheduleRetry()
}
```

### Phase 2 Error Scenarios

**Campaign Creation Failures**:
```typescript
try {
  await campaignService.createCampaign(data)
} catch (error) {
  if (error.message.includes('Insufficient tokens')) {
    showError('Insufficient Tokens', `You need ${error.required} tokens but only have ${error.available}. Please purchase more tokens.`)
  } else if (error.message.includes('validation')) {
    showError('Validation Error', error.message)
  } else {
    showError('Creation Failed', 'Unable to create campaign. Please try again.')
  }
}
```

**Launch Failures**:
```typescript
try {
  await campaignService.launchCampaign(id)
} catch (error) {
  if (error.message.includes('survey not found')) {
    showError('Survey Missing', 'The associated survey no longer exists. Please select a different survey.')
  } else if (error.message.includes('Insufficient tokens')) {
    showError('Insufficient Tokens', 'Token balance changed. Please review campaign cost.')
  } else {
    showError('Launch Failed', error.message)
  }
}
```

**Network Failures**:
```typescript
// Implement retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      
      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(await response.text())
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await delay(Math.pow(2, i) * 1000)
    }
  }
}
```



## Testing Strategy

### Phase 1 Testing

**Unit Tests**:
- `VariableGroupingService.suggestGroupsCaseInsensitive()` - Test pattern detection
- `DemographicService.detectDemographics()` - Test demographic detection
- `useVariableGroupingAutoSave` hook - Test save/retry logic
- `workflowStore` actions - Test state transitions

**Integration Tests**:
- Workflow navigation triggers detection
- Detection results populate UI correctly
- Auto-save persists to localStorage
- Recovery from localStorage works

**E2E Tests** (Playwright):
```typescript
test('auto-detection triggers on step navigation', async ({ page }) => {
  await page.goto('/analysis/project-123')
  
  // Complete health-check step
  await page.click('[data-testid="complete-health-check"]')
  
  // Should navigate to grouping step
  await expect(page.locator('[data-testid="grouping-panel"]')).toBeVisible()
  
  // Should show loading state
  await expect(page.locator('text=Detecting Grouping Patterns')).toBeVisible()
  
  // Should show results after detection
  await expect(page.locator('[data-testid="suggestion-card"]')).toBeVisible({ timeout: 3000 })
})
```

### Phase 2 Testing

**Unit Tests**:
- `surveyCampaignService` methods - Test API calls with mocked fetch
- `validateCampaignData()` - Test validation logic
- `calculateCampaignCost()` - Test cost calculations
- Token balance checks

**Integration Tests**:
- Campaign creation flow end-to-end
- Campaign lifecycle transitions (draft → active → completed)
- Token reservation and distribution
- Analytics aggregation

**API Tests** (using Vitest + MSW):
```typescript
test('POST /api/survey-campaigns creates campaign', async () => {
  const campaignData = {
    title: 'Test Campaign',
    targetParticipants: 100,
    tokenRewardPerParticipant: 10,
    duration: 30
  }
  
  const response = await fetch('/api/survey-campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData)
  })
  
  expect(response.status).toBe(201)
  const campaign = await response.json()
  expect(campaign.status).toBe('draft')
  expect(campaign.title).toBe('Test Campaign')
})
```

**E2E Tests**:
```typescript
test('complete campaign creation workflow', async ({ page }) => {
  await page.goto('/campaigns/create')
  
  // Step 1: Basic Info
  await page.fill('[name="title"]', 'E2E Test Campaign')
  await page.fill('[name="description"]', 'Test description')
  await page.click('button:has-text("Next")')
  
  // Step 2: Targeting
  await page.fill('[name="targetParticipants"]', '100')
  await page.click('button:has-text("Next")')
  
  // ... continue through all steps
  
  // Final step: Submit
  await page.click('button:has-text("Create Campaign")')
  
  // Should redirect to campaign dashboard
  await expect(page).toHaveURL(/\/campaigns\/[a-z0-9-]+/)
  await expect(page.locator('text=E2E Test Campaign')).toBeVisible()
})
```



## Performance Considerations

### Phase 1 Optimizations

**Detection Performance**:
- Run detection in Web Worker for large datasets (>1000 variables)
- Cache detection results in sessionStorage
- Debounce re-detection on variable changes

**Rendering Performance**:
- Use `React.memo` for suggestion cards
- Virtualize long variable lists (react-window)
- Lazy load panels (React.lazy + Suspense)

**Auto-Save Performance**:
- Debounce localStorage writes (300ms)
- Batch database saves (30s interval)
- Use optimistic UI updates

### Phase 2 Optimizations

**API Performance**:
- Implement pagination for campaign lists (50 per page)
- Use database indexes on frequently queried columns
- Cache analytics data (Redis) for 5 minutes
- Implement cursor-based pagination for large result sets

**Frontend Performance**:
- Lazy load analytics charts
- Use SWR for data fetching with stale-while-revalidate
- Implement infinite scroll for campaign lists
- Optimize bundle size (code splitting by route)

**Database Optimizations**:
```sql
-- Indexes for common queries
CREATE INDEX idx_campaigns_status_created ON survey_campaigns(status, created_at DESC);
CREATE INDEX idx_campaigns_user_status ON survey_campaigns(created_by, status);
CREATE INDEX idx_participants_campaign_status ON campaign_participants(campaign_id, status);

-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW campaign_stats AS
SELECT 
  created_by,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  SUM(current_participants) as total_participants,
  SUM(total_tokens_awarded) as total_tokens_spent
FROM survey_campaigns
GROUP BY created_by;

-- Refresh every 5 minutes
CREATE INDEX idx_campaign_stats_user ON campaign_stats(created_by);
```



## Security Considerations

### Authentication & Authorization

**Phase 1**:
- All API routes require authenticated session
- Users can only access their own projects
- Validate projectId ownership before allowing operations

**Phase 2**:
- Campaign creators can only manage their own campaigns
- Participants can only view campaigns they're eligible for
- Admin users can view all campaigns (for moderation)
- Token operations require additional verification

### Input Validation

**Frontend Validation**:
```typescript
// Campaign creation form
const schema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(2000).optional(),
  targetParticipants: z.number().int().min(1).max(10000),
  tokenRewardPerParticipant: z.number().min(0.01).max(1000),
  duration: z.number().int().min(1).max(365)
})
```

**Backend Validation**:
```typescript
// API route validation
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate schema
  const result = campaignSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ 
      error: 'Validation failed',
      details: result.error.issues 
    }, { status: 400 })
  }
  
  // Business logic validation
  if (result.data.targetParticipants * result.data.tokenRewardPerParticipant > 1000000) {
    return Response.json({ 
      error: 'Campaign cost exceeds maximum allowed (1M tokens)' 
    }, { status: 400 })
  }
  
  // ... proceed with creation
}
```

### SQL Injection Prevention

- Use parameterized queries (Supabase client handles this)
- Never concatenate user input into SQL strings
- Validate all input types before database operations

### XSS Prevention

- Sanitize all user-generated content before rendering
- Use React's built-in XSS protection (JSX escaping)
- Set Content-Security-Policy headers

### Rate Limiting

```typescript
// Implement rate limiting for API routes
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
  
  // ... handle request
}
```



## Migration & Deployment Strategy

### Phase 1 Deployment

**Step 1: Update Workflow Store**
- Add new methods to `workflowStore.ts`
- Deploy without breaking existing functionality
- Test in staging environment

**Step 2: Update Panel Components**
- Add `currentStep` dependency to useEffect
- Add `key` prop for remounting
- Deploy and verify auto-detection triggers

**Step 3: Create Workflow Container**
- Build new `app/analysis/[projectId]/page.tsx`
- Migrate existing routes to new structure
- Update navigation links

**Rollback Plan**:
- Keep old workflow pages as fallback
- Feature flag to toggle new workflow
- Monitor error rates and user feedback

### Phase 2 Deployment

**Step 1: Database Migration**
```sql
-- Run migrations in order
-- 001_create_campaigns_table.sql
-- 002_create_participants_table.sql
-- 003_create_analytics_table.sql
-- 004_create_indexes.sql
-- 005_create_materialized_views.sql
```

**Step 2: Deploy Backend APIs**
- Deploy API routes to staging
- Run integration tests
- Load test with realistic data
- Deploy to production

**Step 3: Update Frontend Services**
- Remove mock implementations
- Connect to real APIs
- Deploy frontend changes
- Monitor error rates

**Step 4: Enable Features Gradually**
- Week 1: Campaign creation only (draft mode)
- Week 2: Enable campaign launch
- Week 3: Enable analytics
- Week 4: Enable bulk operations and templates

**Rollback Plan**:
- Database migrations are reversible
- Feature flags for each major feature
- Keep "Coming Soon" alerts as fallback
- Monitor token transactions closely

### Monitoring & Observability

**Metrics to Track**:
- Auto-detection success rate
- Auto-save success rate
- Campaign creation success rate
- Campaign launch success rate
- API response times (p50, p95, p99)
- Error rates by endpoint
- Token transaction accuracy

**Alerts**:
- Error rate > 5% for any endpoint
- API response time p95 > 2 seconds
- Auto-save failure rate > 1%
- Token balance discrepancies
- Campaign launch failures

**Logging**:
```typescript
// Structured logging for debugging
logger.info('Campaign created', {
  campaignId: campaign.id,
  userId: session.user.id,
  targetParticipants: campaign.config.targetParticipants,
  estimatedCost: cost.totalCost,
  timestamp: new Date().toISOString()
})

logger.error('Campaign launch failed', {
  campaignId,
  userId: session.user.id,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
})
```

## Conclusion

This design provides a comprehensive technical approach for both phases:

**Phase 1** fixes the workflow integration issues by:
- Adding proper state management with Zustand
- Ensuring auto-detection triggers on step navigation
- Implementing robust auto-save with localStorage fallback

**Phase 2** completes the campaigns feature by:
- Implementing full backend API with database schema
- Connecting frontend components to real APIs
- Adding token management and analytics
- Implementing notification system

Both phases prioritize reliability, performance, and user experience while maintaining security and data integrity.
