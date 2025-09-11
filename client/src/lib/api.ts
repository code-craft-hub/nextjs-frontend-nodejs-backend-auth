
import { ApiResponse, AuthTokens, LoginData, RegisterData, SessionData, User } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const {accessToken} = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const tokens = await this.refreshPromise;
      this.refreshPromise = null;
      return tokens;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    const refreshToken = Cookies.get('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const {data} = await axios.post<ApiResponse<{ tokens: AuthTokens }>>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      { refreshToken }
    );

    if (!data.success || !data.data) {
      throw new Error('Token refresh failed');
    }

    const tokens = data.data.tokens;
    this.setAuthTokens(tokens);
    return tokens;
  }

  setAuthTokens(tokens: AuthTokens): void {
    const expirationTime = new Date(Date.now() + tokens.expiresIn * 1000);
    
    Cookies.set('accessToken', tokens.accessToken, { 
      expires: expirationTime,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    Cookies.set('refreshToken', tokens.refreshToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  clearAuth(): void {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!Cookies.get('accessToken');
  }

  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }


  async login(data: LoginData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data
    });
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request({
      method: 'POST',
      url: '/auth/logout'
    });
    
    this.clearAuth();
    return result;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request({
      method: 'GET',
      url: '/auth/profile'
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request({
      method: 'PUT',
      url: '/auth/change-password',
      data: { currentPassword, newPassword }
    });
  }

  async getSessions(): Promise<ApiResponse<{ sessions: SessionData[] }>> {
    return this.request({
      method: 'GET',
      url: '/auth/sessions'
    });
  }

  async revokeSession(sessionId: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/auth/sessions/${sessionId}`
    });
  }

  async logoutAllSessions(): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/logout-all'
    });
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email }
    });
  }
}

export const apiClient = new ApiClient();