import { PrismaClient } from '@sentinelle/database';
import { Logger } from '../logger';
import { config } from '../../config/app';

// Créer une instance unique de PrismaClient avec connection pooling
const prismaClientSingleton = () => {
  // Parse DATABASE_URL to add connection pool parameters
  let databaseUrl = process.env.DATABASE_URL || '';
  
  // Add connection pool settings to the connection string if not present
  if (databaseUrl && !databaseUrl.includes('connection_limit')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl += `${separator}connection_limit=${config.DATABASE_POOL_SIZE}&pool_timeout=${config.DATABASE_CONNECTION_TIMEOUT}`;
  }
  
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    datasources: databaseUrl ? {
      db: {
        url: databaseUrl
      }
    } : undefined
  });
};

// Type for transactions Prisma - excludes transaction methods from the client
export type PrismaTx = Omit<PrismaClient, '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;

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