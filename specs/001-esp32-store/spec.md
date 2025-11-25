# Feature Specification: ESPBoards Store Platform

**Feature Branch**: `001-esp32-store`  
**Created**: 2025-11-24  
**Status**: Draft  
**Input**: User description: "Build an application that will be a store-like website. It will be focused on ESP32 items - like development boards, kits, mcus, sensors, etc. We will search products in amazon api, import them into our system, categorize it, and then show it for users. Also refresh each item at least once per 24 hours (to keep prices up to date). So the workflow would be like: 1. Select Marketplace (in the beginning either US or DE amazon) 2. Admin panel -> search items - Search items in amazon API 3. Select items and import selected ones with status = draft. 4. Edit items -> categorize, like ESP32 variant, PSRAM, flash size, etc. 5. Set status to active 6. The refresh worker starts -> refreshes each imported item once per 24h (rolling updates, so some items are refreshed in first hour, some in second, etc...) 7. The active products are shown in website (for selected markeplace!) 8. You can open one product page or see lists. 9. You can browse different categories and applied different filters for seleced categories products"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Active ESP32 Products (Priority: P1)

As a visitor, I want to browse and filter ESP32 products so that I can find the right development board or component for my project.

**Why this priority**: This is the core value proposition - showing curated ESP32 products to users. Without this, the site has no purpose for end users. This story delivers immediate value and can be demonstrated independently.

**Independent Test**: Can be fully tested by importing a few products with active status, then browsing the website to view product listings, individual product pages, and applying filters. Delivers value even without the admin panel or refresh worker.

**Acceptance Scenarios**:

1. **Given** I visit the store homepage, **When** I select a marketplace (US or DE), **Then** I see a list of active ESP32 products with images, titles, prices in local currency, and basic specifications
2. **Given** I am viewing product listings with discounted items, **When** I see products on sale, **Then** products display a deal badge showing savings percentage (e.g., "15% OFF"), original price strikethrough, and discounted price
3. **Given** I am viewing product listings, **When** I click on a product, **Then** I see a detailed product page with full description, specifications (ESP32 variant, PSRAM, flash size), current price, customer ratings, availability status, and link to purchase on Amazon
4. **Given** I am viewing a discounted product detail page, **When** the product is on sale, **Then** I see the original price, current discounted price, savings amount (e.g., "Save $5.99"), and savings percentage (e.g., "15% OFF")
5. **Given** I am viewing a product with variants (e.g., different flash sizes), **When** I use the variant selector on the product page, **Then** the price, specifications, discount information, and Amazon link update to reflect the selected variant
6. **Given** I am viewing product listings, **When** I apply category filters (e.g., "Development Boards", "Sensors", "Kits"), **Then** the list updates to show only products matching the selected categories
7. **Given** I am viewing product listings, **When** I apply the "Show only deals" filter, **Then** the list updates to show only products with active discounts
8. **Given** I am viewing a specific category, **When** I apply specification filters (e.g., ESP32 variant = "ESP32-S3", PSRAM = "8MB"), **Then** the list shows parent products where at least one variant matches all selected filters
9. **Given** I am browsing filtered results, **When** I click on a product that appeared due to variant match, **Then** the product page opens with the matching variant pre-selected in the variant selector
10. **Given** I am browsing products, **When** I switch between US and DE marketplace, **Then** the product list updates to show products available in the selected marketplace with appropriate pricing and locale-specific deals

---

### User Story 2 - Search and Import Products from Amazon (Priority: P2)

As an admin, I want to search for ESP32 products in Amazon API and import selected ones so that I can curate the product catalog.

**Why this priority**: This enables the content creation flow. Without this, admins cannot populate the store with products. This is second priority because you need a way to display products (P1) before you need to import them for demonstration purposes.

**Independent Test**: Can be tested by logging into admin panel, searching Amazon API for "ESP32", seeing results, selecting specific products, and importing them with draft status. Delivers value by enabling catalog curation without requiring the public site to be functional.

