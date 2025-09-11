"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimit = exports.authRateLimit = exports.createRateLimiter = exports.requireRoles = exports.requirePermissions = exports.authenticateToken = void 0;
const jose_1 = require("jose");
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const redis_1 = require("../config/redis");
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'MISSING_TOKEN',
                message: 'Access token is required'
            }));
            return;
        }
        const { payload } = await (0, jose_1.jwtVerify)(token, JWT_SECRET);
        const sessionKey = `session:${payload.sessionId}`;
        const sessionExists = await redis_1.redisClient.exists(sessionKey);
        if (!sessionExists) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'INVALID_SESSION',
                message: 'Session has expired or is invalid'
            }));
            return;
        }
        const userDoc = await firebase_1.db.collection('users').doc(payload.uid).get();
        if (!userDoc.exists) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            }));
            return;
        }
        const userData = userDoc.data();
        if (!userData.isActive) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'USER_INACTIVE',
                message: 'User account is inactive'
            }));
            return;
        }
        req.user = userData;
        req.sessionId = payload.sessionId;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        res.status(401).json((0, response_1.createApiResponse)(false, null, {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
        }));
    }
};
exports.authenticateToken = authenticateToken;
const requirePermissions = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'UNAUTHORIZED',
                message: 'Authentication required'
            }));
            return;
        }
        const userPermissions = req.user.permissions || [];
        const hasAllPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));
        if (!hasAllPermissions) {
            logger_1.logger.warn(`Permission denied for user ${req.user.uid}. Required: ${requiredPermissions}, Has: ${userPermissions}`);
            res.status(403).json((0, response_1.createApiResponse)(false, null, {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to access this resource'
            }));
            return;
        }
        next();
    };
};
exports.requirePermissions = requirePermissions;
const requireRoles = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, response_1.createApiResponse)(false, null, {
                code: 'UNAUTHORIZED',
                message: 'Authentication required'
            }));
            return;
        }
        const userRoles = req.user.roles.map(role => role.name) || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
            logger_1.logger.warn(`Role access denied for user ${req.user.uid}. Required: ${requiredRoles}, Has: ${userRoles}`);
            res.status(403).json((0, response_1.createApiResponse)(false, null, {
                code: 'INSUFFICIENT_ROLE',
                message: 'Insufficient role to access this resource'
            }));
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createRateLimiter = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs,
        max: options.max,
        message: (0, response_1.createApiResponse)(false, null, {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message || 'Too many requests, please try again later'
        }),
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json((0, response_1.createApiResponse)(false, null, {
                code: 'RATE_LIMIT_EXCEEDED',
                message: options.message || 'Too many requests, please try again later'
            }));
        }
    });
};
exports.createRateLimiter = createRateLimiter;
exports.authRateLimit = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later'
});
exports.generalRateLimit = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
//# sourceMappingURL=auth.middleware.js.map