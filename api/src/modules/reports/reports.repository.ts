import { prisma } from '../../shared/database/prisma.client';

export class ReportsRepository {
    async findById(id: string, include?: any) {
        return await prisma.report.findUnique({
            where: { id },
            include
        });
    }

    async findMany(where: any, skip?: number, take?: number, orderBy?: any) {
        return await prisma.report.findMany({
            where,
            include: { brand: true },
            skip,
            take,
            orderBy: orderBy || { createdAt: 'desc' }
        });
    }

    async count(where: any) {
        return await prisma.report.count({ where });
    }

    async create(data: any) {
        return await prisma.report.create({ data });
    }

    async delete(id: string) {
        return await prisma.report.delete({ where: { id } });
    }
}

export const reportsRepository = new ReportsRepository();
