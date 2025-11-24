/**
 * Shared TypeScript Interfaces for ESP32 Store Edge Functions
 * 
 * This file contains all shared type definitions used across Edge Functions:
 * - Database table types (matching PostgreSQL schema)
 * - API request/response types
 * - PA-API (Product Advertising API) types
 * - Circuit breaker types
 * - Utility types
 * 
 * Constitution Compliance:
 * - Code Quality: Explicit types, strict TypeScript
 * - API Design: Consistent request/response structures
 * - Observability: Types for logging and monitoring
 */

// ============================================================================
// DATABASE TYPES (matching PostgreSQL schema from T011-T013)
// ============================================================================

/**
 * Marketplace table row
 * Represents an Amazon marketplace (US, DE, etc.)
 */
export interface Marketplace {
  id: string; // UUID
  code: string; // e.g., "US", "DE"
  region_name: string; // e.g., "United States", "Germany"
  currency: string; // e.g., "USD", "EUR"
  paapi_endpoint: string; // PA-API endpoint URL
  associate_tag: string; // Amazon Associate Tag
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Product status enum
 */
export type ProductStatus = 'draft' | 'active' | 'unavailable';

/**
 * Product table row
 * Represents an ESP32 product from Amazon
 */
export interface Product {
  // Identity
  id: string; // UUID
  asin: string; // Amazon Standard Identification Number
  marketplace_id: string; // Foreign key to marketplaces
  parent_id: string | null; // Self-referencing FK for variations

  // Basic info
  title: string | null;
  description: string | null;
  brand: string | null;
  manufacturer: string | null;

  // Media
  images: ProductImage[] | null; // JSONB
  detail_page_url: string | null;

  // Pricing
  current_price: number | null; // Decimal
  original_price: number | null; // Decimal
  savings_amount: number | null; // Decimal
  savings_percentage: number | null; // Decimal
  currency: string | null;

  // Availability
  availability_type: string | null;
  availability_message: string | null;

  // Ratings
  customer_review_count: number | null;
  star_rating: number | null; // Decimal

  // Metadata
  status: ProductStatus;
  last_refresh_at: string | null; // ISO 8601 timestamp
  last_available_at: string | null; // ISO 8601 timestamp

  // Raw PA-API response
  raw_paapi_response: Record<string, unknown> | null; // JSONB

  // Timestamps
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Product image structure (stored in JSONB)
 */
export interface ProductImage {
  url: string;
  width?: number;
  height?: number;
  variant?: 'Primary' | 'Secondary' | 'Thumbnail';
}

/**
 * Refresh job status enum
 */
export type RefreshJobStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

/**
 * Circuit breaker state enum
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Refresh job table row
 * Tracks background refresh operations
 */
export interface RefreshJob {
  id: string; // UUID
  product_id: string; // Foreign key to products
  scheduled_at: string; // ISO 8601 timestamp
  started_at: string | null; // ISO 8601 timestamp
  completed_at: string | null; // ISO 8601 timestamp
  status: RefreshJobStatus;
  retry_count: number;
  error_code: string | null;
  error_message: string | null;
  circuit_breaker_state: CircuitBreakerState | null;
  created_at: string; // ISO 8601 timestamp
}

// ============================================================================
// API REQUEST/RESPONSE TYPES (for Edge Functions)
// ============================================================================

/**
 * Import Product Request (T021-T035)
 */
export interface ImportProductRequest {
  asin: string; // Amazon Standard Identification Number
  marketplace: string; // Marketplace code (e.g., "US", "DE")
}

/**
 * Import Product Response (T033)
 */
export interface ImportProductResponse {
  product_id: string;
  asin: string;
  title: string | null;
  status: ProductStatus;
  imported_at: string; // ISO 8601 timestamp
  correlation_id: string;
}

/**
 * Error Response (T019, T033)
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  correlation_id?: string;
}

/**
 * Health Check Response (T073)
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string; // ISO 8601 timestamp
  components: {
    database: ComponentHealth;
    paapi: ComponentHealth;
    circuit_breaker: ComponentHealth;
  };
}

/**
 * Component health status
 */
export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Refresh Worker Response (T061)
 */
export interface RefreshWorkerResponse {
  processed_count: number;
  success_count: number;
  failure_count: number;
  skipped_count: number;
  circuit_state: CircuitBreakerState;
  duration_ms: number;
  correlation_id: string;
}

// ============================================================================
// PA-API TYPES (Product Advertising API 5.0)
// ============================================================================

/**
 * PA-API Configuration (T022)
 */
export interface PaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string; // e.g., "www.amazon.com"
  region: string; // e.g., "us-east-1"
}

/**
 * PA-API GetItems Request (T022)
 */
export interface PaapiGetItemsRequest {
  itemIds: string[]; // ASINs
  resources: string[]; // Resource paths to include in response
}

/**
 * PA-API GetItems Response (T022)
 * Simplified structure - actual PA-API response is more complex
 */
export interface PaapiGetItemsResponse {
  ItemsResult?: {
    Items?: PaapiItem[];
  };
  Errors?: PaapiError[];
}

/**
 * PA-API SearchItems Request (T094)
 */
export interface PaapiSearchItemsRequest {
  Keywords: string;
  SearchIndex?: string;
  ItemCount?: number;
  Resources?: string[];
}

/**
 * PA-API SearchItems Response (T094)
 */
export interface PaapiSearchItemsResponse {
  SearchResult?: {
    Items?: PaapiItem[];
    TotalResultCount?: number;
  };
  Errors?: PaapiError[];
}

/**
 * PA-API Item structure
 */
export interface PaapiItem {
  ASIN: string;
  DetailPageURL?: string;
  ItemInfo?: {
    Title?: {
      DisplayValue?: string;
    };
    ByLineInfo?: {
      Brand?: {
        DisplayValue?: string;
      };
      Manufacturer?: {
        DisplayValue?: string;
      };
    };
  };
  Images?: {
    Primary?: {
      Large?: {
        URL?: string;
        Height?: number;
        Width?: number;
      };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount?: number;
        Currency?: string;
      };
      SavingBasis?: {
        Amount?: number;
      };
      Availability?: {
        Type?: string;
        Message?: string;
      };
    }>;
  };
  CustomerReviews?: {
    Count?: number;
    StarRating?: {
      Value?: number;
    };
  };
}

