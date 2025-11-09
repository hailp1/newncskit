/**
 * Integration Test: Data Analysis Workflow
 * 
 * Tests that auto-detection triggers correctly when navigating through workflow steps
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/stores/workflowStore';

describe('Workflow Store Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useWorkflowStore.getState().reset();
  });

  it('should initialize with upload step', () => {
    const store = useWorkflowStore.getState();
    
    expect(store.currentStep).toBe('upload');
    expect(store.completedSteps).toEqual([]);
    expect(store.getProgress()).toBe(0);
  });

  it('should navigate to next step using completeCurrentAndNavigate', () => {
    const store = useWorkflowStore.getState();
    
    store.completeCurrentAndNavigate();
    
    expect(store.currentStep).toBe('health-check');
    expect(store.completedSteps).toContain('upload');
  });

  it('should navigate to grouping step after health-check', () => {
    const store = useWorkflowStore.getState();
    
    // Complete upload
    store.completeCurrentAndNavigate();
    
    // Complete health-check
    store.completeCurrentAndNavigate();
    
    expect(store.currentStep).toBe('grouping');
    expect(store.completedSteps).toContain('upload');
    expect(store.completedSteps).toContain('health-check');
  });

  it('should navigate to demographic step after grouping', () => {
    const store = useWorkflowStore.getState();
    
    // Navigate through steps
    store.completeCurrentAndNavigate(); // upload -> health-check
    store.completeCurrentAndNavigate(); // health-check -> grouping
    store.completeCurrentAndNavigate(); // grouping -> demographic
    
    expect(store.currentStep).toBe('demographic');
    expect(store.completedSteps).toContain('grouping');
  });

  it('should emit step change events', () => {
    const store = useWorkflowStore.getState();
    const stepChanges: string[] = [];
    
    // Subscribe to step changes
    const unsubscribe = store.onStepChange((step) => {
      stepChanges.push(step);
    });
    
    // Navigate through steps
    store.setCurrentStep('health-check');
    store.setCurrentStep('grouping');
    store.setCurrentStep('demographic');
    
    expect(stepChanges).toEqual(['health-check', 'grouping', 'demographic']);
    
    // Cleanup
    unsubscribe();
  });

  it('should prevent navigation to steps without completing previous', () => {
    const store = useWorkflowStore.getState();
    
    // Try to navigate to demographic without completing previous steps
    store.navigateToStep('demographic');
    
    // Should still be on upload
    expect(store.currentStep).toBe('upload');
  });

  it('should allow navigation to completed steps', () => {
    const store = useWorkflowStore.getState();
    
    // Complete several steps
    store.completeCurrentAndNavigate(); // upload -> health-check
    store.completeCurrentAndNavigate(); // health-check -> grouping
    store.completeCurrentAndNavigate(); // grouping -> demographic
    
    // Navigate back to grouping
    store.navigateToStep('grouping');
    
    expect(store.currentStep).toBe('grouping');
  });

  it('should calculate progress correctly', () => {
    const store = useWorkflowStore.getState();
    
    expect(store.getProgress()).toBe(0);
    
    store.markStepComplete('upload');
    
    // 1 out of 7 steps = ~14%
    expect(store.getProgress()).toBe(14);
    
    store.markStepComplete('health-check');
    store.markStepComplete('grouping');
    
    // 3 out of 7 steps = ~43%
    expect(store.getProgress()).toBe(43);
  });

  it('should handle multiple listeners', () => {
    const store = useWorkflowStore.getState();
    const listener1Changes: string[] = [];
    const listener2Changes: string[] = [];
    
    // Subscribe multiple listeners
    const unsubscribe1 = store.onStepChange((step) => {
      listener1Changes.push(step);
    });
    
    const unsubscribe2 = store.onStepChange((step) => {
      listener2Changes.push(step);
    });
    
    // Navigate
    store.setCurrentStep('grouping');
    
    // Both listeners should receive the event
    expect(listener1Changes).toEqual(['grouping']);
    expect(listener2Changes).toEqual(['grouping']);
    
    // Cleanup
    unsubscribe1();
    unsubscribe2();
  });

  it('should unsubscribe listeners correctly', () => {
    const store = useWorkflowStore.getState();
    const stepChanges: string[] = [];
    
    // Subscribe
    const unsubscribe = store.onStepChange((step) => {
      stepChanges.push(step);
    });
    
    // Navigate
    store.setCurrentStep('grouping');
    
    expect(stepChanges).toEqual(['grouping']);
    
    // Unsubscribe
    unsubscribe();
    
    // Navigate again - should not trigger listener
    store.setCurrentStep('demographic');
    
    // Should still only have 'grouping'
    expect(stepChanges).toEqual(['grouping']);
  });
});
