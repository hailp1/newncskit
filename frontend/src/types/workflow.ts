// Workflow State Types

export type WorkflowStep =
  | 'upload'
  | 'health-check'
  | 'grouping'
  | 'demographic'
  | 'analysis-selection'
  | 'execution'
  | 'results';

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  projectId: string | null;
  lastSaved: Date | null;
  isDirty: boolean;
  progress: number; // 0-100
}

export interface StepConfig {
  id: WorkflowStep;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  isAccessible: boolean;
}

// Loading State Types

export type LoadingType =
  | 'upload'
  | 'parsing'
  | 'health-check'
  | 'grouping'
  | 'analysis'
  | 'export';

export interface LoadingState {
  isLoading: boolean;
  loadingType: LoadingType;
  progress?: number;
  message?: string;
  estimatedTime?: number;
  canCancel?: boolean;
}

export interface OperationProgress {
  current: number;
  total: number;
  currentItem?: string;
  startTime: Date;
}

// Error State Types

export type ErrorType = 'warning' | 'error' | 'critical';

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  field?: string;
  suggestions: string[];
  canRetry: boolean;
  canReport: boolean;
}

export interface ValidationError extends ErrorState {
  field: string;
  value: any;
  constraint: string;
}

// Backup State Types

export interface BackupState {
  projectId: string;
  step: WorkflowStep;
  timestamp: Date;
  formData: Record<string, any>;
}

// Project and Research Types (from original workflow.ts)

export enum ProjectStage {
  IDEA = 'idea',
  IDEA_COMPLETE = 'idea-complete',
  RESEARCH_DESIGN = 'research-design',
  RESEARCH_DESIGN_COMPLETE = 'research-design-complete',
  THEORETICAL_FRAMEWORK_COMPLETE = 'theoretical-framework-complete',
  SURVEY_COMPLETE = 'survey-complete',
  DATA_COLLECTION = 'data-collection',
  DATA_COLLECTION_COMPLETE = 'data-collection-complete',
  ANALYSIS = 'analysis',
  ANALYSIS_COMPLETE = 'analysis-complete',
  REPORTING = 'reporting',
  DRAFT_COMPLETE = 'draft-complete',
  CITATION_COMPLETE = 'citation-complete',
  FORMAT_COMPLETE = 'format-complete',
  PLAGIARISM_CHECK_COMPLETE = 'plagiarism-check-complete',
  SUBMITTED = 'submitted',
  PUBLISHED = 'published',
  COMPLETED = 'completed'
}

export enum MilestoneStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

export enum MilestoneType {
  RESEARCH_PLANNING = 'research-planning',
  LITERATURE_REVIEW = 'literature-review',
  THEORETICAL_FRAMEWORK = 'theoretical-framework',
  SURVEY_DESIGN = 'survey-design',
  DATA_COLLECTION = 'data-collection',
  DATA_ANALYSIS = 'data-analysis',
  REPORT_WRITING = 'report-writing',
  WRITING = 'writing',
  REVIEW = 'review',
  SUBMISSION = 'submission',
  PUBLICATION = 'publication'
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  type: MilestoneType;
  dueDate: Date;
  completedDate?: Date;
  dependencies?: string[];
  dependsOn?: string[];
  orderIndex: number;
  progressPercentage: number;
  plannedStartDate?: Date;
  plannedCompletionDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  attachments?: string[];
  data?: any;
}

export interface TimelineEvent {
  id?: string;
  projectId?: string;
  title?: string;
  description?: string;
  date?: Date;
  timestamp?: Date;
  type?: 'milestone' | 'update' | 'issue';
  eventType?: string;
  data?: any;
  metadata?: any;
}

export interface ProgressReport {
  projectId: string;
  stage: ProjectStage;
  completedMilestones: number;
  totalMilestones: number;
  percentComplete: number;
  lastUpdated: Date;
  upcomingMilestones: Milestone[];
  blockedMilestones: Milestone[];
  estimatedCompletion?: Date;
}

// Data Collection Types

export enum DataCollectionMethod {
  SURVEY = 'survey',
  INTERNAL_SURVEY = 'internal-survey',
  EXTERNAL_DATA = 'external-data',
  INTERVIEW = 'interview',
  FOCUS_GROUP = 'focus-group',
  OBSERVATION = 'observation',
  EXPERIMENT = 'experiment',
  SECONDARY_DATA = 'secondary-data'
}

export enum DataCollectionStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on-hold'
}

export interface DataCollectionConfig {
  method: DataCollectionMethod;
  status: DataCollectionStatus;
  targetSampleSize?: number;
  currentSampleSize?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
  collectionMethod?: string;
  campaignId?: string;
  surveyId?: string;
}

// Research Design Types

export interface TheoreticalFramework {
  id: string;
  name: string;
  description: string;
  constructs?: string[];
  relationships: FrameworkRelationship[];
  variables?: ResearchVariable[];
}

export interface FrameworkRelationship {
  from: string;
  to: string;
  type: 'influences' | 'moderates' | 'mediates';
  description?: string;
}

export interface ResearchVariable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'moderator' | 'mediator';
  construct?: string;
  items?: string[];
  description?: string;
  measurementItems?: string[];
}

export interface Hypothesis {
  id: string;
  statement: string;
  variables: string[];
  expectedRelationship?: 'positive' | 'negative' | 'none';
  rationale?: string;
  type?: 'directional' | 'non-directional' | 'null' | 'main' | 'alternative';
  expectedDirection?: 'positive' | 'negative' | 'none';
}

export interface ResearchDesign {
  type?: 'quantitative' | 'qualitative' | 'mixed-methods';
  approach?: string;
  variables?: string[];
  hypotheses?: string[] | Hypothesis[];
  theoreticalFrameworks?: TheoreticalFramework[];
  researchVariables?: ResearchVariable[];
  methodology?: string;
}

// Survey Campaign Types

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  gender?: 'male' | 'female' | 'other' | 'any';
  location?: string[];
  customCriteria?: Record<string, any>;
  demographics?: Record<string, any>;
  experience?: string | number;
}

export interface SurveyCampaign {
  id: string;
  projectId: string;
  name: string;
  title: string;
  description?: string;
  status: CampaignStatus;
  targetSampleSize: number;
  currentSampleSize: number;
  startDate: Date;
  endDate?: Date;
  eligibilityCriteria: EligibilityCriteria;
  surveyId?: string;
  participation?: {
    total: number;
    completed: number;
    inProgress: number;
    abandoned: number;
    totalParticipants?: number;
    completedResponses?: number;
  };
  config?: {
    allowAnonymous?: boolean;
    requireEmail?: boolean;
    maxResponses?: number;
    expiresAt?: Date;
    targetParticipants?: number;
    tokenRewardPerParticipant?: number;
    duration?: number;
  };
  launchedAt?: Date;
}

export interface EnhancedProject {
  id: string;
  name: string;
  title: string;
  description?: string;
  stage: ProjectStage;
  researchDesign?: ResearchDesign;
  dataCollection?: DataCollectionConfig;
  milestones: Milestone[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Question Types

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TEXT = 'text',
  RATING_SCALE = 'rating-scale',
  LIKERT = 'likert',
  YES_NO = 'yes-no',
  RANKING = 'ranking',
  MATRIX = 'matrix'
}

export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  text: string;
  textVi?: string;
  options?: string[];
  required: boolean;
  scale?: number | { min: number; max: number; labels: string[] };
  construct?: string;
  researchVariable?: string;
  theoreticalModel?: string;
  source?: string;
  tags?: string[];
  isActive?: boolean;
  version?: number;
}
