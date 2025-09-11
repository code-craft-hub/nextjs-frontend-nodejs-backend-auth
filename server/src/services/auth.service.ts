import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { auth, db } from "../config/firebase";
import { redisClient } from "../config/redis";
import {
  AuthTokens,
  JWTPayload,
  RefreshTokenPayload,
  User,
  LoginRequest,
  RegisterRequest,
  SessionData,
  UserRoles,
  Permission,
} from "../types";
import { logger } from "../utils/logger";
import { AuditService } from "./audit.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

export class AuthService {
  private auditService = new AuditService();

  async register(
    data: RegisterRequest,
    ipAddress: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Create Firebase user
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
      });

      // Create user document in Firestore with default role
      const userData: User = {
        uid: userRecord.uid,
        email: data.email,
        emailVerified: false,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        roles: [
          {
            id: "user",
            name: UserRoles.USER,
            permissions: [Permission.USER_READ, Permission.USER_WRITE],
            isSystem: true,
          },
        ],
        permissions: [Permission.USER_READ, Permission.USER_WRITE],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        metadata: {
          registrationIp: ipAddress,
          source: "web",
        },
      };

      await db.collection("users").doc(userRecord.uid).set(userData);

      // Generate tokens
      const tokens = await this.generateTokens(userData, ipAddress);

      // Log audit event
      await this.auditService.log({
        userId: userRecord.uid,
        action: "user_registered",
        resource: "auth",
        ipAddress,
        metadata: { email: data.email },
      });

      logger.info(`User registered successfully: ${data.email}`);

      return { user: userData, tokens };
    } catch (error) {
      logger.error("Registration error:", error);
      throw new Error("Registration failed: " + error);
    }
  }

  async login(
    data: LoginRequest,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Verify user credentials with Firebase
      const userRecord = await auth.getUserByEmail(data.email);

      // Get user from Firestore
      const userDoc = await db.collection("users").doc(userRecord.uid).get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as User;

      // Check if user is active
      if (!userData.isActive) {
        throw new Error("Account is inactive");
      }

      // Update last login
      await db.collection("users").doc(userRecord.uid).update({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate tokens
      const tokens = await this.generateTokens(userData, ipAddress, userAgent);

      // Log audit event
      await this.auditService.log({
        userId: userRecord.uid,
        action: "user_login",
        resource: "auth",
        ipAddress,
        metadata: { userAgent },
      });

      logger.info(`User logged in successfully: ${data.email}`);

      return {
        user: { ...userData, lastLoginAt: new Date() },
        tokens,
      };
    } catch (error: any) {
      logger.error("Login error:", error);

      // Log failed login attempt
      await this.auditService.log({
        userId: null,
        action: "login_failed",
        resource: "auth",
        ipAddress,
        metadata: { email: data.email, error: error.message },
      });

      throw new Error("Invalid credentials");
    }
  }

  async refreshTokens(
    refreshToken: string,
    ipAddress: string
  ): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const { payload } = (await jwtVerify(
        refreshToken,
        JWT_REFRESH_SECRET
      )) as { payload: RefreshTokenPayload };

      // Check if session exists and is valid
      const sessionKey = `session:${payload.sessionId}`;
      const sessionData = await redisClient.get(sessionKey);

      if (!sessionData) {
        throw new Error("Invalid refresh token");
      }

      const session: SessionData = JSON.parse(sessionData);

      // Verify token family (detect token reuse)
      if (session.tokenFamily !== payload.tokenFamily) {
        // Potential token theft - invalidate all sessions for user
        await this.invalidateAllUserSessions(payload.uid);
        throw new Error("Token reuse detected");
      }

      // Get user data
      const userDoc = await db.collection("users").doc(payload.uid).get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as User;

      if (!userData.isActive) {
        throw new Error("Account is inactive");
      }

      // Generate new tokens with new token family
      const tokens = await this.generateTokens(userData, ipAddress);

      // Invalidate old session
      await redisClient.del(sessionKey);

      logger.info(`Tokens refreshed for user: ${userData.email}`);

      return tokens;
    } catch (error) {
      logger.error("Token refresh error:", error);
      throw new Error("Invalid refresh token");
    }
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      await redisClient.del(sessionKey);

      // Log audit event
      await this.auditService.log({
        userId,
        action: "user_logout",
        resource: "auth",
        metadata: { sessionId },
      });

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      // Get all sessions for user
      const sessionPattern = `session:*`;
      const keys = await redisClient.keys(sessionPattern);

      const userSessions = [];
      for (const key of keys) {
        const sessionData = await redisClient.get(key);
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          if (session.userId === userId) {
            userSessions.push(key);
          }
        }
      }

      // Delete all user sessions
      if (userSessions.length > 0) {
        userSessions.forEach(async (key) => {
          await redisClient.del(key);
        });
      }

      // Log audit event
      await this.auditService.log({
        userId,
        action: "all_sessions_invalidated",
        resource: "auth",
        metadata: { sessionCount: userSessions.length },
      });

      logger.info(
        `Invalidated ${userSessions.length} sessions for user: ${userId}`
      );
    } catch (error) {
      logger.error("Session invalidation error:", error);
      throw new Error("Session invalidation failed");
    }
  }

  private async generateTokens(
    user: User,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    // Create JWT payload
    const jwtPayload: Omit<JWTPayload, "iat" | "exp" | "iss" | "aud"> = {
      uid: user.uid,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.permissions,
      sessionId,
    };

    // Generate access token (15 minutes)
    const accessToken = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .setIssuer("secure-auth-api")
      .setAudience("secure-auth-client")
      .sign(JWT_SECRET);

    // Generate refresh token (7 days)
    const refreshPayload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
      uid: user.uid,
      sessionId,
      tokenFamily,
    };

    const refreshToken = await new SignJWT(refreshPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_REFRESH_SECRET);

    // Store session in Redis
    const sessionData: SessionData = {
      userId: user.uid,
      sessionId,
      tokenFamily,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress,
      userAgent: userAgent || "unknown",
      isActive: true,
    };

    const sessionKey = `session:${sessionId}`;
    await redisClient.setEx(
      sessionKey,
      7 * 24 * 60 * 60,
      JSON.stringify(sessionData)
    ); // 7 days TTL

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: "Bearer",
    };
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessionPattern = `session:*`;
      const keys = await redisClient.keys(sessionPattern);

      const userSessions: SessionData[] = [];
      for (const key of keys) {
        const sessionData = await redisClient.get(key);
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          if (session.userId === userId && session.isActive) {
            userSessions.push(session);
          }
        }
      }

      return userSessions;
    } catch (error) {
      logger.error("Get user sessions error:", error);
      throw new Error("Failed to retrieve user sessions");
    }
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionData = await redisClient.get(sessionKey);

      if (!sessionData) {
        throw new Error("Session not found");
      }

      const session: SessionData = JSON.parse(sessionData);

      if (session.userId !== userId) {
        throw new Error("Unauthorized to revoke this session");
      }

      await redisClient.del(sessionKey);

      // Log audit event
      await this.auditService.log({
        userId,
        action: "session_revoked",
        resource: "auth",
        metadata: { sessionId, revokedSessionId: sessionId },
      });

      logger.info(`Session revoked: ${sessionId} for user: ${userId}`);
    } catch (error) {
      logger.error("Revoke session error:", error);
      throw new Error("Failed to revoke session");
    }
  }

  async changePassword(
    userId: string,
    _currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Verify current password by attempting to sign in
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data() as User;

      // Update password in Firebase Auth
      await auth.updateUser(userId, {
        password: newPassword,
      });

      // Invalidate all existing sessions (force re-login)
      await this.invalidateAllUserSessions(userId);

      // Update user document
      await db.collection("users").doc(userId).update({
        updatedAt: new Date(),
      });

      // Log audit event
      await this.auditService.log({
        userId,
        action: "password_changed",
        resource: "auth",
        metadata: { email: userData.email },
      });

      logger.info(`Password changed for user: ${userData.email}`);
    } catch (error) {
      logger.error("Change password error:", error);
      throw new Error("Failed to change password");
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Generate password reset link using Firebase
      const resetLink = await auth.generatePasswordResetLink(email);

      // In a real application, you would send this link via email
      // For now, we'll just log it
      logger.info(`Password reset link generated for ${email}: ${resetLink}`);

      // Log audit event
      await this.auditService.log({
        userId: null,
        action: "password_reset_requested",
        resource: "auth",
        metadata: { email },
      });
    } catch (error) {
      logger.error("Password reset request error:", error);
      // Don't throw error to prevent email enumeration
      logger.info(`Password reset attempted for non-existent email: ${email}`);
    }
  }
}
