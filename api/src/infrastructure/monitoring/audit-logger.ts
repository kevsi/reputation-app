/**
 * 📋 Audit Logging Service
 * 
 * Log toutes les opérations critiques pour:
 * - Conformité (RGPD, SOC2, PCI-DSS)
 * - Forensic et investigation
 * - Détection d'anomalies
 */

import { prisma } from '@/shared/database/prisma.client';
import { logger } from '@/infrastructure/logger';

export enum AuditAction {
    // Auth
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    LOGIN_FAILED = 'LOGIN_FAILED',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
    PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
    TOKEN_REFRESHED = 'TOKEN_REFRESHED',
    TOKEN_REVOKED = 'TOKEN_REVOKED',
    WEB_AUTH_ENABLED = 'WEB_AUTH_ENABLED',
    WEB_AUTH_DISABLED = 'WEB_AUTH_DISABLED',
    
    // Données
    DATA_EXPORTED = 'DATA_EXPORTED',
    DATA_DELETED = 'DATA_DELETED',
    DATA_ACCESSED = 'DATA_ACCESSED',
    
    // Ressources
    RESOURCE_CREATED = 'RESOURCE_CREATED',
    RESOURCE_UPDATED = 'RESOURCE_UPDATED',
    RESOURCE_DELETED = 'RESOURCE_DELETED',
    
    // Sécurité
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    ATTACK_DETECTED = 'ATTACK_DETECTED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    
    // Admin
    USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
    ORGANIZATION_CREATED = 'ORGANIZATION_CREATED',
    SUBSCRIPTION_CHANGED = 'SUBSCRIPTION_CHANGED',
}

export interface AuditLogEntry {
    id?: string;
    userId?: string;
    organizationId?: string;
    action: AuditAction;
    resource?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    status: 'success' | 'failure';
    errorMessage?: string;
    timestamp?: Date;
}

class AuditService {
    /**
     * Créer une entrée d'audit
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            // Stocker en base de données
            await prisma.activityLog.create({
                data: {
                    action: entry.action,
                    entity: entry.resource || 'SYSTEM',
                    entityId: entry.resourceId,
                    description: `${entry.action} - ${entry.status}`,
                    metadata: {
                        ...entry.metadata,
                        ipAddress: entry.ipAddress,
                        userAgent: entry.userAgent,
                        errorMessage: entry.errorMessage,
                    },
                    userId: entry.userId,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                },
            });

            // Logger également pour le monitoring
            logger.info(`[AUDIT] ${entry.action}`, {
                userId: entry.userId,
                organizationId: entry.organizationId,
                action: entry.action,
                resource: entry.resource,
                resourceId: entry.resourceId,
                status: entry.status,
                ip: entry.ipAddress,
            });
        } catch (error) {
            // Ne pas bloquer l'opération si l'audit échoue
            logger.error('Failed to write audit log', error);
        }
    }

    /**
     * Log simplifié pour les actions auth
     */
    async logAuth(
        action: AuditAction,
        userId: string,
        organizationId: string | null,
        req: Request,
        status: 'success' | 'failure',
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.log({
            userId,
            organizationId: organizationId || undefined,
            action,
            ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
            userAgent: req.headers['user-agent'],
            status,
            metadata,
        });
    }

    /**
     * Récupérer les logs d'audit (admin)
     */
    async getAuditLogs(filters: {
        userId?: string;
        organizationId?: string;
        action?: AuditAction;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{ data: any[]; total: number }> {
        const where: any = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.organizationId) where.metadata = { organizationId: filters.organizationId };
        if (filters.action) where.action = filters.action;
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = filters.startDate;
            if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        const [data, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: filters.limit || 50,
                skip: filters.offset || 0,
            }),
            prisma.activityLog.count({ where }),
        ]);

        return { data, total };
    }

    /**
     * Exporter les logs pour compliance
     */
    async exportLogs(
        organizationId: string,
        startDate: Date,
        endDate: Date,
        format: 'json' | 'csv' = 'json'
    ): Promise<{ data: any; filename: string }> {
        const logs = await prisma.activityLog.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                // Filtrer par organisation via metadata
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: logs,
            filename: `audit_logs_${organizationId}_${startDate.toISOString()}_${endDate.toISOString()}.${format}`,
        };
    }

    /**
     * Détecter les activités suspectes
     */
    async detectSuspiciousActivity(userId: string): Promise<{
        suspicious: boolean;
        reasons: string[];
    }> {
        const recentLogs = await prisma.activityLog.findMany({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24h
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        const reasons: string[] = [];
        let failedLogins = 0;
        let differentIPs = new Set<string>();

        for (const log of recentLogs) {
            if (log.action === AuditAction.LOGIN_FAILED) {
                failedLogins++;
            }
            if (log.ipAddress) {
                differentIPs.add(log.ipAddress);
            }
        }

        // Seuils suspects
        if (failedLogins > 10) {
            reasons.push('Trop de tentatives de connexion échouées (10+)');
        }
        if (differentIPs.size > 5) {
            reasons.push(`Trop d'adresses IP différentes (${differentIPs.size})`);
        }

        return {
            suspicious: reasons.length > 0,
            reasons,
        };
    }
}

export const auditService = new AuditService();

// Import Request pour le typage
import { Request } from 'express';
