import { prisma } from '../../shared/database/prisma.client';

export class BrandsRepository {
    async findById(id: string, include?: any) {
        return await prisma.brand.findUnique({
            where: { id },
            include
        });
    }

    async findMany(where: any, skip?: number, take?: number, orderBy?: any) {
        return await prisma.brand.findMany({
            where,
            skip,
            take,
            orderBy: orderBy || { createdAt: 'desc' }
        });
    }

    async count(where: any) {
        return await prisma.brand.count({ where });
    }

    async create(data: any) {
        return await prisma.brand.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.brand.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.brand.delete({ where: { id } });
    }
}

export const brandsRepository = new BrandsRepository();
