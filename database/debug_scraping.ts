import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sources = await prisma.source.findMany();
    console.log('--- Active Sources ---');
    console.log(JSON.stringify(sources, null, 2));

    const mentionsCount = await prisma.mention.count();
    console.log(`\nTotal Mentions: ${mentionsCount}`);

    const jobs = await prisma.scrapingJob.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log('\n--- Recent Scraping Jobs ---');
    console.log(JSON.stringify(jobs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
