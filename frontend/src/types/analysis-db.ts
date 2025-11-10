/**
 * Analysis Database Types
 * Explicit type exports for analysis tables
 */

import type { Database } from './supabase';

// Analysis Projects
export type AnalysisProject = Database['public']['Tables']['analysis_projects']['Row'];
export type AnalysisProjectInsert = Database['public']['Tables']['analysis_projects']['Insert'];
export type AnalysisProjectUpdate = Database['public']['Tables']['analysis_projects']['Update'];

// Analysis Variables
export type AnalysisVariable = Database['public']['Tables']['analysis_variables']['Row'];
export type AnalysisVariableInsert = Database['public']['Tables']['analysis_variables']['Insert'];
export type AnalysisVariableUpdate = Database['public']['Tables']['analysis_variables']['Update'];

// Variable Groups
export type VariableGroup = Database['public']['Tables']['variable_groups']['Row'];
export type VariableGroupInsert = Database['public']['Tables']['variable_groups']['Insert'];
export type VariableGroupUpdate = Database['public']['Tables']['variable_groups']['Update'];

// Variable Role Tags
export type VariableRoleTag = Database['public']['Tables']['variable_role_tags']['Row'];
export type VariableRoleTagInsert = Database['public']['Tables']['variable_role_tags']['Insert'];
export type VariableRoleTagUpdate = Database['public']['Tables']['variable_role_tags']['Update'];

// Analysis Configurations
export type AnalysisConfiguration = Database['public']['Tables']['analysis_configurations']['Row'];
export type AnalysisConfigurationInsert = Database['public']['Tables']['analysis_configurations']['Insert'];
export type AnalysisConfigurationUpdate = Database['public']['Tables']['analysis_configurations']['Update'];

// Analysis Results
export type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
export type AnalysisResultInsert = Database['public']['Tables']['analysis_results']['Insert'];
export type AnalysisResultUpdate = Database['public']['Tables']['analysis_results']['Update'];
