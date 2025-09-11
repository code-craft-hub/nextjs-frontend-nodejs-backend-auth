"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_validator_1 = require("express-validator");
const user_service_1 = require("../services/user.service");
const audit_service_1 = require("../services/audit.service");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        this.auditService = new audit_service_1.AuditService();
        this.getAllUsers = async (req, res) => {
            try {
                const { page, limit, role, isActive } = req.query;
                const params = {
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 20,
                    role: role,
                    isActive: isActive !== undefined ? isActive === 'true' : undefined
                };
                const result = await this.userService.getAllUsers(params);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    users: result.users,
                    pagination: {
                        current: params.page,
                        limit: params.limit,
                        total: result.total,
                        pages: Math.ceil(result.total / params.limit)
                    }
                }));
            }
            catch (error) {
                logger_1.logger.error('Get all users controller error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, null, {
                    code: 'USERS_FETCH_FAILED',
                    message: 'Failed to fetch users'
                }));
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const { uid } = req.params;
                const user = await this.userService.getUserById(uid);
                if (!user) {
                    res.status(404).json((0, response_1.createApiResponse)(false, null, {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }));
                    return;
                }
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        emailVerified: user.emailVerified,
                        phoneNumber: user.phoneNumber,
                        roles: user.roles.map(r => r.name),
                        permissions: user.permissions,
                        isActive: user.isActive,
                        createdAt: user.createdAt,
                        lastLoginAt: user.lastLoginAt
                    }
                }));
            }
            catch (error) {
                logger_1.logger.error('Get user by ID controller error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, null, {
                    code: 'USER_FETCH_FAILED',
                    message: 'Failed to fetch user'
                }));
            }
        };
        this.updateUser = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json((0, response_1.createApiResponse)(false, null, {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.array()
                    }));
                    return;
                }
                const { uid } = req.params;
                const updates = req.body;
                const adminUserId = req.user.uid;
                const updatedUser = await this.userService.updateUser(uid, updates, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    user: {
                        uid: updatedUser.uid,
                        email: updatedUser.email,
                        displayName: updatedUser.displayName,
                        emailVerified: updatedUser.emailVerified,
                        phoneNumber: updatedUser.phoneNumber,
                        roles: updatedUser.roles.map(r => r.name),
                        permissions: updatedUser.permissions,
                        isActive: updatedUser.isActive,
                        updatedAt: updatedUser.updatedAt
                    }
                }));
            }
            catch (error) {
                logger_1.logger.error('Update user controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'USER_UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to update user'
                }));
            }
        };
        this.assignRole = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json((0, response_1.createApiResponse)(false, null, {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.array()
                    }));
                    return;
                }
                const { uid } = req.params;
                const { roleName } = req.body;
                const adminUserId = req.user.uid;
                await this.userService.assignRole(uid, roleName, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    message: `Role ${roleName} assigned successfully`
                }));
            }
            catch (error) {
                logger_1.logger.error('Assign role controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLE_ASSIGNMENT_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to assign role'
                }));
            }
        };
        this.removeRole = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json((0, response_1.createApiResponse)(false, null, {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.array()
                    }));
                    return;
                }
                const { uid } = req.params;
                const { roleName } = req.body;
                const adminUserId = req.user.uid;
                await this.userService.removeRole(uid, roleName, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    message: `Role ${roleName} removed successfully`
                }));
            }
            catch (error) {
                logger_1.logger.error('Remove role controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLE_REMOVAL_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to remove role'
                }));
            }
        };
        this.deactivateUser = async (req, res) => {
            try {
                const { uid } = req.params;
                const adminUserId = req.user.uid;
                await this.userService.deactivateUser(uid, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    message: 'User deactivated successfully'
                }));
            }
            catch (error) {
                logger_1.logger.error('Deactivate user controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'USER_DEACTIVATION_FAILED',
                    message: 'Failed to deactivate user'
                }));
            }
        };
        this.activateUser = async (req, res) => {
            try {
                const { uid } = req.params;
                const adminUserId = req.user.uid;
                await this.userService.activateUser(uid, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    message: 'User activated successfully'
                }));
            }
            catch (error) {
                logger_1.logger.error('Activate user controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'USER_ACTIVATION_FAILED',
                    message: 'Failed to activate user'
                }));
            }
        };
        this.getAllRoles = async (req, res) => {
            try {
                const roles = await this.userService.getAllRoles();
                res.status(200).json((0, response_1.createApiResponse)(true, { roles }));
            }
            catch (error) {
                logger_1.logger.error('Get all roles controller error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLES_FETCH_FAILED',
                    message: 'Failed to fetch roles'
                }));
            }
        };
        this.createRole = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json((0, response_1.createApiResponse)(false, null, {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.array()
                    }));
                    return;
                }
                const roleData = req.body;
                const adminUserId = req.user.uid;
                const role = await this.userService.createRole({
                    name: roleData.name,
                    permissions: roleData.permissions,
                    description: roleData.description,
                    isSystem: false
                }, adminUserId);
                res.status(201).json((0, response_1.createApiResponse)(true, { role }));
            }
            catch (error) {
                logger_1.logger.error('Create role controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLE_CREATION_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to create role'
                }));
            }
        };
        this.updateRole = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json((0, response_1.createApiResponse)(false, null, {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: errors.array()
                    }));
                    return;
                }
                const { roleId } = req.params;
                const updates = req.body;
                const adminUserId = req.user.uid;
                const role = await this.userService.updateRole(roleId, updates, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, { role }));
            }
            catch (error) {
                logger_1.logger.error('Update role controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLE_UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to update role'
                }));
            }
        };
        this.deleteRole = async (req, res) => {
            try {
                const { roleId } = req.params;
                const adminUserId = req.user.uid;
                await this.userService.deleteRole(roleId, adminUserId);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    message: 'Role deleted successfully'
                }));
            }
            catch (error) {
                logger_1.logger.error('Delete role controller error:', error);
                res.status(400).json((0, response_1.createApiResponse)(false, null, {
                    code: 'ROLE_DELETION_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to delete role'
                }));
            }
        };
        this.getAuditLogs = async (req, res) => {
            try {
                const { userId, action, resource, startDate, endDate, page, limit } = req.query;
                const params = {
                    userId: userId,
                    action: action,
                    resource: resource,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    limit: limit ? parseInt(limit) : 50,
                    offset: page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 50) : 0
                };
                const result = await this.auditService.getAuditLogs(params);
                res.status(200).json((0, response_1.createApiResponse)(true, {
                    logs: result.logs,
                    pagination: {
                        current: page ? parseInt(page) : 1,
                        limit: params.limit,
                        total: result.total,
                        pages: Math.ceil(result.total / params.limit)
                    }
                }));
            }
            catch (error) {
                logger_1.logger.error('Get audit logs controller error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, null, {
                    code: 'AUDIT_LOGS_FETCH_FAILED',
                    message: 'Failed to fetch audit logs'
                }));
            }
        };
        this.getSecurityEvents = async (req, res) => {
            try {
                const { startDate, endDate, limit } = req.query;
                const params = {
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    limit: limit ? parseInt(limit) : 100
                };
                const events = await this.auditService.getSecurityEvents(params);
                res.status(200).json((0, response_1.createApiResponse)(true, { events }));
            }
            catch (error) {
                logger_1.logger.error('Get security events controller error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, null, {
                    code: 'SECURITY_EVENTS_FETCH_FAILED',
                    message: 'Failed to fetch security events'
                }));
            }
        };
    }
}
exports.UserController = UserController;
UserController.updateUserValidation = [
    (0, express_validator_1.param)('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('displayName').optional().isString().isLength({ min: 1, max: 50 }).trim(),
    (0, express_validator_1.body)('phoneNumber').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
];
UserController.assignRoleValidation = [
    (0, express_validator_1.param)('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('roleName').isString().isLength({ min: 1 }).withMessage('Role name is required')
];
UserController.removeRoleValidation = [
    (0, express_validator_1.param)('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    (0, express_validator_1.body)('roleName').isString().isLength({ min: 1 }).withMessage('Role name is required')
];
UserController.createRoleValidation = [
    (0, express_validator_1.body)('name').isString().isLength({ min: 1, max: 50 }).trim().withMessage('Role name is required'),
    (0, express_validator_1.body)('permissions').isArray().withMessage('Permissions must be an array'),
    (0, express_validator_1.body)('permissions.*').isString().withMessage('Each permission must be a string'),
    (0, express_validator_1.body)('description').optional().isString().isLength({ max: 200 }).trim()
];
UserController.updateRoleValidation = [
    (0, express_validator_1.param)('roleId').isString().isLength({ min: 1 }).withMessage('Valid role ID is required'),
    (0, express_validator_1.body)('permissions').optional().isArray().withMessage('Permissions must be an array'),
    (0, express_validator_1.body)('permissions.*').optional().isString().withMessage('Each permission must be a string'),
    (0, express_validator_1.body)('description').optional().isString().isLength({ max: 200 }).trim()
];
//# sourceMappingURL=user.controller.js.map