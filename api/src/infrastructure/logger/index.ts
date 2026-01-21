import winston from 'winston';
import { config } from '../../config/app';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format personnalisé pour les logs
const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Ajouter les métadonnées si présentes
  if (Object.keys(meta).length > 0) {
    log += `
${JSON.stringify(meta, null, 2)}`;
  }
  
  // Ajouter la stack trace si présente
  if (stack) {
    log += `
${stack}`;
  }
  
  return log;
});

// Configuration du logger
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console en développement avec couleurs
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),
    
    // Fichier pour les erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// En production, ne pas logger sur la console
if (config.NODE_ENV === 'production') {
  logger.remove(logger.transports[0]);
}

// Helper pour logger les requêtes HTTP
export const logRequest = (req: any) => {
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};