**Acceptance Scenarios**:

1. **Given** I am logged into the admin panel, **When** I select a marketplace (US or DE), **Then** the search interface is configured to search that marketplace's Amazon API
2. **Given** I am in the admin panel, **When** I enter a search term (e.g., "ESP32 development board") and click search, **Then** I see a list of matching products from Amazon with images, titles, prices, and Amazon ratings
3. **Given** I see Amazon search results for a product with variants, **When** I view the product details, **Then** I see all available variants (e.g., different flash sizes, colors) listed with their individual prices and specifications
4. **Given** I see a product with variants in search results, **When** I select the parent product and click "Import Selected", **Then** all variants are imported as separate products with status = "draft", each linked via parent_id to group them as a variant family
5. **Given** I import a product, **When** the import completes, **Then** the product (and its variants if applicable) appear in my draft products list in the admin panel, grouped by parent_id
6. **Given** I search for products, **When** Amazon API returns an error or no results, **Then** I see a user-friendly error message explaining what happened

---

### User Story 3 - Categorize and Activate Products (Priority: P3)

As an admin, I want to edit imported products to add categorization and specifications, then activate them so that they appear on the public website.

**Why this priority**: This completes the curation workflow by adding rich metadata and publishing products. This is third priority because it depends on having products imported (P2) and requires the public display (P1) to show results.

**Independent Test**: Can be tested by viewing draft products in admin panel, editing one to add ESP32 variant, PSRAM, flash size, selecting categories, changing status to active, and verifying it appears on the public site. Delivers value by enabling full product curation workflow.

**Acceptance Scenarios**:

1. **Given** I am in the admin panel, **When** I view the draft products list, **Then** I see all imported products with status = "draft" organized by marketplace
2. **Given** I am viewing draft products, **When** I click "Edit" on a product, **Then** I see a form with fields for categories, ESP32 variant, PSRAM size, flash size, and other specifications
3. **Given** I am editing a product, **When** I select categories from a predefined list (e.g., "Development Boards", "Sensors", "Displays"), **Then** those categories are associated with the product
4. **Given** I am editing a product, **When** I fill in technical specifications (ESP32 variant: dropdown with S2/S3/C3/etc., PSRAM: text input, Flash: dropdown with common sizes), **Then** those specifications are saved with the product
5. **Given** I have finished editing a product, **When** I change status to "active" and save, **Then** the product immediately appears in the public marketplace listing for users to browse
6. **Given** I am editing a product, **When** I save without changing status, **Then** it remains as draft and is not visible to public users

---

### User Story 4 - Automatic Product Data Refresh (Priority: P4)

As a system administrator, I want products to automatically refresh their data from Amazon every 24 hours so that prices and availability stay current without manual intervention.

**Why this priority**: This ensures data freshness but is not critical for initial launch. The system can function with static data, and this can be added after the core flows are working. It's essential for long-term operation but not for MVP demonstration.

**Independent Test**: Can be tested by marking products as needing refresh, running the worker manually, and verifying that product data (especially prices) updates from Amazon. Delivers value by maintaining data accuracy over time without requiring manual updates.

**Acceptance Scenarios**:

1. **Given** active products exist in the system, **When** the refresh worker runs, **Then** it identifies products that haven't been refreshed in the last 24 hours
2. **Given** the refresh worker identifies products needing updates, **When** it processes them, **Then** it updates them using rolling updates (distributing refreshes across the 24-hour period, not all at once)
3. **Given** a product is being refreshed, **When** the worker fetches data from Amazon API, **Then** it updates the price, availability status, and any changed product details
4. **Given** a product refresh fails (API error, product no longer available), **When** the error occurs, **Then** the system retries up to 3 times with exponential backoff (1s, 2s, 4s delays), and if all retries fail, the product is marked with an error status and admin is notified
5. **Given** multiple products fail refresh due to PA-API outage, **When** the circuit breaker threshold is reached, **Then** the circuit opens for 5 minutes to prevent cascade failures, and refresh attempts resume automatically after cooldown
6. **Given** products are refreshed throughout the day, **When** users browse the site, **Then** they always see up-to-date pricing without any downtime or performance degradation
7. **Given** the refresh worker is running, **When** it processes products, **Then** it respects Amazon API rate limits to avoid service disruption

