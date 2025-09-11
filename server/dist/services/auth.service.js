"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jose_1 = require("jose");
const crypto_1 = __importDefault(require("crypto"));
const firebase_1 = require("../config/firebase");
const redis_1 = require("../config/redis");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const audit_service_1 = require("./audit.service");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
class AuthService {
    constructor() {
        this.auditService = new audit_service_1.AuditService();
    }
    async register(data, ipAddress) {
        try {
            const userRecord = await firebase_1.auth.createUser({
                email: data.email,
                password: data.password,
                displayName: data.displayName,
                phoneNumber: data.phoneNumber,
            });
            const userData = {
                uid: userRecord.uid,
                email: data.email,
                emailVerified: false,
                displayName: data.displayName,
                phoneNumber: data.phoneNumber,
                roles: [{
                        id: 'user',
                        name: types_1.UserRoles.USER,
                        permissions: [types_1.Permission.USER_READ, types_1.Permission.USER_WRITE],
                        isSystem: true
                    }],
                permissions: [types_1.Permission.USER_READ, types_1.Permission.USER_WRITE],
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                metadata: {
                    registrationIp: ipAddress,
                    source: 'web'
                }
            };
            await firebase_1.db.collection('users').doc(userRecord.uid).set(userData);
            const tokens = await this.generateTokens(userData, ipAddress);
            await this.auditService.log({
                userId: userRecord.uid,
                action: 'user_registered',
                resource: 'auth',
                ipAddress,
                metadata: { email: data.email }
            });
            logger_1.logger.info(`User registered successfully: ${data.email}`);
            return { user: userData, tokens };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw new Error('Registration failed');
        }
    }
    async login(data, ipAddress, userAgent) {
        try {
            const userRecord = await firebase_1.auth.getUserByEmail(data.email);
            const userDoc = await firebase_1.db.collection('users').doc(userRecord.uid).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            const userData = userDoc.data();
            if (!userData.isActive) {
                throw new Error('Account is inactive');
            }
            await firebase_1.db.collection('users').doc(userRecord.uid).update({
                lastLoginAt: new Date(),
                updatedAt: new Date()
            });
            const tokens = await this.generateTokens(userData, ipAddress, userAgent);
            await this.auditService.log({
                userId: userRecord.uid,
                action: 'user_login',
                resource: 'auth',
                ipAddress,
                metadata: { userAgent }
            });
            logger_1.logger.info(`User logged in successfully: ${data.email}`);
            return {
                user: { ...userData, lastLoginAt: new Date() },
                tokens
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            await this.auditService.log({
                userId: null,
                action: 'login_failed',
                resource: 'auth',
                ipAddress,
                metadata: { email: data.email, error: error.message }
            });
            throw new Error('Invalid credentials');
        }
    }
    async refreshTokens(refreshToken, ipAddress) {
        try {
            const { payload } = await (0, jose_1.jwtVerify)(refreshToken, JWT_REFRESH_SECRET);
            const sessionKey = `session:${payload.sessionId}`;
            const sessionData = await redis_1.redisClient.get(sessionKey);
            if (!sessionData) {
                throw new Error('Invalid refresh token');
            }
            const session = JSON.parse(sessionData);
            if (session.tokenFamily !== payload.tokenFamily) {
                await this.invalidateAllUserSessions(payload.uid);
                throw new Error('Token reuse detected');
            }
            const userDoc = await firebase_1.db.collection('users').doc(payload.uid).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            const userData = userDoc.data();
            if (!userData.isActive) {
                throw new Error('Account is inactive');
            }
            const tokens = await this.generateTokens(userData, ipAddress);
            await redis_1.redisClient.del(sessionKey);
            logger_1.logger.info(`Tokens refreshed for user: ${userData.email}`);
            return tokens;
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            throw new Error('Invalid refresh token');
        }
    }
    async logout(sessionId, userId) {
        try {
            const sessionKey = `session:${sessionId}`;
            await redis_1.redisClient.del(sessionKey);
            await this.auditService.log({
                userId,
                action: 'user_logout',
                resource: 'auth',
                metadata: { sessionId }
            });
            logger_1.logger.info(`User logged out: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            throw new Error('Logout failed');
        }
    }
    async invalidateAllUserSessions(userId) {
        try {
            const sessionPattern = `session:*`;
            const keys = await redis_1.redisClient.keys(sessionPattern);
            const userSessions = [];
            for (const key of keys) {
                const sessionData = await redis_1.redisClient.get(key);
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    if (session.userId === userId) {
                        userSessions.push(key);
                    }
                }
            }
            if (userSessions.length > 0) {
                await redis_1.redisClient.del(...userSessions);
            }
            await this.auditService.log({
                userId,
                action: 'all_sessions_invalidated',
                resource: 'auth',
                metadata: { sessionCount: userSessions.length }
            });
            logger_1.logger.info(`Invalidated ${userSessions.length} sessions for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Session invalidation error:', error);
            throw new Error('Session invalidation failed');
        }
    }
    async generateTokens(user, ipAddress, userAgent) {
        const sessionId = crypto_1.default.randomUUID();
        const tokenFamily = crypto_1.default.randomUUID();
        const jwtPayload = {
            uid: user.uid,
            email: user.email,
            roles: user.roles.map(role => role.name),
            permissions: user.permissions,
            sessionId
        };
        const accessToken = await new jose_1.SignJWT(jwtPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('15m')
            .setIssuer('secure-auth-api')
            .setAudience('secure-auth-client')
            .sign(JWT_SECRET);
        const refreshPayload = {
            uid: user.uid,
            sessionId,
            tokenFamily
        };
        const refreshToken = await new jose_1.SignJWT(refreshPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_REFRESH_SECRET);
        const sessionData = {
            userId: user.uid,
            sessionId,
            tokenFamily,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress,
            userAgent: userAgent || 'unknown',
            isActive: true
        };
        const sessionKey = `session:${sessionId}`;
        await redis_1.redisClient.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(sessionData));
        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            tokenType: 'Bearer'
        };
    }
    async getUserSessions(userId) {
        try {
            const sessionPattern = `session:*`;
            const keys = await redis_1.redisClient.keys(sessionPattern);
            const userSessions = [];
            for (const key of keys) {
                const sessionData = await redis_1.redisClient.get(key);
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    if (session.userId === userId && session.isActive) {
                        userSessions.push(session);
                    }
                }
            }
            return userSessions;
        }
        catch (error) {
            logger_1.logger.error('Get user sessions error:', error);
            throw new Error('Failed to retrieve user sessions');
        }
    }
    async revokeSession(sessionId, userId) {
        try {
            const sessionKey = `session:${sessionId}`;
            const sessionData = await redis_1.redisClient.get(sessionKey);
            if (!sessionData) {
                throw new Error('Session not found');
            }
            const session = JSON.parse(sessionData);
            if (session.userId !== userId) {
                throw new Error('Unauthorized to revoke this session');
            }
            await redis_1.redisClient.del(sessionKey);
            await this.auditService.log({
                userId,
                action: 'session_revoked',
                resource: 'auth',
                metadata: { sessionId, revokedSessionId: sessionId }
            });
            logger_1.logger.info(`Session revoked: ${sessionId} for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Revoke session error:', error);
            throw new Error('Failed to revoke session');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const userDoc = await firebase_1.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            const userData = userDoc.data();
            await firebase_1.auth.updateUser(userId, {
                password: newPassword
            });
            await this.invalidateAllUserSessions(userId);
            await firebase_1.db.collection('users').doc(userId).update({
                updatedAt: new Date()
            });
            await this.auditService.log({
                userId,
                action: 'password_changed',
                resource: 'auth',
                metadata: { email: userData.email }
            });
            logger_1.logger.info(`Password changed for user: ${userData.email}`);
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            throw new Error('Failed to change password');
        }
    }
    async requestPasswordReset(email) {
        try {
            const resetLink = await firebase_1.auth.generatePasswordResetLink(email);
            logger_1.logger.info(`Password reset link generated for ${email}: ${resetLink}`);
            await this.auditService.log({
                userId: null,
                action: 'password_reset_requested',
                resource: 'auth',
                metadata: { email }
            });
        }
        catch (error) {
            logger_1.logger.error('Password reset request error:', error);
            logger_1.logger.info(`Password reset attempted for non-existent email: ${email}`);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map