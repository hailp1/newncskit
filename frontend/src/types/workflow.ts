// Enhanced types for workflow restructure
import { Database } from './database'

// Project Stage Enum
export enum ProjectStage {
  IDEA_COMPLETE = 'idea_complete',
  THEORETICAL_FRAMEWORK_COMPLETE = 'theoretical_framework_complete',
  SURVEY_COMPLETE = 'survey_complete',
  DATA_COLLECTION_COMPLETE = 'data_collection_complete',
  ANALYSIS_COMPLETE = 'analysis_complete',
  DRAFT_COMPLETE = 'draft_complete',
  CITATION_COMPLETE = 'citation_complete',
  FORMAT_COMPLETE = 'format_complete',
  PLAGIARISM_CHECK_COMPLETE = 'plagiarism_check_complete',
  SUBMITTED = 'submitted',
  PUBLISHED = 'published'
}

// Data Collection Method Enum
export enum DataCollectionMethod {
  INTERNAL_SURVEY = 'internal_survey',
  EXTERNAL_DATA = 'external_data'
}

// Data Collection Status Enum
export enum DataCollectionStatus {
  NOT_STARTED = 'not_started',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

// Campaign Status Enum
export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Question Type Enum
export enum QuestionType {
  LIKERT = 'likert',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  NUMERIC = 'numeric',
  BOOLEAN = 'boolean',
  RATING = 'rating',
  RANKING = 'ranking'
}

// Milestone Type Enum
export enum MilestoneType {
  RESEARCH_PLANNING = 'research_planning',
  THEORETICAL_FRAMEWORK = 'theoretical_framework',
  SURVEY_DESIGN = 'survey_design',
  DATA_COLLECTION = 'data_collection',
  DATA_ANALYSIS = 'data_analysis',
  WRITING = 'writing',
  REVIEW = 'review',
  SUBMISSION = 'submission',
  PUBLICATION = 'publication'
}

// Milestone Status Enum
export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

// Theoretical Framework Interface
export interface TheoreticalFramework {
  id: string
  name: string
  description: string
  variables: ResearchVariable[]
  relationships: FrameworkRelationship[]
}

// Research Variable Interface
export interface ResearchVariable {
  id: string
  name: string
  type: 'independent' | 'dependent' | 'mediator' | 'moderator'
  description: string
  construct: string
  measurementItems: string[]
}

// Framework Relationship Interface
export interface FrameworkRelationship {
  id: string
  from: string // variable id
  to: string // variable id
  type: 'direct' | 'indirect' | 'moderating' | 'mediating'
  hypothesis: string
}

// Hypothesis Interface
export interface Hypothesis {
  id: string
  statement: string
  type: 'main' | 'alternative' | 'null'
  variables: string[] // variable ids
  expectedDirection: 'positive' | 'negative' | 'neutral'
}

// Research Design Interface
export interface ResearchDesign {
  theoreticalFrameworks: TheoreticalFramework[]
  researchVariables: ResearchVariable[]
  hypotheses: Hypothesis[]
  methodology: string
}

// Data Collection Configuration Interface
export interface DataCollectionConfig {
  surveyId?: string
  campaignId?: string
  targetSampleSize: number
  collectionMethod: DataCollectionMethod
  status: DataCollectionStatus
}

// Progress Tracking Interface
export interface ProgressTracking {
  currentStage: ProjectStage
  completedMilestones: Milestone[]
  timeline: TimelineEvent[]
}

// Publication Info Interface
export interface PublicationInfo {
  submissionStatus?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published'
  submissionDate?: Date
  publicationLink?: string
  journal?: string
}

// Enhanced Project Interface
export interface EnhancedProject {
  id: string
  title: string
  description: string
  user_id: string
  business_domain_id: number
  selected_models: number[]
  
  // Enhanced fields
  researchDesign: ResearchDesign
  dataCollection: DataCollectionConfig
  progress: ProgressTracking
  publication?: PublicationInfo
  
