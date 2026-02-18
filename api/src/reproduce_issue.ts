import { Logger } from './shared/logger';
import { prisma } from './shared/database/prisma.client';

async function main() {
    try {
        Logger.info('Connexion à la base de données en cours', { composant: 'ReproduceIssue', operation: 'main' });

        const countUsers = await prisma.user.count();
        Logger.info('Nombre total d\'utilisateurs', { count: countUsers, composant: 'ReproduceIssue', operation: 'main' });

        const countOrgs = await prisma.organization.count();
        Logger.info('Nombre total d\'organisations', { count: countOrgs, composant: 'ReproduceIssue', operation: 'main' });

        const user = await prisma.user.findFirst({
            include: { organization: true }
        });

        if (!user) {
            Logger.warn('Aucun utilisateur trouvé', { composant: 'ReproduceIssue', operation: 'main' });
            return;
        }


        Logger.info('Utilisateur trouvé', { userId: String(user.id), organizationId: String(user.organizationId), composant: 'ReproduceIssue', operation: 'main' });

        if (!user.organizationId) {
            Logger.warn('L\'utilisateur n\'a pas d\'organizationId', { userId: String(user.id), composant: 'ReproduceIssue', operation: 'main' });
            return;
        }

        const organizationId = String(user.organizationId);

        Logger.info('Test de la requête getAllMentions', { organizationId, composant: 'ReproduceIssue', operation: 'main' });

        const mentions = await prisma.mention.findMany({
            where: {
                brand: {
                    organizationId: organizationId
                }
            },
            include: { source: true, brand: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        Logger.info('Succès : mentions trouvées', { count: mentions.length, composant: 'ReproduceIssue', operation: 'main' });

    } catch (e: any) {
        Logger.error('Erreur capturée dans le script reproduce_issue', e as Error, { composant: 'ReproduceIssue', operation: 'main' });
    } finally {
        await prisma.$disconnect();
    }
}

main();
