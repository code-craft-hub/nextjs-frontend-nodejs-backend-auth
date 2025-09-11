import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { AuthRequest, LoginRequest, RegisterRequest } from '../types';
import { logger } from '../utils/logger';
import { createApiResponse } from '../utils/response';

export class AuthController {
  private authService = new AuthService();

  // Validation rules
  static registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    body('displayName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('phoneNumber').optional().isMobilePhone('any')
  ];

  static loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
    body('rememberMe').optional().isBoolean()
  ];

  static changePasswordValidation = [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character')
  ];

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Register controller hit", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createApiResponse(false, null, {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }));
        return;
      }

      const data: RegisterRequest = req.body;
      const ipAddress = req.ip || 'unknown';

      const result = await this.authService.register(data, ipAddress);

      res.status(201).json(createApiResponse(true, {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          emailVerified: result.user.emailVerified,
          roles: result.user.roles.map(r => r.name),
          permissions: result.user.permissions
        },
        tokens: result.tokens
      }));
    } catch (error) {
      logger.error('Registration controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'REGISTRATION_FAILED',
        message: error instanceof Error ? error.message : 'Registration failed'
      }));
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createApiResponse(false, null, {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }));
        return;
      }

      const data: LoginRequest = req.body;
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await this.authService.login(data, ipAddress, userAgent);

      res.status(200).json(createApiResponse(true, {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          emailVerified: result.user.emailVerified,
          roles: result.user.roles.map(r => r.name),
          permissions: result.user.permissions,
          lastLoginAt: result.user.lastLoginAt
        },
        tokens: result.tokens
      }));
    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(401).json(createApiResponse(false, null, {
        code: 'LOGIN_FAILED',
        message: 'Invalid credentials'
      }));
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json(createApiResponse(false, null, {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required'
        }));
        return;
      }

      const ipAddress = req.ip || 'unknown';
      const tokens = await this.authService.refreshTokens(refreshToken, ipAddress);

      res.status(200).json(createApiResponse(true, { tokens }));
    } catch (error) {
      logger.error('Token refresh controller error:', error);
      res.status(401).json(createApiResponse(false, null, {
        code: 'TOKEN_REFRESH_FAILED',
        message: 'Invalid refresh token'
      }));
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.sessionId) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      await this.authService.logout(req.sessionId, req.user.uid);

      res.status(200).json(createApiResponse(true, {
        message: 'Logged out successfully'
      }));
    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'LOGOUT_FAILED',
        message: 'Logout failed'
      }));
    }
  };

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      res.status(200).json(createApiResponse(true, {
        user: {
          uid: req.user.uid,
          email: req.user.email,
          displayName: req.user.displayName,
          emailVerified: req.user.emailVerified,
          phoneNumber: req.user.phoneNumber,
          photoURL: req.user.photoURL,
          roles: req.user.roles.map(r => r.name),
          permissions: req.user.permissions,
          createdAt: req.user.createdAt,
          lastLoginAt: req.user.lastLoginAt
        }
      }));
    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to fetch profile'
      }));
    }
  };

  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(createApiResponse(false, null, {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }));
        return;
      }

      if (!req.user) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user.uid, currentPassword, newPassword);

      res.status(200).json(createApiResponse(true, {
        message: 'Password changed successfully'
      }));
    } catch (error) {
      logger.error('Change password controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to change password'
      }));
    }
  };

  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json(createApiResponse(false, null, {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }));
        return;
      }

      await this.authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.status(200).json(createApiResponse(true, {
        message: 'If the email exists, a password reset link has been sent'
      }));
    } catch (error) {
      logger.error('Password reset controller error:', error);
      // Always return success to prevent email enumeration
      res.status(200).json(createApiResponse(true, {
        message: 'If the email exists, a password reset link has been sent'
      }));
    }
  };

  getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      const sessions = await this.authService.getUserSessions(req.user.uid);

      res.status(200).json(createApiResponse(true, {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          createdAt: session.createdAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          current: session.sessionId === req.sessionId
        }))
      }));
    } catch (error) {
      logger.error('Get sessions controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'SESSIONS_FETCH_FAILED',
        message: 'Failed to fetch sessions'
      }));
    }
  };

  revokeSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      const { sessionId } = req.params;
      await this.authService.revokeSession(sessionId, req.user.uid);

      res.status(200).json(createApiResponse(true, {
        message: 'Session revoked successfully'
      }));
    } catch (error) {
      logger.error('Revoke session controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'SESSION_REVOKE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to revoke session'
      }));
    }
  };

  logoutAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, null, {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }));
        return;
      }

      await this.authService.invalidateAllUserSessions(req.user.uid);

      res.status(200).json(createApiResponse(true, {
        message: 'All sessions logged out successfully'
      }));
    } catch (error) {
      logger.error('Logout all sessions controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'LOGOUT_ALL_FAILED',
        message: 'Failed to logout all sessions'
      }));
    }
  };
}