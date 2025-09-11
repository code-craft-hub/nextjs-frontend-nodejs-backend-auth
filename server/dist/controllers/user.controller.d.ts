import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class UserController {
    private userService;
    private auditService;
    static updateUserValidation: import("express-validator").ValidationChain[];
    static assignRoleValidation: import("express-validator").ValidationChain[];
    static removeRoleValidation: import("express-validator").ValidationChain[];
    static createRoleValidation: import("express-validator").ValidationChain[];
    static updateRoleValidation: import("express-validator").ValidationChain[];
    getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
    getUserById: (req: AuthRequest, res: Response) => Promise<void>;
    updateUser: (req: AuthRequest, res: Response) => Promise<void>;
    assignRole: (req: AuthRequest, res: Response) => Promise<void>;
    removeRole: (req: AuthRequest, res: Response) => Promise<void>;
    deactivateUser: (req: AuthRequest, res: Response) => Promise<void>;
    activateUser: (req: AuthRequest, res: Response) => Promise<void>;
    getAllRoles: (req: AuthRequest, res: Response) => Promise<void>;
    createRole: (req: AuthRequest, res: Response) => Promise<void>;
    updateRole: (req: AuthRequest, res: Response) => Promise<void>;
    deleteRole: (req: AuthRequest, res: Response) => Promise<void>;
    getAuditLogs: (req: AuthRequest, res: Response) => Promise<void>;
    getSecurityEvents: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map