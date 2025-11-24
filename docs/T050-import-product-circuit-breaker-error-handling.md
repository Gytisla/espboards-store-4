# T050: Import-Product Circuit Breaker Error Handling

**Status**: ✅ COMPLETED  
**Date**: 2025-11-24  
**Related Tasks**: T049 (PA-API Circuit Breaker Integration), T027-T034 (Import Product Implementation)

## Overview

Updated the import-product Edge Function to properly handle `CircuitOpenError` thrown by the circuit breaker when PA-API is experiencing failures. This provides graceful degradation and clear communication to clients when the service is temporarily unavailable.

## Implementation Details

### 1. Import CircuitOpenError

Added import for CircuitOpenError class:

```typescript
import { CircuitOpenError } from "../_shared/circuit-breaker.ts";
```

### 2. Added CircuitOpenError Handler

Inserted CircuitOpenError handling **before** PaapiClientError handling in the catch block:

```typescript
} catch (error) {
  const paapiDuration = Date.now() - paapiStartTime;

  // T050: Handle CircuitOpenError - circuit breaker protecting against PA-API failures
  if (error instanceof CircuitOpenError) {
    logger.warn("PA-API request blocked by circuit breaker", {
      asin,
      duration_ms: paapiDuration,
      retryAfter: error.retryAfter,
      correlation_id: correlationId,
    });

    const errorResponse = createErrorResponse({
      code: ErrorCode.PAAPI_ERROR,
      message: "Service temporarily unavailable due to PA-API issues. Please try again later.",
      correlationId,
      details: {
        circuitBreakerOpen: true,
        retryAfterMs: error.retryAfter,
        retryAfterSeconds: Math.ceil(error.retryAfter / 1000),
      },
    });

    return new Response(JSON.stringify(errorResponse), {
      status: 503, // Service Unavailable
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(error.retryAfter / 1000)), // Seconds
      },
    });
  }

  // Existing PaapiClientError handling continues...
}
```

## Response Specification

### HTTP 503 Service Unavailable

When the circuit breaker is OPEN, import-product returns:

**Status Code**: `503 Service Unavailable`

**Headers**:
```
Content-Type: application/json
Retry-After: 300  (seconds until circuit may close)
Access-Control-Allow-Origin: *
```

**Response Body**:
```json
{
  "error": {
    "code": "PAAPI_ERROR",
    "message": "Service temporarily unavailable due to PA-API issues. Please try again later.",
    "details": {
      "circuitBreakerOpen": true,
      "retryAfterMs": 300000,
      "retryAfterSeconds": 300
    }
  },
  "correlation_id": "uuid-for-tracing"
}
```

## Logging

When CircuitOpenError is caught, the function logs a **warning** (not an error) with:

```json
{
  "timestamp": "2025-11-24T17:00:00.000Z",
  "level": "warn",
  "message": "PA-API request blocked by circuit breaker",
  "metadata": {
    "asin": "B08DQQ8CBP",
    "duration_ms": 5,
    "retryAfter": 300000,
    "correlation_id": "uuid-for-tracing"
  }
}
```

**Why WARN and not ERROR?**: Circuit breaker blocking is **expected behavior** during PA-API outages. It's working as designed to protect the system. It's not an error in our code.

## Client Behavior

Clients should:

1. **Check HTTP Status**: Look for `503 Service Unavailable`
2. **Read Retry-After Header**: Wait the specified number of seconds before retrying
3. **Check Error Details**: Look for `circuitBreakerOpen: true` to distinguish from other errors
4. **Show User-Friendly Message**: "Service temporarily unavailable. Please try again in X minutes."
5. **Implement Exponential Backoff**: If retrying, use the Retry-After value as minimum delay

### Example Client Code

```typescript
async function importProduct(asin: string, marketplace: string) {
  try {
    const response = await fetch('/import-product', {
      method: 'POST',
      body: JSON.stringify({ asin, marketplace }),
    });

    if (response.status === 503) {
      const retryAfter = response.headers.get('Retry-After');
      const data = await response.json();
      
      if (data.error?.details?.circuitBreakerOpen) {
        console.log(`Circuit breaker is open. Retry in ${retryAfter} seconds`);
        // Show user-friendly message
        // Schedule retry after cooldown period
      }
    }

    return response.json();
  } catch (error) {
    console.error('Import failed:', error);
  }
}
```

## Benefits

### System Protection
- **Fail Fast**: No wasted time waiting for PA-API timeout
- **Resource Conservation**: CPU/memory not tied up in failing requests
- **Cascade Failure Prevention**: Stops failures from propagating to other parts of the system

