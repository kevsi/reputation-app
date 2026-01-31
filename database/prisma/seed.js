"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // 1. Cleanup existing data
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.action.deleteMany();
    await prisma.alertTrigger.deleteMany();
    await prisma.mentionKeyword.deleteMany();
    await prisma.keyword.deleteMany();
    await prisma.mention.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.source.deleteMany();
    await prisma.competitor.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Database cleaned.');
    // 2. Create main Admin/Owner user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@sentinelle.io',
            password: hashedPassword,
            name: 'Admin User',
            role: client_1.Role.OWNER,
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
                    plan: client_1.SubscriptionTier.PREMIUM,
                    status: client_1.SubscriptionStatus.ACTIVE,
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
                    type: client_1.SourceType.TWITTER,
                    url: `https://twitter.com/${brand.name.toLowerCase()}`,
                    brandId: brand.id,
                }
            }),
            prisma.source.create({
                data: {
                    name: 'Reddit Discussions',
                    type: client_1.SourceType.REDDIT,
                    url: `https://reddit.com/r/${brand.name.toLowerCase()}`,
                    brandId: brand.id,
                }
            }),
            prisma.source.create({
                data: {
                    name: 'Google News',
                    type: client_1.SourceType.NEWS,
                    url: `https://news.google.com/search?q=${brand.name}`,
                    brandId: brand.id,
                }
            })
        ]);
        // 6. Create Keywords
        await prisma.keyword.createMany({
            data: [
                { word: brand.name, brandId: brand.id, priority: 1 },
                { word: 'Elon Musk', brandId: brand.id, priority: 2 },
                { word: 'innovation', brandId: brand.id, priority: 0 },
            ]
        });
        // 7. Create Mentions (Last 30 days)
        const sentiments = [client_1.SentimentType.POSITIVE, client_1.SentimentType.NEUTRAL, client_1.SentimentType.NEGATIVE];
        const mentionTemplates = [
            `I love the new ${brand.name} updates!`,
            `${brand.name} is leading the market.`,
            `Not sure about the latest ${brand.name} news.`,
            `${brand.name} customers are complaining about support.`,
            `Incredible performance from ${brand.name} this quarter.`,
            `Is ${brand.name} overrated?`,
            `${brand.name} is a game changer in ${bData.description}.`
        ];
        for (let i = 0; i < 50; i++) {
            const publishedAt = new Date();
            publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30));
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
            const source = sources[Math.floor(Math.random() * sources.length)];
            await prisma.mention.create({
                data: {
                    content: mentionTemplates[Math.floor(Math.random() * mentionTemplates.length)],
                    author: `User_${Math.floor(Math.random() * 1000)}`,
                    sentiment,
                    sentimentScore: sentiment === 'POSITIVE' ? 0.8 : sentiment === 'NEGATIVE' ? -0.8 : 0,
                    publishedAt,
                    brandId: brand.id,
                    sourceId: source.id,
                    engagementCount: Math.floor(Math.random() * 100),
                    reachScore: Math.floor(Math.random() * 1000),
                }
            });
        }
        // 8. Create Alerts
        await prisma.alert.create({
            data: {
                name: `High Negative Sentiment - ${brand.name}`,
                condition: client_1.AlertCondition.NEGATIVE_SENTIMENT_THRESHOLD,
                threshold: 0.5,
                level: client_1.AlertLevel.HIGH,
                brandId: brand.id,
            }
        });
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
