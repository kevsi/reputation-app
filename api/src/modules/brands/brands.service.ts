import { prisma } from '../../shared/database/prisma.client';

class BrandsService {
    async getAllBrands() {
        return await prisma.brand.findMany({
            include: { organization: true }
        });
    }

    async getBrandById(id: string) {
        return await prisma.brand.findUnique({
            where: { id },
            include: { organization: true, mentions: { take: 10 } }
        });
    }

    async getBrandsByOrganization(organizationId: string) {
        return await prisma.brand.findMany({
            where: { organizationId },
            include: { _count: { select: { mentions: true } } }
        });
    }

    async createBrand(input: any) {
        return await prisma.brand.create({
            data: {
                name: input.name,
                description: input.description,
                website: input.website,
                logo: input.logo,
                isActive: input.isActive ?? true,
                organizationId: input.organizationId
            }
        });
    }

    async updateBrand(id: string, input: any) {
        return await prisma.brand.update({
            where: { id },
            data: input
        });
    }

    async deleteBrand(id: string): Promise<boolean> {
        await prisma.brand.delete({ where: { id } });
        return true;
    }
}

export const brandsService = new BrandsService();
