# Iteration 001: Backend Import & Refresh Mechanism

**Feature Branch**: `001-esp32-store`  
**Iteration**: 001  
**Created**: 2025-11-24  
**Focus**: Backend-first implementation - Amazon product import and refresh worker

## Iteration Goal

Build the foundational backend infrastructure to:
1. Import a single Amazon product via PA-API 5.0
2. Store comprehensive product data in Supabase
3. Implement automatic refresh mechanism using Supabase Edge Functions
4. Validate circuit breaker pattern with exponential backoff

**Why This First**: Establishes data pipeline, validates PA-API integration, proves refresh worker architecture before building frontend.

---

## Scope for This Iteration

### In Scope

**Database Schema**:
- `products` table with comprehensive PA-API 5.0 metadata fields
- `marketplaces` table for Amazon marketplace configuration
- `refresh_jobs` table for tracking refresh operations
- Row Level Security (RLS) policies for data access

**Supabase Edge Functions**:
- `import-product` - Manual product import from PA-API (GetItems operation)
- `refresh-worker` - Scheduled refresh of product data (24-hour rolling)
- `health-check` - Service health and PA-API connectivity validation

**PA-API 5.0 Integration**:
- Authentication with API credentials
- GetItems operation for single product fetch
- Error handling with exponential backoff (1s, 2s, 4s)
- Circuit breaker implementation (5-minute cooldown)

**Core Features**:
- Import random ESP32 product (e.g., "ESP32-DevKitC")
- Store ALL metadata from PA-API response including:
  - Basic info: ASIN, title, description, brand
  - Pricing: Offers.Listings (Price, SavingsAmount, SavingsPercentage)
  - Media: Images, DetailPageURL
  - Availability: Offers.Listings.Availability
  - Raw JSON response for future extensibility
- Automatic refresh every 24 hours
- Handle product unavailability (soft delete to "unavailable" status)

**Testing** (TDD - NON-NEGOTIABLE):
- Unit tests for PA-API client with mocked responses
- Integration tests for database operations
- Edge function tests with PA-API mocking
- Circuit breaker behavior tests
- 80% minimum coverage

**Observability**:
- Structured JSON logging with correlation IDs
- Basic metrics embedded in logs (response times, success rates)
- Circuit breaker state logging

### Out of Scope (Future Iterations)

- Frontend UI (public website, admin panel)
- Product search functionality (SearchItems operation)
- Product variants handling (GetVariations operation)
- Categories and specifications
- Authentication (admin login)
- Multiple marketplace support (focus on US marketplace only)
- Filtering and browsing

---

## User Stories for This Iteration

### Story 1: Import Single Product via API

**As a** developer  
**I want to** import a single ESP32 product from Amazon PA-API  
**So that** I can validate the data pipeline and storage schema

**Acceptance Criteria**:
1. **Given** I have a valid ASIN (e.g., "B08DQQ8CBP" for ESP32-DevKitC-32UE)
2. **When** I call the `import-product` edge function with ASIN and marketplace
3. **Then** the system fetches product data from PA-API 5.0 GetItems operation
4. **And** stores comprehensive metadata in `products` table including pricing, images, availability, and raw JSON
5. **And** returns success response with product ID and imported fields summary

**Test Cases**:
- ✅ Import valid ESP32 product - stores all fields correctly
- ✅ Import with PA-API rate limit error - retries with exponential backoff
- ✅ Import with invalid ASIN - returns clear error message
- ✅ Import duplicate ASIN - updates existing product instead of creating duplicate
- ✅ Import with network timeout - handles gracefully with retry
- ✅ Import with missing optional fields - handles null values correctly

---

### Story 2: Automatic Product Refresh

**As a** system administrator  
**I want** products to automatically refresh from Amazon every 24 hours  
**So that** pricing and availability stay current without manual intervention

**Acceptance Criteria**:
1. **Given** a product exists with status="active" in the database
2. **When** the scheduled `refresh-worker` edge function runs
3. **Then** it identifies products needing refresh (last_refresh > 24h ago)
4. **And** fetches updated data from PA-API 5.0 GetItems operation
5. **And** updates pricing, availability, and raw JSON fields
6. **And** records refresh timestamp and success status in `refresh_jobs` table

