import { prisma } from '../../shared/database/prisma.client';

class KeywordsService {
    async getKeywordsByBrand(brandId: string) {
        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            select: { keywords: true }
        });
        return brand?.keywords || [];
    }

    async addKeywordToBrand(brandId: string, word: string) {
        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            select: { keywords: true }
        });

        if (!brand) throw new Error('Brand not found');

        const updatedKeywords = [...new Set([...brand.keywords, word])];

        return await prisma.brand.update({
            where: { id: brandId },
            data: { keywords: updatedKeywords }
        });
    }

    async removeKeywordFromBrand(brandId: string, word: string) {
        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            select: { keywords: true }
        });

        if (!brand) throw new Error('Brand not found');

        const updatedKeywords = brand.keywords.filter(k => k !== word);

        return await prisma.brand.update({
            where: { id: brandId },
            data: { keywords: updatedKeywords }
        });
    }

    async updateBrandKeywords(brandId: string, keywords: string[]) {
        return await prisma.brand.update({
            where: { id: brandId },
            data: { keywords: [...new Set(keywords)] }
        });
    }
}

export const keywordsService = new KeywordsService();
