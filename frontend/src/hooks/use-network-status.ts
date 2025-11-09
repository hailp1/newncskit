import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastChecked: Date | null;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true, // Default to true to prevent hydration issues
    isConnected: true,
    lastChecked: null,
  });

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    // Set initial online status after mounting to prevent hydration issues
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      lastChecked: new Date(),
    }));

    const updateOnlineStatus = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        lastChecked: new Date(),
      }));
    };

    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('/api/health/simple', {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        setNetworkStatus(prev => ({
          ...prev,
          isConnected: response.ok,
          lastChecked: new Date(),
        }));
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false,
          lastChecked: new Date(),
        }));
      }
    };

    // Listen to online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check connectivity periodically
    const connectivityInterval = setInterval(checkConnectivity, 60000); // Check every 60 seconds

    // Initial connectivity check
    checkConnectivity();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(connectivityInterval);
    };
  }, []);

  return networkStatus;
}

// Hook for retry logic with exponential backoff
export function useRetry() {
  const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  };

  return { retry };
}