  // Existing fields
  research_outline?: any
  status: 'draft' | 'outline_generated' | 'active' | 'paused' | 'completed' | 'archived'
  progress_percentage: number
  phase: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
  tags?: string[]
  word_count?: number
  reference_count?: number
  created_at: string
  updated_at: string
}

// Survey Campaign Interface
export interface SurveyCampaign {
  id: string
  projectId: string
  surveyId?: string
  title: string
  description?: string
  
  // Campaign Configuration
  config: {
    targetParticipants: number
    tokenRewardPerParticipant: number
    duration: number // days
    eligibilityCriteria: EligibilityCriteria
  }
  
  // Campaign Status
  status: CampaignStatus
  
  // Participation Tracking
  participation: {
    totalParticipants: number
    completedResponses: number
    totalTokensAwarded: number
    adminFeeCollected: number
  }
  
  // Timeline
  createdAt: Date
  launchedAt?: Date
  completedAt?: Date
}

// Eligibility Criteria Interface
export interface EligibilityCriteria {
  minAge?: number
  maxAge?: number
  demographics?: string[]
  experience?: string[]
  location?: string[]
  customCriteria?: { [key: string]: any }
}

// Question Template Interface
export interface QuestionTemplate {
  id: string
  text: string
  textVi?: string
  type: QuestionType
  
  // Model Association
  theoreticalModel: string
  researchVariable: string
  construct: string
  
  // Question Configuration
  options?: string[] // for multiple choice
  scale?: { min: number, max: number, labels: string[] } // for likert
  validation?: ValidationRule[]
  
  // Metadata
  source: string // academic source/reference
  reliability?: number // Cronbach's alpha if available
  tags: string[]
  category?: string
  subcategory?: string
  isActive: boolean
  version: number
  parentQuestionId?: string
}

// Validation Rule Interface
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range'
  value?: any
  message: string
}

// Milestone Interface
export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  type: MilestoneType
  status: MilestoneStatus
  progressPercentage: number
  estimatedHours?: number
  actualHours?: number
  plannedStartDate?: Date
  actualStartDate?: Date
  plannedCompletionDate?: Date
  actualCompletionDate?: Date
  orderIndex: number
  dependsOn: string[] // milestone IDs
  notes?: string
  attachments: FileAttachment[]
  data: { [key: string]: any }
  createdBy?: string
  completedBy?: string
}

// Timeline Event Interface
export interface TimelineEvent {
  id: string
  projectId: string
  milestoneId?: string
  eventType: string
  description: string
  data: { [key: string]: any }
  timestamp: Date
  userId?: string
  metadata: { [key: string]: any }
}

// File Attachment Interface
export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

// Progress Report Interface
export interface ProgressReport {
  projectId: string
  overallProgress: number
  currentStage: ProjectStage
  completedMilestones: number
  totalMilestones: number
  estimatedCompletion?: Date
  recentActivity: TimelineEvent[]
  upcomingMilestones: Milestone[]
  blockedMilestones: Milestone[]
}

// Database type aliases for convenience
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type SurveyCampaignRow = Database['public']['Tables']['survey_campaigns']['Row']
export type SurveyCampaignInsert = Database['public']['Tables']['survey_campaigns']['Insert']
export type SurveyCampaignUpdate = Database['public']['Tables']['survey_campaigns']['Update']

export type QuestionBankRow = Database['public']['Tables']['question_bank']['Row']
export type QuestionBankInsert = Database['public']['Tables']['question_bank']['Insert']
export type QuestionBankUpdate = Database['public']['Tables']['question_bank']['Update']

export type ProgressTrackingRow = Database['public']['Tables']['progress_tracking']['Row']
export type ProgressTrackingInsert = Database['public']['Tables']['progress_tracking']['Insert']
export type ProgressTrackingUpdate = Database['public']['Tables']['progress_tracking']['Update']

export type TimelineEventRow = Database['public']['Tables']['timeline_events']['Row']
export type TimelineEventInsert = Database['public']['Tables']['timeline_events']['Insert']
export type TimelineEventUpdate = Database['public']['Tables']['timeline_events']['Update']