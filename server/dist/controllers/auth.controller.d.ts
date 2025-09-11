import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare class AuthController {
    private authService;
    private userService;
    static registerValidation: import("express-validator").ValidationChain[];
    static loginValidation: import("express-validator").ValidationChain[];
    static changePasswordValidation: import("express-validator").ValidationChain[];
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    logout: (req: AuthRequest, res: Response) => Promise<void>;
    getProfile: (req: AuthRequest, res: Response) => Promise<void>;
    changePassword: (req: AuthRequest, res: Response) => Promise<void>;
    requestPasswordReset: (req: Request, res: Response) => Promise<void>;
    getSessions: (req: AuthRequest, res: Response) => Promise<void>;
    revokeSession: (req: AuthRequest, res: Response) => Promise<void>;
    logoutAllSessions: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map