import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermissions: (requiredPermissions: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRoles: (requiredRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const createRateLimiter: (options: {
    windowMs: number;
    max: number;
    message?: string;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=auth.middleware.d.ts.map