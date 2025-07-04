import { useState, useCallback } from 'react';
import type { Toast } from '../components/common/ToastNotification';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    // Check if a toast with the same message and type already exists
    const existingToast = toasts.find(toast => 
      toast.message === message && toast.type === type
    );
    
    // If duplicate exists, return the existing toast's id without creating a new one
    if (existingToast) {
      return existingToast.id;
    }
    
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, [toasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast]);
  
  const showError = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast]);
  
  const showWarning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast]);
  
  const showInfo = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
