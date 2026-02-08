import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Force resetting lastScrapedAt for all active sources...');
    const result = await prisma.source.updateMany({
        where: { isActive: true },
        data: { lastScrapedAt: null }
    });
    console.log(`Updated ${result.count} sources.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