**Test Cases**:
- ✅ Refresh active product - updates price and availability correctly
- ✅ Refresh with price change - old price and new price logged
- ✅ Refresh with product unavailable - changes status to "unavailable", sets last_available_at
- ✅ Refresh with PA-API error - retries 3 times with exponential backoff (1s, 2s, 4s)
- ✅ Refresh with circuit breaker open - skips refresh attempt, logs skip reason
- ✅ Refresh respects rolling schedule - distributes refreshes across 24-hour period

---

### Story 3: Circuit Breaker for PA-API Failures

**As a** system  
**I want to** implement circuit breaker pattern for PA-API calls  
**So that** I prevent cascade failures during PA-API outages

**Acceptance Criteria**:
1. **Given** PA-API returns errors for multiple consecutive requests
2. **When** failure threshold is reached (e.g., 5 failures in 1 minute)
3. **Then** circuit breaker opens and blocks all PA-API calls for 5 minutes
4. **And** logs circuit breaker state change with failure count
5. **And** after cooldown period, transitions to half-open state for testing
6. **And** closes circuit if test request succeeds

**Test Cases**:
- ✅ Circuit opens after threshold failures - blocks subsequent requests
- ✅ Circuit remains open during cooldown - returns cached data
- ✅ Circuit half-open after cooldown - allows single test request
- ✅ Circuit closes on successful test - resumes normal operation
- ✅ Circuit reopens if test fails - extends cooldown period
- ✅ Circuit state logged with correlation IDs for debugging

---

## Technical Implementation

### Database Schema (Supabase PostgreSQL)

```sql
-- Marketplaces table
CREATE TABLE marketplaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g., "www.amazon.com"
  region_name TEXT NOT NULL, -- e.g., "United States"
  currency TEXT NOT NULL, -- e.g., "USD"
  paapi_endpoint TEXT NOT NULL,
  associate_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin TEXT NOT NULL,
  marketplace_id UUID REFERENCES marketplaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  manufacturer TEXT,
  
  -- Media
  images JSONB, -- Array of image URLs
  detail_page_url TEXT,
  
  -- Pricing & Deals
  current_price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  savings_amount DECIMAL(10, 2),
  savings_percentage DECIMAL(5, 2),
  currency TEXT,
  
  -- Availability
  availability_type TEXT,
  availability_message TEXT,
  
  -- Ratings
  customer_review_count INTEGER,
  star_rating DECIMAL(3, 2),
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'unavailable')),
  last_refresh_at TIMESTAMPTZ,
  last_available_at TIMESTAMPTZ,
  
  -- Raw data for future extensibility
  raw_paapi_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (asin, marketplace_id)
);

-- Refresh jobs tracking
CREATE TABLE refresh_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  retry_count INTEGER DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  circuit_breaker_state TEXT CHECK (circuit_breaker_state IN ('closed', 'open', 'half-open')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_asin ON products(asin);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_last_refresh ON products(last_refresh_at);
CREATE INDEX idx_refresh_jobs_scheduled ON refresh_jobs(scheduled_at, status);

-- RLS policies (will be refined when adding auth)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_jobs ENABLE ROW LEVEL SECURITY;

-- Temporary allow-all policies for MVP (will restrict later)
CREATE POLICY "Allow all for now" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON marketplaces FOR ALL USING (true);
CREATE POLICY "Allow all for now" ON refresh_jobs FOR ALL USING (true);
```

### Supabase Edge Functions Structure

```
supabase/
├── functions/
│   ├── import-product/
│   │   ├── index.ts           # Main handler
│   │   └── _shared/
│   │       ├── paapi-client.ts    # PA-API 5.0 client
│   │       ├── circuit-breaker.ts # Circuit breaker logic
│   │       └── logger.ts          # Structured logging
│   ├── refresh-worker/
│   │   ├── index.ts           # Scheduled function handler
│   │   └── _shared/           # Reuse from import-product
│   └── health-check/
│       └── index.ts           # Health endpoint
└── config.toml                # Edge function config
```

### PA-API 5.0 Client Interface

