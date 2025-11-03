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
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          institution: string | null
          orcid_id: string | null
          avatar_url: string | null
          subscription_type: 'free' | 'premium' | 'institutional'
          research_domains: string[]
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          institution?: string | null
          orcid_id?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium' | 'institutional'
          research_domains?: string[]
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          institution?: string | null
          orcid_id?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium' | 'institutional'
          research_domains?: string[]
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          phase: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          status: 'active' | 'paused' | 'completed' | 'archived'
          progress: number
          owner_id: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          phase?: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          status?: 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          owner_id: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          phase?: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          status?: 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          owner_id?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          permissions: string[]
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          permissions?: string[]
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          permissions?: string[]
          invited_at?: string
          joined_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          version: number
          type: 'manuscript' | 'notes' | 'methodology' | 'data_analysis' | 'presentation'
          metadata: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: string
          version?: number
          type?: 'manuscript' | 'notes' | 'methodology' | 'data_analysis' | 'presentation'
          metadata?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string
          version?: number
          type?: 'manuscript' | 'notes' | 'methodology' | 'data_analysis' | 'presentation'
          metadata?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      references: {
        Row: {
          id: string
          title: string
          authors: Json
          publication: Json
          metadata: Json
          tags: string[]
          notes: string | null
          user_id: string
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          authors: Json
          publication: Json
          metadata: Json
          tags?: string[]
          notes?: string | null
          user_id: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          authors?: Json
          publication?: Json
          metadata?: Json
          tags?: string[]
          notes?: string | null
          user_id?: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          due_date: string
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description: string
          due_date: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string
          due_date?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          type: 'document_edit' | 'reference_added' | 'milestone_completed' | 'collaboration'
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          type: 'document_edit' | 'reference_added' | 'milestone_completed' | 'collaboration'
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          type?: 'document_edit' | 'reference_added' | 'milestone_completed' | 'collaboration'
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      research_phase: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
      project_status: 'active' | 'paused' | 'completed' | 'archived'
      document_type: 'manuscript' | 'notes' | 'methodology' | 'data_analysis' | 'presentation'
      activity_type: 'document_edit' | 'reference_added' | 'milestone_completed' | 'collaboration'
      subscription_type: 'free' | 'premium' | 'institutional'
      collaborator_role: 'owner' | 'editor' | 'viewer'
    }
  }
}