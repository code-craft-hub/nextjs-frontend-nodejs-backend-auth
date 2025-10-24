import { api } from "./client";
import type {
  AuthSession,
  LoginCredentials,
  RegisterData,
  User,
} from "@/lib/types";

export const authApi = {
  // Get current session
  getSession: () => api.get<AuthSession>("/auth/session"),

  // Get current user profile
  getProfile: () => api.get<User>("/auth/users"),

  // Login
  login: (credentials: LoginCredentials) =>
    api.post<AuthSession>("/auth/login", credentials),

  // Register
  register: (data: RegisterData) =>
    api.post<AuthSession>("/auth/register", data),

  // Logout
  logout: () => api.post<void>("/auth/logout"),

  // Refresh token (if needed)
  refresh: () => api.post<AuthSession>("/auth/refresh"),

  // Password reset request
  requestPasswordReset: (email: string) =>
    api.post<void>("/auth/password-reset", { email }),

  // Password reset confirm
  resetPassword: (token: string, newPassword: string) =>
    api.post<void>("/auth/password-reset/confirm", { token, newPassword }),
};
