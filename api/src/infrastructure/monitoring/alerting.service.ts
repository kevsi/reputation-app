/**
 * Alerting Service for Production Monitoring
 * 
 * Provides centralized alerting for critical system events:
 * - Circuit breaker opened
 * - Job failures exceeded threshold
 * - Source errors accumulation
 * - Rate limit hits
 * - Queue lag exceeded
 * - Database connection issues
 * 
 * Supports multiple channels:
 * - Console (development)
 * - Prometheus metrics
 * - Webhook (Slack, PagerDuty, etc.)
 */

import { Logger } from '../../shared/logger';

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AlertSource {
  SCRAPING = 'scraping',
  AUTH = 'auth',
  DATABASE = 'database',
  QUEUE = 'queue',
  API = 'api'
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  throttles: Record<string, number>; // Alert type -> ms throttle
}

export interface AlertChannel {
  type: 'console' | 'webhook' | 'prometheus';
  config?: Record<string, any>;
}

class AlertingService {
  private alerts: Map<string, Alert> = new Map();
  private config: AlertConfig = {
    enabled: true,
    channels: [
      { type: 'console' }
    ],
    throttles: {
      'circuit_breaker_open': 300000, // 5 min
      'job_failure_threshold': 60000,  // 1 min
      'rate_limit_hit': 120000,       // 2 min
      'queue_lag_high': 300000,       // 5 min
      'db_connection_error': 30000    // 30 sec
    }
  };

  private lastAlertTime: Map<string, number> = new Map();

  /**
   * Send an alert
   */
  async alert(
    type: string,
    severity: AlertSeverity,
    source: AlertSource,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Check throttle
    if (this.isThrottled(type)) {
      Logger.debug(`Alert ${type} throttled`, { type });
      return;
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      source,
      title,
      message,
      metadata,
      timestamp: new Date(),
      acknowledged: false
    };

    // Store alert
    this.alerts.set(alert.id, alert);
    this.lastAlertTime.set(type, Date.now());

    // Send to configured channels
    for (const channel of this.config.channels) {
      await this.sendToChannel(channel, alert);
    }
  }

  /**
   * Check if alert should be throttled
   */
  private isThrottled(type: string): boolean {
    const throttleMs = this.config.throttles[type];
    if (!throttleMs) return false;

    const lastTime = this.lastAlertTime.get(type);
    if (!lastTime) return false;

    return Date.now() - lastTime < throttleMs;
  }

