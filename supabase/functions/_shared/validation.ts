/**
 * Validation Schemas for ESPBoards Store Edge Functions
 * 
 * This file provides Zod validation schemas for:
 * - API request validation (import-product, etc.)
 * - PA-API response validation
 * - Data transformation and sanitization
 * 
 * Constitution Compliance:
 * - API Design: Strict input validation, fail-fast on invalid data
 * - Code Quality: Reusable schemas, typed validation results
 * - Security: Validate all external inputs (API requests, PA-API responses)
 * 
 * Usage:
 * ```typescript
 * import { ImportProductRequestSchema, validateImportRequest } from './_shared/validation.ts';
 * 
 * const result = validateImportRequest(requestBody);
 * if (!result.success) {
 *   return new Response(JSON.stringify({ error: result.error }), { status: 400 });
 * }
 * const { asin, marketplace } = result.data;
 * ```
 */

import { z } from 'npm:zod@3.22.4';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * ASIN (Amazon Standard Identification Number) validation
 * Format: 10 characters, alphanumeric, typically starts with B
 * Examples: B08DQQ8CBP, B07RXPHYNM
 */
const AsinSchema = z
  .string()
  .length(10, 'ASIN must be exactly 10 characters')
  .regex(/^[A-Z0-9]{10}$/, 'ASIN must be alphanumeric uppercase')
  .refine(
    (asin: string) => asin.startsWith('B') || asin.startsWith('0') || asin.startsWith('1'),
    'ASIN typically starts with B, 0, or 1'
  );

/**
 * Marketplace code validation
 * Supported: US, DE (can be extended)
 */
const MarketplaceCodeSchema = z
  .string()
  .min(2, 'Marketplace code must be at least 2 characters')
  .max(3, 'Marketplace code must be at most 3 characters')
  .toUpperCase()
  .refine(
    (code: string) => ['US', 'DE'].includes(code),
    'Marketplace code must be one of: US, DE'
  );

/**
 * Correlation ID validation (UUID v4)
 */
const CorrelationIdSchema = z
  .string()
  .uuid('Correlation ID must be a valid UUID');

/**
 * ISO 8601 timestamp validation
 */
const TimestampSchema = z
  .string()
  .datetime({ message: 'Must be a valid ISO 8601 timestamp' });

/**
 * Price validation (non-negative decimal)
 */
const PriceSchema = z
  .number()
  .nonnegative('Price must be non-negative')
  .finite('Price must be a finite number');

/**
 * Star rating validation (0.0 to 5.0)
 */
const StarRatingSchema = z
  .number()
  .min(0, 'Star rating must be at least 0')
  .max(5, 'Star rating must be at most 5');

/**
 * Currency code validation (ISO 4217)
 */
const CurrencyCodeSchema = z
  .string()
  .length(3, 'Currency code must be exactly 3 characters')
  .toUpperCase()
  .refine(
    (code: string) => ['USD', 'EUR', 'GBP', 'JPY', 'CAD'].includes(code),
    'Currency code must be a valid ISO 4217 code'
  );

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

/**
 * Import Product Request Schema (T028, T029)
 * POST /import-product
 */
export const ImportProductRequestSchema = z.object({
  asin: AsinSchema,
  marketplace: MarketplaceCodeSchema,
});

export type ImportProductRequestInput = z.infer<typeof ImportProductRequestSchema>;

/**
 * Search Products Request Schema (T094)
 * POST /search-products
 */
export const SearchProductsRequestSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be at most 100 characters')
    .trim(),
  marketplace: MarketplaceCodeSchema,
});

export type SearchProductsRequestInput = z.infer<typeof SearchProductsRequestSchema>;

/**
 * Refresh Worker Request Schema (optional body for manual triggers)
 * POST /refresh-worker
 */
export const RefreshWorkerRequestSchema = z
  .object({
    batch_size: z.number().int().min(1).max(100).optional().default(10),
    force: z.boolean().optional().default(false),
  })
  .optional();

export type RefreshWorkerRequestInput = z.infer<typeof RefreshWorkerRequestSchema>;

// ============================================================================
// PA-API ERROR RESPONSE SCHEMAS
// ============================================================================

/**
 * PA-API Error structure validation
 */
const PaapiErrorSchema = z.object({
  Code: z.string().min(1, 'Error code is required'),
  Message: z.string().min(1, 'Error message is required'),
});

/**
 * PA-API Error Response validation (T024)
 */
