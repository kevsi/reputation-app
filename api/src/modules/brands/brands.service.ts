import { PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';
import { BrandsRepository, brandsRepository } from './brands.repository';

class BrandsService {
    constructor(private repository: BrandsRepository) { }

    async getAllBrands() {
        return await this.repository.findMany({}, undefined, undefined, { name: 'asc' });
    }

    async getBrandById(id: string) {
        return await this.repository.findById(id, {
            organization: true,
            mentions: { take: 10 }
        });
    }

    async getBrandsByOrganization(
        organizationId: string,
        pagination: PaginationParams
    ): Promise<PaginatedResponse<any>> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where = { organizationId };

        const [data, total] = await Promise.all([
            this.repository.findMany(where, skip, limit, { name: 'asc' }),
            this.repository.count(where)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    async createBrand(input: any) {
        return await this.repository.create({
            name: input.name,
            description: input.description,
            website: input.website,
            logo: input.logo,
            keywords: input.keywords || [],
            isActive: input.isActive ?? true,
            organizationId: input.organizationId
        });
    }

    async updateBrand(id: string, input: any) {
        return await this.repository.update(id, input);
    }

    async deleteBrand(id: string): Promise<boolean> {
        await this.repository.delete(id);
        return true;
    }
}

export const brandsService = new BrandsService(brandsRepository);