```typescript
// supabase/functions/_shared/paapi-client.ts

interface PaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string; // e.g., "www.amazon.com"
}

interface GetItemsRequest {
  itemIds: string[]; // ASINs
  resources: string[]; // Fields to fetch
}

interface GetItemsResponse {
  ItemsResult: {
    Items: Array<{
      ASIN: string;
      DetailPageURL: string;
      Images: {
        Primary: { Large: { URL: string } };
      };
      ItemInfo: {
        Title: { DisplayValue: string };
        ByLineInfo: { Brand: { DisplayValue: string } };
        // ... more fields
      };
      Offers: {
        Listings: Array<{
          Price: { Amount: number; Currency: string };
          SavingBasis: { Amount: number };
          Availability: { Type: string; Message: string };
        }>;
      };
    }>;
  };
  Errors?: Array<{ Code: string; Message: string }>;
}

class PaapiClient {
  constructor(private config: PaapiConfig) {}
  
  async getItems(request: GetItemsRequest): Promise<GetItemsResponse> {
    // Implement PA-API 5.0 authentication (AWS Signature V4)
    // Make HTTP request to PA-API endpoint
    // Handle errors and map to standardized format
  }
}
```

### Circuit Breaker Implementation

```typescript
// supabase/functions/_shared/circuit-breaker.ts

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private readonly threshold = 5; // Open after 5 failures
  private readonly timeout = 5 * 60 * 1000; // 5 minutes cooldown

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
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

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

---

## Test Plan (TDD Workflow)

### Unit Tests

**PA-API Client Tests** (`paapi-client.test.ts`):
- ✅ Authentication signature generation
- ✅ GetItems request formatting
- ✅ Response parsing with all metadata fields
- ✅ Error handling for various PA-API error codes
- ✅ Timeout handling

**Circuit Breaker Tests** (`circuit-breaker.test.ts`):
- ✅ Circuit remains closed on success
- ✅ Circuit opens after threshold failures
- ✅ Circuit transitions to half-open after timeout
- ✅ Circuit closes on successful test request
- ✅ Circuit reopens if half-open test fails

### Integration Tests

**Import Product Tests** (`import-product.test.ts`):
- ✅ Import valid product - creates database record
- ✅ Import duplicate - updates existing record
- ✅ Import with PA-API error - retries correctly
- ✅ Import with circuit open - returns error immediately

**Refresh Worker Tests** (`refresh-worker.test.ts`):
- ✅ Identifies products needing refresh (>24h old)
- ✅ Updates product data correctly
- ✅ Handles product unavailable - sets status
- ✅ Respects circuit breaker state
- ✅ Creates refresh job records

### Coverage Target

- **Minimum**: 80% coverage (NON-NEGOTIABLE per constitution)
- **Focus**: PA-API client, circuit breaker, edge function handlers
- **Tools**: Vitest for unit tests, Deno test for edge functions

---

## Success Criteria

- ✅ **SC-001**: Successfully import a real ESP32 product from Amazon PA-API with all metadata stored
- ✅ **SC-002**: Refresh worker updates product data automatically on schedule (validate manually for MVP)
- ✅ **SC-003**: Circuit breaker opens after 5 consecutive PA-API failures and closes after cooldown
- ✅ **SC-004**: All tests pass with 80%+ coverage
- ✅ **SC-005**: Structured logs with correlation IDs visible in Supabase dashboard
- ✅ **SC-006**: Health check endpoint returns 200 OK with component status (database, PA-API)
- ✅ **SC-007**: Product unavailability handled correctly (status changes to "unavailable")

---

## Deployment

**Supabase Setup**:
1. Create Supabase project
2. Run migration SQL to create tables
3. Configure edge function environment variables (PA-API credentials)
4. Deploy edge functions: `supabase functions deploy`

**Environment Variables** (Supabase Secrets):
```
PAAPI_ACCESS_KEY=your-access-key
PAAPI_SECRET_KEY=your-secret-key
PAAPI_PARTNER_TAG=your-associate-tag
PAAPI_MARKETPLACE=www.amazon.com
```

**Scheduled Function**:
- Configure `refresh-worker` to run every hour (will process 1/24 of products each run)

---

## Next Iteration

After validating this backend foundation:
- **Iteration 002**: Product search via PA-API SearchItems + Admin import UI
- **Iteration 003**: Product variants (GetVariations) + variant selector
- **Iteration 004**: Public product browsing + filtering
