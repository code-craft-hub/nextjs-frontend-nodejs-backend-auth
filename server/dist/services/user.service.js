"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const firebase_1 = require("../config/firebase");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const audit_service_1 = require("./audit.service");
class UserService {
    constructor() {
        this.auditService = new audit_service_1.AuditService();
    }
    async getUserById(uid) {
        try {
            const userDoc = await firebase_1.db.collection('users').doc(uid).get();
            if (!userDoc.exists) {
                return null;
            }
            return userDoc.data();
        }
        catch (error) {
            logger_1.logger.error('Get user by ID error:', error);
            throw new Error('Failed to fetch user');
        }
    }
    async updateUser(uid, updates, adminUserId) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };
            await firebase_1.db.collection('users').doc(uid).update(updateData);
            const updatedUser = await this.getUserById(uid);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }
            await this.auditService.log({
                userId: adminUserId || uid,
                action: 'user_updated',
                resource: 'user',
                resourceId: uid,
                metadata: { updatedFields: Object.keys(updates) }
            });
            logger_1.logger.info(`User updated: ${uid}`);
            return updatedUser;
        }
        catch (error) {
            logger_1.logger.error('Update user error:', error);
            throw new Error('Failed to update user');
        }
    }
    async assignRole(uid, roleName, adminUserId) {
        try {
            const user = await this.getUserById(uid);
            if (!user) {
                throw new Error('User not found');
            }
            const role = await this.getRoleByName(roleName);
            if (!role) {
                throw new Error('Role not found');
            }
            const hasRole = user.roles.some(r => r.name === roleName);
            if (hasRole) {
                throw new Error('User already has this role');
            }
            const updatedRoles = [...user.roles, role];
            const allPermissions = Array.from(new Set(updatedRoles.flatMap(r => r.permissions)));
            await firebase_1.db.collection('users').doc(uid).update({
                roles: updatedRoles,
                permissions: allPermissions,
                updatedAt: new Date()
            });
            await this.auditService.log({
                userId: adminUserId,
                action: 'role_assigned',
                resource: 'user',
                resourceId: uid,
                metadata: { roleName, assignedBy: adminUserId }
            });
            logger_1.logger.info(`Role ${roleName} assigned to user ${uid} by ${adminUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Assign role error:', error);
            throw new Error(`Failed to assign role: ${error.message}`);
        }
    }
    async removeRole(uid, roleName, adminUserId) {
        try {
            const user = await this.getUserById(uid);
            if (!user) {
                throw new Error('User not found');
            }
            const roleToRemove = user.roles.find(r => r.name === roleName);
            if (roleToRemove?.isSystem) {
                throw new Error('Cannot remove system role');
            }
            const updatedRoles = user.roles.filter(r => r.name !== roleName);
            const allPermissions = Array.from(new Set(updatedRoles.flatMap(r => r.permissions)));
            await firebase_1.db.collection('users').doc(uid).update({
                roles: updatedRoles,
                permissions: allPermissions,
                updatedAt: new Date()
            });
            await this.auditService.log({
                userId: adminUserId,
                action: 'role_removed',
                resource: 'user',
                resourceId: uid,
                metadata: { roleName, removedBy: adminUserId }
            });
            logger_1.logger.info(`Role ${roleName} removed from user ${uid} by ${adminUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Remove role error:', error);
            throw new Error(`Failed to remove role: ${error.message}`);
        }
    }
    async deactivateUser(uid, adminUserId) {
        try {
            await firebase_1.db.collection('users').doc(uid).update({
                isActive: false,
                updatedAt: new Date()
            });
            await firebase_1.auth.updateUser(uid, { disabled: true });
            await this.auditService.log({
                userId: adminUserId,
                action: 'user_deactivated',
                resource: 'user',
                resourceId: uid,
                metadata: { deactivatedBy: adminUserId }
            });
            logger_1.logger.info(`User deactivated: ${uid} by ${adminUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Deactivate user error:', error);
            throw new Error('Failed to deactivate user');
        }
    }
    async activateUser(uid, adminUserId) {
        try {
            await firebase_1.db.collection('users').doc(uid).update({
                isActive: true,
                updatedAt: new Date()
            });
            await firebase_1.auth.updateUser(uid, { disabled: false });
            await this.auditService.log({
                userId: adminUserId,
                action: 'user_activated',
                resource: 'user',
                resourceId: uid,
                metadata: { activatedBy: adminUserId }
            });
            logger_1.logger.info(`User activated: ${uid} by ${adminUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Activate user error:', error);
            throw new Error('Failed to activate user');
        }
    }
    async getAllUsers(params) {
        try {
            let query = firebase_1.db.collection('users');
            if (params.role) {
                query = query.where('roles', 'array-contains-any', [params.role]);
            }
            if (params.isActive !== undefined) {
                query = query.where('isActive', '==', params.isActive);
            }
            const countSnapshot = await query.count().get();
            const total = countSnapshot.data().count;
            const limit = params.limit || 20;
            const page = params.page || 1;
            const offset = (page - 1) * limit;
            if (offset > 0) {
                query = query.offset(offset);
            }
            query = query.limit(limit).orderBy('createdAt', 'desc');
            const snapshot = await query.get();
            const users = snapshot.docs.map(doc => {
                const userData = doc.data();
                return {
                    uid: userData.uid,
                    email: userData.email,
                    displayName: userData.displayName,
                    emailVerified: userData.emailVerified,
                    roles: userData.roles.map(r => r.name),
                    isActive: userData.isActive,
                    createdAt: userData.createdAt,
                    lastLoginAt: userData.lastLoginAt
                };
            });
            return { users, total };
        }
        catch (error) {
            logger_1.logger.error('Get all users error:', error);
            throw new Error('Failed to fetch users');
        }
    }
    async getRoleByName(roleName) {
        try {
            const roleDoc = await firebase_1.db.collection('roles').doc(roleName).get();
            if (!roleDoc.exists) {
                return null;
            }
            return roleDoc.data();
        }
        catch (error) {
            logger_1.logger.error('Get role by name error:', error);
            throw new Error('Failed to fetch role');
        }
    }
    async createRole(roleData, adminUserId) {
        try {
            const roleId = roleData.name.toLowerCase().replace(/\s+/g, '_');
            const role = {
                id: roleId,
                ...roleData
            };
            await firebase_1.db.collection('roles').doc(roleId).set(role);
            await this.auditService.log({
                userId: adminUserId,
                action: 'role_created',
                resource: 'role',
                resourceId: roleId,
                metadata: { roleName: role.name, permissions: role.permissions }
            });
            logger_1.logger.info(`Role created: ${role.name} by ${adminUserId}`);
            return role;
        }
        catch (error) {
            logger_1.logger.error('Create role error:', error);
            throw new Error('Failed to create role');
        }
    }
    async updateRole(roleId, updates, adminUserId) {
        try {
            const existingRole = await firebase_1.db.collection('roles').doc(roleId).get();
            if (!existingRole.exists) {
                throw new Error('Role not found');
            }
            const roleData = existingRole.data();
            if (roleData.isSystem) {
                throw new Error('Cannot update system role');
            }
            await firebase_1.db.collection('roles').doc(roleId).update(updates);
            const updatedRole = await this.getRoleByName(roleId);
            if (!updatedRole) {
                throw new Error('Role not found after update');
            }
            await this.updateUserPermissionsForRole(roleId, updatedRole.permissions);
            await this.auditService.log({
                userId: adminUserId,
                action: 'role_updated',
                resource: 'role',
                resourceId: roleId,
                metadata: { updatedFields: Object.keys(updates) }
            });
            logger_1.logger.info(`Role updated: ${roleId} by ${adminUserId}`);
            return updatedRole;
        }
        catch (error) {
            logger_1.logger.error('Update role error:', error);
            throw new Error(`Failed to update role: ${error.message}`);
        }
    }
    async deleteRole(roleId, adminUserId) {
        try {
            const roleDoc = await firebase_1.db.collection('roles').doc(roleId).get();
            if (!roleDoc.exists) {
                throw new Error('Role not found');
            }
            const roleData = roleDoc.data();
            if (roleData.isSystem) {
                throw new Error('Cannot delete system role');
            }
            const usersWithRole = await firebase_1.db.collection('users')
                .where('roles', 'array-contains-any', [roleData])
                .get();
            if (!usersWithRole.empty) {
                throw new Error('Cannot delete role that is assigned to users');
            }
            await firebase_1.db.collection('roles').doc(roleId).delete();
            await this.auditService.log({
                userId: adminUserId,
                action: 'role_deleted',
                resource: 'role',
                resourceId: roleId,
                metadata: { roleName: roleData.name }
            });
            logger_1.logger.info(`Role deleted: ${roleId} by ${adminUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Delete role error:', error);
            throw new Error(`Failed to delete role: ${error.message}`);
        }
    }
    async getAllRoles() {
        try {
            const snapshot = await firebase_1.db.collection('roles').orderBy('name').get();
            return snapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            logger_1.logger.error('Get all roles error:', error);
            throw new Error('Failed to fetch roles');
        }
    }
    async updateUserPermissionsForRole(roleId, newPermissions) {
        try {
            const usersSnapshot = await firebase_1.db.collection('users').get();
            const batch = firebase_1.db.batch();
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const hasRole = userData.roles.some(r => r.id === roleId);
                if (hasRole) {
                    const updatedRoles = userData.roles.map(r => r.id === roleId ? { ...r, permissions: newPermissions } : r);
                    const allPermissions = Array.from(new Set(updatedRoles.flatMap(r => r.permissions)));
                    batch.update(userDoc.ref, {
                        roles: updatedRoles,
                        permissions: allPermissions,
                        updatedAt: new Date()
                    });
                }
            }
            await batch.commit();
            logger_1.logger.info(`Updated permissions for all users with role: ${roleId}`);
        }
        catch (error) {
            logger_1.logger.error('Update user permissions for role error:', error);
            throw new Error('Failed to update user permissions');
        }
    }
    async initializeDefaultRoles() {
        try {
            const defaultRoles = [
                {
                    id: 'super_admin',
                    name: types_1.UserRoles.SUPER_ADMIN,
                    permissions: Object.values(types_1.Permission),
                    description: 'Full system access',
                    isSystem: true
                },
                {
                    id: 'admin',
                    name: types_1.UserRoles.ADMIN,
                    permissions: [
                        types_1.Permission.USER_READ,
                        types_1.Permission.USER_WRITE,
                        types_1.Permission.ADMIN_READ,
                        types_1.Permission.ADMIN_WRITE,
                        types_1.Permission.ROLE_READ,
                        types_1.Permission.ROLE_WRITE
                    ],
                    description: 'Administrative access',
                    isSystem: true
                },
                {
                    id: 'moderator',
                    name: types_1.UserRoles.MODERATOR,
                    permissions: [
                        types_1.Permission.USER_READ,
                        types_1.Permission.USER_WRITE
                    ],
                    description: 'Content moderation access',
                    isSystem: true
                },
                {
                    id: 'user',
                    name: types_1.UserRoles.USER,
                    permissions: [
                        types_1.Permission.USER_READ,
                        types_1.Permission.USER_WRITE
                    ],
                    description: 'Standard user access',
                    isSystem: true
                },
                {
                    id: 'guest',
                    name: types_1.UserRoles.GUEST,
                    permissions: [
                        types_1.Permission.USER_READ
                    ],
                    description: 'Read-only access',
                    isSystem: true
                }
            ];
            const batch = firebase_1.db.batch();
            for (const role of defaultRoles) {
                const roleRef = firebase_1.db.collection('roles').doc(role.id);
                const existingRole = await roleRef.get();
                if (!existingRole.exists) {
                    batch.set(roleRef, role);
                }
            }
            await batch.commit();
            logger_1.logger.info('Default roles initialized');
        }
        catch (error) {
            logger_1.logger.error('Initialize default roles error:', error);
            throw new Error('Failed to initialize default roles');
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map