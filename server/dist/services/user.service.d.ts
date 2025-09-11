import { User, UserRole } from '../types';
export declare class UserService {
    private auditService;
    getUserById(uid: string): Promise<User | null>;
    updateUser(uid: string, updates: Partial<User>, adminUserId?: string): Promise<User>;
    assignRole(uid: string, roleName: string, adminUserId: string): Promise<void>;
    removeRole(uid: string, roleName: string, adminUserId: string): Promise<void>;
    deactivateUser(uid: string, adminUserId: string): Promise<void>;
    activateUser(uid: string, adminUserId: string): Promise<void>;
    getAllUsers(params: {
        page?: number;
        limit?: number;
        role?: string;
        isActive?: boolean;
    }): Promise<{
        users: Partial<User>[];
        total: number;
    }>;
    getRoleByName(roleName: string): Promise<UserRole | null>;
    createRole(roleData: Omit<UserRole, 'id'>, adminUserId: string): Promise<UserRole>;
    updateRole(roleId: string, updates: Partial<UserRole>, adminUserId: string): Promise<UserRole>;
    deleteRole(roleId: string, adminUserId: string): Promise<void>;
    getAllRoles(): Promise<UserRole[]>;
    private updateUserPermissionsForRole;
    initializeDefaultRoles(): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map