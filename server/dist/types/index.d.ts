import { Request } from 'express';
export interface User {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    roles: UserRole[];
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    metadata?: Record<string, any>;
}
export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
    description?: string;
    isSystem: boolean;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}
export interface JWTPayload {
    uid: string;
    email: string;
    roles: string[];
    permissions: string[];
    sessionId: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}
export interface RefreshTokenPayload {
    uid: string;
    sessionId: string;
    tokenFamily: string;
    iat: number;
    exp: number;
}
export interface AuthRequest extends Request {
    user?: User;
    sessionId?: string;
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
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RegisterRequest {
    email: string;
    password: string;
    displayName?: string;
    phoneNumber?: string;
}
export interface PasswordResetRequest {
    email: string;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
}
export declare enum Permission {
    USER_READ = "user:read",
    USER_WRITE = "user:write",
    USER_DELETE = "user:delete",
    ADMIN_READ = "admin:read",
    ADMIN_WRITE = "admin:write",
    ADMIN_DELETE = "admin:delete",
    SYSTEM_CONFIG = "system:config",
    SYSTEM_LOGS = "system:logs",
    ROLE_READ = "role:read",
    ROLE_WRITE = "role:write",
    ROLE_DELETE = "role:delete"
}
export declare enum UserRoles {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MODERATOR = "moderator",
    USER = "user",
    GUEST = "guest"
}
export interface SessionData {
    userId: string;
    sessionId: string;
    tokenFamily: string;
    createdAt: Date;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}
//# sourceMappingURL=index.d.ts.map