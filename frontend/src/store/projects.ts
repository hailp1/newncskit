import { create } from 'zustand'
import { projectsService } from '@/services/projects'
import { useAuthStore } from '@/store/auth'
import type { Project, ProjectCreation, ProjectSummary } from '@/types'

interface ProjectState {
  projects: ProjectSummary[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
}

interface ProjectActions {
  fetchProjects: () => Promise<void>
  createProject: (projectData: ProjectCreation) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  clearError: () => void
}

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => ({
  // State
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Actions
  fetchProjects: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const projects = await projectsService.getUserProjects(user.id)
      set({ projects, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false,
      })
    }
  },

  createProject: async (projectData: ProjectCreation) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const newProject = await projectsService.createProject(user.id, projectData)
      
      // Add activity
      await projectsService.addActivity(
        user.id,
        newProject.id.toString(),
        'collaboration',
        `Created new project: ${newProject.title}`
      )

      // Refresh projects list
      const projects = await projectsService.getUserProjects(user.id)
      set({ projects, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false,
      })
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const updatedProject = await projectsService.updateProject(id, updates)
      const { projects, currentProject } = get()
      
      // Update projects list
      const updatedProjects = projects.map(p => 
        p.id === id 
          ? { ...p, title: updatedProject.title, phase: updatedProject.phase, progress: (updatedProject as any).progress || (p as any).progress }
          : p
      )
      
      set({
        projects: updatedProjects,
        currentProject: currentProject?.id === id ? updatedProject as any : currentProject,
        isLoading: false,
      })

      // Add activity
      await projectsService.addActivity(
        user.id,
        id,
        'collaboration',
        `Updated project: ${updatedProject.title}`
      )
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false,
      })
    }
  },

  deleteProject: async (id: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      await projectsService.deleteProject(id)
      const { projects, currentProject } = get()
      
      set({
        projects: projects.filter(p => p.id !== id),
        currentProject: currentProject?.id === id ? null : currentProject,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false,
      })
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project })
  },

  clearError: () => {
    set({ error: null })
  },
}))