import { Job } from 'bull';
import { PrismaClient } from '@sentinelle/database';

const prisma = new PrismaClient();

export const reportsProcessor = async (job: Job) => {
    const { brandId, reportId } = job.data;

    console.log(`📊 Generating report ${reportId} for brand ${brandId}...`);

    try {
        // 1. Fetch report configuration
        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            console.warn(`⚠️ Report ${reportId} not found`);
            return;
        }

        // 2. Fetch mentions in the period
        const mentions = await prisma.mention.findMany({
            where: {
                brandId,
                publishedAt: {
                    gte: report.startDate,
                    lte: report.endDate
                }
            }
        });

        // 3. Calculate statistics
        const totalMentions = mentions.length;
        const sentimentCounts = mentions.reduce((acc: any, m) => {
            acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
            return acc;
        }, {});

        const reportData = {
            totalMentions,
            sentimentCounts,
            generatedAt: new Date(),
            period: {
                start: report.startDate,
                end: report.endDate
            }
        };

        // 4. Update report in DB
        await prisma.report.update({
            where: { id: reportId },
            data: {
                data: reportData,
                generatedAt: new Date()
                // fileUrl could be updated here if we generated a PDF/CSV
            }
        });

        console.log(`✅ Report ${reportId} generated successfully`);

        return { success: true };
    } catch (error) {
        console.error(`❌ Report generation failed for ${reportId}:`, error);
        throw error;
    }
};
