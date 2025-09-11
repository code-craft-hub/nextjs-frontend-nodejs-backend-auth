import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export interface AuditLog {
  id?: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class AuditService {
  private collectionName = 'audit_logs';

  async log(params: {
    userId: string | null;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const auditLog: AuditLog = {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
        metadata: params.metadata,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
      };

      await db.collection(this.collectionName).add(auditLog);
      
      logger.info('Audit log created', { 
        userId: params.userId, 
        action: params.action, 
        resource: params.resource 
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async getAuditLogs(params: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = db.collection(this.collectionName).orderBy('timestamp', 'desc');

      // Apply filters
      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.action) {
        query = query.where('action', '==', params.action);
      }
      if (params.resource) {
        query = query.where('resource', '==', params.resource);
      }
      if (params.startDate) {
        query = query.where('timestamp', '>=', params.startDate);
      }
      if (params.endDate) {
        query = query.where('timestamp', '<=', params.endDate);
      }

      // Apply pagination
      const limit = params.limit || 50;
      const offset = params.offset || 0;

      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      if (offset > 0) {
        query = query.offset(offset);
      }
      query = query.limit(limit);

      const snapshot = await query.get();
      const logs: AuditLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));

      return { logs, total };
    } catch (error) {
      logger.error('Failed to retrieve audit logs:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  async getSecurityEvents(params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      const securityActions = [
        'login_failed',
        'password_changed',
        'password_reset_requested',
        'account_locked',
        'suspicious_activity',
        'token_reuse_detected',
        'all_sessions_invalidated'
      ];

      let query = db.collection(this.collectionName)
        .where('action', 'in', securityActions)
        .orderBy('timestamp', 'desc');

      if (params.startDate) {
        query = query.where('timestamp', '>=', params.startDate);
      }
      if (params.endDate) {
        query = query.where('timestamp', '<=', params.endDate);
      }

      const limit = params.limit || 100;
      query = query.limit(limit);

      const snapshot = await query.get();
      const logs: AuditLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));

      return logs;
    } catch (error) {
      logger.error('Failed to retrieve security events:', error);
      throw new Error('Failed to retrieve security events');
    }
  }
}