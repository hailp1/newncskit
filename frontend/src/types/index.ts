// User and Authentication Types
export interface User {
  id: string
  email: string
  profile: UserProfile
  subscription: SubscriptionPlan
  preferences: UserPreferences
  role?: string
  status?: string
  full_name?: string
  is_staff?: boolean
  is_superuser?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  institution?: string
  researchDomain: string[]
  orcidId?: string
  avatar?: string
}

export interface SubscriptionPlan {
  type: 'free' | 'premium' | 'institutional'
  features: string[]
  expiresAt?: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  deadlines: boolean
  collaboration: boolean
}

// Project Management Types
export interface Project {
  id: string
  title: string
  description: string
  phase: ResearchPhase
  status: ProjectStatus
  timeline: ProjectTimeline
  collaborators: Collaborator[]
  documents: Document[]
  references: Reference[]
  createdAt: Date
  updatedAt: Date
}

export type ResearchPhase = 'planning' | 'execution' | 'writing' | 'submission' | 'management'
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface ProjectTimeline {
  startDate: Date
  endDate?: Date
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
}

export interface Collaborator {
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  permissions: string[]
  invitedAt: Date
  joinedAt?: Date
}

// Document and Content Types
export interface Document {
  id: string
  projectId: string
  title: string
  content: string
  version: number
  type: DocumentType
  metadata: DocumentMetadata
  collaborativeEdits: Edit[]
  createdAt: Date
  updatedAt: Date
}

export type DocumentType = 'manuscript' | 'notes' | 'methodology' | 'data_analysis' | 'presentation'

export interface DocumentMetadata {
  wordCount: number
  lastEditedBy: string
  tags: string[]
  language: string
}

export interface Edit {
  id: string
  userId: string
  timestamp: Date
  type: 'insert' | 'delete' | 'format'
  position: number
  content: string
}

// Reference Management Types
export interface Reference {
  id: string
  title: string
  authors: Author[]
  publication: Publication
  metadata: ReferenceMetadata
  tags: string[]
  notes: string
  attachments: Attachment[]
  createdAt: Date
}

export interface Author {
  firstName: string
  lastName: string
  orcidId?: string
}

export interface Publication {
  journal?: string
  conference?: string
  publisher?: string
  year: number
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  isbn?: string
}

export interface ReferenceMetadata {
  type: 'journal' | 'conference' | 'book' | 'thesis' | 'report' | 'website'
  abstract?: string
  keywords: string[]
  citationCount?: number
  impactFactor?: number
}

export interface Attachment {
  id: string
  filename: string
  fileType: string
  fileSize: number
  url: string
}

// Journal and Submission Types
export interface Journal {
  id: string
  name: string
  publisher: string
  impactFactor: number
  acceptanceRate: number
  submissionGuidelines: SubmissionGuidelines
  categories: ResearchCategory[]
  ranking: JournalRanking
}

export interface SubmissionGuidelines {
  wordLimit: number
  referenceLimit: number
  figureLimit: number
  formatRequirements: string[]
  submissionDeadlines: string[]
}

export interface ResearchCategory {
  name: string
  subcategories: string[]
}

export interface JournalRanking {
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  rank: number
  totalJournals: number
}

// AI and Suggestions Types
export interface TopicSuggestion {
  id: string
  title: string
  description: string
  relevanceScore: number
  trendScore: number
  noveltyScore: number
  suggestedKeywords: string[]
  relatedReferences: Reference[]
}

export interface WritingSuggestion {
  id: string
  type: 'grammar' | 'style' | 'structure' | 'content'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  position: {
    start: number
    end: number
  }
}

// Dashboard and Analytics Types
export interface DashboardData {
  projects: ProjectSummary[]
  recentActivity: Activity[]
  upcomingDeadlines: Deadline[]
  productivity: ProductivityMetrics
}

export interface ProjectSummary {
  id: string
  title: string
  phase: ResearchPhase
  progress: number
  lastActivity: Date
  collaboratorCount: number
}

export interface Activity {
  id: string
  type: 'document_edit' | 'reference_added' | 'milestone_completed' | 'collaboration'
  description: string
  timestamp: Date
  projectId: string
}

export interface Deadline {
  id: string
  title: string
  date: Date
  type: 'milestone' | 'submission' | 'review'
  priority: 'low' | 'medium' | 'high'
  projectId: string
}

export interface ProductivityMetrics {
  wordsWritten: number
  referencesAdded: number
  milestonesCompleted: number
  collaborationHours: number
  period: 'week' | 'month' | 'year'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface UserRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  institution?: string
  researchDomain: string[]
}

export interface ProjectCreation {
  title: string
  description: string
  phase: ResearchPhase
  collaborators?: string[]
  timeline?: {
    startDate: Date
    endDate?: Date
  }
}

// Re-export workflow types
export * from './workflow'
export * from './database'