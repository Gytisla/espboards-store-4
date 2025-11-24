/**
 * Circuit Breaker Pattern Implementation
 * 
 * Protects against cascade failures during external service outages (e.g., PA-API).
 * 
 * Circuit Breaker States:
 * - CLOSED: Normal operation, all requests pass through
 * - OPEN: Circuit opened after threshold failures, all requests blocked
 * - HALF_OPEN: Testing phase after cooldown, single test request allowed
 * 
 * State Transitions:
 * - CLOSED → OPEN: After failureThreshold consecutive failures
 * - OPEN → HALF_OPEN: After cooldownTimeout expires
 * - HALF_OPEN → CLOSED: After successful test request
 * - HALF_OPEN → OPEN: After failed test request
 * 
 * Constitution Compliance:
 * - Performance: Prevent cascade failures, auto-recovery
 * - Observability: State changes logged with timestamps
 * - Code Quality: Explicit types, comprehensive error handling
 */

import { Logger, LogLevel } from "./logger.ts";

/**
 * Circuit breaker state enumeration
 */
export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Circuit breaker configuration options
 */
export interface CircuitBreakerConfig {
  /**
   * Number of consecutive failures before opening circuit
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Time to wait before attempting recovery (in milliseconds)
   * @default 300000 (5 minutes)
   */
  cooldownTimeout?: number;

  /**
   * Name for logging and identification
   * @default "circuit-breaker"
   */
  name?: string;
}

/**
 * Current state of the circuit breaker
 */
export interface CircuitBreakerState {
  /**
   * Current circuit state
   */
  state: CircuitState;

  /**
   * Number of consecutive failures
   */
  failureCount: number;

  /**
   * Number of consecutive successes
   */
  successCount: number;

  /**
   * Timestamp of last failure (milliseconds since epoch)
   */
  lastFailureTime?: number;

  /**
   * Circuit breaker name
   */
  name: string;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  /**
   * Total number of successful executions
   */
  totalSuccesses: number;

  /**
   * Total number of failed executions
   */
  totalFailures: number;

  /**
   * Total number of requests (successes + failures + blocked)
   */
  totalRequests: number;

  /**
   * Number of times circuit has opened
   */
  circuitOpens: number;

  /**
   * Number of times circuit has closed
   */
  circuitCloses: number;
}

/**
 * Error thrown when circuit breaker is in OPEN state
 */
