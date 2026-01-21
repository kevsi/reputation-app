import { prisma } from '../../shared/database/prisma.client';
import { ReportType } from '@sentinelle/database';
import { analyticsService } from '../analytics/analytics.service';

class ReportsService {
    async getAllReports(organizationId: string) {
        return await prisma.report.findMany({
            where: {
                brand: { organizationId }
            },
            include: { brand: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getReportById(id: string) {
        return await prisma.report.findUnique({
            where: { id },
            include: { brand: true }
        });
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

        // 1. Récupérer la marque pour avoir l'organizationId
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
        const report = await prisma.report.create({
            data: {
                title: `Report ${brand.name} - ${type}`,
                type,
                startDate,
                endDate,
                brandId,
                format,
                data: reportData as any,
                generatedAt: new Date()
            }
        });

        return report;
    }

    async deleteReport(id: string) {
        await prisma.report.delete({ where: { id } });
        return true;
    }
}

export const reportsService = new ReportsService();
