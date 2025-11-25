# Implementation Plan: ESPBoards Store Platform

**Branch**: `001-esp32-store` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-esp32-store/spec.md`

**Phase**: Backend-First Implementation - Iteration 001

## Summary

Build an ESP32-focused e-commerce platform that integrates with Amazon Product Advertising API 5.0 to import, categorize, and display ESP32 development boards and components. The system will automatically refresh product data every 24 hours to maintain current pricing and availability.

**Technical Approach**: 
- **Backend-First**: Start with Supabase PostgreSQL schema + Edge Functions for PA-API integration
- **Data Pipeline**: Import → Store → Refresh → Display workflow
- **Core Value**: Curated ESP32 product catalog with always-current pricing
- **Architecture**: Nuxt 3 Universal Rendering + Supabase backend + Netlify hosting

**Iteration 001 Focus**: Backend infrastructure - product import and automatic refresh mechanism using Supabase Edge Functions with circuit breaker pattern for PA-API resilience.

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict mode enabled  
**Frontend Framework**: Nuxt 3 (Vue 3 Composition API) with Universal Rendering (SSR/SSG)  
**Styling**: Tailwind CSS 3+ for utility-first responsive design  
**Backend**: Supabase Stack
- PostgreSQL 15+ for relational data storage
- Supabase Auth for admin authentication (email/password + OAuth ready)
- Supabase Edge Functions (Deno runtime) for PA-API integration
- Supabase Cron Jobs for scheduled refresh worker

**Primary Dependencies**:
- `nuxt` (3.x) - Full-stack Vue framework
- `@supabase/supabase-js` - Supabase client SDK
- `@supabase/auth-helpers-vue` - Vue 3 auth integration
- `tailwindcss` - Utility-first CSS framework
- PA-API 5.0 SDK or custom HTTP client with AWS Signature V4

**Testing Stack**:
- `vitest` - Unit testing framework (Vite-native, fast)
- `@vue/test-utils` - Vue component testing
- `playwright` - E2E testing for user scenarios
- `@vitest/coverage-v8` - Code coverage reporting (80% minimum)

**Storage**: 
- Supabase PostgreSQL for all application data
- Tables: `products`, `marketplaces`, `categories`, `product_specifications`, `refresh_jobs`, `admins`
- Row Level Security (RLS) policies for data access control

**Hosting & Deployment**:
- Netlify for Nuxt 3 application hosting and CI/CD
- Netlify Edge Functions as backup for scheduled tasks
- Supabase cloud for database and edge functions

**Target Platform**: 
- Web (responsive: 320px - 2560px viewport)
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Progressive enhancement for older browsers

**Performance Goals**:
- Time to Interactive (TTI): <5s on 3G
- API response times: GET <200ms (p95), POST <500ms (p95)
- Frontend bundle: <200KB per route (gzipped)
- Database queries: <100ms (p95) with proper indexing
- PA-API calls: <2s with retry logic

**Constraints**:
- Amazon PA-API 5.0 rate limits (marketplace-specific, ~1 TPS)
- Circuit breaker: 3 retries with exponential backoff (1s, 2s, 4s)
- 24-hour refresh cycle (rolling updates to distribute load)
- WCAG 2.1 AA accessibility compliance
- HTTPS required for production (Supabase Auth requirement)

**Scale/Scope**:
- Initial: 50-200 products across 2 marketplaces (US, DE)
- Target: 1000+ products, 100 concurrent users
- Admin users: 1-5 initially
- 4 user stories with 28 acceptance scenarios
- 40+ functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Backend-First Architecture ✓
- [x] Backend implementation planned before frontend (Iteration 001: Supabase schema + Edge Functions first)
- [x] APIs documented (Supabase Edge Functions with OpenAPI-style JSDoc comments)
- [x] Database schema migrations version-controlled (Supabase migrations in `supabase/migrations/`)
- [x] Health check endpoints included (`/functions/v1/health-check`)
- [x] Services independently testable (Edge Functions, PA-API client, circuit breaker as isolated modules)

### II. Test-Driven Development (NON-NEGOTIABLE) ✓
- [x] Tests written BEFORE implementation begins (TDD workflow documented in Iteration 001 quick-start)
- [x] Unit test coverage target: 80% minimum (enforced via Vitest coverage reporting)
- [x] Integration tests for API contracts included (Edge Function tests with Supabase client mocking)
- [x] E2E tests for P1 user scenarios planned (Playwright tests for product browsing, filtering)
- [x] All tests executable in CI/CD pipeline (Netlify build commands configured)

### III. Code Quality Standards ✓
- [x] Linters/formatters configured (ESLint + Prettier for TypeScript/Vue)
- [x] TypeScript strict mode enabled (`tsconfig.json` with `strict: true`)
- [x] Code review process defined (GitHub PR reviews, minimum 1 approval)
- [x] Function complexity limits enforced (<50 lines, cyclomatic complexity <10 via ESLint)
- [x] Public API documentation (JSDoc for all exported functions, Supabase Edge Functions)

### IV. User Experience Consistency ✓
- [x] Design system/component library used (Tailwind CSS + custom Vue components library)
- [x] WCAG 2.1 AA accessibility compliance planned (semantic HTML, ARIA labels, keyboard navigation)
- [x] Responsive design (320px-2560px) included (Tailwind responsive utilities)
- [x] Error handling UX patterns defined (Toast notifications, inline validation, 410 Gone for unavailable products)
- [x] Performance budget specified (TTI <5s, Lighthouse score >90, bundle <200KB per route)

### V. Performance Requirements ✓
- [x] API response time targets: GET <200ms (p95), POST <500ms (p95) (Supabase Edge Functions optimized)
- [x] Database queries indexed, no N+1 queries (Indexes on ASIN, status, last_refresh_at; RLS policies optimized)
- [x] Pagination for collections >100 items (Product listings paginated at 24 items per page)
- [x] Frontend bundle size <200KB per route (Nuxt 3 code splitting + lazy loading)
- [x] Image optimization (WebP/AVIF) and lazy loading (Nuxt Image module with Amazon CDN URLs)

### VI. API Design Excellence ✓
- [x] RESTful conventions followed (Supabase REST API + custom Edge Functions follow REST patterns)
- [x] API versioning strategy defined (Edge Functions namespaced: `/functions/v1/*`)
- [x] Request validation schemas (Zod validation for Edge Function inputs)
- [x] Consistent error response format (JSON with `{ error: { code, message, details } }`)
- [x] Authentication/authorization implemented (Supabase Auth + RLS policies)
- [x] Rate limiting configured (Supabase built-in rate limiting + PA-API circuit breaker)

### VII. Observability & Monitoring ✓
- [x] Structured JSON logging implemented (Pino for Nuxt server, console.log with structured format in Edge Functions)
- [x] Trace IDs propagate across services (Correlation IDs in request headers and logs)
- [x] Health check endpoints (/health, /ready) (`/functions/v1/health-check` with component status)
- [x] Key metrics tracked (PA-API success rate, circuit breaker state, refresh job completion rate)
- [x] Alerts and runbooks prepared (Supabase dashboard alerts for Edge Function errors)

### Performance Standards ✓
- [x] Load testing plan (10x peak traffic) (Playwright load tests simulating 1000 concurrent users)
- [x] Stress testing to identify breaking points (Gradual load increase until failure)
- [x] Database query execution plans reviewed (Supabase dashboard query analyzer)
- [x] Lighthouse score target >90 (CI/CD includes Lighthouse CI checks)

### Quality Gates ✓
- [x] All automated tests pass in CI/CD (Netlify build fails if tests fail)
- [x] 80% code coverage minimum (Vitest coverage report blocks merge if <80%)
- [x] Zero linter errors, justified warnings (ESLint strict mode, Prettier enforced)
- [x] Security scan shows no high/critical vulnerabilities (npm audit, Supabase security advisories)
- [x] Performance budgets not exceeded (Bundle analyzer reports in CI/CD)
- [x] Documentation updated (README, API specs, architecture diagrams)

## Project Structure

### Documentation (this feature)

```text
specs/001-esp32-store/
├── spec.md                          # Feature specification (COMPLETE)
├── plan.md                          # This file - implementation plan
├── checklists/
│   └── requirements.md              # Specification quality validation (PASSED)
├── iterations/
│   ├── iter-001-backend-import-refresh.md  # Iteration 001 spec (COMPLETE)
│   ├── iter-001-checklist.md              # Iteration 001 validation (READY)
│   └── iter-001-quick-start.md            # TDD implementation guide (READY)
├── research.md                      # Phase 0: PA-API 5.0 integration research (TO BE CREATED)
├── data-model.md                    # Phase 1: Database schema design (TO BE CREATED)
├── quickstart.md                    # Phase 1: Developer onboarding guide (TO BE CREATED)
├── contracts/                       # Phase 1: API contracts (TO BE CREATED)
│   ├── edge-functions.md           # Supabase Edge Function interfaces
│   └── database-schema.sql         # PostgreSQL schema with RLS policies
└── tasks.md                         # Phase 2: Task breakdown (TO BE CREATED via /speckit.tasks)
```

### Source Code (repository root)

**Structure Decision**: Web application with separated Nuxt 3 frontend and Supabase backend services

```text
espboards-store/                     # Repository root
│
├── .github/                         # GitHub Actions CI/CD
│   └── workflows/
│       ├── ci.yml                  # Run tests, linting, coverage checks
│       ├── deploy-preview.yml      # Netlify preview deploys
│       └── lighthouse.yml          # Performance budget checks
│
├── .specify/                        # Speckit workflow files
│   ├── memory/
│   │   └── constitution.md         # Project governance (COMPLETE)
│   ├── scripts/
│   │   └── bash/                   # Workflow automation scripts
│   └── templates/                  # Spec templates
│
├── specs/                          # Feature specifications (this directory)
│   └── 001-esp32-store/            # This feature
│
├── supabase/                       # Supabase backend
│   ├── migrations/                 # Database migrations (version-controlled)
│   │   ├── 20251124000001_create_products_schema.sql
│   │   ├── 20251124000002_create_refresh_jobs.sql
│   │   └── 20251124000003_add_indexes_and_rls.sql
│   ├── functions/                  # Edge Functions (Deno runtime)
│   │   ├── import-product/
│   │   │   ├── index.ts           # Main handler
│   │   │   └── index.test.ts      # Integration tests
│   │   ├── refresh-worker/
│   │   │   ├── index.ts           # Scheduled refresh handler
│   │   │   └── index.test.ts
│   │   ├── health-check/
│   │   │   └── index.ts           # Health endpoint
│   │   └── _shared/               # Shared utilities
│   │       ├── paapi-client.ts    # PA-API 5.0 SDK
│   │       ├── paapi-client.test.ts
│   │       ├── circuit-breaker.ts # Circuit breaker pattern
│   │       ├── circuit-breaker.test.ts
│   │       ├── logger.ts          # Structured logging
│   │       ├── types.ts           # Shared TypeScript types
│   │       └── validation.ts      # Zod schemas
│   ├── seed.sql                   # Development seed data
│   └── config.toml                # Edge Functions configuration
│
├── app/                           # Nuxt 3 application (main source)
│   ├── components/                # Vue components
│   │   ├── product/
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductDetail.vue
│   │   │   ├── ProductList.vue
│   │   │   └── VariantSelector.vue
│   │   ├── filters/
│   │   │   ├── CategoryFilter.vue
│   │   │   ├── SpecificationFilter.vue
│   │   │   └── DealFilter.vue
│   │   ├── admin/
│   │   │   ├── ProductSearch.vue
│   │   │   ├── ProductEditor.vue
│   │   │   └── MetricsDashboard.vue
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   └── MarketplaceSelector.vue
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.vue
│   │       ├── Input.vue
│   │       ├── Badge.vue
│   │       └── Toast.vue
│   ├── pages/                    # File-based routing
│   │   ├── index.vue            # Homepage (product listings)
│   │   ├── products/
│   │   │   └── [asin].vue       # Product detail page
│   │   ├── categories/
│   │   │   └── [slug].vue       # Category page with filters
│   │   └── admin/
│   │       ├── index.vue        # Admin dashboard
│   │       ├── search.vue       # Product search & import
│   │       ├── products.vue     # Product management
│   │       └── login.vue        # Admin authentication
│   ├── layouts/                 # Layout components
│   │   ├── default.vue         # Public site layout
│   │   └── admin.vue           # Admin panel layout
│   ├── composables/             # Vue 3 composables (business logic)
│   │   ├── useProducts.ts
│   │   ├── useFilters.ts
│   │   ├── useMarketplace.ts
│   │   ├── useAuth.ts
│   │   └── useAdmin.ts
│   ├── server/                  # Nuxt server routes (Nitro)
│   │   ├── api/
│   │   │   ├── products/
│   │   │   │   ├── index.get.ts      # List products
│   │   │   │   └── [asin].get.ts     # Get single product
│   │   │   ├── categories/
│   │   │   │   └── index.get.ts      # List categories
│   │   │   └── health.get.ts         # Health check proxy
│   │   └── middleware/
│   │       └── auth.ts               # Admin auth middleware
│   ├── plugins/                 # Nuxt plugins
│   │   ├── supabase.ts         # Supabase client initialization
│   │   └── error-handler.ts    # Global error handling
│   ├── middleware/              # Route middleware
│   │   └── admin-auth.ts       # Protect admin routes
│   ├── types/                   # TypeScript types
│   │   ├── product.ts
│   │   ├── marketplace.ts
│   │   ├── category.ts
│   │   └── api.ts
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts       # Price, date formatting
│   │   ├── validators.ts       # Client-side validation
│   │   └── constants.ts        # App constants
│   ├── public/                  # Static assets
│   │   ├── favicon.ico
│   │   └── images/
│   └── app.vue                  # Root component
│
├── tests/                       # Test suites
│   ├── unit/                   # Unit tests (Vitest)
│   │   ├── components/
│   │   ├── composables/
│   │   └── utils/
│   ├── integration/            # Integration tests
│   │   └── api/
│   └── e2e/                    # End-to-end tests (Playwright)
│       ├── product-browsing.spec.ts
│       ├── product-filtering.spec.ts
│       ├── admin-import.spec.ts
│       └── fixtures/           # Test fixtures
│
├── .env.example                # Environment variables template
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── netlify.toml               # Netlify deployment config
├── nuxt.config.ts             # Nuxt configuration
├── package.json               # Node dependencies
├── pnpm-lock.yaml             # Lockfile (using pnpm)
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration (strict mode)
├── vitest.config.ts           # Vitest configuration
└── README.md                  # Project documentation
```

**Key Architectural Decisions**:

1. **Nuxt 3 App Directory**: Uses Nuxt 3's file-based routing and auto-imports
2. **Supabase Backend Separation**: Edge Functions in `supabase/functions/` for PA-API integration
3. **Composables for Logic**: Business logic in Vue 3 composables, components focused on presentation
4. **Server Routes for BFF**: Nuxt server routes act as Backend-for-Frontend, proxying Supabase calls
5. **Shared Types**: TypeScript types shared between frontend and backend via `types/` directory
6. **Test Isolation**: Unit, integration, and E2E tests in separate directories
7. **Migration-First**: Database changes via Supabase migrations (version-controlled SQL)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ **NO VIOLATIONS** - All constitution principles satisfied

The architecture follows all constitution principles without requiring complexity justifications. The Nuxt 3 + Supabase stack provides:
- Backend-first capability (Edge Functions before UI)
- Built-in testing support (Vitest, Playwright)
- TypeScript strict mode by default
- Performance optimization tools (code splitting, lazy loading)
- Observability through structured logging

---

## Phase 0: Research & Technical Validation

**Objective**: Validate PA-API 5.0 integration approach and Supabase Edge Functions capabilities

**Duration**: 1 day

### Tasks

1. **PA-API 5.0 Authentication Research**
   - [ ] Study AWS Signature V4 signing process for PA-API requests
   - [ ] Review PA-API 5.0 GetItems operation documentation
   - [ ] Identify required request parameters (Resources, ItemIds, PartnerTag)
   - [ ] Document error codes and retry strategies
   - **Deliverable**: `research.md` with PA-API integration patterns

2. **Supabase Edge Functions Evaluation**
   - [ ] Test Deno runtime capabilities for HTTP requests
   - [ ] Validate AWS SDK compatibility in Deno
   - [ ] Test Edge Function cold start times (<1s target)
   - [ ] Confirm cron job scheduling capabilities
   - **Deliverable**: Proof-of-concept Edge Function making PA-API call

3. **Circuit Breaker Pattern Design**
   - [ ] Research circuit breaker implementations in Deno
   - [ ] Design state management (in-memory for MVP, Redis for scale)
   - [ ] Define failure thresholds and cooldown periods
   - **Deliverable**: Circuit breaker design document in `research.md`

4. **Database Schema Validation**
   - [ ] Review Supabase PostgreSQL features (JSONB, full-text search)
   - [ ] Plan indexes for common queries (ASIN lookups, status filters)
   - [ ] Design RLS policies for admin vs public access
   - **Deliverable**: Schema design in `contracts/database-schema.sql`

### Success Criteria

- [ ] PA-API GetItems call successfully executed from Edge Function
- [ ] Circuit breaker pattern validated with test scenarios
- [ ] Database schema reviewed and approved for all 40+ FRs
- [ ] No blocking technical risks identified

---

## Phase 1: Architecture & Data Model

**Objective**: Design complete data model, API contracts, and developer onboarding

**Duration**: 2 days

### 1.1 Database Schema Design

**File**: `specs/001-esp32-store/data-model.md`

**Tasks**:
- [ ] Create `marketplaces` table with PA-API endpoints
- [ ] Create `products` table with comprehensive PA-API fields:
  - ASIN, title, description, brand, manufacturer
  - Pricing: current_price, original_price, savings_amount, savings_percentage
  - Media: images (JSONB), detail_page_url
  - Availability: availability_type, availability_message
  - Ratings: customer_review_count, star_rating
  - Metadata: status (draft/active/unavailable), timestamps
  - Raw data: raw_paapi_response (JSONB for future extensibility)
  - Variants: parent_id (self-referencing FK)
- [ ] Create `categories` table for ESP32 product categorization
- [ ] Create `product_specifications` table for technical specs (key-value pairs)
- [ ] Create `product_categories` junction table (many-to-many)
- [ ] Create `refresh_jobs` table for tracking refresh operations
- [ ] Create `admins` table (minimal, Supabase Auth handles passwords)
- [ ] Design indexes for performance:
  - `idx_products_asin` on products(asin)
  - `idx_products_status` on products(status)
  - `idx_products_last_refresh` on products(last_refresh_at)
  - `idx_refresh_jobs_scheduled` on refresh_jobs(scheduled_at, status)
- [ ] Define RLS policies:
  - Public read access to active products only
  - Admin full access (authenticated users in admins table)
  - Refresh jobs readable by admins only

**Deliverable**: Complete SQL migration files with DDL, indexes, and RLS policies

### 1.2 API Contracts

**File**: `specs/001-esp32-store/contracts/edge-functions.md`

**Define Contracts**:

**1. Import Product Edge Function**
```typescript
POST /functions/v1/import-product

Request:
{
  asin: string;              // Amazon ASIN
  marketplace: string;       // e.g., "www.amazon.com"
  correlation_id?: string;   // Optional tracing ID
}

Response (Success):
{
  product_id: string;        // UUID
  asin: string;
  title: string;
  status: "draft";
  imported_at: string;       // ISO 8601
  correlation_id: string;
}

Response (Error):
{
  error: {
    code: string;            // e.g., "PAAPI_RATE_LIMIT"
    message: string;
    details?: object;
  };
  correlation_id: string;
}
```

**2. Refresh Worker Edge Function**
```typescript
POST /functions/v1/refresh-worker

Request: (empty, triggered by cron)

Response:
{
  processed_count: number;
  success_count: number;
  failure_count: number;
  skipped_count: number;     // Circuit breaker open
  circuit_breaker_state: "closed" | "open" | "half-open";
  duration_ms: number;
  correlation_id: string;
}
```

**3. Health Check Edge Function**
```typescript
GET /functions/v1/health-check

Response:
{
  status: "healthy" | "degraded" | "unhealthy";
  components: {
    database: "up" | "down";
    paapi: "up" | "down" | "rate_limited";
    circuit_breaker: "closed" | "open" | "half-open";
  };
  timestamp: string;         // ISO 8601
}
```

**Deliverable**: Complete API contract documentation with request/response schemas

### 1.3 Developer Quickstart Guide

**File**: `specs/001-esp32-store/quickstart.md`

**Content**:
- [ ] Prerequisites (Node.js 18+, pnpm, Supabase CLI)
- [ ] Repository setup (`git clone`, `pnpm install`)
- [ ] Environment variables setup (`.env.local` with Supabase keys, PA-API credentials)
- [ ] Database migration steps (`supabase db reset --local`)
- [ ] Running dev server (`pnpm dev`)
- [ ] Running tests (`pnpm test`, `pnpm test:coverage`)
- [ ] Deploying Edge Functions (`supabase functions deploy`)
- [ ] Common development workflows (TDD cycle, component development)

**Deliverable**: Step-by-step onboarding guide for new developers

### Success Criteria

- [ ] All database tables and relationships documented
- [ ] Migrations create schema without errors
- [ ] API contracts reviewed and approved
- [ ] Quickstart guide tested by following steps from scratch
- [ ] RLS policies prevent unauthorized access in tests

---

## Phase 2: Implementation Planning (Task Breakdown)

**Objective**: Create detailed task breakdown for implementation

**Duration**: 1 day

**Process**: Run `/speckit.tasks` command to generate `tasks.md` from plan and spec

**Expected Output**: `specs/001-esp32-store/tasks.md` with:

### Iteration 001: Backend Infrastructure (1-2 weeks)

**Phase 2.1: Database Foundation** (2-3 days)
- Task 001: Create Supabase project and local development environment
- Task 002: Write migration for marketplaces table
- Task 003: Write migration for products table with JSONB fields
- Task 004: Write migration for refresh_jobs table
- Task 005: Add indexes for performance
- Task 006: Implement RLS policies
- Task 007: Seed development data (2 marketplaces, 5 test products)
- Task 008: Write database schema tests

**Phase 2.2: PA-API Client (TDD)** (3-4 days)
- Task 009: Write tests for AWS Signature V4 generation
- Task 010: Implement AWS Signature V4 signer
- Task 011: Write tests for PA-API GetItems request
- Task 012: Implement PA-API client with GetItems operation
- Task 013: Write tests for PA-API error handling
- Task 014: Implement error parsing and mapping
- Task 015: Write tests for request/response types
- Task 016: Document PA-API client API

**Phase 2.3: Circuit Breaker (TDD)** (2 days)
- Task 017: Write tests for circuit breaker state transitions
- Task 018: Implement circuit breaker logic
- Task 019: Write tests for failure threshold
- Task 020: Implement failure counting and threshold
- Task 021: Write tests for cooldown period
- Task 022: Implement cooldown timer
- Task 023: Integrate circuit breaker with PA-API client

**Phase 2.4: Import Product Edge Function (TDD)** (3-4 days)
- Task 024: Write tests for import function handler
- Task 025: Implement import function skeleton
- Task 026: Write tests for ASIN validation
- Task 027: Implement request validation (Zod schemas)
- Task 028: Write tests for PA-API data transformation
- Task 029: Implement PA-API response mapping to database schema
- Task 030: Write tests for database upsert logic
- Task 031: Implement product upsert with conflict handling
- Task 032: Write tests for error scenarios (rate limits, invalid ASIN)
- Task 033: Implement error handling and retry logic
- Task 034: Add structured logging with correlation IDs
- Task 035: Deploy to Supabase and test manually

**Phase 2.5: Refresh Worker Edge Function (TDD)** (3-4 days)
- Task 036: Write tests for refresh worker scheduling logic
- Task 037: Implement product selection query (>24h since refresh)
- Task 038: Write tests for refresh job creation
- Task 039: Implement refresh job tracking in database
- Task 040: Write tests for PA-API GetItems call
- Task 041: Implement GetItems with circuit breaker
- Task 042: Write tests for product update logic
- Task 043: Implement product data update with versioning
- Task 044: Write tests for unavailable product handling
- Task 045: Implement status change to "unavailable"
- Task 046: Write tests for rolling updates distribution
- Task 047: Implement batch processing (10 products per run)
- Task 048: Configure cron schedule (hourly)
- Task 049: Deploy and validate with test products

**Phase 2.6: Health Check & Observability** (1-2 days)
- Task 050: Implement health check endpoint
- Task 051: Add database connectivity check
- Task 052: Add PA-API connectivity check
- Task 053: Expose circuit breaker state
- Task 054: Add metrics logging (success rates, timing)
- Task 055: Test health check responses

**Phase 2.7: Testing & Validation** (2 days)
- Task 056: Run full test suite and verify 80% coverage
- Task 057: Manual testing with real PA-API credentials
- Task 058: Import real ESP32 product (ASIN: B08DQQ8CBP)
- Task 059: Validate refresh worker updates product data
- Task 060: Test circuit breaker opens after failures
- Task 061: Review Supabase logs for structured logging
- Task 062: Performance testing (response times, query plans)

**Phase 2.8: Documentation** (1 day)
- Task 063: Update README with architecture overview
- Task 064: Document environment variables
- Task 065: Create deployment runbook
- Task 066: Document troubleshooting steps
- Task 067: Update quickstart guide with lessons learned

### Iteration 002: Product Search & Admin UI (2-3 weeks)
- Implement SearchItems PA-API operation
- Build admin authentication with Supabase Auth
- Create admin product search interface
- Implement product import workflow
- Add product categorization UI

### Iteration 003: Product Variants (1-2 weeks)
- Implement GetVariations PA-API operation
- Import variants with parent_id linking
- Build variant selector component
- Update filtering logic for variant families

### Iteration 004: Public Product Browsing (2-3 weeks)
- Build product listing pages
- Implement category filtering
- Add specification filters
- Create product detail pages
- Add deal badge display

---

## Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PA-API rate limits exceeded | High | Medium | Circuit breaker pattern, rolling refresh schedule, monitoring |
| AWS Signature V4 complexity | Medium | Low | Use existing Deno/Node libraries, comprehensive testing |
| Cold start latency in Edge Functions | Medium | Medium | Keep functions warm with periodic health checks, optimize bundle size |
| Database query performance at scale | High | Medium | Proper indexing, query plan analysis, pagination |
| Supabase RLS policy complexity | Medium | Medium | Thorough testing, start permissive and restrict gradually |
| PA-API response schema changes | Medium | Low | Store raw JSON, version API client, monitor API docs |
| Test coverage goal (80%) | Medium | Low | TDD workflow enforcement, coverage gates in CI/CD |

---

## Deployment Strategy

### Development Environment

1. **Local Supabase**: `supabase start` (Docker-based local instance)
2. **Local Nuxt Dev**: `pnpm dev` (Hot module reload)
3. **Test**: `pnpm test` (Vitest + Playwright)

### Staging Environment

1. **Supabase Project**: Create staging project in Supabase Cloud
2. **Netlify Preview**: Automatic preview deploys on PR creation
3. **Seed Data**: Use test ASINs for product imports
4. **Edge Functions**: Deploy to Supabase staging

### Production Environment

1. **Supabase Production**: Separate production project
2. **Netlify Production**: Deploy from `main` branch
3. **Environment Variables**: Stored in Netlify and Supabase secrets
4. **Database Migrations**: Run via Supabase CLI in CI/CD
5. **Monitoring**: Supabase dashboard + Netlify analytics

### CI/CD Pipeline (GitHub Actions + Netlify)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:coverage
      - name: Check coverage threshold
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
      - uses: supabase/setup-cli@v1
      - run: supabase db lint
      - run: supabase functions deploy --dry-run
  
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://preview-${{ github.event.number }}.netlify.app
          budgetPath: ./lighthouse-budget.json
```

---

## Success Metrics

### Iteration 001 Completion Criteria

- [ ] ✅ All 67 tasks in Phase 2 completed
- [ ] ✅ Test coverage ≥80% across all modules
- [ ] ✅ Real ESP32 product imported from PA-API
- [ ] ✅ Refresh worker successfully updates product data
- [ ] ✅ Circuit breaker opens/closes correctly under load
- [ ] ✅ Health check endpoint returns accurate component status
- [ ] ✅ Structured logs visible in Supabase dashboard with correlation IDs
- [ ] ✅ Database queries execute in <100ms (p95)
- [ ] ✅ Edge Functions respond in <2s including PA-API calls
- [ ] ✅ Zero high/critical security vulnerabilities
- [ ] ✅ Documentation complete and validated

### Long-Term Success Metrics (Post-Launch)

- **User Engagement**: 100+ daily active users browsing products
- **Data Freshness**: 100% of products refreshed within 24 hours
- **System Reliability**: 99.9% uptime for public website
- **API Success Rate**: >95% PA-API requests succeed
- **Performance**: Lighthouse score >90, TTI <5s
- **Admin Efficiency**: <5 minutes to import and activate a product

---

## Next Steps

1. **Immediate**: Begin Phase 0 research (PA-API authentication, Edge Functions validation)
2. **Week 1**: Complete Phase 1 (database schema, API contracts, quickstart guide)
3. **Week 1 End**: Run `/speckit.tasks` to generate detailed task breakdown
4. **Week 2-3**: Execute Iteration 001 tasks following TDD workflow
5. **Week 3 End**: Demo working backend to stakeholders
6. **Week 4+**: Begin Iteration 002 (Product Search + Admin UI)

**Ready to start Phase 0 research!** 🚀
