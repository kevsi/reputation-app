const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './database/.env' });

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log('Using URL:', process.env.DATABASE_URL);
    try {
        const sourceCount = await prisma.source.count();
        console.log('Source count:', sourceCount);
        const activeSourceCount = await prisma.source.count({ where: { isActive: true } });
        console.log('Active source count:', activeSourceCount);

        const sources = await prisma.source.findMany({ take: 5 });
        console.log('Sample sources:', sources.map(s => ({ name: s.name, active: s.isActive })));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
