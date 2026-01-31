import { PrismaClient } from '@sentinelle/database';
import { Logger } from '../logger';

// Créer une instance unique de PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

// Déclaration TypeScript pour globalThis
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Utiliser une instance globale en développement pour éviter trop de connexions
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    Logger.debug('Requête Prisma exécutée', { query: e.query });
    Logger.debug('Durée de la requête Prisma', { durationMs: e.duration });
  });
}

export { prisma };