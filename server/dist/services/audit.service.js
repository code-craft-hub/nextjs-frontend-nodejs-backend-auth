"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
class AuditService {
    constructor() {
        this.collectionName = 'audit_logs';
    }
    async log(params) {
        try {
            const auditLog = {
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
            await firebase_1.db.collection(this.collectionName).add(auditLog);
            logger_1.logger.info('Audit log created', {
                userId: params.userId,
                action: params.action,
                resource: params.resource
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create audit log:', error);
        }
    }
    async getAuditLogs(params) {
        try {
            let query = firebase_1.db.collection(this.collectionName).orderBy('timestamp', 'desc');
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
            const limit = params.limit || 50;
            const offset = params.offset || 0;
            const countSnapshot = await query.count().get();
            const total = countSnapshot.data().count;
            if (offset > 0) {
                query = query.offset(offset);
            }
            query = query.limit(limit);
            const snapshot = await query.get();
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { logs, total };
        }
        catch (error) {
            logger_1.logger.error('Failed to retrieve audit logs:', error);
            throw new Error('Failed to retrieve audit logs');
        }
    }
    async getSecurityEvents(params) {
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
            let query = firebase_1.db.collection(this.collectionName)
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
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return logs;
        }
        catch (error) {
            logger_1.logger.error('Failed to retrieve security events:', error);
            throw new Error('Failed to retrieve security events');
        }
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map