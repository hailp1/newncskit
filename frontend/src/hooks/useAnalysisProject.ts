import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AnalysisProject {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Fetch project by ID
export function useAnalysisProject(projectId: string | null) {
  return useQuery({
    queryKey: ['analysis-project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const response = await fetch(`/api/analysis/project/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json();
    },
    enabled: !!projectId,
  });
}

// Fetch analysis results
export function useAnalysisResults(projectId: string | null) {
  return useQuery({
    queryKey: ['analysis-results', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const response = await fetch(`/api/analysis/results/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      return response.json();
    },
    enabled: !!projectId,
  });
}

// Save project configuration
export function useSaveProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: string; config: any }) => {
      const response = await fetch('/api/analysis/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate project query to refetch
      queryClient.invalidateQueries({
        queryKey: ['analysis-project', variables.projectId],
      });
    },
  });
}

// Execute analysis
export function useExecuteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectId: string; analysisTypes?: string[] }) => {
      const response = await fetch('/api/analysis/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to execute analysis');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate results query
      queryClient.invalidateQueries({
        queryKey: ['analysis-results', variables.projectId],
      });
    },
  });
}
