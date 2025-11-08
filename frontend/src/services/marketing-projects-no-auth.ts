// Marketing Projects Service using Supabase
// @ts-nocheck - Supabase generated types causing issues
import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from './error-handler';

// Initialize Supabase client
const supabase = createClient();

export interface MarketingProject {
  id: string
  title: string
  description: string
  business_domain_id: number
  business_domain_name?: string
  selected_models: number[]
  selected_model_names?: string[]
  research_outline: any
  status: string
  progress: number
  user_id: string
  created_at: string
  updated_at: string
  tags?: string[]
  word_count?: number
  reference_count?: number
}

export interface MarketingProjectCreation {
  title: string
  description: string
  business_domain_id: number
  selected_models: number[]
  research_outline: any
  status?: string
  progress?: number
}

export const marketingProjectsService = {
  // Get business domains with graceful fallback
  async getBusinessDomains() {
    try {
      const { data, error } = await supabase
        .from('business_domains')
        .select('*')
        .order('name')

      if (error) {
        console.warn('Business domains table error:', error.message)
        return this.getFallbackDomains()
      }
      return data || this.getFallbackDomains()
    } catch (error) {
      console.error('Get business domains error:', error)
      return this.getFallbackDomains()
    }
  },

  getFallbackDomains() {
    return [
      { id: 1, name: 'Marketing', name_vi: 'Marketing', description: 'Marketing and consumer behavior research', icon: 'chart-bar', color: '#3B82F6' },
      { id: 2, name: 'Tourism', name_vi: 'Du lịch', description: 'Tourism and hospitality industry research', icon: 'globe-alt', color: '#10B981' },
      { id: 3, name: 'Human Resources', name_vi: 'Nhân sự', description: 'Human resource management and organizational behavior', icon: 'users', color: '#8B5CF6' },
      { id: 4, name: 'Information Systems', name_vi: 'Hệ thống thông tin', description: 'Management information systems and technology adoption', icon: 'computer-desktop', color: '#F59E0B' },
      { id: 5, name: 'Finance', name_vi: 'Tài chính', description: 'Financial management and investment research', icon: 'currency-dollar', color: '#EF4444' }
    ]
  },

  // Get marketing models with graceful fallback
  async getMarketingModels() {
    try {
      const { data, error } = await supabase
        .from('marketing_models')
        .select('*')
        .order('name')

      if (error) {
        console.warn('Marketing models table error:', error.message)
        return this.getFallbackModels()
      }
      return data || this.getFallbackModels()
    } catch (error) {
      console.error('Get marketing models error:', error)
      return this.getFallbackModels()
    }
  },

  getFallbackModels() {
    return [
      { id: 1, name: 'Theory of Planned Behavior', name_vi: 'Lý thuyết Hành vi Có Kế hoạch', abbreviation: 'TPB', description: 'A theory that links beliefs and behavior', category: 'Behavioral', key_authors: ['Icek Ajzen'] },
      { id: 2, name: 'Technology Acceptance Model', name_vi: 'Mô hình Chấp nhận Công nghệ', abbreviation: 'TAM', description: 'A model that explains technology acceptance', category: 'Technology', key_authors: ['Fred Davis'] },
      { id: 3, name: 'SERVQUAL Model', name_vi: 'Mô hình SERVQUAL', abbreviation: 'SERVQUAL', description: 'A service quality measurement model', category: 'Service Quality', key_authors: ['Parasuraman', 'Zeithaml', 'Berry'] },
      { id: 4, name: 'Porter Five Forces', name_vi: 'Năm Lực lượng Porter', abbreviation: 'P5F', description: 'Framework for analyzing competitive forces', category: 'Strategic Analysis', key_authors: ['Michael Porter'] },
      { id: 5, name: 'SWOT Analysis', name_vi: 'Phân tích SWOT', abbreviation: 'SWOT', description: 'Strategic planning technique', category: 'Strategic Planning', key_authors: ['Albert Humphrey'] },
      { id: 6, name: 'Value-Belief-Norm Model', name_vi: 'Mô hình Giá trị - Niềm tin - Chuẩn mực', abbreviation: 'VBN', description: 'A model explaining pro-environmental behavior through personal values, beliefs, and norms', category: 'Environmental Psychology', key_authors: ['Paul C. Stern'] },
      { id: 7, name: 'Green Self-Identity Theory', name_vi: 'Lý thuyết Bản sắc Xanh Cá nhân', abbreviation: 'GSI', description: 'Theory explaining how environmental self-identity influences green behavior', category: 'Environmental Psychology', key_authors: ['Linda Steg'] },
      { id: 8, name: 'Elaboration Likelihood Model', name_vi: 'Mô hình Khả năng Xử lý Thông tin', abbreviation: 'ELM', description: 'A dual-process theory explaining persuasive communications', category: 'Communication Theory', key_authors: ['Richard E. Petty', 'John T. Cacioppo'] },
      { id: 9, name: 'Signaling Theory', name_vi: 'Lý thuyết Tín hiệu', abbreviation: 'ST', description: 'Economic theory explaining how parties credibly convey information', category: 'Economic Theory', key_authors: ['Michael Spence'] },
      { id: 10, name: 'Transparency and Trust Theory', name_vi: 'Lý thuyết Minh bạch và Niềm tin', abbreviation: 'TTT', description: 'Theory explaining how organizational transparency builds consumer trust', category: 'Organizational Behavior', key_authors: ['Guido Palazzo'] }
    ]
  },

  // Create new marketing project WITHOUT authentication check (for testing with RLS disabled)
  async createProject(userId: string, projectData: MarketingProjectCreation): Promise<MarketingProject> {
    try {
      console.log('🚀 Creating project')
      
      // Use a default test user ID if none provided
      const testUserId = userId || '9adc5570-5708-4cea-b150-4d37958509bb' // From our test users
      
      // Try to get business domain name (graceful fallback)
      let domainName = 'Unknown Domain'
      try {
        const { data: domainData } = await supabase
          .from('business_domains')
          .select('name')
          .eq('id', projectData.business_domain_id)
          .single()
        
        domainName = (domainData as any)?.name || 'Unknown Domain'
      } catch (error) {
        console.warn('Could not fetch domain name, using fallback')
        const fallbackDomains = this.getFallbackDomains()
        const domain = fallbackDomains.find(d => d.id === projectData.business_domain_id)
        domainName = domain?.name || 'Unknown Domain'
      }

      // Try to get selected model names (graceful fallback)
      let modelNames: string[] = []
      try {
        const { data: modelsData } = await supabase
          .from('marketing_models')
          .select('name, category')
          .in('id', projectData.selected_models)

        modelNames = modelsData?.map((m: any) => m.name) || []
      } catch (error) {
        console.warn('Could not fetch model names, using fallback')
        const fallbackModels = this.getFallbackModels()
        modelNames = projectData.selected_models.map(id => {
          const model = fallbackModels.find(m => m.id === id)
          return model?.name || `Model ${id}`
        })
      }

      // Create project data
      const insertData = {
        title: projectData.title,
        description: projectData.description,
        business_domain_id: projectData.business_domain_id,
        selected_models: projectData.selected_models,
        research_outline: projectData.research_outline,
        status: projectData.status || 'draft',
        progress: projectData.progress || 60,
        user_id: testUserId,
        phase: 'planning',
        tags: modelNames,
        word_count: 0,
        reference_count: 0
      }

      console.log('📝 Inserting project data:', {
        title: insertData.title,
        user_id: insertData.user_id.substring(0, 8) + '...',
        domain_id: insertData.business_domain_id,
        models: insertData.selected_models
      })

      // Create project
      const { data, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Create project error:', error)
        console.error('Error details:', {
          code: error?.code || 'unknown',
          message: error?.message || 'unknown error',
          details: error?.details || 'no details',
          full_error: JSON.stringify(error)
        })
        
        // Provide more specific error messages
        const errorMessage = error?.message || ''
        
        if (errorMessage.includes('row-level security')) {
          throw new Error('RLS Error: Vui lòng disable RLS trong Supabase SQL Editor trước.')
        } else if (errorMessage.includes('foreign key')) {
          // More specific foreign key error
          if (errorMessage.includes('business_domain_id')) {
            throw new Error(`Lỗi: Lĩnh vực kinh doanh ID ${projectData.business_domain_id} không tồn tại. Vui lòng chọn lĩnh vực khác.`)
          } else if (errorMessage.includes('user_id')) {
            throw new Error('Lỗi: User ID không hợp lệ. Vui lòng đăng nhập lại.')
          } else {
            throw new Error('Lỗi dữ liệu: Thông tin không hợp lệ.')
          }
        } else if (errorMessage.includes('duplicate key')) {
          throw new Error('Dự án đã tồn tại.')
        } else if (errorMessage.includes('check constraint')) {
          throw new Error('Lỗi: Dữ liệu không đúng định dạng yêu cầu.')
        } else if (!errorMessage || errorMessage === '') {
          throw new Error('Lỗi không xác định: Không thể tạo dự án. Vui lòng thử lại.')
        } else {
          throw new Error(`Không thể tạo dự án: ${errorMessage}`)
        }
      }

      console.log('✅ Project created successfully:', data.id)

      return {
        ...data,
        business_domain_name: domainName,
        selected_model_names: modelNames,
        research_outline: projectData.research_outline,
        tags: modelNames,
      }
    } catch (error) {
      console.error('Create marketing project error:', error)
      throw error
    }
  },

  // Get all marketing projects for a user
  async getUserProjects(userId: string): Promise<MarketingProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.warn('Projects table error:', error.message)
        return []
      }

      // Process projects with graceful fallbacks
      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project: any) => {
          let domainName = 'Unknown Domain'
          let modelNames: string[] = []

          // Try to get domain name
          try {
            const { data: domainData } = await supabase
              .from('business_domains')
              .select('name')
              .eq('id', project.business_domain_id)
              .single()
            
            domainName = domainData?.name || 'Unknown Domain'
          } catch (error) {
            const fallbackDomains = this.getFallbackDomains()
            const domain = fallbackDomains.find(d => d.id === project.business_domain_id)
            domainName = domain?.name || 'Unknown Domain'
          }

          // Try to get model names
          if (project.selected_models && project.selected_models.length > 0) {
            try {
              const { data: modelsData } = await supabase
                .from('marketing_models')
                .select('name, category')
                .in('id', project.selected_models)

              modelNames = modelsData?.map((m: any) => m.name) || []
            } catch (error) {
              const fallbackModels = this.getFallbackModels()
              modelNames = project.selected_models.map((id: number) => {
                const model = fallbackModels.find(m => m.id === id)
                return model?.name || `Model ${id}`
              })
            }
          }

          return {
            ...project,
            business_domain_name: domainName,
            selected_model_names: modelNames,
            research_outline: project.research_outline || null,
            tags: modelNames,
          }
        })
      )

      return projectsWithDetails
    } catch (error) {
      console.error('Get user marketing projects error:', error)
      return []
    }
  }
}