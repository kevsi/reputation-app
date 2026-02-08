import { prisma } from '../../shared/database/prisma.client';

export class ActionsRepository {
    async findById(id: string, include?: any) {
        return await prisma.action.findUnique({
            where: { id },
            include
        });
    }

    async findMany(where: any, skip?: number, take?: number, orderBy?: any) {
        return await prisma.action.findMany({
            where,
            include: { assignedTo: { select: { id: true, name: true, email: true } } },
            skip,
            take,
            orderBy: orderBy || { createdAt: 'desc' }
        });
    }

    async count(where: any) {
        return await prisma.action.count({ where });
    }

    async create(data: any) {
        return await prisma.action.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.action.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.action.delete({ where: { id } });
    }
}

export const actionsRepository = new ActionsRepository();
