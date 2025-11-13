/**
 * Workflow Logger Service Tests
 * 
 * Tests for the workflow logging functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { workflowLogger } from '../workflow-logger.service';

describe('WorkflowLoggerService', () => {
  beforeEach(() => {
    // Clear any existing session
    const session = workflowLogger.getSession();
    if (session) {
      workflowLogger.endSession(true);
    }
    
    // Spy on console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Management', () => {
    it('should start a new session', () => {
      const sessionId = workflowLogger.startSession('upload');
      
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^session-\d+-[a-z0-9]+$/);
      
      const session = workflowLogger.getSession();
      expect(session).not.toBeNull();
      expect(session?.sessionId).toBe(sessionId);
      expect(session?.currentStep).toBe('upload');
    });

    it('should end a session', () => {
      workflowLogger.startSession('upload');
      workflowLogger.endSession(true, { reason: 'test' });
      
      const session = workflowLogger.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Step Transition Logging', () => {
    it('should log step transitions', () => {
      workflowLogger.startSession('upload');
      
      workflowLogger.logStepTransition('upload', 'health', {
        projectId: 'test-123',
      });
      
      const session = workflowLogger.getSession();
      expect(session?.steps).toHaveLength(1);
      expect(session?.steps[0].fromStep).toBe('upload');
      expect(session?.steps[0].toStep).toBe('health');
      expect(session?.steps[0].metadata?.projectId).toBe('test-123');
      expect(session?.currentStep).toBe('health');
    });

    it('should calculate step duration', () => {
      workflowLogger.startSession('upload');
      
      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait
      }
      
      workflowLogger.logStepTransition('upload', 'health');
      
      const session = workflowLogger.getSession();
      expect(session?.steps[0].duration).toBeGreaterThan(0);
    });
  });

  describe('API Call Logging', () => {
    it('should log API call start', () => {
      workflowLogger.startSession('upload');
      
      const correlationId = workflowLogger.generateCorrelationId('test');
      workflowLogger.logAPICallStart('api/test', 'POST', correlationId, {
        projectId: 'test-123',
      });
      
      expect(console.log).toHaveBeenCalledWith(
        '[API Call] Started',
        expect.objectContaining({
          endpoint: 'api/test',
          method: 'POST',
          correlationId,
        })
      );
    });

    it('should log API call completion', () => {
      workflowLogger.startSession('upload');
      
      const correlationId = workflowLogger.generateCorrelationId('test');
      workflowLogger.logAPICallStart('api/test', 'POST', correlationId);
      
      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait
      }
      
      workflowLogger.logAPICallComplete('api/test', 'POST', correlationId, 200, true, {
        resultCount: 5,
      });
      
      const session = workflowLogger.getSession();
      expect(session?.apiCalls).toHaveLength(1);
      expect(session?.apiCalls[0].endpoint).toBe('api/test');
      expect(session?.apiCalls[0].status).toBe(200);
      expect(session?.apiCalls[0].success).toBe(true);
      expect(session?.apiCalls[0].duration).toBeGreaterThan(0);
      expect(session?.apiCalls[0].metadata?.resultCount).toBe(5);
    });

    it('should log API call error', () => {
      workflowLogger.startSession('upload');
      
      const correlationId = workflowLogger.generateCorrelationId('test');
      workflowLogger.logAPICallStart('api/test', 'POST', correlationId);
      
      const error = new Error('Test error');
      workflowLogger.logAPICallError('api/test', 'POST', correlationId, error, {
        status: 500,
      });
      
      const session = workflowLogger.getSession();
      expect(session?.apiCalls).toHaveLength(1);
      expect(session?.apiCalls[0].success).toBe(false);
      expect(session?.apiCalls[0].error).toBe('Test error');
      expect(session?.errors).toHaveLength(1);
    });

    it('should generate unique correlation IDs', () => {
      const id1 = workflowLogger.generateCorrelationId('test');
      const id2 = workflowLogger.generateCorrelationId('test');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with full details', () => {
      workflowLogger.startSession('upload');
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.ts:10:20';
      
      workflowLogger.logError(error, 'Test context', 'corr-123', {
        additionalInfo: 'test',
      });
      
      const session = workflowLogger.getSession();
      expect(session?.errors).toHaveLength(1);
      expect(session?.errors[0].message).toBe('Test error');
      expect(session?.errors[0].stack).toBe(error.stack);
      expect(session?.errors[0].context).toBe('Test context');
      expect(session?.errors[0].correlationId).toBe('corr-123');
      expect(session?.errors[0].metadata?.additionalInfo).toBe('test');
    });
  });

  describe('Workflow Summary', () => {
    it('should generate comprehensive summary on session end', () => {
      workflowLogger.startSession('upload');
      
      // Log some steps
      workflowLogger.logStepTransition('upload', 'health');
      workflowLogger.logStepTransition('health', 'group');
      
      // Log some API calls
      const correlationId1 = workflowLogger.generateCorrelationId('test1');
      workflowLogger.logAPICallStart('api/test1', 'POST', correlationId1);
      workflowLogger.logAPICallComplete('api/test1', 'POST', correlationId1, 200, true);
      
      const correlationId2 = workflowLogger.generateCorrelationId('test2');
      workflowLogger.logAPICallStart('api/test2', 'POST', correlationId2);
      workflowLogger.logAPICallError('api/test2', 'POST', correlationId2, new Error('Test error'));
      
      // End session
      workflowLogger.endSession(true, { reason: 'test' });
      
      // Verify summary was logged
      expect(console.log).toHaveBeenCalledWith(
        '[Workflow Summary]',
        expect.objectContaining({
          steps: expect.objectContaining({
            total: 2,
            list: expect.any(Array),
          }),
          apiCalls: expect.objectContaining({
            total: 2,
            successful: 1,
            failed: 1,
          }),
          errors: expect.objectContaining({
            total: 1,
          }),
        })
      );
    });
  });

  describe('Enable/Disable Logging', () => {
    it('should allow disabling logging', () => {
      workflowLogger.setEnabled(false);
      expect(workflowLogger.isLoggingEnabled()).toBe(false);
      
      workflowLogger.startSession('upload');
      
      // Console should not be called when disabled
      const logCallCount = vi.mocked(console.log).mock.calls.length;
      
      workflowLogger.logStepTransition('upload', 'health');
      
      expect(vi.mocked(console.log).mock.calls.length).toBe(logCallCount);
      
      // Re-enable for other tests
      workflowLogger.setEnabled(true);
    });

    it('should allow re-enabling logging', () => {
      workflowLogger.setEnabled(false);
      workflowLogger.setEnabled(true);
      
      expect(workflowLogger.isLoggingEnabled()).toBe(true);
    });
  });
});
