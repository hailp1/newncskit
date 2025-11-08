import { create } from 'zustand';
import { WorkflowStep, WorkflowState } from '@/types/workflow';

interface WorkflowStore extends WorkflowState {
  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  markStepComplete: (step: WorkflowStep) => void;
  setProjectId: (id: string) => void;
  markDirty: () => void;
  markClean: () => void;
  updateLastSaved: () => void;
  reset: () => void;
  
  // Computed
  getProgress: () => number;
  canNavigateTo: (step: WorkflowStep) => boolean;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  'upload',
  'health-check',
  'grouping',
  'demographic',
  'analysis-selection',
  'execution',
  'results',
];

const initialState: WorkflowState = {
  currentStep: 'upload',
  completedSteps: [],
  projectId: null,
  lastSaved: null,
  isDirty: false,
  progress: 0,
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  setCurrentStep: (step: WorkflowStep) => {
    set({ currentStep: step });
  },

  markStepComplete: (step: WorkflowStep) => {
    set((state) => {
      const completedSteps = [...state.completedSteps];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      return {
        completedSteps,
        progress: get().getProgress(),
      };
    });
  },

  setProjectId: (id: string) => {
    set({ projectId: id });
  },

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  updateLastSaved: () => {
    set({ lastSaved: new Date(), isDirty: false });
  },

  reset: () => {
    set(initialState);
  },

  getProgress: () => {
    const { completedSteps } = get();
    return Math.round((completedSteps.length / WORKFLOW_STEPS.length) * 100);
  },

  canNavigateTo: (step: WorkflowStep) => {
    const { completedSteps } = get();
    const stepIndex = WORKFLOW_STEPS.indexOf(step);
    
    // Can always go to first step
    if (stepIndex === 0) return true;
    
    // Can navigate to completed steps
    if (completedSteps.includes(step)) return true;
    
    // Can navigate to next step if previous step is complete
    const previousStep = WORKFLOW_STEPS[stepIndex - 1];
    return completedSteps.includes(previousStep);
  },
}));
