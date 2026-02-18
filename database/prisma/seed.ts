import { PrismaClient, Role, SubscriptionTier, SubscriptionStatus, SourceType, SentimentType, AlertCondition, AlertLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Cleanup existing data (only valid tables)
    try {
        await prisma.mention.deleteMany();
        await prisma.source.deleteMany();
        await prisma.brand.deleteMany();
        await prisma.subscription.deleteMany();
        await prisma.organization.deleteMany();
        await prisma.user.deleteMany();
    } catch (e) {
        console.log('⚠️ Cleanup skipped:', e.message.split('\n')[0]);
    }

    console.log('🧹 Database cleaned.');

    // 2. Create main Admin/Owner user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@sentinelle.io',
            password: hashedPassword,
            name: 'Admin User',
            role: Role.OWNER,
            isActive: true,
            emailVerified: true,
        },
    });

    console.log('👤 Admin user created.');

    // 3. Create Organization
    const org = await prisma.organization.create({
        data: {
            name: 'Sentinelle Corp',
            slug: 'sentinelle-corp',
            industry: 'Technology',
            website: 'https://sentinelle.io',
            ownerId: adminUser.id,
            members: {
                connect: { id: adminUser.id }
            },
            subscription: {
                create: {
                    plan: SubscriptionTier.PREMIUM,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            }
        },
    });

    console.log('🏢 Organization created.');

    // 4. Create Brands
    const brandsData = [
        { name: 'Tesla', description: 'Electric vehicles and energy', website: 'https://tesla.com' },
        { name: 'SpaceX', description: 'Space exploration', website: 'https://spacex.com' }
    ];

    for (const bData of brandsData) {
        const brand = await prisma.brand.create({
            data: {
                ...bData,
                organizationId: org.id,
            },
        });

        console.log(`🏷️ Brand ${brand.name} created.`);

        // 5. Create Sources for each brand
        const sources = await Promise.all([
            prisma.source.create({
                data: {
                    name: 'Twitter Official',
                    type: SourceType.TWITTER,
                    url: `https://twitter.com/${brand.name.toLowerCase()}`,
                    brandId: brand.id,
                }
            }),
            prisma.source.create({
                data: {
                    name: 'Reddit Discussions',
                    type: SourceType.REDDIT,
                    url: `https://reddit.com/r/${brand.name.toLowerCase()}`,
                    brandId: brand.id,
                }
            }),
            prisma.source.create({
                data: {
                    name: 'Google News',
                    type: SourceType.NEWS,
                    url: `https://news.google.com/search?q=${brand.name}`,
                    brandId: brand.id,
                }
            })
        ]);

        // 6. Create Keywords - SKIPPED (optional table)
        // await prisma.keyword.createMany({...});

        // 7. Create Mentions - SKIPPED (will be created by workers)
        // await prisma.mention.create({...});
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