---

### Edge Cases

- What happens when an Amazon product is no longer available or has been removed? **Resolution: System automatically changes status to "unavailable" (soft delete), preserving all data with last_available_at timestamp. Admin panel shows unavailable products in separate section for review, allowing hard delete or re-activation. Public URLs return 410 Gone with category redirect.**
- How does the system handle products that exist in multiple marketplaces with different prices? (Each marketplace has separate product entries with marketplace-specific data)
- What happens if an admin tries to activate a product without required categorization fields? (Validation prevents activation and shows which fields are required)
- How does the system handle concurrent edits by multiple admins? (Last-write-wins with timestamp tracking, or show "currently being edited by X" warning)
- What happens when Amazon API rate limits are exceeded during search or refresh? (Graceful degradation with retry logic and user-friendly error messages)
- How does the system handle products with incomplete or missing specifications from Amazon? (Allows manual entry of missing fields, marks incomplete data)
- What happens when a marketplace switch occurs mid-session? (Clear current filters, refresh product list, maintain user session)
- How are products handled if refresh worker is down for more than 24 hours? (Queues all pending refreshes, processes in batches when worker recovers)
- What happens when a user applies filters and multiple variants of the same product match? (Show parent product once; when clicked, variant selector shows matching variants or pre-selects best match)
- How does the system handle variants that are no longer available on Amazon during refresh? (Mark individual variant as unavailable; if all variants unavailable, mark parent as unavailable)
- What happens if admin activates a parent product but some variants are still in draft status? (Either require all variants active, or allow mixed status with UI indicating some variants not yet published)
- How are new variants handled when they appear on Amazon for an already-imported product? (Refresh worker can detect and optionally auto-import new variants as draft, or notify admin for manual review)

## Requirements *(mandatory)*

### Functional Requirements

**Marketplace Management**

- **FR-001**: System MUST support multiple Amazon marketplaces (initially US and DE) with the ability to add more marketplaces in the future
- **FR-002**: System MUST allow users to select their preferred marketplace, which determines which products are displayed and in what currency
- **FR-003**: System MUST maintain separate product catalogs for each marketplace, as products and prices vary by region

**Product Search and Import**

- **FR-004**: Admin panel MUST integrate with Amazon Product Advertising API 5.0 (PA-API 5.0) to search for products using the SearchItems operation
- **FR-005**: Admin panel MUST allow searching with keywords and display results with product images, titles, prices, and ratings as returned by PA-API SearchItems response
- **FR-006**: Admin panel MUST allow admins to select multiple products from search results and import them into the system
- **FR-007**: System MUST import products with status = "draft" initially, preventing them from appearing on the public website
- **FR-008**: System MUST associate each imported product with its source marketplace (US or DE) as specified in the PA-API request
- **FR-009**: System MUST store ALL available metadata from PA-API 5.0 response to maximize future flexibility and feature possibilities, including but not limited to:
  - **Basic Info**: ASIN, title, description (Features, ProductDescription), brand, manufacturer
  - **Media**: Images (Primary, Variants), DetailPageURL
  - **Pricing & Offers**: Offers.Listings (Price, SavingsAmount, SavingsPercentage), Offers.Summaries (LowestPrice, HighestPrice, OfferCount)
  - **Product Details**: ItemInfo (ProductInfo, TechnicalInfo, ContentInfo, ExternalIds)
  - **Ratings & Reviews**: CustomerReviews (Count, StarRating)
  - **Availability**: Offers.Listings.Availability (Type, Message)
  - **Classification**: BrowseNodeInfo, Classifications
  - **Timestamps**: Last updated timestamp
