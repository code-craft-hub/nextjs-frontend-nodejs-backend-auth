import { AuthTokens, User, LoginRequest, RegisterRequest, SessionData } from '../types';
export declare class AuthService {
    private auditService;
    register(data: RegisterRequest, ipAddress: string): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    login(data: LoginRequest, ipAddress: string, userAgent: string): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    refreshTokens(refreshToken: string, ipAddress: string): Promise<AuthTokens>;
    logout(sessionId: string, userId: string): Promise<void>;
    invalidateAllUserSessions(userId: string): Promise<void>;
    private generateTokens;
    getUserSessions(userId: string): Promise<SessionData[]>;
    revokeSession(sessionId: string, userId: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map