### User Experience
- **Clear Communication**: Users know service is temporarily unavailable (not a bug)
- **Retry Guidance**: Retry-After header tells them exactly when to try again
- **Observability**: Correlation IDs allow support teams to trace issues

### Operations
- **Circuit State Visibility**: Logging shows when circuit breaker activates
- **Automatic Recovery**: System auto-recovers when PA-API comes back online
- **No Manual Intervention**: Circuit breaker handles recovery automatically

## Testing

### Unit Test Results

Created comprehensive test suite: `circuit-breaker-integration.test.ts`

```
✅ Import Product - Circuit Breaker Integration (T050)
  ✅ CircuitOpenError Handling (6 tests)
    ✅ should properly format CircuitOpenError properties
    ✅ should calculate retry-after in seconds correctly
    ✅ should verify circuit breaker singleton exists
    ✅ should verify CircuitOpenError is thrown when circuit is open
    ✅ should format expected error response structure for 503
    ✅ should verify Retry-After header calculation
  ✅ Integration with import-product (1 test)
    ✅ should document expected behavior when circuit is open

Total: 7 tests, 9 steps, 0 failures (11ms)
```

### Verified Behaviors

1. **CircuitOpenError Structure**: Name, message, retryAfter properties validated
2. **Retry-After Calculation**: Correctly converts milliseconds to seconds (rounded up)
3. **Circuit Breaker State**: Singleton instance accessible and tracks state correctly
4. **Error Response Format**: Matches expected structure with all required fields
5. **Header Calculation**: Various durations convert correctly to Retry-After seconds

## Error Handling Flow

```
Client Request (POST /import-product)
  ↓
Validation & Setup
  ↓
PA-API Request via Circuit Breaker
  ↓
Circuit Breaker State Check
  ├─ CLOSED → Execute request
  ├─ HALF_OPEN → Execute test request
  └─ OPEN → Throw CircuitOpenError ❌
       ↓
  T050: Catch CircuitOpenError
       ↓
  Log WARNING (not ERROR)
       ↓
  Build 503 Response
    - Set Retry-After header
    - Include circuit breaker details
    - User-friendly message
       ↓
  Return to Client
```

## Integration with Circuit Breaker

The import-product function now has **three layers of error handling**:

1. **CircuitOpenError** (T050 - NEW)
   - Status: 503 Service Unavailable
   - Header: Retry-After
   - Message: "Service temporarily unavailable"

2. **PaapiClientError** (T034 - Existing)
   - Status: 400/429/502/504 (varies by error)
   - Maps PA-API error codes to HTTP codes
   - Includes original PA-API error details

3. **Unexpected Errors** (T034 - Existing)
   - Status: 500 Internal Server Error
   - Catch-all for unknown errors
   - Full error logging with stack traces

## Next Steps

**T051**: Write integration test simulating circuit breaker behavior end-to-end
- Test: Circuit opens after 5 consecutive PA-API failures
- Test: Subsequent imports fail fast with 503
- Test: Circuit closes after cooldown and successful request

**T052**: Run end-to-end verification
- Validate circuit breaker in production-like scenario
- Verify all logging and metrics
- Confirm automatic recovery

## Files Modified

- `supabase/functions/import-product/index.ts`
  - Added CircuitOpenError import
  - Added CircuitOpenError catch block before PaapiClientError
  - Returns 503 with Retry-After header
  - Logs warning with circuit breaker details

## Files Created

- `supabase/functions/import-product/__tests__/circuit-breaker-integration.test.ts`
  - 7 comprehensive test scenarios
  - Validates CircuitOpenError structure
  - Documents expected behavior
  - Verifies response formatting

## Dependencies

- Circuit breaker (T043-T048)
- PA-API circuit breaker integration (T049)
- Import product Edge Function (T027-T034)
- Error handling utilities (ErrorCode, createErrorResponse)
- Logger with correlation IDs

## Related Documentation

- [T049: PA-API Circuit Breaker Integration](./T049-paapi-circuit-breaker-integration.md)
- [T043-T048: Circuit Breaker Implementation](./circuit-breaker-implementation.md)
- [T027-T034: Import Product Edge Function](./import-product-implementation.md)
- [Circuit Breaker Pattern (Martin Fowler)](https://martinfowler.com/bliki/CircuitBreaker.html)

## Key Achievement

✨ **Import-product Edge Function now gracefully handles PA-API outages with clear error messages, proper HTTP status codes, and automatic retry guidance for clients. The circuit breaker provides system-wide protection while maintaining excellent observability.**