/**
 * PA-API Error structure (T024)
 */
export interface PaapiError {
  Code: string; // e.g., "ItemNotAccessible", "TooManyRequests"
  Message: string;
}

/**
 * PA-API Error Codes (T024)
 */
export enum PaapiErrorCode {
  ItemNotAccessible = 'ItemNotAccessible',
  InvalidParameterValue = 'InvalidParameterValue',
  TooManyRequests = 'TooManyRequests',
  RequestThrottled = 'RequestThrottled',
  InvalidPartnerTag = 'InvalidPartnerTag',
  InvalidSignature = 'InvalidSignature',
  AccessDenied = 'AccessDenied',
  ResourceNotFound = 'ResourceNotFound',
}

// ============================================================================
// CIRCUIT BREAKER TYPES (T042-T048)
// ============================================================================

/**
 * Circuit Breaker Configuration (T043)
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening (default: 5)
  cooldownTimeout: number; // Milliseconds to wait before half-open (default: 300000 = 5 min)
}

/**
 * Circuit Breaker Metrics (T045)
 */
export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failure_count: number;
  success_count: number;
  total_failures: number;
  total_successes: number;
  last_failure_time: string | null; // ISO 8601 timestamp
  last_state_change: string; // ISO 8601 timestamp
  time_in_open_ms: number;
  circuit_open_count: number;
}

// ============================================================================
// VALIDATION TYPES (T018)
// ============================================================================

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Environment variables type
 */
export interface EnvironmentVariables {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_LOCAL_URL?: string;
  SUPABASE_LOCAL_ANON_KEY?: string;
  SUPABASE_LOCAL_SERVICE_ROLE_KEY?: string;

  // PA-API
  PAAPI_ACCESS_KEY: string;
  PAAPI_SECRET_KEY: string;
  PAAPI_PARTNER_TAG_US: string;
  PAAPI_PARTNER_TAG_DE?: string;
  PAAPI_ENDPOINT_US: string;
  PAAPI_ENDPOINT_DE?: string;

  // Application
  NODE_ENV?: string;
  APP_URL?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter parameters (generic)
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

// ============================================================================
// HTTP TYPES
// ============================================================================

/**
 * HTTP Method enum
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * HTTP Status Code enum (common codes)
 */
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  Conflict = 409,
  Gone = 410,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

/**
 * CORS headers configuration
 */
export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Max-Age'?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if error is PaapiError
 */
export function isPaapiError(error: unknown): error is PaapiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'Code' in error &&
    'Message' in error &&
    typeof (error as PaapiError).Code === 'string' &&
    typeof (error as PaapiError).Message === 'string'
  );
}

/**
 * Type guard to check if response is ErrorResponse
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ErrorResponse).error === 'object' &&
    (response as ErrorResponse).error !== null
  );
}

/**
 * Type guard to check if status is ProductStatus
 */
export function isProductStatus(status: unknown): status is ProductStatus {
  return (
    typeof status === 'string' &&
    ['draft', 'active', 'unavailable'].includes(status)
  );
}

/**
 * Type guard to check if state is CircuitBreakerState
 */
export function isCircuitBreakerState(state: unknown): state is CircuitBreakerState {
  return (
    typeof state === 'string' &&
    ['closed', 'open', 'half-open'].includes(state)
  );
}

// ============================================================================
// DATABASE INSERT TYPES (Omit auto-generated fields)
// ============================================================================

/**
 * Product insert type (for creating new products)
 * Omits auto-generated fields: id, created_at, updated_at
 */
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

/**
 * Marketplace insert type
 */
export type MarketplaceInsert = Omit<Marketplace, 'id' | 'created_at' | 'updated_at'>;

/**
 * Refresh job insert type
 */
export type RefreshJobInsert = Omit<RefreshJob, 'id' | 'created_at'>;

// ============================================================================
// DATABASE UPDATE TYPES (Partial updates)
// ============================================================================

/**
 * Product update type (for updating existing products)
 */
export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>;

/**
 * Refresh job update type
 */
export type RefreshJobUpdate = Partial<Omit<RefreshJob, 'id' | 'product_id' | 'created_at'>>;

/**
 * Search product result (T094)
 * Standardized format for search results returned to frontend
 */
export interface SearchProduct {
  asin: string;
  title: string | null;
  images: Array<{
    url: string;
    width: number | null;
    height: number | null;
  }> | null;
  pricing: {
    amount: number;
    currency: string;
    display: string;
  } | null;
  rating: {
    value: number;
    count: number | null;
  } | null;
  url: string | null;
}
