/**
 * Circuit Breaker Implementation for Scraping System
 * 
 * Provides protection against cascading failures when external services
 * (Python scraper API, source websites) become unavailable.
 * 
 * States:
 * - CLOSED: Normal operation, requests allowed
 * - OPEN: Service unavailable, requests blocked immediately
 * - HALF_OPEN: Testing if service recovered
 * 
 * Usage:
 * const breaker = new CircuitBreaker('google-reviews', {
 *   failureThreshold: 5,    // Open after 5 failures
 *   successThreshold: 2,   // Close after 2 successes
 *   timeout: 60000,         // Try again after 60s
 * });
 * 
 * try {
 *   const result = await breaker.execute(() => callScraperApi(...));
 * } catch (e) {
 *   // Handle circuit breaker open error
 * }
 */

import { Logger } from '../../shared/logger';

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;  // Number of failures to open circuit
  successThreshold: number;  // Number of successes to close circuit
  timeout: number;           // Time in ms before trying half-open
  monitoringWindow: number; // Time window for counting failures
}

export interface CircuitBreakerMetrics {
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  state: CircuitBreakerState;
  nextAttempt: Date | null;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private nextAttempt: Date | null = null;
  private readonly name: string;
  private readonly options: CircuitBreakerOptions;
  private executionLock: boolean = false;

  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.name = name;
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 60000, // 1 minute default
      monitoringWindow: options.monitoringWindow ?? 300000 // 5 minutes
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        const timeUntilRetry = this.nextAttempt 
          ? Math.ceil((this.nextAttempt.getTime() - Date.now()) / 1000)
          : 'unknown';
        
        Logger.warn(`Circuit breaker [${this.name}] is OPEN. Retry in ~${timeUntilRetry}s`);
        throw new CircuitBreakerOpenError(
          `Circuit breaker ${this.name} is OPEN. Service unavailable.`,
          this.name,
          this.state,
          this.getMetrics()
        );
      }
    }

    // Try to execute
    try {
      // Prevent concurrent executions during half-open testing
      if (this.executionLock && this.state === CircuitBreakerState.HALF_OPEN) {
        throw new CircuitBreakerOpenError(
          `Circuit breaker [${this.name}] is testing recovery. Concurrent requests blocked.`,
          this.name,
          this.state,
          this.getMetrics()
        );
      }

      this.executionLock = true;
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    } finally {
      this.executionLock = false;
    }
  }

  /**
   * Record a successful execution
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccess = new Date();
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successes >= this.options.successThreshold) {
        this.transitionToClosed();
      }
    }
    
    Logger.debug(`Circuit breaker [${this.name}] success. State: ${this.state}, Successes: ${this.successes}/${this.options.successThreshold}`);
  }

  /**
   * Record a failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
    
    if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failures >= this.options.failureThreshold) {
        this.transitionToOpen();
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Any failure during half-open returns to open
      this.transitionToOpen();
    }
    
    Logger.warn(`Circuit breaker [${this.name}] failure. Failures: ${this.failures}/${this.options.failureThreshold}, State: ${this.state}`);
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttempt) return true;
    return Date.now() >= this.nextAttempt.getTime();
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    this.state = CircuitBreakerState.OPEN;
    this.nextAttempt = new Date(Date.now() + this.options.timeout);
    this.successes = 0; // Reset success counter
    
    Logger.error(`🔴 Circuit breaker [${this.name}] transitioned to OPEN. Failures: ${this.failures}. Will retry at ${this.nextAttempt.toISOString()}`, new Error('Circuit breaker opened'), { composant: 'CircuitBreaker' });
    
    // Emit alert (in production, this would trigger notifications)
    this.emitAlert();
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    this.state = CircuitBreakerState.HALF_OPEN;
    this.successes = 0; // Reset for new counting
    this.nextAttempt = null;
    
    Logger.info(`🟡 Circuit breaker [${this.name}] transitioned to HALF_OPEN. Testing recovery...`);
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = null;
    
    Logger.info(`🟢 Circuit breaker [${this.name}] transitioned to CLOSED. Service recovered.`);
  }

  /**
   * Emit alert for circuit breaker state change
   * In production, integrate with monitoring/alerting system
   */
  private emitAlert(): void {
    // This would integrate with Prometheus, PagerDuty, Slack, etc.
    Logger.error('Circuit breaker alert emitted', new Error('CircuitBreakerAlert'), {
      type: 'CIRCUIT_BREAKER_ALERT',
      breaker: this.name,
      state: this.state,
      failures: this.failures,
      threshold: this.options.failureThreshold,
      nextAttempt: this.nextAttempt?.toISOString()
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      state: this.state,
      nextAttempt: this.nextAttempt
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.transitionToClosed();
    Logger.info(`Circuit breaker [${this.name}] manually reset.`, { composant: 'CircuitBreaker' });
  }

  /**
   * Force open the circuit (for maintenance)
   */
  forceOpen(): void {
    this.state = CircuitBreakerState.OPEN;
    this.nextAttempt = null;
    Logger.warn(`Circuit breaker [${this.name}] manually forced to OPEN.`, { composant: 'CircuitBreaker' });
  }

  /**
   * Force close the circuit (for maintenance)
   */
  forceClose(): void {
    this.transitionToClosed();
    Logger.info(`Circuit breaker [${this.name}] manually forced to CLOSED.`, { composant: 'CircuitBreaker' });
  }
}

/**
 * Custom error for circuit breaker open state
 */
export class CircuitBreakerOpenError extends Error {
  public readonly breakerName: string;
  public readonly state: CircuitBreakerState;
  public readonly metrics: CircuitBreakerMetrics;

  constructor(message: string, breakerName: string, state: CircuitBreakerState, metrics: CircuitBreakerMetrics) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.breakerName = breakerName;
    this.state = state;
    this.metrics = metrics;
  }
}

/**
 * Circuit Breaker Registry - Manages multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private defaultOptions: Partial<CircuitBreakerOptions>;

  constructor(defaultOptions: Partial<CircuitBreakerOptions> = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    let breaker = this.breakers.get(name);
    
    if (!breaker) {
      breaker = new CircuitBreaker(name, { ...this.defaultOptions, ...options });
      this.breakers.set(name, breaker);
    }
    
    return breaker;
  }

  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    for (const [name, breaker] of this.breakers.entries()) {
      metrics[name] = breaker.getMetrics();
    }
    
    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const [, breaker] of this.breakers.entries()) {
      breaker.reset();
    }
    Logger.info('All circuit breakers have been reset.');
  }

  /**
   * Get summary of all breakers
   */
  getSummary(): { open: string[]; halfOpen: string[]; closed: string[] } {
    const summary = {
      open: [] as string[],
      halfOpen: [] as string[],
      closed: [] as string[]
    };

    for (const [name, breaker] of this.breakers.entries()) {
      const state = breaker.getState();
      if (state === CircuitBreakerState.OPEN) summary.open.push(name);
      else if (state === CircuitBreakerState.HALF_OPEN) summary.halfOpen.push(name);
      else summary.closed.push(name);
    }

    return summary;
  }
}

// Global registry instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  monitoringWindow: 300000
});

// Helper function for scraping operations
export async function withCircuitBreaker<T>(
  serviceName: string,
  operation: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> {
  const breaker = circuitBreakerRegistry.getBreaker(serviceName, options);
  return breaker.execute(operation);
}
