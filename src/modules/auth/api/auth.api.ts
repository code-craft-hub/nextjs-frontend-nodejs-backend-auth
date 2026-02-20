import { api, BACKEND_API_VERSION } from "@/lib/api/client";
import type {
  AuthSession,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterData,
} from "./auth.api.types";

const BASE = `/${BACKEND_API_VERSION}/auth`;

export const authApi = {
  // ─── Session ────────────────────────────────────────────────
  getSession: () => api.get<AuthSession>(`${BASE}/session`),

  getProfile: () => api.get<AuthSession["user"]>(`${BASE}/users`),

  // ─── Auth Actions ───────────────────────────────────────────
  login: (credentials: LoginCredentials) =>
    api.post<AuthSession>(`${BASE}/login`, credentials),

  register: (data: RegisterData) =>
    api.post<AuthSession>(`${BASE}/register`, data),

  logout: () => api.post<void>(`${BASE}/logout`),

  refresh: () => api.post<AuthSession>(`${BASE}/refresh`),

  // ─── Password Reset ─────────────────────────────────────────
  requestPasswordReset: ({ email }: PasswordResetRequest) =>
    api.post<void>(`${BASE}/password-reset`, { email }),

  resetPassword: ({ token, newPassword }: PasswordResetConfirm) =>
    api.post<void>(`${BASE}/password-reset/confirm`, { token, newPassword }),
};