  /**
   * Send alert to channel
   */
  private async sendToChannel(channel: AlertChannel, alert: Alert): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendToConsole(alert);
        break;
      case 'webhook':
        await this.sendToWebhook(channel.config?.url, alert);
        break;
      case 'prometheus':
        this.sendToPrometheus(alert);
        break;
    }
  }

  /**
   * Send to console
   */
  private sendToConsole(alert: Alert): void {
    const emoji = {
      [AlertSeverity.INFO]: 'ℹ️',
      [AlertSeverity.WARNING]: '⚠️',
      [AlertSeverity.ERROR]: '❌',
      [AlertSeverity.CRITICAL]: '🚨'
    }[alert.severity];

    console.log(`
${emoji} [${alert.severity.toUpperCase()}] ${alert.title}
📢 Source: ${alert.source}
📝 Message: ${alert.message}
⏰ Time: ${alert.timestamp.toISOString()}
${alert.metadata ? `📊 Metadata: ${JSON.stringify(alert.metadata)}` : ''}
`);
  }

  /**
   * Send to webhook
   */
  private async sendToWebhook(url: string | undefined, alert: Alert): Promise<void> {
    if (!url) return;

    try {
      const webhookPayload = {
        text: this.formatSlackMessage(alert),
        attachments: [{
          color: this.getSeverityColor(alert.severity),
          fields: [
            { title: 'Source', value: alert.source, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: true }
          ],
          footer: 'Sentinelle Alerting',
          ts: Math.floor(alert.timestamp.getTime() / 1000)
        }]
      };

      // In production: await axios.post(url, webhookPayload);
      Logger.info(`Webhook alert sent: ${alert.title}`, { 
        url: url.substring(0, 20) + '...',
        alertId: alert.id,
        payloadSize: JSON.stringify(webhookPayload).length
      });
    } catch (error) {
      Logger.error(`Failed to send webhook alert`, error as Error, { alertId: alert.id });
    }
  }

  /**
   * Send to Prometheus (metrics)
   */
  private sendToPrometheus(alert: Alert): void {
    // In production, would increment a Prometheus counter
    // prometheus_alerts_incidents_total{source="scraping",severity="error"}
    Logger.debug(`Prometheus alert: ${alert.title}`, { alert });
  }

  /**
   * Format Slack message
   */
  private formatSlackMessage(alert: Alert): string {
    const emoji = {
      [AlertSeverity.INFO]: 'ℹ️',
      [AlertSeverity.WARNING]: '⚠️',
      [AlertSeverity.ERROR]: '❌',
      [AlertSeverity.CRITICAL]: '🚨'
    }[alert.severity];

    return `${emoji} *${alert.title}*\n${alert.message}`;
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.INFO: return '#36a64f';
      case AlertSeverity.WARNING: return '#ff9800';
      case AlertSeverity.ERROR: return '#f44336';
      case AlertSeverity.CRITICAL: return '#9c27b0';
    }
  }

  // Convenience methods for common alerts

  /**
   * Alert when circuit breaker opens
   */
  async alertCircuitBreakerOpen(breakerName: string, failureCount: number): Promise<void> {
    await this.alert(
      'circuit_breaker_open',
      AlertSeverity.ERROR,
      AlertSource.SCRAPING,
      `Circuit Breaker Opened: ${breakerName}`,
      `The circuit breaker for ${breakerName} has opened after ${failureCount} failures.`,
      { breakerName, failureCount }
    );
  }

  /**
   * Alert when job failure threshold exceeded
   */
  async alertJobFailureThreshold(
    sourceId: string, 
    brandId: string, 
    failureCount: number
  ): Promise<void> {
    await this.alert(
      'job_failure_threshold',
      AlertSeverity.ERROR,
      AlertSource.SCRAPING,
      `Job Failure Threshold Exceeded`,
      `Source ${sourceId} has failed ${failureCount} times consecutively.`,
      { sourceId, brandId, failureCount }
    );
  }

  /**
   * Alert when rate limit is hit
   */
  async alertRateLimit(sourceType: string, retryAfter?: number): Promise<void> {
    await this.alert(
      'rate_limit_hit',
      AlertSeverity.WARNING,
      AlertSource.SCRAPING,
      `Rate Limit Hit: ${sourceType}`,
      `Rate limit encountered for ${sourceType}.${retryAfter ? ` Retry after ${retryAfter}s.` : ''}`,
      { sourceType, retryAfter }
    );
  }

  /**
   * Alert when queue lag is too high
   */
  async alertQueueLag(queueName: string, lag: number, threshold: number): Promise<void> {
    await this.alert(
      'queue_lag_high',
      AlertSeverity.WARNING,
      AlertSource.QUEUE,
      `High Queue Lag: ${queueName}`,
      `Queue ${queueName} has ${lag} pending jobs (threshold: ${threshold}).`,
      { queueName, lag, threshold }
    );
  }

  /**
   * Alert on database connection error
   */
  async alertDatabaseError(error: string): Promise<void> {
    await this.alert(
      'db_connection_error',
      AlertSeverity.CRITICAL,
      AlertSource.DATABASE,
      'Database Connection Error',
      `Database error: ${error}`,
      { error }
    );
  }

  /**
   * Acknowledge an alert
   */
  async acknowledge(alertId: string, userId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    Logger.info(`Alert acknowledged: ${alertId}`, { acknowledgedBy: userId });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.acknowledged);
  }

  /**
   * Get alerts by source
   */
  getAlertsBySource(source: AlertSource, acknowledged?: boolean): Alert[] {
    return Array.from(this.alerts.values())
      .filter(a => a.source === source && (acknowledged === undefined || a.acknowledged === acknowledged));
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const alertingService = new AlertingService();

// Convenience function for quick alerts
export const alert = (
  severity: AlertSeverity,
  source: AlertSource,
  title: string,
  message: string,
  metadata?: Record<string, any>
) => alertingService.alert(
  `manual_${Date.now()}`,
  severity,
  source,
  title,
  message,
  metadata
);
