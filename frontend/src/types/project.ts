// Project Management Types

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
