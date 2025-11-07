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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
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
