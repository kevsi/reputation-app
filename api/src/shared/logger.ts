/**
 * Système de logging structuré pour Sentinelle Reputation
 * Tous les logs sont en français avec contexte détaillé
 */

export enum LogLevel {
  ERROR = 'ERREUR',
  WARN = 'AVERTISSEMENT',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogContext {
  composant?: string;
  operation?: string;
  userId?: string;
  brandId?: string;
  [key: string]: any;
}

export class Logger {
  /**
   * Log une erreur avec contexte complet
   */
  static error(
    message: string, 
    error: Error, 
    context?: LogContext
  ): void {
    const logEntry = {
      niveau: LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      message,
      erreur: {
        nom: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3)
      },
      contexte: context || {},
      environnement: process.env.NODE_ENV
    };
    
    console.error(JSON.stringify(logEntry, null, 2));
    // TODO: Envoyer à Sentry/autre service de monitoring
  }

  /**
   * Log une information
   */
  static info(message: string, context?: LogContext): void {
    console.log(`✅ [${context?.composant || 'APP'}] ${message}`, context || '');
  }

  /**
   * Log un avertissement
   */
  static warn(message: string, context?: LogContext): void {
    console.warn(`⚠️ [${context?.composant || 'APP'}] ${message}`, context || '');
  }

  /**
   * Log de debug (seulement en dev)
   */
  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }
}
