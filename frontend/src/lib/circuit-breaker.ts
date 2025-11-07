// Circuit Breaker Pattern Implementation
// Prevents cascading failures by tracking service health

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Service is down, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening
  successThreshold: number    // Number of successes to close from half-open
  timeout: number            // Time in ms before trying again
  resetTimeout: number       // Time in ms to wait before half-open
}

interface CircuitBreakerState {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime: number | null
  nextAttemptTime: number | null
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,        // 30 seconds
  resetTimeout: 60000    // 1 minute
}

class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    }
  }

  /**
   * Check if request should be allowed
   */
  canAttempt(): boolean {
    const now = Date.now()

    switch (this.state.state) {
      case CircuitState.CLOSED:
        return true

      case CircuitState.OPEN:
        // Check if enough time has passed to try again
        if (this.state.nextAttemptTime && now >= this.state.nextAttemptTime) {
          this.state.state = CircuitState.HALF_OPEN
          this.state.successCount = 0
          return true
        }
        return false

      case CircuitState.HALF_OPEN:
        return true

      default:
        return false
    }
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.successCount++
      
      if (this.state.successCount >= this.config.successThreshold) {
        this.reset()
      }
    } else if (this.state.state === CircuitState.CLOSED) {
      this.state.failureCount = 0
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.state.failureCount++
    this.state.lastFailureTime = Date.now()

    if (this.state.state === CircuitState.HALF_OPEN) {
      this.open()
    } else if (this.state.failureCount >= this.config.failureThreshold) {
      this.open()
    }
  }

  /**
   * Open the circuit (stop allowing requests)
   */
  private open(): void {
    this.state.state = CircuitState.OPEN
    this.state.nextAttemptTime = Date.now() + this.config.resetTimeout
  }

  /**
   * Reset to closed state
   */
  private reset(): void {
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state }
  }

  /**
   * Force reset (for testing/admin)
   */
  forceReset(): void {
    this.reset()
  }
}

// Global circuit breaker instance for R Analytics service
export const analyticsCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
  resetTimeout: 60000
})
