// src/lib/axios/base.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
}

export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  return axios.create({
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });
};

// Common interceptor setup function
export const setupInterceptors = (client: AxiosInstance, apiName: string) => {
  // Request interceptor
  client.interceptors.request.use(
    (config: any) => {
      // Add timestamp for performance tracking
      config.metadata = { startTime: new Date() };
      
      // Add auth token if available (fallback for non-httpOnly scenarios)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      

      return config;
    },
    (error) => {
      console.error(`❌ [${apiName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      // const endTime = new Date();
      // const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
      
   

      return response;
    },
    (error) => {
      const apiError = `[${apiName}] ${error.response?.status || 'Network Error'}`;
      
      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            console.error(`${apiError}: Unauthorized`);
            // Handle based on API type
            if (apiName !== 'AUTH' && typeof window !== 'undefined') {
              // Only redirect for non-auth APIs to avoid infinite loops
              window.location.href = '/login';
            }
            break;
          case 403:
            console.error(`${apiError}: Forbidden`);
            break;
          case 404:
            console.error(`${apiError}: Resource not found`);
            break;
          case 500:
            console.error(`${apiError}: Internal server error`);
            break;
          default:
            console.error(`${apiError}:`, data?.message || 'Unknown error');
        }
      } else if (error.request) {
        console.error(`${apiError}: Network error - no response received`);
      } else {
        console.error(`${apiError}: Request setup error:`, error.message);
      }

      return Promise.reject(error);
    }
  );
};

// Common API methods interface
export interface ApiMethods {
  get: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  post: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  put: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  patch: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
  delete: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>;
}

// Helper function to create API methods
export const createApiMethods = (client: AxiosInstance): ApiMethods => ({
  get: (url: string, config = {}) => client.get(url, config),
  post: (url: string, data, config = {}) => client.post(url, data, config),
  put: (url: string, data, config = {}) => client.put(url, data, config),
  patch: (url: string, data, config = {}) => client.patch(url, data, config),
  delete: (url: string, config = {}) => client.delete(url, config),
});

// File upload helper
export const createUploadMethod = (client: AxiosInstance) => {
  return (url: string, file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    return client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  };
};