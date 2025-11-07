/**
 * Supabase Service Layer
 * Centralized service for all Supabase database operations
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

type Dataset = Database['public']['Tables']['datasets']['Row']
type DatasetInsert = Database['public']['Tables']['datasets']['Insert']
type DatasetUpdate = Database['public']['Tables']['datasets']['Update']

export class SupabaseService {
  private supabase = createClient()

  // ============================================
  // Profile Operations
  // ============================================

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Get profile error:', error)
      return null
    }

    return data
  }

  async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Create profile error:', error)
      throw error
    }

    return data
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update profile error:', error)
      throw error
    }

    return data
  }

  // ============================================
  // Project Operations
  // ============================================

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Get projects error:', error)
      return []
    }

    return data || []
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Get project error:', error)
      return null
    }

    return data
  }

  async createProject(project: ProjectInsert): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      console.error('Create project error:', error)
      throw error
    }

    return data
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Update project error:', error)
      throw error
    }

    return data
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Delete project error:', error)
      throw error
    }

    return true
  }

  async getProjectCount(userId: string): Promise<number> {
    const { data } = await this.supabase
      .rpc('get_user_project_count', { user_uuid: userId })

    return data || 0
  }

  // ============================================
  // Dataset Operations
  // ============================================

  async getDatasets(projectId: string): Promise<Dataset[]> {
    const { data, error } = await this.supabase
      .from('datasets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get datasets error:', error)
      return []
    }

    return data || []
  }

  async getDataset(datasetId: string): Promise<Dataset | null> {
    const { data, error } = await this.supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (error) {
      console.error('Get dataset error:', error)
      return null
    }

    return data
  }

  async createDataset(dataset: DatasetInsert): Promise<Dataset | null> {
    const { data, error } = await this.supabase
      .from('datasets')
      .insert(dataset)
      .select()
      .single()

    if (error) {
      console.error('Create dataset error:', error)
      throw error
    }

    return data
  }

  async updateDataset(datasetId: string, updates: DatasetUpdate): Promise<Dataset | null> {
    const { data, error } = await this.supabase
      .from('datasets')
      .update(updates)
      .eq('id', datasetId)
      .select()
      .single()

    if (error) {
      console.error('Update dataset error:', error)
      throw error
    }

    return data
  }

  async deleteDataset(datasetId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('datasets')
      .delete()
      .eq('id', datasetId)

    if (error) {
      console.error('Delete dataset error:', error)
      throw error
    }

    return true
  }

  async getDatasetCount(projectId: string): Promise<number> {
    const { data } = await this.supabase
      .rpc('get_project_dataset_count', { project_uuid: projectId })

    return data || 0
  }

  // ============================================
  // Analytics Cache Operations
  // ============================================

  async getCachedAnalytics(requestHash: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('analytics_cache')
      .select('response_data')
      .eq('request_hash', requestHash)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error) {
      return null
    }

    return data?.response_data
  }

  async cacheAnalytics(
    requestHash: string,
    action: string,
    requestData: any,
    responseData: any,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

    const { error } = await this.supabase
      .from('analytics_cache')
      .insert({
        request_hash: requestHash,
        action,
        request_data: requestData,
        response_data: responseData,
        expires_at: expiresAt,
      })

    if (error) {
      console.error('Cache analytics error:', error)
      return false
    }

    return true
  }

  async cleanupExpiredCache(): Promise<boolean> {
    const { error } = await this.supabase.rpc('cleanup_expired_cache')

    if (error) {
      console.error('Cleanup cache error:', error)
      return false
    }

    return true
  }

  // ============================================
  // Storage Operations
  // ============================================

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Upload avatar error:', error)
      throw error
    }

    const { data } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async uploadDataset(userId: string, projectId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${projectId}/${Date.now()}.${fileExt}`

    const { error } = await this.supabase.storage
      .from('datasets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload dataset error:', error)
      throw error
    }

    const { data } = this.supabase.storage
      .from('datasets')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete file error:', error)
      throw error
    }

    return true
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()
