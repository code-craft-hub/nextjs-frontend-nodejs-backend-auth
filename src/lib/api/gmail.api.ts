import { api, BACKEND_API_VERSION } from "./client";

// ─── Types ────────────────────────────────────────────────────────

export interface EmailFormData {
  userEmail: string;
  recruiterEmail: string;
  subject: string;
  content: string;
  sendImmediately: boolean;
  attachment?: File;
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface EmailPayload {
  userEmail: string;
  recruiterEmail: string;
  subject: string;
  content: string;
  sendImmediately: boolean;
  attachment?: EmailAttachment;
}

export interface AuthUrlResponse {
  data: { success: boolean; authUrl: string };
}

export interface AuthCallbackData {
  code: string;
}

export interface AuthStatusResponse {
  authorized: boolean;
  email?: string;
}

export interface AccountResponse {
  email: string;
  displayName?: string;
  picture?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Client ───────────────────────────────────────────────────

const GMAIL_AUTH_BASE = `/auth/gmail`;

export const gmailApi = {
  getAuthUrl: (token?: string) =>
    api.get<ApiResponse<AuthUrlResponse>>(`${GMAIL_AUTH_BASE}/auth-url`, {
      token,
    }),

  handleAuthCallback: (code: string, token?: string) =>
    api.post<ApiResponse<AuthStatusResponse>>(
      `${GMAIL_AUTH_BASE}/callback`,
      { code },
      { token },
    ),

  checkAuthStatus: (token?: string) =>
    api.get<ApiResponse<AuthStatusResponse>>(`${GMAIL_AUTH_BASE}/status`, {
      token,
    }),

  getAccount: (token?: string) =>
    api.get<ApiResponse<AccountResponse>>(`${GMAIL_AUTH_BASE}/account`, {
      token,
    }),

  revokeAccess: (token?: string) =>
    api.delete<ApiResponse<{ message: string }>>(`${GMAIL_AUTH_BASE}/revoke`, {
      token,
    }),

  sendEmail: (payload: EmailPayload, token?: string) =>
    api.post<ApiResponse<SendEmailResponse>>(
      `${BACKEND_API_VERSION}/gmail/send`,
      payload,
      { token },
    ),
};
