import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { auth, db } from '../config/firebase';
import { AuthRequest, JWTPayload, User } from '../types';
import { logger } from '../utils/logger';
import { createApiResponse } from '../utils/response';
import { redisClient } from '../config/redis';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'MISSING_TOKEN',
        message: 'Access token is required'
      }));
      return;
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: JWTPayload };
    
    // Check if session is still active in Redis
    const sessionKey = `session:${payload.sessionId}`;
    const sessionExists = await redisClient.exists(sessionKey);
    
    if (!sessionExists) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'INVALID_SESSION',
        message: 'Session has expired or is invalid'
      }));
      return;
    }

    // Get user from Firestore with latest data
    const userDoc = await db.collection('users').doc(payload.uid).get();
    if (!userDoc.exists) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }));
      return;
    }

    const userData = userDoc.data() as User;
    
    // Check if user is active
    if (!userData.isActive) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'USER_INACTIVE',
        message: 'User account is inactive'
      }));
      return;
    }

    req.user = userData;
    req.sessionId = payload.sessionId;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json(createApiResponse(false, null, {
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    }));
  }
};

export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }));
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn(`Permission denied for user ${req.user.uid}. Required: ${requiredPermissions}, Has: ${userPermissions}`);
      res.status(403).json(createApiResponse(false, null, {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to access this resource'
      }));
      return;
    }

    next();
  };
};

export const requireRoles = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createApiResponse(false, null, {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }));
      return;
    }

    const userRoles = req.user.roles.map(role => role.name) || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(`Role access denied for user ${req.user.uid}. Required: ${requiredRoles}, Has: ${userRoles}`);
      res.status(403).json(createApiResponse(false, null, {
        code: 'INSUFFICIENT_ROLE',
        message: 'Insufficient role to access this resource'
      }));
      return;
    }

    next();
  };
};

// Rate limiting middleware
import rateLimit from 'express-rate-limit';

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: createApiResponse(false, null, {
      code: 'RATE_LIMIT_EXCEEDED',
      message: options.message || 'Too many requests, please try again later'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json(createApiResponse(false, null, {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later'
      }));
    }
  });
};

// Specific rate limiters
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later'
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later'
});

// Security middleware
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];