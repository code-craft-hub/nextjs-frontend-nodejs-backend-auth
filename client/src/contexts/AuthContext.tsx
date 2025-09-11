"use client";

import { apiClient } from "@/lib/api";
import { LoginData, RegisterData, User } from "@/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    console.log("Refreshing user...", apiClient.isAuthenticated());
    if (!apiClient.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getProfile();

      console.log("Profile response:", response);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        setUser(null);
        apiClient.clearAuth();
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      apiClient.clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.login(data);

      if (response.success && response.data) {
        apiClient.setAuthTokens(response.data.tokens);
        setUser(response.data.user);
        return { success: true };
      } else {
        const errorMessage = response.error?.message || "Login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "Network error. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Registering user with data:", data);
      const response = await apiClient.register(data);
      console.log("Register response:", response);
      if (response.success && response.data) {
        apiClient.setAuthTokens(response.data.tokens);
        setUser(response.data.user);
        return { success: true };
      } else {
        const errorMessage = response.error?.message || "Registration failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "Network error. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
