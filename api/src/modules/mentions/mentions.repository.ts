import { prisma } from '../../shared/database/prisma.client';

export class MentionsRepository {
    async findById(id: string) {
        return await prisma.mention.findUnique({
            where: { id },
            include: { source: true, brand: true }
        });
    }

    async findMany(where: any, skip?: number, take?: number, orderBy?: any) {
        return await prisma.mention.findMany({
            where,
            include: { source: true, brand: true },
            skip,
            take,
            orderBy: orderBy || { publishedAt: 'desc' }
        });
    }

    async count(where: any) {
        return await prisma.mention.count({ where });
    }

    async create(data: any) {
        return await prisma.mention.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.mention.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.mention.delete({ where: { id } });
    }

    async deleteMany(ids: string[]) {
        return await prisma.mention.deleteMany({
            where: { id: { in: ids } }
        });
    }

    async updateMany(ids: string[], data: any) {
        return await prisma.mention.updateMany({
            where: { id: { in: ids } },
            data
        });
    }
}

export const mentionsRepository = new MentionsRepository();
