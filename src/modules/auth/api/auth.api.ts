import { api, clearLogoutIntent, markLogoutIntent } from "@/lib/api/client";
import type {
  AuthSession,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterData,
} from "./auth.api.types";

export const authApi = {
  // ─── Session ────────────────────────────────────────────────
  getSession: () => api.get<AuthSession>(`/session`),

  getProfile: () => api.get<AuthSession["user"]>(`/users`),

  // ─── Auth Actions ───────────────────────────────────────────
  login: (credentials: LoginCredentials) =>
    api.post<AuthSession>(`/login`, credentials),

  register: (data: RegisterData) => api.post<AuthSession>(`/register`, data),

  logout: async () => {
    // Signal the HTTP client to skip refresh for any concurrent 401s —
    // the user's intent is clear. Reverted on failure so normal flow resumes.
    markLogoutIntent();
    try {
      return await api.post<void>(`/auth/logout`);
    } catch (error) {
      clearLogoutIntent();
      throw error;
    }
  },

  refresh: () => api.post<AuthSession>(`/refresh`),

  // ─── Password Reset ─────────────────────────────────────────
  requestPasswordReset: ({ email }: PasswordResetRequest) =>
    api.post<void>(`/password-reset`, { email }),

  resetPassword: ({ token, newPassword }: PasswordResetConfirm) =>
    api.post<void>(`/password-reset/confirm`, { token, newPassword }),
};
