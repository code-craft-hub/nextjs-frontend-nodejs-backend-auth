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
export declare class AuditService {
    private collectionName;
    log(params: {
        userId: string | null;
        action: string;
        resource: string;
        resourceId?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
        success?: boolean;
        errorMessage?: string;
    }): Promise<void>;
    getAuditLogs(params: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    getSecurityEvents(params: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<AuditLog[]>;
}
//# sourceMappingURL=audit.service.d.ts.map