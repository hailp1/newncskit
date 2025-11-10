import { act } from 'react-dom/test-utils';
import { useAnalysisWorkflowStore, WorkflowStep } from './workflow-store';

describe('Analysis Workflow Store', () => {
  beforeEach(() => {
    useAnalysisWorkflowStore.getState().reset();
  });

  it('initializes with default state', () => {
    const state = useAnalysisWorkflowStore.getState();
    expect(state.currentStep).toBe('upload');
    expect(state.projectId).toBeNull();
    expect(state.variables).toHaveLength(0);
  });

  it('updates project context on upload', () => {
    act(() => {
      useAnalysisWorkflowStore
        .getState()
        .setProjectContext({ projectId: 'proj-1', healthReport: null, headers: ['col1'], preview: [] });
    });

    const state = useAnalysisWorkflowStore.getState();
    expect(state.projectId).toBe('proj-1');
    expect(state.uploadedHeaders).toEqual(['col1']);
  });

  it('advances workflow step correctly', () => {
    act(() => {
      useAnalysisWorkflowStore.getState().setStep('health');
    });

    const state = useAnalysisWorkflowStore.getState();
    expect(state.currentStep).toBe<WorkflowStep>('health');
  });
});

