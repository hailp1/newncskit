import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class ApiClient {
  private client: AxiosInstance;
  private config: APIClientConfig;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    // Use backend URL for API calls, fallback to localhost for development
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                      process.env.BACKEND_API_URL || 
                      'http://localhost:8001';
    
    this.config = {
      baseURL: backendURL,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle network errors with retry
        if (this.isNetworkError(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          if (originalRequest._retryCount <= this.config.retryAttempts) {
            await this.delay(this.config.retryDelay * originalRequest._retryCount);
            return this.client(originalRequest);
          }
        }
        
        // Handle specific error types
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        } else if (error.response?.status >= 500) {
          console.error('Server error:', error.response.status, error.response.data);
        } else if (this.isNetworkError(error)) {
          console.error('Network error:', error.message);
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    // In a real app, this would get the token from localStorage, cookies, or state management
    return localStorage.getItem('auth_token');
  }

  private handleUnauthorized(): void {
    // Clear auth data and redirect to login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('auth-storage');
    
    // Only redirect if not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }

  private isNetworkError(error: any): boolean {
    return !error.response && (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message.includes('Network Error') ||
      error.message.includes('timeout')
    );
  }

  private formatError(error: any): any {
    if (this.isNetworkError(error)) {
      return {
        type: 'network',
        message: 'Unable to connect to server. Please check your internet connection.',
        retryable: true,
        originalError: error
      };
    }
    
    if (error.response) {
      return {
        type: 'server',
        message: error.response.data?.error || error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        retryable: error.response.status >= 500,
        originalError: error
      };
    }
    
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      retryable: false,
      originalError: error
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(url: string, config?: AxiosRequestConfig): string {
    return `${url}:${JSON.stringify(config?.params || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean old cache entries (keep max 100 items)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig & { skipCache?: boolean }): Promise<AxiosResponse<T>> {
    try {
      // Check cache for GET requests (unless skipCache is true)
      if (!config?.skipCache) {
        const cacheKey = this.getCacheKey(url, config);
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          return { data: cachedData, status: 200, statusText: 'OK (cached)', headers: {}, config: {} as any };
        }
      }

      const response = await this.client.get<T>(url, config);
      
      // Cache successful GET responses
      if (!config?.skipCache && response.status === 200) {
        const cacheKey = this.getCacheKey(url, config);
        this.setCache(cacheKey, response.data);
      }
      
      return response;
    } catch (error) {
      console.error('GET request failed:', url, error);
      throw error;
    }
  }

  // Clear cache for specific URL or all cache
  clearCache(url?: string): void {
    if (url) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(url));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post<T>(url, data, config);
    } catch (error) {
      console.error('POST request failed:', url, error);
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put<T>(url, data, config);
    } catch (error) {
      console.error('PUT request failed:', url, error);
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.patch<T>(url, data, config);
    } catch (error) {
      console.error('PATCH request failed:', url, error);
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete<T>(url, config);
    } catch (error) {
      console.error('DELETE request failed:', url, error);
      throw error;
    }
  }

  // Utility method to get current configuration
  getConfig(): APIClientConfig {
    return { ...this.config };
  }

  // Method to check if backend is reachable
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();