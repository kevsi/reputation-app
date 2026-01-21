import 'dotenv/config';
import { PrismaClient } from '@sentinelle/database';

const prisma = new PrismaClient();

async function checkSources() {
    const sources = await prisma.source.findMany();
    console.log('--- Sources ---');
    console.log(JSON.stringify(sources, null, 2));

    const brands = await prisma.brand.findMany();
    console.log('--- Brands ---');
    console.log(JSON.stringify(brands, null, 2));
}

checkSources()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
