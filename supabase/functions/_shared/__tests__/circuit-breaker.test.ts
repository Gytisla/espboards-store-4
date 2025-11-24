/**
 * Circuit Breaker Unit Tests
 * 
 * Tests the circuit breaker pattern implementation for protecting against
 * cascade failures during external service outages (e.g., PA-API).
 * 
 * Circuit Breaker States:
 * - CLOSED: Normal operation, all requests pass through
 * - OPEN: Circuit opened after threshold failures, all requests blocked
 * - HALF_OPEN: Testing phase after cooldown, single test request allowed
 * 
 * Constitution Compliance:
 * - TDD: Tests written FIRST, implementation follows
 * - Performance: Prevent cascade failures, auto-recovery
 * - Observability: State changes logged with timestamps
 */

import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.220.0/assert/mod.ts";
import { describe, it, beforeEach } from "https://deno.land/std@0.220.0/testing/bdd.ts";

// Import types and classes to test (will fail until implemented)
import {
  CircuitBreaker,
  CircuitState,
  CircuitOpenError,
  type CircuitBreakerConfig,
} from "../circuit-breaker.ts";

describe("CircuitBreaker", () => {
  describe("Constructor and Configuration", () => {
    it("should create circuit breaker with default configuration", () => {
      const breaker = new CircuitBreaker();
      const state = breaker.getState();
      
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.failureCount, 0);
      assertEquals(state.successCount, 0);
    });

    it("should create circuit breaker with custom configuration", () => {
      const config: CircuitBreakerConfig = {
        failureThreshold: 3,
        cooldownTimeout: 10000, // 10 seconds
        name: "test-breaker",
      };
      
      const breaker = new CircuitBreaker(config);
      const state = breaker.getState();
      
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.name, "test-breaker");
    });
  });

  describe("CLOSED State - Normal Operation", () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker({
        failureThreshold: 5,
        cooldownTimeout: 5 * 60 * 1000, // 5 minutes
      });
    });

    it("should remain CLOSED on successful operations", async () => {
      const successFn = async (): Promise<string> => "success";
      
      const result1 = await breaker.execute(successFn);
      assertEquals(result1, "success");
      
      const result2 = await breaker.execute(successFn);
      assertEquals(result2, "success");
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.successCount, 2);
      assertEquals(state.failureCount, 0);
    });

    it("should track failure count but remain CLOSED below threshold", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // 4 failures (below threshold of 5)
      for (let i = 0; i < 4; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error,
          "Service failure"
        );
      }
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.failureCount, 4);
      assertEquals(state.successCount, 0);
    });

    it("should reset failure count after successful operation", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      const successFn = async (): Promise<string> => "success";
      
      // 3 failures
      for (let i = 0; i < 3; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      let state = breaker.getState();
      assertEquals(state.failureCount, 3);
      
      // 1 success should reset failure count
      await breaker.execute(successFn);
      
      state = breaker.getState();
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.failureCount, 0);
      assertEquals(state.successCount, 1);
    });
  });

  describe("OPEN State - Circuit Opened", () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker({
        failureThreshold: 5,
        cooldownTimeout: 5 * 60 * 1000, // 5 minutes
      });
    });

    it("should open circuit after threshold failures (5 failures)", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // 5 failures should open circuit
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error,
          "Service failure"
        );
      }
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.OPEN);
      assertEquals(state.failureCount, 5);
    });

    it("should block all requests when OPEN", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // Open the circuit with 5 failures
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      // Verify circuit is OPEN
      let state = breaker.getState();
      assertEquals(state.state, CircuitState.OPEN);
      
      // Next request should be blocked immediately without calling function
      const successFn = async (): Promise<string> => "success";
      
      await assertRejects(
        async () => await breaker.execute(successFn),
        CircuitOpenError,
        "Circuit breaker is OPEN"
      );
      
      // Failure count should not increase (request was blocked, not attempted)
      state = breaker.getState();
      assertEquals(state.failureCount, 5);
    });

    it("should include retry-after duration in CircuitOpenError", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      // Try to execute when circuit is OPEN
      try {
        await breaker.execute(async (): Promise<string> => "test");
        throw new Error("Should have thrown CircuitOpenError");
      } catch (error) {
        assertEquals(error instanceof CircuitOpenError, true);
        const circuitError = error as CircuitOpenError;
        assertEquals(circuitError.name, "CircuitOpenError");
        
        // Should have retry-after duration
        assertEquals(typeof circuitError.retryAfter, "number");
        assertEquals(circuitError.retryAfter > 0, true);
      }
    });
  });

  describe("HALF_OPEN State - Testing Phase", () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker({
        failureThreshold: 5,
        cooldownTimeout: 100, // 100ms for faster tests
      });
    });

    it("should transition to HALF_OPEN after cooldown period", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      assertEquals(breaker.getState().state, CircuitState.OPEN);
      
      // Wait for cooldown period
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Next request should transition to HALF_OPEN
      const successFn = async (): Promise<string> => "success";
      const result = await breaker.execute(successFn);
      
      assertEquals(result, "success");
      
      // Circuit should now be CLOSED after successful test
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.failureCount, 0);
    });

    it("should close circuit after successful test in HALF_OPEN state", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service failure");
      };
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Successful test should close circuit
      const successFn = async (): Promise<string> => "recovered";
      const result = await breaker.execute(successFn);
      
      assertEquals(result, "recovered");
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(state.failureCount, 0);
      assertEquals(state.successCount, 1);
    });

    it("should reopen circuit if test fails in HALF_OPEN state", async () => {
      const failureFn = async (): Promise<never> => {
        throw new Error("Service still failing");
      };
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      // Wait for cooldown
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Failed test should reopen circuit
      await assertRejects(
        async () => await breaker.execute(failureFn),
        Error,
        "Service still failing"
      );
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.OPEN);
      
      // Subsequent requests should be blocked immediately
      await assertRejects(
        async () => await breaker.execute(failureFn),
        CircuitOpenError
      );
    });
  });

  describe("State Tracking", () => {
    it("should return current circuit state with getState()", () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 5,
        cooldownTimeout: 5 * 60 * 1000,
        name: "test-circuit",
      });
      
      const state = breaker.getState();
      
      assertEquals(typeof state.state, "string");
      assertEquals(state.state, CircuitState.CLOSED);
      assertEquals(typeof state.failureCount, "number");
      assertEquals(typeof state.successCount, "number");
      assertEquals(state.name, "test-circuit");
    });

    it("should track timestamps for state changes", async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        cooldownTimeout: 100,
      });
      
      const failureFn = async (): Promise<never> => {
        throw new Error("Failure");
      };
      
      // Open circuit with 2 failures
      for (let i = 0; i < 2; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      const state = breaker.getState();
      assertEquals(state.state, CircuitState.OPEN);
      assertEquals(typeof state.lastFailureTime, "number");
      if (state.lastFailureTime !== undefined) {
        assertEquals(state.lastFailureTime > 0, true);
      }
    });
  });

  describe("Metrics", () => {
    it("should track total successes and failures", async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 10,
      });
      
      const successFn = async (): Promise<string> => "ok";
      const failureFn = async (): Promise<never> => {
        throw new Error("fail");
      };
      
      // 3 successes
      for (let i = 0; i < 3; i++) {
        await breaker.execute(successFn);
      }
      
      // 2 failures
      for (let i = 0; i < 2; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      const metrics = breaker.getMetrics();
      assertEquals(metrics.totalSuccesses, 3);
      assertEquals(metrics.totalFailures, 2);
      assertEquals(typeof metrics.totalRequests, "number");
      assertEquals(metrics.totalRequests, 5);
    });

    it("should track circuit open/close count", async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        cooldownTimeout: 50,
      });
      
      const failureFn = async (): Promise<never> => {
        throw new Error("fail");
      };
      const successFn = async (): Promise<string> => "ok";
      
      // Open circuit (first time)
      for (let i = 0; i < 2; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      let metrics = breaker.getMetrics();
      assertEquals(metrics.circuitOpens, 1);
      
      // Wait and close circuit
      await new Promise(resolve => setTimeout(resolve, 100));
      await breaker.execute(successFn);
      
      metrics = breaker.getMetrics();
      assertEquals(metrics.circuitCloses, 1);
      
      // Open circuit again
      for (let i = 0; i < 2; i++) {
        await assertRejects(
          async () => await breaker.execute(failureFn),
          Error
        );
      }
      
      metrics = breaker.getMetrics();
      assertEquals(metrics.circuitOpens, 2);
    });
  });

  describe("Error Handling", () => {
    it("should throw CircuitOpenError with proper error properties", async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
      });
      
      // Open circuit
      await assertRejects(
        async () => await breaker.execute(async (): Promise<never> => {
          throw new Error("fail");
        }),
        Error
      );
      
      // Try to execute when OPEN
      try {
        await breaker.execute(async (): Promise<string> => "test");
        throw new Error("Should have thrown");
      } catch (error) {
        assertEquals(error instanceof CircuitOpenError, true);
        const circuitError = error as CircuitOpenError;
        assertEquals(circuitError.name, "CircuitOpenError");
        assertEquals(typeof circuitError.message, "string");
        assertEquals(circuitError.message.includes("Circuit breaker is OPEN"), true);
      }
    });

    it("should preserve original error when function fails", async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 10,
      });
      
      class CustomError extends Error {
        constructor(message: string, public code: string) {
          super(message);
          this.name = "CustomError";
        }
      }
      
      const failureFn = async (): Promise<never> => {
        throw new CustomError("Custom failure", "CUSTOM_CODE");
      };
      
      try {
        await breaker.execute(failureFn);
        throw new Error("Should have thrown");
      } catch (error) {
        assertEquals(error instanceof CustomError, true);
        const customError = error as CustomError;
        assertEquals(customError.message, "Custom failure");
        assertEquals(customError.code, "CUSTOM_CODE");
      }
    });
  });
});
