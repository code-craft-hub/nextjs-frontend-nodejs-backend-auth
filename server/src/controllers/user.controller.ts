import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserService } from '../services/user.service';
import { AuditService } from '../services/audit.service';
import { AuthRequest } from '../types';
import { createApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class UserController {
  private userService = new UserService();
  private auditService = new AuditService();

  // Validation rules
  static updateUserValidation = [
    param('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    body('displayName').optional().isString().isLength({ min: 1, max: 50 }).trim(),
    body('phoneNumber').optional().isMobilePhone('any'),
    body('isActive').optional().isBoolean()
  ];

  static assignRoleValidation = [
    param('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    body('roleName').isString().isLength({ min: 1 }).withMessage('Role name is required')
  ];

  static removeRoleValidation = [
    param('uid').isString().isLength({ min: 1 }).withMessage('Valid user ID is required'),
    body('roleName').isString().isLength({ min: 1 }).withMessage('Role name is required')
  ];

  static createRoleValidation = [
    body('name').isString().isLength({ min: 1, max: 50 }).trim().withMessage('Role name is required'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('permissions.*').isString().withMessage('Each permission must be a string'),
    body('description').optional().isString().isLength({ max: 200 }).trim()
  ];

  static updateRoleValidation = [
    param('roleId').isString().isLength({ min: 1 }).withMessage('Valid role ID is required'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('permissions.*').optional().isString().withMessage('Each permission must be a string'),
    body('description').optional().isString().isLength({ max: 200 }).trim()
  ];

  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, role, isActive } = req.query;

      const params = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        role: role as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      };

      const result = await this.userService.getAllUsers(params);

      res.status(200).json(createApiResponse(true, {
        users: result.users,
        pagination: {
          current: params.page,
          limit: params.limit,
          total: result.total,
          pages: Math.ceil(result.total / params.limit)
        }
      }));
    } catch (error) {
      logger.error('Get all users controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'USERS_FETCH_FAILED',
        message: 'Failed to fetch users'
      }));
    }
  };

  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const user = await this.userService.getUserById(uid);

      if (!user) {
        res.status(404).json(createApiResponse(false, null, {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }));
        return;
      }

      res.status(200).json(createApiResponse(true, {
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
    } catch (error) {
      logger.error('Get user by ID controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'USER_FETCH_FAILED',
        message: 'Failed to fetch user'
      }));
    }
  };

  updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const { uid } = req.params;
      const updates = req.body;
      const adminUserId = req.user!.uid;

      const updatedUser = await this.userService.updateUser(uid, updates, adminUserId);

      res.status(200).json(createApiResponse(true, {
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
    } catch (error) {
      logger.error('Update user controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'USER_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update user'
      }));
    }
  };

  assignRole = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const { uid } = req.params;
      const { roleName } = req.body;
      const adminUserId = req.user!.uid;

      await this.userService.assignRole(uid, roleName, adminUserId);

      res.status(200).json(createApiResponse(true, {
        message: `Role ${roleName} assigned successfully`
      }));
    } catch (error) {
      logger.error('Assign role controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'ROLE_ASSIGNMENT_FAILED',
        message: error instanceof Error ? error.message : 'Failed to assign role'
      }));
    }
  };

  removeRole = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const { uid } = req.params;
      const { roleName } = req.body;
      const adminUserId = req.user!.uid;

      await this.userService.removeRole(uid, roleName, adminUserId);

      res.status(200).json(createApiResponse(true, {
        message: `Role ${roleName} removed successfully`
      }));
    } catch (error) {
      logger.error('Remove role controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'ROLE_REMOVAL_FAILED',
        message: error instanceof Error ? error.message : 'Failed to remove role'
      }));
    }
  };

  deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const adminUserId = req.user!.uid;

      await this.userService.deactivateUser(uid, adminUserId);

      res.status(200).json(createApiResponse(true, {
        message: 'User deactivated successfully'
      }));
    } catch (error) {
      logger.error('Deactivate user controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'USER_DEACTIVATION_FAILED',
        message: 'Failed to deactivate user'
      }));
    }
  };

  activateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.params;
      const adminUserId = req.user!.uid;

      await this.userService.activateUser(uid, adminUserId);

      res.status(200).json(createApiResponse(true, {
        message: 'User activated successfully'
      }));
    } catch (error) {
      logger.error('Activate user controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'USER_ACTIVATION_FAILED',
        message: 'Failed to activate user'
      }));
    }
  };

  getAllRoles = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const roles = await this.userService.getAllRoles();

      res.status(200).json(createApiResponse(true, { roles }));
    } catch (error) {
      logger.error('Get all roles controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'ROLES_FETCH_FAILED',
        message: 'Failed to fetch roles'
      }));
    }
  };

  createRole = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const roleData = req.body;
      const adminUserId = req.user!.uid;

      const role = await this.userService.createRole({
        name: roleData.name,
        permissions: roleData.permissions,
        description: roleData.description,
        isSystem: false
      }, adminUserId);

      res.status(201).json(createApiResponse(true, { role }));
    } catch (error) {
      logger.error('Create role controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'ROLE_CREATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create role'
      }));
    }
  };

  updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const { roleId } = req.params;
      const updates = req.body;
      const adminUserId = req.user!.uid;

      const role = await this.userService.updateRole(roleId, updates, adminUserId);

      res.status(200).json(createApiResponse(true, { role }));
    } catch (error) {
      logger.error('Update role controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'ROLE_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update role'
      }));
    }
  };

  deleteRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { roleId } = req.params;
      const adminUserId = req.user!.uid;

      await this.userService.deleteRole(roleId, adminUserId);

      res.status(200).json(createApiResponse(true, {
        message: 'Role deleted successfully'
      }));
    } catch (error) {
      logger.error('Delete role controller error:', error);
      res.status(400).json(createApiResponse(false, null, {
        code: 'ROLE_DELETION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete role'
      }));
    }
  };

  getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, action, resource, startDate, endDate, page, limit } = req.query;

      const params = {
        userId: userId as string,
        action: action as string,
        resource: resource as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: page ? (parseInt(page as string) - 1) * (limit ? parseInt(limit as string) : 50) : 0
      };

      const result = await this.auditService.getAuditLogs(params);

      res.status(200).json(createApiResponse(true, {
        logs: result.logs,
        pagination: {
          current: page ? parseInt(page as string) : 1,
          limit: params.limit,
          total: result.total,
          pages: Math.ceil(result.total / params.limit)
        }
      }));
    } catch (error) {
      logger.error('Get audit logs controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'AUDIT_LOGS_FETCH_FAILED',
        message: 'Failed to fetch audit logs'
      }));
    }
  };

  getSecurityEvents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, limit } = req.query;

      const params = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 100
      };

      const events = await this.auditService.getSecurityEvents(params);

      res.status(200).json(createApiResponse(true, { events }));
    } catch (error) {
      logger.error('Get security events controller error:', error);
      res.status(500).json(createApiResponse(false, null, {
        code: 'SECURITY_EVENTS_FETCH_FAILED',
        message: 'Failed to fetch security events'
      }));
    }
  };
}