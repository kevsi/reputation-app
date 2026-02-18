import { prisma } from '../../shared/database/prisma.client';

export class AlertsRepository {
    async findById(id: string, include?: any) {
        return await prisma.alert.findUnique({
            where: { id },
            include
        });
    }

    async findMany(where: any, skip?: number, take?: number, orderBy?: any) {
        return await prisma.alert.findMany({
            where,
            include: { brand: true },
            skip,
            take,
            orderBy: orderBy || { createdAt: 'desc' }
        });
    }

    async count(where: any) {
        return await prisma.alert.count({ where });
    }

    async create(data: any) {
        return await prisma.alert.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.alert.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.alert.delete({ where: { id } });
    }

    // Alert Rules
    async deleteRulesByAlertId(alertId: string) {
        return await prisma.alertRule.deleteMany({ where: { alertId } });
    }

    // Alert Triggers
    async findTriggers(where: any, take?: number) {
        return await prisma.alertTrigger.findMany({
            where,
            include: { mention: true },
            orderBy: { createdAt: 'desc' },
            take
        });
    }

    async findUsersByOrganizationId(organizationId: string) {
        return await prisma.user.findMany({
            where: { organizationId }
        });
    }
}

export const alertsRepository = new AlertsRepository();
