import { create } from 'zustand';
import { WorkflowStep, WorkflowState } from '@/types/workflow';

// Type for step change listener callback
type StepChangeListener = (step: WorkflowStep) => void;

interface WorkflowStore extends WorkflowState {
  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  markStepComplete: (step: WorkflowStep) => void;
  setProjectId: (id: string) => void;
  markDirty: () => void;
  markClean: () => void;
  updateLastSaved: () => void;
  reset: () => void;
  
  // New helper methods for step navigation
  navigateToStep: (step: WorkflowStep) => void;
  completeCurrentAndNavigate: () => void;
  
  // Event listeners for step changes
  onStepChange: (callback: StepChangeListener) => () => void;
  
  // Computed
  getProgress: () => number;
  canNavigateTo: (step: WorkflowStep) => boolean;
  
  // Internal state for listeners
  stepChangeListeners: Set<StepChangeListener>;
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

const initialStoreState = {
  ...initialState,
  stepChangeListeners: new Set<StepChangeListener>(),
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialStoreState,

  setCurrentStep: (step: WorkflowStep) => {
    set({ currentStep: step });
    // Emit step change event to all listeners
    const { stepChangeListeners } = get();
    stepChangeListeners.forEach(listener => listener(step));
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
    set({ ...initialState, stepChangeListeners: new Set() });
  },

  // New helper method: Navigate to step with validation
  navigateToStep: (step: WorkflowStep) => {
    const { canNavigateTo, setCurrentStep } = get();
    
    if (canNavigateTo(step)) {
      setCurrentStep(step);
    } else {
      console.warn(`Cannot navigate to step "${step}". Complete previous steps first.`);
    }
  },

  // New helper method: Complete current step and move to next
  completeCurrentAndNavigate: () => {
    const { currentStep, markStepComplete, setCurrentStep } = get();
    
    // Mark current step as complete
    markStepComplete(currentStep);
    
    // Find next step
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1];
      setCurrentStep(nextStep);
    }
  },

  // New event listener system
  onStepChange: (callback: StepChangeListener) => {
    const { stepChangeListeners } = get();
    stepChangeListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      const { stepChangeListeners } = get();
      stepChangeListeners.delete(callback);
    };
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
