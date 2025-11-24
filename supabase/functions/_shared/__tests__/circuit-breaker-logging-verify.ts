/**
 * Circuit Breaker Logging Verification
 * 
 * Manual test to verify circuit breaker state change logging.
 * This demonstrates the logging functionality without adding
 * automated tests that capture console output.
 */

import { CircuitBreaker } from "../circuit-breaker.ts";

console.log("=== Circuit Breaker Logging Verification ===\n");

// Create circuit breaker with low threshold for quick testing
const breaker = new CircuitBreaker({
  failureThreshold: 3,
  cooldownTimeout: 1000, // 1 second for quick testing
  name: "test-circuit",
});

console.log("\n--- Test 1: Circuit Opens After Failures ---");
const failureFn = async (): Promise<never> => {
  throw new Error("Simulated failure");
};

// Trigger 3 failures to open circuit
for (let i = 1; i <= 3; i++) {
  try {
    await breaker.execute(failureFn);
  } catch (error) {
    console.log(`Failure ${i}/3: ${error.message}`);
  }
}

console.log("\n--- Test 2: Circuit Blocks Requests When OPEN ---");
try {
  await breaker.execute(async () => "test");
} catch (error) {
  console.log(`Request blocked: ${error.message}`);
}

console.log("\n--- Test 3: Wait for Cooldown and Transition to HALF_OPEN ---");
console.log("Waiting 1.2 seconds for cooldown...");
await new Promise(resolve => setTimeout(resolve, 1200));

console.log("\n--- Test 4: Successful Test Closes Circuit ---");
const successFn = async (): Promise<string> => "success";
try {
  const result = await breaker.execute(successFn);
  console.log(`Request succeeded: ${result}`);
} catch (error) {
  console.log(`Request failed: ${error.message}`);
}

console.log("\n--- Circuit Breaker State ---");
const state = breaker.getState();
console.log(JSON.stringify(state, null, 2));

console.log("\n--- Circuit Breaker Metrics ---");
const metrics = breaker.getMetrics();
console.log(JSON.stringify(metrics, null, 2));

console.log("\n=== Verification Complete ===");
console.log("\nExpected Log Output:");
console.log("1. Circuit breaker initialized");
console.log("2. Circuit breaker opened due to failure threshold (after 3rd failure)");
console.log("3. Circuit breaker transitioned to HALF_OPEN (after cooldown)");
console.log("4. Circuit breaker closed after successful test");