export class CircuitOpenError extends Error {
  /**
   * Time to wait before retry (in milliseconds)
   */
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = "CircuitOpenError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit Breaker implementation
 * 
 * Prevents cascade failures by blocking requests when error threshold is reached.
 * Automatically attempts recovery after cooldown period.
 * 
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   cooldownTimeout: 5 * 60 * 1000, // 5 minutes
 * });
 * 
 * try {
 *   const result = await breaker.execute(async () => {
 *     return await callExternalService();
 *   });
 * } catch (error) {
 *   if (error instanceof CircuitOpenError) {
 *     console.log(`Circuit is OPEN, retry after ${error.retryAfter}ms`);
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private successCount: number;
  private lastFailureTime?: number;
  private readonly config: Required<CircuitBreakerConfig>;
  private readonly logger: Logger;

  // Metrics
  private totalSuccesses: number;
  private totalFailures: number;
  private totalRequests: number;
  private circuitOpens: number;
  private circuitCloses: number;

  /**
   * Create a new circuit breaker instance
   * 
   * @param config - Circuit breaker configuration
   */
  constructor(config?: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 5,
      cooldownTimeout: config?.cooldownTimeout ?? 5 * 60 * 1000, // 5 minutes default
      name: config?.name ?? "circuit-breaker",
    };

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;

    // Initialize metrics
    this.totalSuccesses = 0;
    this.totalFailures = 0;
    this.totalRequests = 0;
    this.circuitOpens = 0;
    this.circuitCloses = 0;

    // Initialize logger
    this.logger = new Logger({
      minLevel: LogLevel.INFO,
    });

    // Log circuit breaker initialization
    this.logger.info("Circuit breaker initialized", {
      name: this.config.name,
      failureThreshold: this.config.failureThreshold,
      cooldownTimeout: this.config.cooldownTimeout,
    });
  }

  /**
   * Execute a function with circuit breaker protection
   * 
   * @param fn - Function to execute
   * @returns Result of the function
   * @throws {CircuitOpenError} When circuit is OPEN and cooldown hasn't expired
   * @throws {Error} Original error from the function if it fails
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if we should transition to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.transitionToHalfOpen();
      } else {
        const retryAfter = this.getRetryAfter();
        throw new CircuitOpenError(
          "Circuit breaker is OPEN",
          retryAfter
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.totalSuccesses++;
    this.successCount++;
    this.failureCount = 0;

    // If in HALF_OPEN state, successful test closes the circuit
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.circuitCloses++;
      
      // Log circuit closed
      this.logger.info("Circuit breaker closed after successful test", {
        name: this.config.name,
        previousState: CircuitState.HALF_OPEN,
        newState: CircuitState.CLOSED,
        successCount: this.successCount,
        totalSuccesses: this.totalSuccesses,
        totalFailures: this.totalFailures,
        circuitCloses: this.circuitCloses,
        timestamp: new Date().toISOString(),
      });
      // Keep successCount to reflect the successful test
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.totalFailures++;
    this.failureCount++;
    this.successCount = 0;
    this.lastFailureTime = Date.now();

    // If in HALF_OPEN state, failed test reopens the circuit
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.circuitOpens++;
      
      // Log circuit reopened from HALF_OPEN
      this.logger.warn("Circuit breaker reopened after failed test", {
        name: this.config.name,
        previousState: CircuitState.HALF_OPEN,
        newState: CircuitState.OPEN,
        failureCount: this.failureCount,
        totalFailures: this.totalFailures,
        circuitOpens: this.circuitOpens,
        lastFailureTime: new Date(this.lastFailureTime).toISOString(),
        cooldownTimeout: this.config.cooldownTimeout,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // If in CLOSED state, open circuit if threshold reached
    if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.circuitOpens++;
        
        // Log circuit opened
        this.logger.error("Circuit breaker opened due to failure threshold", undefined, {
          name: this.config.name,
          previousState: CircuitState.CLOSED,
          newState: CircuitState.OPEN,
          failureCount: this.failureCount,
          failureThreshold: this.config.failureThreshold,
          totalFailures: this.totalFailures,
          circuitOpens: this.circuitOpens,
          lastFailureTime: new Date(this.lastFailureTime).toISOString(),
          cooldownTimeout: this.config.cooldownTimeout,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Check if cooldown period has expired and recovery should be attempted
   */
  private shouldAttemptRecovery(): boolean {
    if (!this.lastFailureTime) {
      return false;
    }

    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.config.cooldownTimeout;
  }

  /**
   * Transition circuit to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    const previousState = this.state;
    this.state = CircuitState.HALF_OPEN;
    this.failureCount = 0;
    this.successCount = 0;
    
    // Log transition to HALF_OPEN
    this.logger.info("Circuit breaker transitioned to HALF_OPEN", {
      name: this.config.name,
      previousState,
      newState: CircuitState.HALF_OPEN,
      cooldownElapsed: this.lastFailureTime 
        ? Date.now() - this.lastFailureTime 
        : 0,
      cooldownTimeout: this.config.cooldownTimeout,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Calculate time until retry is allowed (in milliseconds)
   */
  private getRetryAfter(): number {
    if (!this.lastFailureTime) {
      return 0;
    }

    const elapsed = Date.now() - this.lastFailureTime;
    const remaining = this.config.cooldownTimeout - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Get current circuit breaker state
   * 
   * @returns Current state with metadata
   */
  getState(): CircuitBreakerState {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      name: this.config.name,
    };
  }

  /**
   * Get circuit breaker metrics
   * 
   * @returns Metrics object with statistics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      totalSuccesses: this.totalSuccesses,
      totalFailures: this.totalFailures,
      totalRequests: this.totalRequests,
      circuitOpens: this.circuitOpens,
      circuitCloses: this.circuitCloses,
    };
  }
}
