/**
 * Supabase Database Types
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          institution: string | null
          orcid_id: string | null
          research_domains: string[] | null
          role: string
          subscription_type: string
          is_active: boolean
          status: string
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          institution?: string | null
          orcid_id?: string | null
          research_domains?: string[] | null
          role?: string
          subscription_type?: string
          is_active?: boolean
          status?: string
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          institution?: string | null
          orcid_id?: string | null
          research_domains?: string[] | null
          role?: string
          subscription_type?: string
          is_active?: boolean
          status?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      permissions: {
        Row: {
          id: number
          user_id: string
          permission: string
          granted_by: string
          granted_at: string
          expires_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          permission: string
          granted_by: string
          granted_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          permission?: string
          granted_by?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'permissions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'permissions_granted_by_fkey'
            columns: ['granted_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      admin_logs: {
        Row: {
          id: number
          admin_id: string
          action: string
          target_type: string
          target_id: number
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          admin_id: string
          action: string
          target_type: string
          target_id: number
          details: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: number
          details?: Json
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'admin_logs_admin_id_fkey'
            columns: ['admin_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          id: number
          title: string
          slug: string
          excerpt: string | null
          content: string
          author_id: string
          status: string
          category: string | null
          tags: Json | null
          featured_image: string | null
          meta_description: string | null
          view_count: number
          like_count: number
          published_at: string | null
          scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          excerpt?: string | null
          content: string
          author_id: string
          status?: string
          category?: string | null
          tags?: Json | null
          featured_image?: string | null
          meta_description?: string | null
          view_count?: number
          like_count?: number
          published_at?: string | null
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          author_id?: string
          status?: string
          category?: string | null
          tags?: Json | null
          featured_image?: string | null
          meta_description?: string | null
          view_count?: number
          like_count?: number
          published_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      datasets: {
        Row: {
          id: string
          project_id: string
          name: string
          file_url: string
          file_size: number | null
          row_count: number | null
          column_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          file_url: string
          file_size?: number | null
          row_count?: number | null
          column_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          file_url?: string
          file_size?: number | null
          row_count?: number | null
          column_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'datasets_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      analytics_cache: {
        Row: {
          id: string
          request_hash: string
          action: string
          request_data: Json
          response_data: Json
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          request_hash: string
          action: string
          request_data: Json
          response_data: Json
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          request_hash?: string
          action?: string
          request_data?: Json
          response_data?: Json
          expires_at?: string
        }
        Relationships: []
      }
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
          configuration: Json
          is_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          analysis_type: 'descriptive' | 'reliability' | 'efa' | 'cfa' | 'correlation' | 'ttest' | 'anova' | 'regression' | 'sem'
          configuration?: Json
          is_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          analysis_type?: 'descriptive' | 'reliability' | 'efa' | 'cfa' | 'correlation' | 'ttest' | 'anova' | 'regression' | 'sem'
          configuration?: Json
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
          results: Json
          execution_time_ms: number | null
          executed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          analysis_type: string
          results: Json
          execution_time_ms?: number | null
          executed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          analysis_type?: string
          results?: Json
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_project_count: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      get_project_dataset_count: {
        Args: {
          project_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
