import { ReportType } from '@sentinelle/database';
import { analyticsService } from '../analytics/analytics.service';
import { ReportsRepository, reportsRepository } from './reports.repository';
import { PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';
import { prisma } from '../../shared/database/prisma.client';

class ReportsService {
    constructor(private repository: ReportsRepository) { }

    /**
     * ✅ Récupérer tous les rapports avec pagination
     */
    async getAllReports(
        organizationId: string,
        pagination: PaginationParams
    ): Promise<PaginatedResponse<any>> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where = { brand: { organizationId } };

        const [data, total] = await Promise.all([
            this.repository.findMany(where, skip, limit),
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

    async getReportById(id: string) {
        return await this.repository.findById(id);
    }

    /**
     * Génération instantanée d'un rapport
     */
    async generateInstant(input: {
        brandId: string,
        type: ReportType,
        startDate: Date,
        endDate: Date,
        format?: 'json' | 'pdf'
    }) {
        const { brandId, type, startDate, endDate, format = 'json' } = input;

        // 1. Récupérer la marque pour avoir l'organizationId - Here still using prisma as it's a cross-module check or we could use brandsService
        // but let's keep it simple for now or use repository if available.
        // Actually BrandsRepository is available. But let's keep the focus on Reports for now.
        const brand = await prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand) throw new Error('Brand not found');

        // 2. Récupérer les données via le service Analytics
        const analyticsInput = {
            organizationId: brand.organizationId,
            brandId,
            startDate,
            endDate
        };

        const [summary, sentiment, timeSeries] = await Promise.all([
            analyticsService.getSummary(analyticsInput),
            analyticsService.getSentimentBreakdown(analyticsInput),
            analyticsService.getTimeSeries({ ...analyticsInput, period: 'daily' })
        ]);

        const reportData = {
            summary,
            sentiment,
            timeSeries,
            metadata: {
                generatedAt: new Date(),
                period: { startDate, endDate }
            }
        };

        // 3. Créer l'entrée dans la DB
        const report = await this.repository.create({
            title: `Report ${brand.name} - ${type}`,
            type,
            startDate,
            endDate,
            brandId,
            format,
            data: reportData as any,
            generatedAt: new Date()
        });

        return report;
    }

    async deleteReport(id: string) {
        await this.repository.delete(id);
        return true;
    }
}

export const reportsService = new ReportsService(reportsRepository);
