import type { IUser } from "@/shared/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthSession {
  user: Partial<IUser>;
  expiresAt: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  /** Required for email/password accounts. Omit for Google-only accounts setting a password for the first time. */
  currentPassword?: string;
  newPassword: string;
}