- **FR-009-DEALS**: System MUST specifically capture discount information from Offers.Listings.SavingsAmount and SavingsPercentage to enable "deal badge" display when products are on sale

**Product Variants**

- **FR-009a**: System MUST detect when Amazon products have multiple variants using PA-API 5.0 GetVariations operation (e.g., different flash sizes, colors, configurations)
- **FR-009b**: System MUST import each variant as a separate product record with its own unique ASIN, price, and specifications
- **FR-009c**: System MUST link related variants using a parent_id field to group them as a variant family (parent ASIN references the parent product)
- **FR-009d**: System MUST store variant-specific attributes from PA-API VariationAttributes (e.g., selected options like "8MB Flash", "Blue Color") for each variant product
- **FR-009e**: Public website MUST display a variant selector (dropdown or button group) on product detail pages when viewing products with variants
- **FR-009f**: Website MUST dynamically update price, specifications, images, and DetailPageURL when user selects a different variant
- **FR-009g**: Product listings MUST show only one product card per variant family (showing parent/representative variant)
- **FR-009h**: Filtering MUST show a product family if ANY variant matches the filter criteria
- **FR-009i**: System MUST pre-select the variant that matches the filter criteria when user clicks through from filtered listings

**Product Categorization**

- **FR-010**: System MUST provide predefined product categories relevant to ESP32 ecosystem (e.g., Development Boards, Microcontrollers, Sensors, Displays, Kits, Accessories)
- **FR-011**: Admin panel MUST allow assigning multiple categories to a single product
- **FR-012**: System MUST support ESP32-specific technical specifications including: ESP32 variant (ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, ESP32-H2), PSRAM size, Flash storage size, connectivity features (WiFi, Bluetooth, LoRa, etc.)
- **FR-013**: Admin panel MUST provide structured input fields for technical specifications with dropdowns for predefined values where appropriate
- **FR-014**: System MUST allow products to be edited after import to add or modify categorization and specifications

**Product Status and Activation**

- **FR-015**: System MUST support product statuses: "draft" (not visible to public), "active" (visible to public), and "unavailable" (soft-deleted, hidden from public but data retained)
- **FR-016**: Admin panel MUST allow changing product status from draft to active
- **FR-017**: System MUST immediately reflect status changes - products set to active must appear on public site without delay
- **FR-018**: System MUST validate that required categorization fields are completed before allowing activation
- **FR-018a**: When product becomes unavailable on Amazon (404, ItemNotAccessible errors), system MUST automatically change status to "unavailable" after first failed refresh, preserving all product data for potential re-activation
- **FR-018b**: Admin panel MUST display unavailable products in a separate section with last-available timestamp and option to hard delete or re-activate
- **FR-018c**: Public website MUST return 410 Gone status for unavailable product URLs with optional redirect to category page for SEO best practices

**Automatic Product Refresh**

- **FR-019**: System MUST automatically refresh product data using PA-API 5.0 GetItems operation at least once every 24 hours for all active products
- **FR-020**: Refresh worker MUST use rolling updates, distributing refreshes evenly across the 24-hour period to avoid PA-API rate limit issues
- **FR-021**: Refresh process MUST update ALL stored metadata including prices (Offers.Listings.Price), discount information (SavingsAmount, SavingsPercentage), availability status (Offers.Listings.Availability), ratings, and other changeable product details from PA-API GetItems response
- **FR-022**: System MUST track last refresh timestamp for each product
- **FR-023**: System MUST handle refresh failures gracefully, logging errors and marking products with error status when PA-API returns errors or product data is unavailable
- **FR-024**: Refresh worker MUST respect PA-API 5.0 rate limits (marketplace-specific TPS limits) and implement exponential backoff retry strategy (3 attempts: 1s, 2s, 4s delays) with circuit breaker pattern (5-minute open state after repeated failures) to prevent cascade failures during PA-API outages
- **FR-024a**: System MUST monitor circuit breaker state and emit metrics for observability (closed/open/half-open states, failure rates)
- **FR-024b**: When circuit breaker is open, system MUST gracefully skip refresh attempts and rely on cached data until circuit closes, preventing unnecessary PA-API calls

