/**
 * Standardized Error Responses for ESP32 Store Edge Functions
 * 
 * This file provides:
 * - ErrorResponse interface and error code constants
 * - Helper functions for creating consistent error responses
 * - Error logging with correlation IDs
 * - HTTP status code mapping
 * 
 * Constitution Compliance:
 * - API Design: Consistent error responses across all Edge Functions
 * - Observability: Error logging with correlation IDs for tracing
 * - Code Quality: Typed errors, reusable helpers
 * 
 * Usage:
 * ```typescript
 * import { createErrorResponse, ErrorCode } from './_shared/errors.ts';
 * 
 * const errorResponse = createErrorResponse({
 *   code: ErrorCode.VALIDATION_ERROR,
 *   message: 'Invalid ASIN format',
 *   correlationId: 'abc-123',
 *   details: { field: 'asin', value: 'invalid' }
 * });
 * 
 * return new Response(JSON.stringify(errorResponse), { status: 400 });
 * ```
 */

import type { ErrorResponse } from './types.ts';
import { Logger, generateCorrelationId } from './logger.ts';

// ============================================================================
// ERROR CODE CONSTANTS
// ============================================================================

/**
 * Standard error codes used across Edge Functions
 */
export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_ASIN = 'INVALID_ASIN',
  INVALID_MARKETPLACE = 'INVALID_MARKETPLACE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_REQUEST_BODY = 'INVALID_REQUEST_BODY',

  // Authentication/Authorization Errors (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_API_KEY = 'INVALID_API_KEY',

  // Not Found Errors (404)
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  MARKETPLACE_NOT_FOUND = 'MARKETPLACE_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // PA-API Errors (502, 503)
  PAAPI_ERROR = 'PAAPI_ERROR',
  PAAPI_ITEM_NOT_ACCESSIBLE = 'PAAPI_ITEM_NOT_ACCESSIBLE',
  PAAPI_INVALID_PARAMETER = 'PAAPI_INVALID_PARAMETER',
  PAAPI_THROTTLED = 'PAAPI_THROTTLED',
  PAAPI_TIMEOUT = 'PAAPI_TIMEOUT',

  // Circuit Breaker Errors (503)
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Database Errors (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',

  // Internal Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Map error codes to HTTP status codes
 */
export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_ASIN]: 400,
  [ErrorCode.INVALID_MARKETPLACE]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_REQUEST_BODY]: 400,

  // 401 Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_API_KEY]: 401,

  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,

  // 404 Not Found
  [ErrorCode.PRODUCT_NOT_FOUND]: 404,
  [ErrorCode.MARKETPLACE_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,

  // 502 Bad Gateway (PA-API errors)
  [ErrorCode.PAAPI_ERROR]: 502,
  [ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE]: 502,
  [ErrorCode.PAAPI_INVALID_PARAMETER]: 502,
  [ErrorCode.PAAPI_THROTTLED]: 502,
  [ErrorCode.PAAPI_TIMEOUT]: 502,

  // 503 Service Unavailable
  [ErrorCode.CIRCUIT_BREAKER_OPEN]: 503,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,

  // 500 Internal Server Error
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.DATABASE_CONNECTION_FAILED]: 500,
  [ErrorCode.DATABASE_QUERY_FAILED]: 500,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.UNKNOWN_ERROR]: 500,
};

// ============================================================================
// ERROR RESPONSE CREATION
// ============================================================================

/**
 * Parameters for creating an error response
 */
export interface CreateErrorResponseOptions {
  code: ErrorCode | string;
  message: string;
  correlationId?: string;
  details?: Record<string, unknown>;
}

/**
 * Create a standardized error response
 * 
 * @param options - Error response options
 * @returns ErrorResponse object
 * 
 * @example
 * ```typescript
 * const error = createErrorResponse({
 *   code: ErrorCode.INVALID_ASIN,
 *   message: 'ASIN must be 10 characters',
 *   correlationId: 'abc-123',
 *   details: { asin: 'invalid', expected_length: 10 }
 * });
 * ```
 */
