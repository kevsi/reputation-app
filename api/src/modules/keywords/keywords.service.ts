import { prisma } from '../../shared/database/prisma.client';

class KeywordsService {
    async getAllKeywords() {
        return await prisma.keyword.findMany({
            include: { brand: true }
        });
    }

    async getKeywordById(id: string) {
        return await prisma.keyword.findUnique({
            where: { id },
            include: { brand: true }
        });
    }

    async getKeywordsByBrand(brandId: string) {
        return await prisma.keyword.findMany({
            where: { brandId }
        });
    }

    async createKeyword(input: any) {
        return await prisma.keyword.create({
            data: {
                word: input.word,
                category: input.category,
                priority: input.priority ?? 0,
                isNegative: input.isNegative ?? false,
                brandId: input.brandId
            }
        });
    }

    async updateKeyword(id: string, input: any) {
        return await prisma.keyword.update({
            where: { id },
            data: input
        });
    }

    async deleteKeyword(id: string): Promise<boolean> {
        await prisma.keyword.delete({ where: { id } });
        return true;
    }
}

export const keywordsService = new KeywordsService();