**Public Product Browsing**

- **FR-025**: Public website MUST display only products with status = "active" for the selected marketplace
- **FR-026**: Product listings MUST show product image, title, current price in local currency, key specifications, and deal badge when product has active discount (SavingsPercentage > 0)
- **FR-026a**: Deal badge MUST display the savings percentage (e.g., "15% OFF") when SavingsPercentage is available from PA-API Offers data
- **FR-026b**: Product cards MUST visually distinguish discounted products (e.g., original price strikethrough, savings amount, deal badge styling)
- **FR-027**: System MUST provide individual product detail pages with full description, all specifications, current price, original price (if discounted), savings amount/percentage, availability status, customer ratings, and direct link to purchase on Amazon
- **FR-028**: Website MUST allow filtering products by category (single or multiple categories)
- **FR-029**: Website MUST allow filtering products by technical specifications (ESP32 variant, PSRAM size, flash size, connectivity features)
- **FR-029a**: Website SHOULD allow filtering by deal status (e.g., "Show only discounted items") to help users find bargains
- **FR-030**: System MUST support combining multiple filters (e.g., category = "Development Boards" AND ESP32 variant = "ESP32-S3" AND PSRAM >= "8MB" AND has_discount = true)
- **FR-031**: Website MUST update filter results dynamically without full page reload
- **FR-032**: System MUST display appropriate message when no products match selected filters

**Admin Authentication**

- **FR-033**: System MUST provide admin authentication to protect admin panel access using Supabase Auth
- **FR-034**: System MUST support admin login with email and password via Supabase Auth, with optional OAuth providers (Google, GitHub) for future enhancement
- **FR-035**: System MUST maintain admin session using Supabase session management with automatic logout after inactivity (default: 1 hour idle timeout)
- **FR-036**: System MUST use Supabase Row Level Security (RLS) policies to restrict admin panel operations to authenticated admin users

**Observability & Monitoring**

- **FR-037**: System MUST implement structured JSON logging with correlation IDs for request tracing across all backend services
- **FR-038**: System MUST emit basic operational metrics embedded in logs including: API response times (p50, p95, p99), PA-API request success/failure rates, circuit breaker state changes, refresh job completion rates
- **FR-039**: System MUST provide health check endpoints exposing service status, database connectivity, PA-API availability, and circuit breaker states
- **FR-040**: Admin panel MUST display basic operational metrics dashboard showing: products refreshed in last 24h, current refresh queue size, PA-API error rate, circuit breaker status per marketplace

### Key Entities

- **Marketplace**: Represents an Amazon marketplace (e.g., US, DE); includes marketplace code (e.g., "www.amazon.com", "www.amazon.de"), region name, currency, PA-API 5.0 endpoint, Associate Tag
- **Product**: Core entity representing an ESP32 item or variant; stores comprehensive PA-API 5.0 metadata including:
  - **Identity**: ASIN (Amazon Standard Identification Number), parent_id (null for parent products, references parent ASIN for variants)
  - **Basic Info**: title, description, brand, manufacturer
  - **Media**: images (primary and variants), DetailPageURL (Amazon product URL)
  - **Pricing & Deals**: current price, original price (list price), savings amount, savings percentage, offer count
  - **Availability**: availability type, availability message
  - **Ratings**: customer review count, star rating
  - **Classification**: browse node info, product group
  - **Variant Info**: variant attributes from PA-API VariationAttributes (e.g., "8MB Flash", "Blue Color")
  - **Metadata**: status (draft/active/unavailable), marketplace association, last refresh timestamp, last_available_at timestamp (for unavailable products)
  - **Raw Data**: complete PA-API JSON response stored for future feature extensibility