export function createErrorResponse(options: CreateErrorResponseOptions): ErrorResponse {
  const { code, message, correlationId, details } = options;

  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  if (correlationId) {
    errorResponse.correlation_id = correlationId;
  }

  return errorResponse;
}

/**
 * Create an error Response object with proper status code and headers
 * 
 * @param options - Error response options
 * @returns Response object with JSON error body
 * 
 * @example
 * ```typescript
 * return createErrorResponseObject({
 *   code: ErrorCode.VALIDATION_ERROR,
 *   message: 'Invalid request',
 *   correlationId: req.headers.get('x-correlation-id') || generateCorrelationId()
 * });
 * ```
 */
export function createErrorResponseObject(
  options: CreateErrorResponseOptions
): Response {
  const errorResponse = createErrorResponse(options);
  
  // Determine HTTP status code
  const statusCode = ERROR_STATUS_CODES[options.code as ErrorCode] || 500;

  // Create response with CORS headers
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      ...(options.correlationId && { 'X-Correlation-ID': options.correlationId }),
    },
  });
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Options for logging errors
 */
export interface LogErrorOptions {
  error: Error | unknown;
  code: ErrorCode | string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  logger?: Logger;
}

/**
 * Log an error with correlation ID and structured metadata
 * 
 * @param options - Error logging options
 * 
 * @example
 * ```typescript
 * try {
 *   await fetchFromPaapi();
 * } catch (error) {
 *   logError({
 *     error,
 *     code: ErrorCode.PAAPI_ERROR,
 *     correlationId,
 *     metadata: { asin: 'B08DQQ8CBP', marketplace: 'US' }
 *   });
 * }
 * ```
 */
export function logError(options: LogErrorOptions): void {
  const { error, code, correlationId, metadata, logger } = options;

  // Create logger instance if not provided
  const log = logger || new Logger({ correlationId });

  // Extract error details
  const errorObject = error instanceof Error ? error : undefined;
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Log error with structured metadata
  log.error(
    `Error occurred: ${code} - ${errorMessage}`,
    errorObject,
    {
      ...metadata,
      error_code: code,
    }
  );
}

/**
 * Log error and create error response in one call
 * 
 * @param options - Combined logging and response options
 * @returns Response object with JSON error body
 * 
 * @example
 * ```typescript
 * return logErrorAndRespond({
 *   error: err,
 *   code: ErrorCode.DATABASE_ERROR,
 *   message: 'Failed to query products table',
 *   correlationId,
 *   metadata: { query: 'SELECT * FROM products' }
 * });
 * ```
 */
export function logErrorAndRespond(
  options: LogErrorOptions & { message: string }
): Response {
  // Log the error
  logError(options);

  // Create error response
  return createErrorResponseObject({
    code: options.code,
    message: options.message,
    correlationId: options.correlationId,
    details: options.metadata,
  });
}

// ============================================================================
// ERROR TYPE GUARDS
// ============================================================================

/**
 * Check if error is a validation error
 */
export function isValidationError(code: string): boolean {
  return [
    ErrorCode.VALIDATION_ERROR,
    ErrorCode.INVALID_ASIN,
    ErrorCode.INVALID_MARKETPLACE,
    ErrorCode.MISSING_REQUIRED_FIELD,
    ErrorCode.INVALID_REQUEST_BODY,
  ].includes(code as ErrorCode);
}

/**
 * Check if error is a PA-API error
 */
export function isPaapiError(code: string): boolean {
  return [
    ErrorCode.PAAPI_ERROR,
    ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE,
    ErrorCode.PAAPI_INVALID_PARAMETER,
    ErrorCode.PAAPI_THROTTLED,
    ErrorCode.PAAPI_TIMEOUT,
  ].includes(code as ErrorCode);
}

/**
 * Check if error is a database error
 */
export function isDatabaseError(code: string): boolean {
  return [
    ErrorCode.DATABASE_ERROR,
    ErrorCode.DATABASE_CONNECTION_FAILED,
    ErrorCode.DATABASE_QUERY_FAILED,
  ].includes(code as ErrorCode);
}

/**
 * Check if error code indicates a retryable error
 */
