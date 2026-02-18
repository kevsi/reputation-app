/**
 * 🖥️ Frontend Logging Utility
 * 
 * Provides structured logging for development and production.
 * Integrates with error tracking services in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Get session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

/**
 * Format log entry for console
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, ...rest } = entry;
  const context = Object.keys(rest).length > 0 ? JSON.stringify(rest, null, 2) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${context}`;
}

/**
 * Send log to remote service (production)
 */
async function sendToRemote(entry: LogEntry): Promise<void> {
  try {
    // Replace with your error tracking service (Sentry, Datadog, etc.)
    // await fetch('/api/v1/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry)
    // });
    
    // For now, just log to console in production
    console.log('[REMOTE LOG]', entry);
  } catch {
    // Silently fail - don't break the app
  }
}

/**
 * Main logger object
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (import.meta.env.DEV) {
      console.debug(formatLogEntry({
        level: 'debug',
        message,
        context,
        timestamp: new Date().toISOString()
      }));
    }
  },

  info(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (import.meta.env.DEV) {
      console.info(formatLogEntry(entry));
    } else {
      sendToRemote(entry);
    }
  },

  warn(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (import.meta.env.DEV) {
      console.warn(formatLogEntry(entry));
    } else {
      sendToRemote(entry);
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorInfo: LogContext = {};
    
    if (error instanceof Error) {
      errorInfo.name = error.name;
      errorInfo.message = error.message;
      errorInfo.stack = import.meta.env.DEV ? error.stack : undefined;
    } else if (error) {
      errorInfo.error = String(error);
    }

    const entry: LogEntry = {
      level: 'error',
      message,
      context: { ...context, ...errorInfo },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: getSessionId()
    };

    // Always log errors to console
    console.error(formatLogEntry(entry));

    if (import.meta.env.PROD) {
      sendToRemote(entry);
    }
  },

  /**
   * Log API request/response
   */
  api(endpoint: string, method: string, status?: number, duration?: number): void {
    this.debug(`${method} ${endpoint}`, { status, duration });
  },

  /**
   * Log user action for analytics
   */
  track(action: string, properties?: LogContext): void {
    this.info(`[TRACK] ${action}`, properties);
  }
};

/**
 * Global error handler for uncaught errors
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      promise: event.promise
    });
  });
}

export default logger;