export const PaapiErrorResponseSchema = z.object({
  Errors: z.array(PaapiErrorSchema).min(1, 'At least one error must be present'),
});

export type PaapiErrorResponseInput = z.infer<typeof PaapiErrorResponseSchema>;

/**
 * PA-API Error Code enum validation
 */
export const PaapiErrorCodeSchema = z.enum([
  'ItemNotAccessible',
  'InvalidParameterValue',
  'TooManyRequests',
  'RequestThrottled',
  'InvalidPartnerTag',
  'InvalidAccessKeyId',
  'SignatureDoesNotMatch',
  'InvalidMarketplace',
  'InvalidResources',
  'UnknownError',
]);

export type PaapiErrorCode = z.infer<typeof PaapiErrorCodeSchema>;

// ============================================================================
// PA-API RESPONSE SCHEMAS (for validation and transformation)
// ============================================================================

/**
 * PA-API Item Image validation
 */
const PaapiImageSchema = z
  .object({
    URL: z.string().url('Image URL must be valid'),
    Height: z.number().int().positive().optional(),
    Width: z.number().int().positive().optional(),
  })
  .optional();

/**
 * PA-API Item structure validation (simplified)
 */
const PaapiItemSchema = z.object({
  ASIN: AsinSchema,
  DetailPageURL: z.string().url('Detail page URL must be valid').optional(),
  ItemInfo: z
    .object({
      Title: z
        .object({
          DisplayValue: z.string().min(1).optional(),
        })
        .optional(),
      ByLineInfo: z
        .object({
          Brand: z
            .object({
              DisplayValue: z.string().min(1).optional(),
            })
            .optional(),
          Manufacturer: z
            .object({
              DisplayValue: z.string().min(1).optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  Images: z
    .object({
      Primary: z
        .object({
          Large: PaapiImageSchema,
          Medium: PaapiImageSchema,
          Small: PaapiImageSchema,
        })
        .optional(),
    })
    .optional(),
  Offers: z
    .object({
      Listings: z
        .array(
          z.object({
            Price: z
              .object({
                Amount: PriceSchema.optional(),
                Currency: CurrencyCodeSchema.optional(),
              })
              .optional(),
            SavingBasis: z
              .object({
                Amount: PriceSchema.optional(),
              })
              .optional(),
            Availability: z
              .object({
                Type: z.string().optional(),
                Message: z.string().optional(),
              })
              .optional(),
          })
        )
        .optional(),
    })
    .optional(),
  CustomerReviews: z
    .object({
      Count: z.number().int().nonnegative().optional(),
      StarRating: z
        .object({
          Value: StarRatingSchema.optional(),
        })
        .optional(),
    })
    .optional(),
});

export type PaapiItemInput = z.infer<typeof PaapiItemSchema>;

/**
 * PA-API GetItems Response validation
 */
const PaapiGetItemsResponseSchema = z.object({
  ItemsResult: z
    .object({
      Items: z.array(PaapiItemSchema).optional(),
    })
    .optional(),
  Errors: z.array(PaapiErrorSchema).optional(),
});

export type PaapiGetItemsResponseInput = z.infer<typeof PaapiGetItemsResponseSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * Validation error structure
 */
export interface ValidationError {
  code: 'VALIDATION_ERROR';
  message: string;
  details: z.ZodIssue[];
}

/**
 * Generate a user-friendly error message from Zod validation issues
 * @param issues - Zod validation issues
 * @returns User-friendly error message
 */
function generateValidationErrorMessage(issues: z.ZodIssue[]): string {
  if (issues.length === 0) {
    return 'Invalid import product request';
  }

  // Get the first issue (most relevant)
  const firstIssue = issues[0];
  if (!firstIssue) {
    return 'Invalid import product request';
  }

  const fieldPath = firstIssue.path.join('.');
  const fieldName = fieldPath || 'field';

  // Generate specific message based on error type
  switch (firstIssue.code) {
    case 'invalid_type': {
      // Type assertion for invalid_type issues which have expected/received
      const invalidTypeIssue = firstIssue as { expected?: unknown; received?: unknown };
      if (invalidTypeIssue.received === 'undefined') {
        return `Missing required field: ${fieldName}`;
      }
      return `Invalid ${fieldName}: expected ${invalidTypeIssue.expected}, got ${invalidTypeIssue.received}`;
    }

    case 'too_small':
      return `Invalid ${fieldName}: ${firstIssue.message}`;

    case 'too_big':
      return `Invalid ${fieldName}: ${firstIssue.message}`;

    case 'invalid_string':
      return `Invalid ${fieldName} format: ${firstIssue.message}`;

    case 'custom':
      return `Invalid ${fieldName}: ${firstIssue.message}`;

    default:
      return `Invalid ${fieldName}: ${firstIssue.message}`;
  }
}

/**
 * Validate import product request
 * @param data - Request body to validate
 * @returns Validation result with typed data or error
 */
export function validateImportRequest(
  data: unknown
): ValidationResult<ImportProductRequestInput> {
  const result = ImportProductRequestSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: generateValidationErrorMessage(result.error.issues),
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate search products request (T094)
 * @param data - Request body to validate
 * @returns Validation result with typed data or error
 */
export function validateSearchProducts(
  data: unknown
): ValidationResult<SearchProductsRequestInput> {
  const result = SearchProductsRequestSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: generateValidationErrorMessage(result.error.issues),
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate ASIN format
 * @param asin - ASIN string to validate
 * @returns Validation result
 */
export function validateAsin(asin: unknown): ValidationResult<string> {
  const result = AsinSchema.safeParse(asin);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid ASIN format',
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate marketplace code
 * @param code - Marketplace code to validate
 * @returns Validation result
 */
export function validateMarketplaceCode(code: unknown): ValidationResult<string> {
  const result = MarketplaceCodeSchema.safeParse(code);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid marketplace code',
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate PA-API error response
 * @param data - PA-API response to validate
 * @returns Validation result
 */
export function validatePaapiErrorResponse(
  data: unknown
): ValidationResult<PaapiErrorResponseInput> {
  const result = PaapiErrorResponseSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid PA-API error response',
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate PA-API GetItems response
 * @param data - PA-API response to validate
 * @returns Validation result
 */
export function validatePaapiGetItemsResponse(
  data: unknown
): ValidationResult<PaapiGetItemsResponseInput> {
  const result = PaapiGetItemsResponseSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid PA-API GetItems response',
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate PA-API item
 * @param data - PA-API item to validate
 * @returns Validation result
 */
export function validatePaapiItem(data: unknown): ValidationResult<PaapiItemInput> {
  const result = PaapiItemSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid PA-API item',
        details: result.error.issues,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Extract validation error messages as string array
 * @param error - Validation error
 * @returns Array of error messages
 */
export function formatValidationErrors(error: ValidationError): string[] {
  return error.details.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Check if PA-API error code is a specific type
 * @param code - Error code to check
 * @returns Boolean indicating if code matches
 */
export function isPaapiErrorCode(code: string, expected: PaapiErrorCode): boolean {
  return code === expected;
}

/**
 * Parse and validate PA-API error code
 * @param code - Error code string
 * @returns Validated error code or 'UnknownError'
 */
export function parsePaapiErrorCode(code: string): PaapiErrorCode {
  const result = PaapiErrorCodeSchema.safeParse(code);
  return result.success ? result.data : 'UnknownError';
}

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize ASIN (convert to uppercase, trim)
 * @param asin - ASIN string to sanitize
 * @returns Sanitized ASIN or null if invalid
 */
export function sanitizeAsin(asin: string): string | null {
  const sanitized = asin.trim().toUpperCase();
  const result = validateAsin(sanitized);
  return result.success ? result.data : null;
}

/**
 * Sanitize marketplace code (convert to uppercase, trim)
 * @param code - Marketplace code to sanitize
 * @returns Sanitized code or null if invalid
 */
export function sanitizeMarketplaceCode(code: string): string | null {
  const sanitized = code.trim().toUpperCase();
  const result = validateMarketplaceCode(sanitized);
  return result.success ? result.data : null;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if error is a Zod validation error
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

/**
 * Check if value is a validation error
 */
export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    value.code === 'VALIDATION_ERROR' &&
    'message' in value &&
    'details' in value
  );
}

// ============================================================================
// EXPORT SCHEMAS FOR EXTERNAL USE
// ============================================================================

export {
  AsinSchema,
  MarketplaceCodeSchema,
  CorrelationIdSchema,
  TimestampSchema,
  PriceSchema,
  StarRatingSchema,
  CurrencyCodeSchema,
  PaapiErrorSchema,
  PaapiItemSchema,
  PaapiGetItemsResponseSchema,
};