export function isRetryableError(code: string): boolean {
  return [
    ErrorCode.PAAPI_THROTTLED,
    ErrorCode.PAAPI_TIMEOUT,
    ErrorCode.DATABASE_CONNECTION_FAILED,
    ErrorCode.SERVICE_UNAVAILABLE,
  ].includes(code as ErrorCode);
}

// ============================================================================
// PA-API ERROR MAPPING
// ============================================================================

/**
 * Map PA-API error code to application error code
 * 
 * @param paapiErrorCode - PA-API error code string
 * @returns Mapped ErrorCode
 */
export function mapPaapiErrorCode(paapiErrorCode: string): ErrorCode {
  const mapping: Record<string, ErrorCode> = {
    ItemNotAccessible: ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE,
    InvalidParameterValue: ErrorCode.PAAPI_INVALID_PARAMETER,
    TooManyRequests: ErrorCode.PAAPI_THROTTLED,
    RequestThrottled: ErrorCode.PAAPI_THROTTLED,
    InvalidPartnerTag: ErrorCode.PAAPI_INVALID_PARAMETER,
    InvalidAccessKeyId: ErrorCode.INVALID_API_KEY,
    SignatureDoesNotMatch: ErrorCode.INVALID_API_KEY,
  };

  return mapping[paapiErrorCode] || ErrorCode.PAAPI_ERROR;
}

/**
 * Create error response from PA-API error
 * 
 * @param paapiErrorCode - PA-API error code
 * @param paapiErrorMessage - PA-API error message
 * @param correlationId - Correlation ID for tracing
 * @returns ErrorResponse object
 */
export function createPaapiErrorResponse(
  paapiErrorCode: string,
  paapiErrorMessage: string,
  correlationId?: string
): ErrorResponse {
  const code = mapPaapiErrorCode(paapiErrorCode);

  return createErrorResponse({
    code,
    message: `PA-API Error: ${paapiErrorMessage}`,
    correlationId,
    details: {
      paapi_error_code: paapiErrorCode,
      paapi_error_message: paapiErrorMessage,
    },
  });
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON ERRORS
// ============================================================================

/**
 * Create a validation error response
 */
export function validationError(
  message: string,
  correlationId?: string,
  details?: Record<string, unknown>
): Response {
  return createErrorResponseObject({
    code: ErrorCode.VALIDATION_ERROR,
    message,
    correlationId,
    details,
  });
}

/**
 * Create a not found error response
 */
export function notFoundError(
  resource: string,
  correlationId?: string
): Response {
  return createErrorResponseObject({
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: `${resource} not found`,
    correlationId,
  });
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(
  message = 'Unauthorized',
  correlationId?: string
): Response {
  return createErrorResponseObject({
    code: ErrorCode.UNAUTHORIZED,
    message,
    correlationId,
  });
}

/**
 * Create a rate limit error response with retry-after header
 */
export function rateLimitError(
  retryAfterSeconds: number,
  correlationId?: string
): Response {
  const response = createErrorResponseObject({
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds`,
    correlationId,
    details: { retry_after_seconds: retryAfterSeconds },
  });

  // Add Retry-After header
  response.headers.set('Retry-After', String(retryAfterSeconds));

  return response;
}

/**
 * Create a circuit breaker open error response
 */
export function circuitBreakerError(
  retryAfterSeconds: number,
  correlationId?: string
): Response {
  const response = createErrorResponseObject({
    code: ErrorCode.CIRCUIT_BREAKER_OPEN,
    message: 'Service temporarily unavailable due to upstream failures',
    correlationId,
    details: { 
      retry_after_seconds: retryAfterSeconds,
      reason: 'Circuit breaker is open',
    },
  });

  // Add Retry-After header
  response.headers.set('Retry-After', String(retryAfterSeconds));

  return response;
}

/**
 * Create an internal server error response
 */
export function internalServerError(
  message = 'Internal server error',
  correlationId?: string,
  details?: Record<string, unknown>
): Response {
  return createErrorResponseObject({
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message,
    correlationId,
    details,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { generateCorrelationId };