- **Category**: Predefined product categories (Development Boards, Sensors, Kits, etc.); products can belong to multiple categories
- **ProductSpecification**: Technical specifications for a product; includes ESP32 variant, PSRAM size, flash size, connectivity features (WiFi, Bluetooth, etc.); structured as key-value pairs for flexibility
- **Admin**: User account with access to admin panel; includes email, hashed password (managed by Supabase Auth), role assignment, last login timestamp; authentication handled by Supabase Auth service
- **RefreshJob**: Tracks product refresh operations; includes product ASIN reference, scheduled time, completion status, PA-API error codes/messages if failed, retry attempt count (max 3), circuit breaker state (closed/open/half-open)
- **ProductCategoryAssociation**: Links products to categories (many-to-many relationship)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse at least 50 ESP32 products per marketplace within 10 seconds of selecting a marketplace
- **SC-002**: Users can apply category and specification filters (including deal filter) and see filtered results in under 2 seconds
- **SC-003**: Users can view complete product details including current Amazon pricing, deal information (if discounted), customer ratings, and availability status on individual product pages
- **SC-003a**: When products are on sale, users can immediately identify them via visible deal badges showing savings percentage in both product listings and detail pages
- **SC-004**: Admins can search Amazon, import products, categorize them, and activate them within 5 minutes per product
- **SC-005**: 100% of active products have their pricing refreshed at least once every 24 hours without manual intervention
- **SC-006**: Product prices displayed to users are never more than 24 hours old
- **SC-007**: System successfully handles marketplace switching without errors or data loss
- **SC-008**: 95% of Amazon API requests complete successfully within rate limits (handling failures gracefully)
- **SC-009**: Admin panel product search returns relevant results for ESP32-related queries 90% of the time
- **SC-010**: System supports concurrent browsing by at least 100 users without performance degradation
- **SC-011**: Health check endpoints return status within 500ms and accurately reflect system component health (database, PA-API connectivity, worker status)
- **SC-012**: Application bundle size remains under 200KB (gzipped) for initial page load, meeting performance budget requirements

## Assumptions

- Amazon Product Advertising API 5.0 (PA-API 5.0) access is available and API credentials will be provided
- **Supabase** project is provisioned with Auth enabled for admin authentication and session management
- **Nuxt 3** application will be deployed to Netlify with edge functions for PA-API integration and background jobs
- PA-API 5.0 rate limits are sufficient for the expected search and refresh volumes (PA-API 5.0 has marketplace-specific limits; assumed adequate for initial scale)
- Product images are hosted by Amazon CDN and can be displayed via external URLs provided in PA-API responses
- Currency conversion is handled by displaying prices in the marketplace's native currency (USD for US, EUR for DE) as provided by PA-API
- Admin authentication uses **Supabase Auth** for session management, with email/password as primary method and optional OAuth providers for future enhancement
- Initial product catalog will be manually curated (no automated product discovery beyond manual search)
- Amazon product links include Associate Tag (affiliate tracking codes) for revenue generation (to be configured per marketplace in PA-API requests)
- System will initially support two marketplaces (US and DE) with architecture allowing future expansion
- PA-API 5.0 SearchItems operation returns sufficient product data for initial import (title, images, price, ASIN, ItemInfo)
- Legal compliance for displaying Amazon product data is handled by Amazon Product Advertising API terms of service
- No payment processing is required (users purchase directly on Amazon via affiliate links)
- PA-API 5.0 GetVariations operation provides variant information that allows identification of parent-variant relationships
- Each variant has a unique Amazon product ID (ASIN) that can be used for direct linking and refresh operations via GetItems
- When importing products with variants, all variants returned by GetVariations are imported together as a family (no partial variant imports)

## Dependencies

