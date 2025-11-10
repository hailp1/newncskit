/**
 * Analysis Tables Types for Supabase
 * Add these to the main supabase.ts file
 */

export interface AnalysisTables {
  analysis_projects: {
    Row: {
      id: string
      user_id: string
      name: string
      description: string | null
      csv_file_path: string
      csv_file_size: number
      row_count: number
      column_count: number
      status: 'draft' | 'configured' | 'analyzing' | 'completed' | 'error'
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      name: string
      description?: string | null
      csv_file_path: string
      csv_file_size: number
      row_count: number
      column_count: number
      status?: 'draft' | 'configured' | 'analyzing' | 'completed' | 'error'
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      name?: string
      description?: string | null
      csv_file_path?: string
      csv_file_size?: number
      row_count?: number
      column_count?: number
      status?: 'draft' | 'configured' | 'analyzing' | 'completed' | 'error'
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'analysis_projects_user_id_fkey'
        columns: ['user_id']
        referencedRelation: 'users'
        referencedColumns: ['id']
      }
    ]
  }
  
  analysis_variables: {
    Row: {
      id: string
      project_id: string
      column_name: string
      display_name: string | null
      data_type: 'numeric' | 'categorical' | 'text' | 'date' | null
      is_demographic: boolean
      demographic_type: 'categorical' | 'ordinal' | 'continuous' | null
      semantic_name: string | null
      variable_group_id: string | null
      missing_count: number
      unique_count: number
      min_value: number | null
      max_value: number | null
      mean_value: number | null
      created_at: string
    }
    Insert: {
      id?: string
      project_id: string
      column_name: string
      display_name?: string | null
      data_type?: 'numeric' | 'categorical' | 'text' | 'date' | null
      is_demographic?: boolean
      demographic_type?: 'categorical' | 'ordinal' | 'continuous' | null
      semantic_name?: string | null
      variable_group_id?: string | null
      missing_count?: number
      unique_count?: number
      min_value?: number | null
      max_value?: number | null
      mean_value?: number | null
      created_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      column_name?: string
      display_name?: string | null
      data_type?: 'numeric' | 'categorical' | 'text' | 'date' | null
      is_demographic?: boolean
      demographic_type?: 'categorical' | 'ordinal' | 'continuous' | null
      semantic_name?: string | null
      variable_group_id?: string | null
      missing_count?: number
      unique_count?: number
      min_value?: number | null
      max_value?: number | null
      mean_value?: number | null
    }
    Relationships: [
      {
        foreignKeyName: 'analysis_variables_project_id_fkey'
        columns: ['project_id']
        referencedRelation: 'analysis_projects'
        referencedColumns: ['id']
      }
    ]
  }
  
  variable_groups: {
    Row: {
      id: string
      project_id: string
      name: string
      description: string | null
      group_type: 'construct' | 'demographic' | 'control'
      created_at: string
    }
    Insert: {
      id?: string
      project_id: string
      name: string
      description?: string | null
      group_type?: 'construct' | 'demographic' | 'control'
      created_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      name?: string
      description?: string | null
      group_type?: 'construct' | 'demographic' | 'control'
    }
    Relationships: [
      {
        foreignKeyName: 'variable_groups_project_id_fkey'
        columns: ['project_id']
        referencedRelation: 'analysis_projects'
        referencedColumns: ['id']
      }
    ]
  }
  
  variable_role_tags: {
    Row: {
      id: string
      variable_id: string
      role_tag: string
      created_at: string
    }
    Insert: {
      id?: string
      variable_id: string
      role_tag: string
      created_at?: string
    }
    Update: {
      id?: string
      variable_id?: string
      role_tag?: string
    }
    Relationships: [
      {
        foreignKeyName: 'variable_role_tags_variable_id_fkey'
        columns: ['variable_id']
        referencedRelation: 'analysis_variables'
        referencedColumns: ['id']
      }
    ]
  }
  
  analysis_configurations: {
    Row: {
      id: string
      project_id: string
      analysis_type: 'descriptive' | 'reliability' | 'efa' | 'cfa' | 'correlation' | 'ttest' | 'anova' | 'regression' | 'sem'
      configuration: Record<string, any>
      is_enabled: boolean
      created_at: string
    }
    Insert: {
      id?: string
      project_id: string
      analysis_type: 'descriptive' | 'reliability' | 'efa' | 'cfa' | 'correlation' | 'ttest' | 'anova' | 'regression' | 'sem'
      configuration?: Record<string, any>
      is_enabled?: boolean
      created_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      analysis_type?: 'descriptive' | 'reliability' | 'efa' | 'cfa' | 'correlation' | 'ttest' | 'anova' | 'regression' | 'sem'
      configuration?: Record<string, any>
      is_enabled?: boolean
    }
    Relationships: [
      {
        foreignKeyName: 'analysis_configurations_project_id_fkey'
        columns: ['project_id']
        referencedRelation: 'analysis_projects'
        referencedColumns: ['id']
      }
    ]
  }
  
  analysis_results: {
    Row: {
      id: string
      project_id: string
      analysis_type: string
      results: Record<string, any>
      execution_time_ms: number | null
      executed_at: string
    }
    Insert: {
      id?: string
      project_id: string
      analysis_type: string
      results: Record<string, any>
      execution_time_ms?: number | null
      executed_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      analysis_type?: string
      results?: Record<string, any>
      execution_time_ms?: number | null
      executed_at?: string
    }
    Relationships: [
      {
        foreignKeyName: 'analysis_results_project_id_fkey'
        columns: ['project_id']
        referencedRelation: 'analysis_projects'
        referencedColumns: ['id']
      }
    ]
  }
}
