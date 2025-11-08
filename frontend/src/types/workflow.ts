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

export type ProjectStage =
  | 'planning'
  | 'data-collection'
  | 'analysis'
  | 'reporting'
  | 'completed';

export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export type MilestoneType = 'research' | 'data' | 'analysis' | 'report' | 'review';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  type: MilestoneType;
  dueDate: Date;
  completedDate?: Date;
  dependencies?: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'milestone' | 'update' | 'issue';
}

export interface ProgressReport {
  projectId: string;
  stage: ProjectStage;
  completedMilestones: number;
  totalMilestones: number;
  percentComplete: number;
  lastUpdated: Date;
}

// Data Collection Types

export type DataCollectionMethod =
  | 'survey'
  | 'interview'
  | 'focus-group'
  | 'observation'
  | 'experiment'
  | 'secondary-data';

export type DataCollectionStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'on-hold';

export interface DataCollectionConfig {
  method: DataCollectionMethod;
  status: DataCollectionStatus;
  targetSampleSize?: number;
  currentSampleSize?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
}

// Research Design Types

export interface ResearchDesign {
  type: 'quantitative' | 'qualitative' | 'mixed-methods';
  approach: string;
  variables?: string[];
  hypotheses?: string[];
}

// Question Types

export type QuestionType =
  | 'multiple-choice'
  | 'text'
  | 'rating-scale'
  | 'yes-no'
  | 'ranking'
  | 'matrix';

export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
}
