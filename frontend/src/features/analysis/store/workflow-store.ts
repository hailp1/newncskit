import { create } from 'zustand';
import {
  AnalysisType,
  AnalysisVariable,
  DataHealthReport,
  VariableGroup,
  VariableGroupSuggestion,
} from '@/types/analysis';

export type WorkflowStep = 'upload' | 'health' | 'group' | 'demographic' | 'analyze' | 'results';

export interface WorkflowState {
  currentStep: WorkflowStep;
  projectId: string | null;
  healthReport: DataHealthReport | null;
  uploadedHeaders: string[];
  uploadedPreview: any[];
  variables: AnalysisVariable[];
  groups: VariableGroup[];
  groupSuggestions: VariableGroupSuggestion[];
  demographics: any[];
  selectedAnalyses: { type: AnalysisType; config: any }[];
  isExistingProject: boolean;
  hasSavedGroups: boolean;
  setStep(step: WorkflowStep): void;
  setProjectContext(payload: {
    projectId: string;
    healthReport: DataHealthReport | null;
    headers?: string[];
    preview?: any[];
  }): void;
  setVariables(variables: AnalysisVariable[]): void;
  setGroups(groups: VariableGroup[]): void;
  setGroupSuggestions(suggestions: VariableGroupSuggestion[]): void;
  setDemographics(demographics: any[]): void;
  setSelectedAnalyses(analyses: { type: AnalysisType; config: any }[]): void;
  setExistingProject(flags: { isExisting: boolean; hasGroups: boolean }): void;
  reset(): void;
}

const initialState: Omit<
  WorkflowState,
  | 'setStep'
  | 'setProjectContext'
  | 'setVariables'
  | 'setGroups'
  | 'setGroupSuggestions'
  | 'setDemographics'
  | 'setSelectedAnalyses'
  | 'setExistingProject'
  | 'reset'
> = {
  currentStep: 'upload',
  projectId: null,
  healthReport: null,
  uploadedHeaders: [],
  uploadedPreview: [],
  variables: [],
  groups: [],
  groupSuggestions: [],
  demographics: [],
  selectedAnalyses: [],
  isExistingProject: false,
  hasSavedGroups: false,
};

export const useAnalysisWorkflowStore = create<WorkflowState>((set) => ({
  ...initialState,
  setStep: (step) => set({ currentStep: step }),
  setProjectContext: ({ projectId, healthReport, headers = [], preview = [] }) =>
    set({
      projectId,
      healthReport,
      uploadedHeaders: headers,
      uploadedPreview: preview,
    }),
  setVariables: (variables) => set({ variables }),
  setGroups: (groups) => set({ groups }),
  setGroupSuggestions: (groupSuggestions) => set({ groupSuggestions }),
  setDemographics: (demographics) => set({ demographics }),
  setSelectedAnalyses: (selectedAnalyses) => set({ selectedAnalyses }),
  setExistingProject: ({ isExisting, hasGroups }) =>
    set({
      isExistingProject: isExisting,
      hasSavedGroups: hasGroups,
    }),
  reset: () => set({ ...initialState }),
}));

