import { User as FirebaseUser } from 'firebase/auth';

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope?: 'own' | 'team' | 'organization' | 'global';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  roles: UserRole[];
  metadata: {
    createdAt: string;
    lastLoginAt: string;
    isActive: boolean;
    organizationId?: string;
    teamId?: string;
  };
  preferences: Record<string, unknown>;
}

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

export interface AuthUser extends Omit<FirebaseUser, 'metadata'> {
  profile?: UserProfile;
  customClaims?: Record<string, unknown>;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (roleId: string) => boolean;
  hasPermission: (resource: string, action: Permission['action'], scope?: Permission['scope']) => boolean;
  isAdmin: boolean;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshCustomClaims: () => Promise<void>;
}

export type AuthAction = 
  | { type: 'AUTH_STATE_CHANGED'; payload: { user: AuthUser | null; isLoading: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_CUSTOM_CLAIMS'; payload: Record<string, unknown> | null }
  | { type: 'SIGN_OUT' };

export interface RouteProtection {
  requireAuth: boolean;
  requiredRoles?: string[];
  requiredPermissions?: Array<{
    resource: string;
    action: Permission['action'];
    scope?: Permission['scope'];
  }>;
  fallbackUrl?: string;
}

// Common role definitions for type safety
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// Common permissions for type safety
export const PERMISSIONS = {
  USERS_MANAGE: 'users:manage',
  USERS_READ: 'users:read',
  SETTINGS_MANAGE: 'settings:manage',
  DASHBOARD_READ: 'dashboard:read',
  REPORTS_READ: 'reports:read',
  REPORTS_CREATE: 'reports:create',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];