- **Amazon Product Advertising API 5.0** account and credentials
- **Amazon PA-API 5.0 Documentation**: https://webservices.amazon.com/paapi5/documentation/ (official reference for API implementation)
- **Supabase** project with Auth service enabled for admin authentication and session management
- **Technology Stack**:
  - **Nuxt 3** (Vue.js framework) with TypeScript for full-stack application
  - **Tailwind CSS** for utility-first styling and responsive design
  - **Supabase Client** for authentication and database interactions
  - **Netlify** for hosting, edge functions, and deployment pipeline
- Understanding of PA-API 5.0 request/response formats for:
  - SearchItems operation (product search)
  - GetItems operation (product details and refresh)
  - GetVariations operation (product variant discovery)
- Definition of complete list of ESP32 variants and common specifications for dropdown values
- Design mockups for admin panel and public website layout (or acceptance of basic functional UI for MVP)
- Hosting infrastructure with ability to run background workers for product refresh (Netlify scheduled functions or external cron service)
- **Nuxt 3** development environment with Node.js 18+ and pnpm/npm package manager

## Out of Scope (for this specification)

- User accounts or wishlists on the public website
- Price comparison across multiple marketplaces
- Email notifications for price drops or product availability
- Reviews or ratings within the platform (Amazon ratings will be displayed from API data)
- Integration with other product sources beyond Amazon
- Inventory management (relies on Amazon availability data)
- Multi-language support (English only for MVP)
- Advanced search features like natural language queries or AI-powered recommendations
- Mobile native applications (responsive web only)

---

## Technology Stack (Resolved)

**Decision Summary**: Nuxt 3 + TypeScript + Tailwind CSS + Supabase + Netlify

**Frontend**:
- **Nuxt 3** (Vue.js framework) with Universal Rendering (SSR/SSG) for optimal performance and SEO
- **TypeScript** (strict mode) for type safety and developer experience
- **Tailwind CSS** for utility-first styling, responsive design, and consistent UI components
- **Vue 3 Composition API** for component logic and state management

**Backend**:
- **Nuxt Server Routes** (Nitro engine) for API endpoints and server-side logic
- **Netlify Edge Functions** for serverless API integration with PA-API 5.0
- **Netlify Scheduled Functions** for background refresh worker (24-hour rolling updates)

**Database & Auth**:
- **Supabase PostgreSQL** for product data, categories, specifications, and admin users
- **Supabase Auth** for admin authentication with email/password and session management
- **Supabase Row Level Security (RLS)** for data access control

**Infrastructure**:
- **Netlify** for hosting, CI/CD deployment from Git, edge functions, and scheduled functions
- **Supabase** for managed PostgreSQL database and authentication service

**Development & Testing**:
- **Vitest** for unit testing (TDD workflow, 80% coverage minimum)
- **Playwright** for end-to-end testing of user scenarios
- **ESLint** + **Prettier** for code quality and formatting
- **pnpm** for package management

**Observability**:
- **Pino** for structured JSON logging with correlation IDs
- Netlify function logs for centralized log aggregation
- Custom metrics embedded in logs (response times, PA-API success rates, circuit breaker states)

---

## Product Variants Strategy (Resolved)

**Decision Summary**: Amazon products with variations (e.g., different flash sizes, PSRAM configurations) will be handled using a hybrid approach:

1. **Import Strategy**: Each variant imported as separate product with `parent_id` reference to group related variants
2. **Display Strategy**: Amazon-style variant selector on product detail pages (dropdown/buttons to switch between variants)
3. **Filtering Strategy**: Show parent product in listings if ANY variant matches the filter criteria

**Implications**:
- Data model includes `parent_id` field on Product entity to link variants
- Product detail pages require variant selector UI component
- Filtering logic checks all variants of a product group and shows parent if any match
- Each variant maintains its own price, availability, and specifications
- Users see one product card per variant group in listings, but can select specific variant on detail page
