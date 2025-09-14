"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

import {
  AuthContextValue,
  AuthState,
  AuthAction,
  AuthUser,
  UserProfile,
  ROLES,
  Permission,
} from "../types/auth";
import { authService, AuthServiceError } from "../lib/services/auth.service";
import { getFirebaseAuth } from "@/lib/firebase/config";

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasRole: () => false,
  hasPermission: () => false,
  isAdmin: false,
};


// Auth reducer for state management
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      const { user, isLoading } = action.payload;
      return {
        ...state,
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin:
          user?.customClaims?.role === ROLES.SUPER_ADMIN ||
          user?.customClaims?.role === ROLES.ADMIN ||
          user?.profile?.roles?.some(
            (role) =>
              role.name === ROLES.SUPER_ADMIN || role.name === ROLES.ADMIN
          ) ||
          false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_PROFILE":
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          profile: action.payload || undefined,
        },
        isAdmin:
          action.payload?.roles?.some(
            (role) =>
              role.name === ROLES.SUPER_ADMIN || role.name === ROLES.ADMIN
          ) ||
          state.user.customClaims?.role === ROLES.SUPER_ADMIN ||
          state.user.customClaims?.role === ROLES.ADMIN ||
          false,
      };

    case "SET_CUSTOM_CLAIMS":
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          customClaims: action.payload || {},
        },
        isAdmin:
          action.payload?.role === ROLES.SUPER_ADMIN ||
          action.payload?.role === ROLES.ADMIN ||
          state.user.profile?.roles?.some(
            (role) =>
              role.name === ROLES.SUPER_ADMIN || role.name === ROLES.ADMIN
          ) ||
          false,
      };

    case "SIGN_OUT":
      return {
        ...initialAuthState,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Auth context
const AuthContext = createContext<AuthContextValue | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Enterprise-grade Authentication Provider
 * Manages authentication state with Firebase integration,
 * role-based access control, and permission checking.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Create helper functions with proper access to current state
  const createHelperFunctions = useCallback((currentUser: AuthUser | null) => {
    const hasRole = (roleId: string): boolean => {
      if (!currentUser) return false;

      // Check custom claims first
      if (currentUser.customClaims?.role === roleId) return true;

      // Check profile roles
      return (
        currentUser.profile?.roles?.some((role) => role.name === roleId) ||
        false
      );
    };

    const hasPermission = (
      resource: string,
      action: Permission["action"],
      scope?: Permission["scope"]
    ): boolean => {
      if (!currentUser) return false;

      // Super admin has all permissions
      if (hasRole(ROLES.SUPER_ADMIN)) return true;

      // Check profile permissions
      return (
        currentUser.profile?.roles?.some((role) =>
          role.permissions.some(
            (permission) =>
              permission.resource === resource &&
              permission.action === action &&
              (!scope ||
                permission.scope === scope ||
                permission.scope === "global")
          )
        ) || false
      );
    };

    return { hasRole, hasPermission };
  }, []);

  // Update helper functions when user changes
  const helperFunctions = useMemo(
    () => createHelperFunctions(state.user),
    [state.user, createHelperFunctions]
  );

  // Enhanced state with helper functions
  const enhancedState: AuthState = useMemo(
    () => ({
      ...state,
      ...helperFunctions,
    }),
    [state, helperFunctions]
  );

  // Authentication methods
  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const result = await authService.signIn(email, password);

        if (!result.success || !result.data) {
          throw result.error || new Error("Sign in failed");
        }

        // State will be updated by auth state observer
      } catch (error) {
        dispatch({ type: "SET_LOADING", payload: false });

        if (error instanceof AuthServiceError) {
          throw error;
        }

        throw new Error("Failed to sign in. Please try again.");
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<void> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const result = await authService.signUp(email, password, displayName);

        if (!result.success || !result.data) {
          throw result.error || new Error("Sign up failed");
        }

        // State will be updated by auth state observer
      } catch (error) {
        dispatch({ type: "SET_LOADING", payload: false });

        if (error instanceof AuthServiceError) {
          throw error;
        }

        throw new Error("Failed to create account. Please try again.");
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const result = await authService.signOut();

      if (!result.success) {
        throw result.error || new Error("Sign out failed");
      }

      dispatch({ type: "SIGN_OUT" });
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if sign out fails, clear local state
      dispatch({ type: "SIGN_OUT" });
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      const result = await authService.resetPassword(email);

      if (!result.success) {
        throw result.error || new Error("Password reset failed");
      }
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      throw new Error("Failed to send password reset email. Please try again.");
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      if (!state.user) {
        throw new Error("User must be authenticated to update profile");
      }

      try {
        const result = await authService.updateProfile(state.user.uid, updates);

        if (!result.success || !result.data) {
          throw result.error || new Error("Profile update failed");
        }

        dispatch({ type: "SET_PROFILE", payload: result.data });
      } catch (error) {
        if (error instanceof AuthServiceError) {
          throw error;
        }

        throw new Error("Failed to update profile. Please try again.");
      }
    },
    [state.user]
  );

  const refreshCustomClaims = useCallback(async (): Promise<void> => {
    if (!state.user) {
      throw new Error("User must be authenticated to refresh claims");
    }

    try {
      const result = await authService.refreshCustomClaims(state.user.uid);

      if (!result.success) {
        throw result.error || new Error("Failed to refresh claims");
      }

      dispatch({ type: "SET_CUSTOM_CLAIMS", payload: result.data || null });
    } catch (error) {
      console.error("Failed to refresh custom claims:", error);
      // Don't throw error for claims refresh failure
    }
  }, [state.user]);

  // Setup auth state observer
  useEffect(() => {
    const unsubscribe = authService.createAuthStateObserver(
      (user: AuthUser | null) => {
        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload: { user, isLoading: false },
        });
      }
    );

    return unsubscribe;
  }, []);

  // Context value
  const contextValue: AuthContextValue = useMemo(
    () => ({
      ...enhancedState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshCustomClaims,
    }),
    [
      enhancedState,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshCustomClaims,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * Throws error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Hook to get current user with type safety
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roleId: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(roleId);
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(
  resource: string,
  action: Permission["action"],
  scope?: Permission["scope"]
): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(resource, action, scope);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}
