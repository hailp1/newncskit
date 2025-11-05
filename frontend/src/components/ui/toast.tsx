'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorToast } from './error-message';
import type { ErrorMessage } from '@/services/error-handler';

interface ToastContextType {
  showToast: (error: ErrorMessage, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface Toast extends ErrorMessage {
  id: string;
  duration?: number;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((error: ErrorMessage, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { ...error, id, duration };
    
    setToasts(prev => [...prev, toast]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration = 3000) => {
    showToast({
      title,
      message,
      type: 'info'
    }, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message: string, duration = 5000) => {
    showToast({
      title,
      message,
      type: 'error'
    }, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, duration = 4000) => {
    showToast({
      title,
      message,
      type: 'warning'
    }, duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ErrorToast
            key={toast.id}
            error={toast}
            onDismiss={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}