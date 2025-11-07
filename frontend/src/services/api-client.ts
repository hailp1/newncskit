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

  constructor() {
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

    console.log('API Client initialized with baseURL:', this.config.baseURL);

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
            console.log(`Retrying request (${originalRequest._retryCount}/${this.config.retryAttempts}):`, originalRequest.url);
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

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get<T>(url, config);
    } catch (error) {
      console.error('GET request failed:', url, error);
      throw error;
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