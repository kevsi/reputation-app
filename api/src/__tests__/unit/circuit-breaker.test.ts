/**
 * Unit Tests for Circuit Breaker
 */

import { CircuitBreaker, CircuitBreakerState, CircuitBreakerOpenError } from '../../infrastructure/resilience/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000
    });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('should execute function when closed', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
  });

  it('should track failures', async () => {
    // Simulate failures
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    const metrics = breaker.getMetrics();
    expect(metrics.failures).toBe(3);
  });

  it('should open after threshold failures', async () => {
    // Fail 3 times to trigger threshold
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
  });

  it('should reject requests when open', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    // Try to execute again - should fail
    await expect(
      breaker.execute(async () => 'test')
    ).rejects.toThrow(CircuitBreakerOpenError);
  });

  it('should transition to half-open after timeout', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Try to execute - should transition to half-open
    try {
      await breaker.execute(async () => 'test');
    } catch (e) {
      // Might still fail depending on implementation
    }

    // The state might be HALF_OPEN or back to CLOSED depending on success
    const state = breaker.getState();
    expect([CircuitBreakerState.HALF_OPEN, CircuitBreakerState.CLOSED]).toContain(state);
  });

  it('should reset manually', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

    // Manual reset
    breaker.reset();

    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('should provide metrics', async () => {
    await breaker.execute(async () => 'success');

    const metrics = breaker.getMetrics();
    expect(metrics.successes).toBe(1);
    expect(metrics.state).toBe(CircuitBreakerState.CLOSED);
    expect(metrics.lastSuccess).toBeInstanceOf(Date);
  });
});

describe('CircuitBreakerOpenError', () => {
  it('should contain correct information', () => {
    const metrics = {
      failures: 5,
      successes: 0,
      lastFailure: new Date(),
      lastSuccess: null,
      state: CircuitBreakerState.OPEN,
      nextAttempt: new Date()
    };

    const error = new CircuitBreakerOpenError(
      'Circuit is open',
      'test-service',
      CircuitBreakerState.OPEN,
      metrics
    );

    expect(error.message).toBe('Circuit is open');
    expect(error.breakerName).toBe('test-service');
    expect(error.state).toBe(CircuitBreakerState.OPEN);
    expect(error.metrics).toEqual(metrics);
  });
});
