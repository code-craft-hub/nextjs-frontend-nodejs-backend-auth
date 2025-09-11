import { auth, db } from '../config/firebase';
import { User, UserRole, Permission, UserRoles } from '../types';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';

export class UserService {
  private auditService = new AuditService();

  async getUserById(uid: string): Promise<User | null> {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return null;
      }
      return userDoc.data() as User;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async updateUser(uid: string, updates: Partial<User>, adminUserId?: string): Promise<User> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await db.collection('users').doc(uid).update(updateData);
      
      const updatedUser = await this.getUserById(uid);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      // Log audit event
      await this.auditService.log({
        userId: adminUserId || uid,
        action: 'user_updated',
        resource: 'user',
        resourceId: uid,
        metadata: { updatedFields: Object.keys(updates) }
      });

      logger.info(`User updated: ${uid}`);
      return updatedUser;
    } catch (error) {
      logger.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  }

  async assignRole(uid: string, roleName: string, adminUserId: string): Promise<void> {
    try {
      const user = await this.getUserById(uid);
      if (!user) {
        throw new Error('User not found');
      }

      const role = await this.getRoleByName(roleName);
      if (!role) {
        throw new Error('Role not found');
      }

      // Check if user already has the role
      const hasRole = user.roles.some(r => r.name === roleName);
      if (hasRole) {
        throw new Error('User already has this role');
      }

      const updatedRoles = [...user.roles, role];
      const allPermissions = Array.from(new Set(
        updatedRoles.flatMap(r => r.permissions)
      ));

      await db.collection('users').doc(uid).update({
        roles: updatedRoles,
        permissions: allPermissions,
        updatedAt: new Date()
      });

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'role_assigned',
        resource: 'user',
        resourceId: uid,
        metadata: { roleName, assignedBy: adminUserId }
      });

      logger.info(`Role ${roleName} assigned to user ${uid} by ${adminUserId}`);
    } catch (error) {
      logger.error('Assign role error:', error);
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  async removeRole(uid: string, roleName: string, adminUserId: string): Promise<void> {
    try {
      const user = await this.getUserById(uid);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent removing system roles
      const roleToRemove = user.roles.find(r => r.name === roleName);
      if (roleToRemove?.isSystem) {
        throw new Error('Cannot remove system role');
      }

      const updatedRoles = user.roles.filter(r => r.name !== roleName);
      const allPermissions = Array.from(new Set(
        updatedRoles.flatMap(r => r.permissions)
      ));

      await db.collection('users').doc(uid).update({
        roles: updatedRoles,
        permissions: allPermissions,
        updatedAt: new Date()
      });

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'role_removed',
        resource: 'user',
        resourceId: uid,
        metadata: { roleName, removedBy: adminUserId }
      });

      logger.info(`Role ${roleName} removed from user ${uid} by ${adminUserId}`);
    } catch (error) {
      logger.error('Remove role error:', error);
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  }

  async deactivateUser(uid: string, adminUserId: string): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        isActive: false,
        updatedAt: new Date()
      });

      // Disable user in Firebase Auth
      await auth.updateUser(uid, { disabled: true });

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'user_deactivated',
        resource: 'user',
        resourceId: uid,
        metadata: { deactivatedBy: adminUserId }
      });

      logger.info(`User deactivated: ${uid} by ${adminUserId}`);
    } catch (error) {
      logger.error('Deactivate user error:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  async activateUser(uid: string, adminUserId: string): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        isActive: true,
        updatedAt: new Date()
      });

      // Enable user in Firebase Auth
      await auth.updateUser(uid, { disabled: false });

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'user_activated',
        resource: 'user',
        resourceId: uid,
        metadata: { activatedBy: adminUserId }
      });

      logger.info(`User activated: ${uid} by ${adminUserId}`);
    } catch (error) {
      logger.error('Activate user error:', error);
      throw new Error('Failed to activate user');
    }
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<{ users: Partial<User>[]; total: number }> {
    try {
      let query = db.collection('users');

      // Apply filters
      if (params.role) {
        query = query.where('roles', 'array-contains-any', [params.role]);
      }
      if (params.isActive !== undefined) {
        query = query.where('isActive', '==', params.isActive);
      }

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply pagination
      const limit = params.limit || 20;
      const page = params.page || 1;
      const offset = (page - 1) * limit;

      if (offset > 0) {
        query = query.offset(offset);
      }
      query = query.limit(limit).orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      const users: Partial<User>[] = snapshot.docs.map(doc => {
        const userData = doc.data() as User;
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
    } catch (error) {
      logger.error('Get all users error:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getRoleByName(roleName: string): Promise<UserRole | null> {
    try {
      const roleDoc = await db.collection('roles').doc(roleName).get();
      if (!roleDoc.exists) {
        return null;
      }
      return roleDoc.data() as UserRole;
    } catch (error) {
      logger.error('Get role by name error:', error);
      throw new Error('Failed to fetch role');
    }
  }

  async createRole(roleData: Omit<UserRole, 'id'>, adminUserId: string): Promise<UserRole> {
    try {
      const roleId = roleData.name.toLowerCase().replace(/\s+/g, '_');
      
      const role: UserRole = {
        id: roleId,
        ...roleData
      };

      await db.collection('roles').doc(roleId).set(role);

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'role_created',
        resource: 'role',
        resourceId: roleId,
        metadata: { roleName: role.name, permissions: role.permissions }
      });

      logger.info(`Role created: ${role.name} by ${adminUserId}`);
      return role;
    } catch (error) {
      logger.error('Create role error:', error);
      throw new Error('Failed to create role');
    }
  }

  async updateRole(roleId: string, updates: Partial<UserRole>, adminUserId: string): Promise<UserRole> {
    try {
      const existingRole = await db.collection('roles').doc(roleId).get();
      if (!existingRole.exists) {
        throw new Error('Role not found');
      }

      const roleData = existingRole.data() as UserRole;
      
      // Prevent updating system roles
      if (roleData.isSystem) {
        throw new Error('Cannot update system role');
      }

      await db.collection('roles').doc(roleId).update(updates);

      const updatedRole = await this.getRoleByName(roleId);
      if (!updatedRole) {
        throw new Error('Role not found after update');
      }

      // Update permissions for all users with this role
      await this.updateUserPermissionsForRole(roleId, updatedRole.permissions);

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'role_updated',
        resource: 'role',
        resourceId: roleId,
        metadata: { updatedFields: Object.keys(updates) }
      });

      logger.info(`Role updated: ${roleId} by ${adminUserId}`);
      return updatedRole;
    } catch (error) {
      logger.error('Update role error:', error);
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  async deleteRole(roleId: string, adminUserId: string): Promise<void> {
    try {
      const roleDoc = await db.collection('roles').doc(roleId).get();
      if (!roleDoc.exists) {
        throw new Error('Role not found');
      }

      const roleData = roleDoc.data() as UserRole;
      
      // Prevent deleting system roles
      if (roleData.isSystem) {
        throw new Error('Cannot delete system role');
      }

      // Check if any users have this role
      const usersWithRole = await db.collection('users')
        .where('roles', 'array-contains-any', [roleData])
        .get();

      if (!usersWithRole.empty) {
        throw new Error('Cannot delete role that is assigned to users');
      }

      await db.collection('roles').doc(roleId).delete();

      // Log audit event
      await this.auditService.log({
        userId: adminUserId,
        action: 'role_deleted',
        resource: 'role',
        resourceId: roleId,
        metadata: { roleName: roleData.name }
      });

      logger.info(`Role deleted: ${roleId} by ${adminUserId}`);
    } catch (error) {
      logger.error('Delete role error:', error);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  async getAllRoles(): Promise<UserRole[]> {
    try {
      const snapshot = await db.collection('roles').orderBy('name').get();
      return snapshot.docs.map(doc => doc.data() as UserRole);
    } catch (error) {
      logger.error('Get all roles error:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  private async updateUserPermissionsForRole(roleId: string, newPermissions: string[]): Promise<void> {
    try {
      // Get all users with this role
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        const hasRole = userData.roles.some(r => r.id === roleId);
        
        if (hasRole) {
          // Update the role in user's roles array
          const updatedRoles = userData.roles.map(r => 
            r.id === roleId ? { ...r, permissions: newPermissions } : r
          );
          
          // Recalculate all permissions
          const allPermissions = Array.from(new Set(
            updatedRoles.flatMap(r => r.permissions)
          ));

          batch.update(userDoc.ref, {
            roles: updatedRoles,
            permissions: allPermissions,
            updatedAt: new Date()
          });
        }
      }

      await batch.commit();
      logger.info(`Updated permissions for all users with role: ${roleId}`);
    } catch (error) {
      logger.error('Update user permissions for role error:', error);
      throw new Error('Failed to update user permissions');
    }
  }

  async initializeDefaultRoles(): Promise<void> {
    try {
      const defaultRoles: UserRole[] = [
        {
          id: 'super_admin',
          name: UserRoles.SUPER_ADMIN,
          permissions: Object.values(Permission),
          description: 'Full system access',
          isSystem: true
        },
        {
          id: 'admin',
          name: UserRoles.ADMIN,
          permissions: [
            Permission.USER_READ,
            Permission.USER_WRITE,
            Permission.ADMIN_READ,
            Permission.ADMIN_WRITE,
            Permission.ROLE_READ,
            Permission.ROLE_WRITE
          ],
          description: 'Administrative access',
          isSystem: true
        },
        {
          id: 'moderator',
          name: UserRoles.MODERATOR,
          permissions: [
            Permission.USER_READ,
            Permission.USER_WRITE
          ],
          description: 'Content moderation access',
          isSystem: true
        },
        {
          id: 'user',
          name: UserRoles.USER,
          permissions: [
            Permission.USER_READ,
            Permission.USER_WRITE
          ],
          description: 'Standard user access',
          isSystem: true
        },
        {
          id: 'guest',
          name: UserRoles.GUEST,
          permissions: [
            Permission.USER_READ
          ],
          description: 'Read-only access',
          isSystem: true
        }
      ];

      const batch = db.batch();
      
      for (const role of defaultRoles) {
        const roleRef = db.collection('roles').doc(role.id);
        const existingRole = await roleRef.get();
        
        if (!existingRole.exists) {
          batch.set(roleRef, role);
        }
      }

      await batch.commit();
      logger.info('Default roles initialized');
    } catch (error) {
      logger.error('Initialize default roles error:', error);
      throw new Error('Failed to initialize default roles');
    }
  }
}