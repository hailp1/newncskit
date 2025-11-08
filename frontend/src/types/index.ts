/**
 * Central export for all type definitions
 */

// Permission types
export * from './permissions';

// Admin types
export * from './admin';

// Blog types
export * from './blog';

// Supabase types (if exists)
export * from './supabase';

// Workflow types
export * from './workflow';

// Analysis types
export * from './analysis';

// Project types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProjectCreation {
  name: string;
  description?: string;
  user_id: string;
}

// Research phase type
export type ResearchPhase = 
  | 'planning'
  | 'literature-review'
  | 'design'
  | 'data-collection'
  | 'analysis'
  | 'writing'
  | 'review'
  | 'completed';
