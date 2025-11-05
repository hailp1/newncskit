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
          full_name: string | null
          institution: string | null
          orcid_id: string | null
          avatar_url: string | null
          subscription_type: 'free' | 'premium' | 'institutional'
          token_balance: number
          account_status: 'active' | 'suspended' | 'pending'
          research_domains: string[] | null
          preferences: Json | null
          role: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          full_name?: string | null
          institution?: string | null
          orcid_id?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium' | 'institutional'
          token_balance?: number
          account_status?: 'active' | 'suspended' | 'pending'
          research_domains?: string[] | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          full_name?: string | null
          institution?: string | null
          orcid_id?: string | null
          avatar_url?: string | null
          subscription_type?: 'free' | 'premium' | 'institutional'
          token_balance?: number
          account_status?: 'active' | 'suspended' | 'pending'
          research_domains?: string[] | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          user_id: string
          business_domain_id: number
          selected_models: number[]
          research_outline: Json | null
          status: 'draft' | 'outline_generated' | 'active' | 'paused' | 'completed' | 'archived'
          progress: number
          phase: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          tags: string[] | null
          word_count: number | null
          reference_count: number | null
          research_design: Json | null
          data_collection: Json | null
          progress_tracking: Json | null
          publication_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          user_id: string
          business_domain_id: number
          selected_models?: number[]
          research_outline?: Json | null
          status?: 'draft' | 'outline_generated' | 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          phase?: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          tags?: string[] | null
          word_count?: number | null
          reference_count?: number | null
          research_design?: Json | null
          data_collection?: Json | null
          progress_tracking?: Json | null
          publication_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          user_id?: string
          business_domain_id?: number
          selected_models?: number[]
          research_outline?: Json | null
          status?: 'draft' | 'outline_generated' | 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          phase?: 'planning' | 'execution' | 'writing' | 'submission' | 'management'
          tags?: string[] | null
          word_count?: number | null
          reference_count?: number | null
          research_design?: Json | null
          data_collection?: Json | null
          progress_tracking?: Json | null
          publication_info?: Json | null
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
      business_domains: {
        Row: {
          id: number
          name: string
          name_vi: string | null
          description: string
          description_vi: string | null
          icon: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          name_vi?: string | null
          description: string
          description_vi?: string | null
          icon: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_vi?: string | null
          description?: string
          description_vi?: string | null
          icon?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      marketing_models: {
        Row: {
          id: number
          name: string
          name_vi: string | null
          abbreviation: string | null
          description: string
          description_vi: string | null
          category: string
          year_developed: number | null
          key_authors: string[] | null
          application_areas: string[] | null
          variables: Json | null
          relationships: Json | null
          academic_references: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          name_vi?: string | null
          abbreviation?: string | null
          description: string
          description_vi?: string | null
          category: string
          year_developed?: number | null
          key_authors?: string[] | null
          application_areas?: string[] | null
          variables?: Json | null
          relationships?: Json | null
          academic_references?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_vi?: string | null
          abbreviation?: string | null
          description?: string
          description_vi?: string | null
          category?: string
          year_developed?: number | null
          key_authors?: string[] | null
          application_areas?: string[] | null
          variables?: Json | null
          relationships?: Json | null
          academic_references?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: number
          admin_id: string
          action: string
          target_type: string
          target_id: number
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: number
          admin_id: string
          action: string
          target_type: string
          target_id: number
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: number
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      user_tokens: {
        Row: {
          id: number
          user_id: number
          transaction_type: string
          amount: number
          balance_after: number
          description: string
          reference_type: string | null
          reference_id: number | null
          created_by: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          transaction_type: string
          amount: number
          balance_after: number
          description: string
          reference_type?: string | null
          reference_id?: number | null
          created_by?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          transaction_type?: string
          amount?: number
          balance_after?: number
          description?: string
          reference_type?: string | null
          reference_id?: number | null
          created_by?: number | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          title: string
          content: string
          author_id: number
          author_name: string | null
          status: string
          category: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          author_id: number
          author_name?: string | null
          status?: string
          category?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          author_id?: number
          author_name?: string | null
          status?: string
          category?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      permissions: {
        Row: {
          id: number
          user_id: string
          permission: string
          granted_by: string | null
          granted_at: string
          expires_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          permission: string
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          permission?: string
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
        }
      }
      rewards: {
        Row: {
          id: number
          user_id: string
          reward_type: string
          amount: number
          description: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          reward_type: string
          amount: number
          description: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          reward_type?: string
          amount?: number
          description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      survey_campaigns: {
        Row: {
          id: string
          project_id: string
          survey_id: string | null
          title: string
          description: string | null
          target_participants: number
          token_reward_per_participant: number
          duration_days: number
          eligibility_criteria: Json
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          total_participants: number
          completed_responses: number
          total_tokens_awarded: number
          admin_fee_collected: number
          admin_fee_percentage: number
          created_at: string
          updated_at: string
          launched_at: string | null
          completed_at: string | null
          campaign_data: Json
        }
        Insert: {
          id?: string
          project_id: string
          survey_id?: string | null
          title: string
          description?: string | null
          target_participants?: number
          token_reward_per_participant?: number
          duration_days?: number
          eligibility_criteria?: Json
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          total_participants?: number
          completed_responses?: number
          total_tokens_awarded?: number
          admin_fee_collected?: number
          admin_fee_percentage?: number
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          completed_at?: string | null
          campaign_data?: Json
        }
        Update: {
          id?: string
          project_id?: string
          survey_id?: string | null
          title?: string
          description?: string | null
          target_participants?: number
          token_reward_per_participant?: number
          duration_days?: number
          eligibility_criteria?: Json
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          total_participants?: number
          completed_responses?: number
          total_tokens_awarded?: number
          admin_fee_collected?: number
          admin_fee_percentage?: number
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          completed_at?: string | null
          campaign_data?: Json
        }
      }
      question_bank: {
        Row: {
          id: string
          text: string
          text_vi: string | null
          type: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean' | 'rating' | 'ranking'
          theoretical_model: string
          research_variable: string
          construct: string
          options: Json | null
          scale: Json | null
          validation_rules: Json
          source: string
          reliability: number | null
          tags: string[]
          category: string | null
          subcategory: string | null
          is_active: boolean
          version: number
          parent_question_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          text: string
          text_vi?: string | null
          type: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean' | 'rating' | 'ranking'
          theoretical_model: string
          research_variable: string
          construct: string
          options?: Json | null
          scale?: Json | null
          validation_rules?: Json
          source: string
          reliability?: number | null
          tags?: string[]
          category?: string | null
          subcategory?: string | null
          is_active?: boolean
          version?: number
          parent_question_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          text?: string
          text_vi?: string | null
          type?: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean' | 'rating' | 'ranking'
          theoretical_model?: string
          research_variable?: string
          construct?: string
          options?: Json | null
          scale?: Json | null
          validation_rules?: Json
          source?: string
          reliability?: number | null
          tags?: string[]
          category?: string | null
          subcategory?: string | null
          is_active?: boolean
          version?: number
          parent_question_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      progress_tracking: {
        Row: {
          id: string
          project_id: string
          milestone_name: string
          milestone_description: string | null
          milestone_type: 'research_planning' | 'theoretical_framework' | 'survey_design' | 'data_collection' | 'data_analysis' | 'writing' | 'review' | 'submission' | 'publication'
          milestone_status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          progress_percentage: number
          estimated_hours: number | null
          actual_hours: number | null
          planned_start_date: string | null
          actual_start_date: string | null
          planned_completion_date: string | null
          actual_completion_date: string | null
          order_index: number
          depends_on: string[]
          notes: string | null
          attachments: Json
          milestone_data: Json
          created_at: string
          updated_at: string
          created_by: string | null
          completed_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          milestone_name: string
          milestone_description?: string | null
          milestone_type: 'research_planning' | 'theoretical_framework' | 'survey_design' | 'data_collection' | 'data_analysis' | 'writing' | 'review' | 'submission' | 'publication'
          milestone_status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          progress_percentage?: number
          estimated_hours?: number | null
          actual_hours?: number | null
          planned_start_date?: string | null
          actual_start_date?: string | null
          planned_completion_date?: string | null
          actual_completion_date?: string | null
          order_index?: number
          depends_on?: string[]
          notes?: string | null
          attachments?: Json
          milestone_data?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          completed_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          milestone_name?: string
          milestone_description?: string | null
          milestone_type?: 'research_planning' | 'theoretical_framework' | 'survey_design' | 'data_collection' | 'data_analysis' | 'writing' | 'review' | 'submission' | 'publication'
          milestone_status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          progress_percentage?: number
          estimated_hours?: number | null
          actual_hours?: number | null
          planned_start_date?: string | null
          actual_start_date?: string | null
          planned_completion_date?: string | null
          actual_completion_date?: string | null
          order_index?: number
          depends_on?: string[]
          notes?: string | null
          attachments?: Json
          milestone_data?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
          completed_by?: string | null
        }
      }
      timeline_events: {
        Row: {
          id: string
          project_id: string
          milestone_id: string | null
          event_type: string
          event_description: string
          event_data: Json
          event_timestamp: string
          user_id: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          project_id: string
          milestone_id?: string | null
          event_type: string
          event_description: string
          event_data?: Json
          event_timestamp?: string
          user_id?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          project_id?: string
          milestone_id?: string | null
          event_type?: string
          event_description?: string
          event_data?: Json
          event_timestamp?: string
          user_id?: string | null
          metadata?: Json
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
      project_stage: 'idea_complete' | 'theoretical_framework_complete' | 'survey_complete' | 'data_collection_complete' | 'analysis_complete' | 'draft_complete' | 'citation_complete' | 'format_complete' | 'plagiarism_check_complete' | 'submitted' | 'published'
      data_collection_method: 'internal_survey' | 'external_data'
      data_collection_status: 'not_started' | 'active' | 'completed'
      submission_status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
      question_type: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean' | 'rating' | 'ranking'
      milestone_type: 'research_planning' | 'theoretical_framework' | 'survey_design' | 'data_collection' | 'data_analysis' | 'writing' | 'review' | 'submission' | 'publication'
      milestone_status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
    }
  }
}