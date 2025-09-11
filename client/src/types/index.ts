
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  photoURL?: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  current: boolean;
}
