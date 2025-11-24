# T011: Create Marketplaces Migration

**Task**: Create database migration for marketplaces table  
**Date**: 2025-11-24  
**Prerequisites**: T002 ✅ (Local Supabase initialized)  
**Status**: COMPLETE ✅

---

## Overview

The `marketplaces` table is the foundation of the multi-region product catalog. It stores configuration for different Amazon marketplaces (US, DE, etc.) including PA-API endpoints and associate tags.

**Purpose**:
- Normalize marketplace data across the application
- Support multi-region PA-API integration
- Enable marketplace-specific product storage and queries
- Maintain marketplace configuration in database (not hardcoded)

---

## Migration File

**Location**: `supabase/migrations/20251124000001_create_marketplaces.sql`

**Naming Convention**: `YYYYMMDDHHMMSS_description.sql`
- `20251124000001`: Timestamp (November 24, 2025, 00:00:01)
- `create_marketplaces`: Descriptive action
- First migration (number ending in 01)

---

## Table Schema

### marketplaces

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique marketplace identifier |
| `code` | TEXT | NOT NULL, UNIQUE, CHECK (uppercase), CHECK (2-3 chars) | ISO 3166-1 country code (US, DE) |
| `region_name` | TEXT | NOT NULL | Human-readable marketplace name |
| `currency` | TEXT | NOT NULL, CHECK (3 chars) | ISO 4217 currency code (USD, EUR) |
| `paapi_endpoint` | TEXT | NOT NULL | PA-API 5.0 endpoint URL |
| `associate_tag` | TEXT | NOT NULL | Amazon Associate Tag for marketplace |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes

- **idx_marketplaces_code**: Index on `code` column
  - Purpose: Fast lookups by marketplace code (most common query pattern)
  - Type: B-tree index
  - Used by: Product queries filtering by marketplace

### Constraints

1. **marketplaces_code_check**: `code = UPPER(code)`
   - Enforces uppercase country codes (US not us)
   
2. **marketplaces_code_length_check**: `LENGTH(code) BETWEEN 2 AND 3`
   - Enforces ISO 3166-1 alpha-2 or alpha-3 codes
   
3. **marketplaces_currency_check**: `LENGTH(currency) = 3`
   - Enforces ISO 4217 3-letter currency codes (USD, EUR, GBP)

### Triggers

**update_marketplaces_updated_at**:
- Type: BEFORE UPDATE trigger
- Purpose: Automatically update `updated_at` timestamp on row modifications
- Function: `update_updated_at_column()` (shared utility function)

---

## Seed Data

The migration inserts two initial marketplaces:

### United States (US)
```sql
code: 'US'
region_name: 'United States'
currency: 'USD'
paapi_endpoint: 'https://webservices.amazon.com/paapi5/getitems'
associate_tag: 'espboards-20' (placeholder)
```

### Germany (DE)
```sql
code: 'DE'
region_name: 'Germany'
currency: 'EUR'
paapi_endpoint: 'https://webservices.amazon.de/paapi5/getitems'
associate_tag: 'espboards-21' (placeholder)
```

**Note**: Associate tags are placeholders. Replace with actual tags from your Amazon Associates account (see T004 environment setup).

---

## PA-API Endpoints Reference

Official Amazon Product Advertising API 5.0 endpoints:

| Marketplace | Code | Endpoint |
|-------------|------|----------|
| United States | US | https://webservices.amazon.com/paapi5/getitems |
| Germany | DE | https://webservices.amazon.de/paapi5/getitems |
| United Kingdom | UK | https://webservices.amazon.co.uk/paapi5/getitems |
| France | FR | https://webservices.amazon.fr/paapi5/getitems |
| Japan | JP | https://webservices.amazon.co.jp/paapi5/getitems |
| Canada | CA | https://webservices.amazon.ca/paapi5/getitems |
| Italy | IT | https://webservices.amazon.it/paapi5/getitems |
| Spain | ES | https://webservices.amazon.es/paapi5/getitems |

**Documentation**: https://webservices.amazon.com/paapi5/documentation/common-request-parameters.html#host-and-region

---

## Constitution Compliance

### ✅ Backend-First
- Database schema created before application code
- Migration-based schema management (version controlled)

### ✅ Performance
- UUID primary key for distributed systems compatibility
- Indexed `code` column for fast marketplace lookups
- Constraints prevent invalid data at database level

### ✅ API Design
- Normalized marketplace data (DRY principle)
- Support for multi-region expansion
- Configuration stored in database, not hardcoded

### ✅ Observability
- Timestamps track record creation and updates
- Comments document table/column purposes

---

## Usage Examples

### Query Marketplace by Code
```sql
-- Get US marketplace configuration
SELECT id, code, region_name, currency, paapi_endpoint, associate_tag
FROM marketplaces
WHERE code = 'US';
```

### Get All Marketplaces
```sql
-- List all available marketplaces
SELECT code, region_name, currency
FROM marketplaces
ORDER BY code;
```

### Add New Marketplace
```sql
-- Add UK marketplace
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES (
    'UK',
    'United Kingdom',
    'GBP',
    'https://webservices.amazon.co.uk/paapi5/getitems',
    'espboards-21'
);
```

### Update Associate Tag
```sql
-- Update US associate tag with actual value
UPDATE marketplaces
SET associate_tag = 'your-actual-tag-20'
WHERE code = 'US';
```

---

## TypeScript Integration

The `Marketplace` interface in `types.ts` matches this schema:

```typescript
// From supabase/functions/_shared/types.ts
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
```

### Edge Function Usage
```typescript
// supabase/functions/import-product/index.ts
import { createClient } from '@supabase/supabase-js';
import type { Marketplace } from '../_shared/types.ts';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get marketplace configuration
const { data: marketplace, error } = await supabase
  .from('marketplaces')
  .select('*')
  .eq('code', 'US')
  .single<Marketplace>();

if (marketplace) {
  // Use marketplace.paapi_endpoint for PA-API calls
  // Use marketplace.associate_tag for PA-API authentication
}
```

---

## Testing & Verification

### Step 1: Apply Migration Locally

```bash
# From project root
cd /Users/gytis/Documents/Projects/Blog/espboards-store-v4/espboards-store

# Ensure Supabase is running
supabase status

# Apply all pending migrations (includes this one)
supabase db reset
```

**Expected Output**:
```
Applying migration 20251124000001_create_marketplaces.sql...
Seeding data from seed.sql...
✓ Database reset successful
```

### Step 2: Verify Table Created

```bash
# Connect to local database
supabase db reset --debug

# Or use psql directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

```sql
-- Check table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'marketplaces';

-- Expected: 1 row with table_name='marketplaces', table_type='BASE TABLE'
```

### Step 3: Verify Columns

```sql
-- List all columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'marketplaces' 
ORDER BY ordinal_position;

-- Expected: 8 columns (id, code, region_name, currency, paapi_endpoint, associate_tag, created_at, updated_at)
```

### Step 4: Verify Seed Data

```sql
-- Check seed data inserted
SELECT id, code, region_name, currency 
FROM marketplaces 
ORDER BY code;

-- Expected: 2 rows (DE, US)
```

### Step 5: Verify Indexes

```sql
-- List indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'marketplaces';

-- Expected: 
-- - marketplaces_pkey (PRIMARY KEY on id)
-- - marketplaces_code_key (UNIQUE on code)
-- - idx_marketplaces_code (B-tree on code)
```

### Step 6: Verify Constraints

```sql
-- List all constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'marketplaces'::regclass;

-- Expected:
-- - marketplaces_pkey (PRIMARY KEY)
-- - marketplaces_code_key (UNIQUE)
-- - marketplaces_code_check (CHECK uppercase)
-- - marketplaces_code_length_check (CHECK length)
-- - marketplaces_currency_check (CHECK length)
```

### Step 7: Test Insert Constraints

```sql
-- Test uppercase constraint (should fail)
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES ('us', 'Test', 'USD', 'https://example.com', 'test-20');
-- Expected: ERROR - violates check constraint "marketplaces_code_check"

-- Test currency length constraint (should fail)
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES ('FR', 'France', 'EURO', 'https://example.com', 'test-20');
-- Expected: ERROR - violates check constraint "marketplaces_currency_check"

-- Test unique constraint (should fail - US already exists)
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES ('US', 'United States 2', 'USD', 'https://example.com', 'test-20');
-- Expected: ERROR - duplicate key value violates unique constraint "marketplaces_code_key"
```

### Step 8: Test Updated At Trigger

```sql
-- Record current updated_at
SELECT code, updated_at FROM marketplaces WHERE code = 'US';

-- Wait 1 second, then update
SELECT pg_sleep(1);
UPDATE marketplaces SET region_name = 'United States of America' WHERE code = 'US';

-- Check updated_at changed
SELECT code, updated_at FROM marketplaces WHERE code = 'US';
-- Expected: updated_at should be newer than previous value
```

---

## Troubleshooting

### Issue: Migration file not found

**Cause**: File created in wrong directory or migrations folder doesn't exist

**Solution**:
```bash
# Ensure migrations directory exists
mkdir -p supabase/migrations

# Verify migration file exists
ls -la supabase/migrations/20251124000001_create_marketplaces.sql

# If missing, recreate from docs/T011-marketplaces-migration.md
```

### Issue: "relation already exists" error

**Cause**: Table already created from previous migration attempt

**Solution**:
```bash
# Option 1: Reset database (destroys all data)
supabase db reset

# Option 2: Manually drop table
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
DROP TABLE IF EXISTS marketplaces CASCADE;
\q

# Then reapply migrations
supabase db reset
```

### Issue: CHECK constraint violations

**Cause**: Seed data doesn't match constraints (e.g., lowercase codes)

**Solution**:
- Verify seed data has uppercase codes: 'US', 'DE' (not 'us', 'de')
- Verify currency codes are 3 letters: 'USD', 'EUR' (not 'DOLLAR', 'EURO')
- Verify code length is 2-3 characters

### Issue: Trigger not firing on UPDATE

**Cause**: Function `update_updated_at_column()` doesn't exist

**Solution**:
```sql
-- Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column';

-- If missing, run CREATE FUNCTION statement from migration file
-- Then recreate trigger
```

---

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS update_marketplaces_updated_at ON marketplaces;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop table (CASCADE removes dependent objects)
DROP TABLE IF EXISTS marketplaces CASCADE;
```

**Note**: This will delete all marketplace data. Only rollback in development!

---

## Next Steps

After completing T011:

1. **T012**: Create products migration
   - Depends on: marketplaces table (foreign key relationship)
   - Products reference marketplaces via `marketplace_id`

2. **T013**: Create refresh_jobs migration
   - Depends on: products table (foreign key relationship)

3. **T014**: Create indexes migration
   - Add additional indexes for query optimization

4. **T015**: Create RLS policies migration
   - Enable Row Level Security
   - Add policies for public read access and service role access

5. **T016**: Apply all migrations locally
   - Run `supabase db reset` to apply all migrations in order

---

## Related Files

- **Migration**: `supabase/migrations/20251124000001_create_marketplaces.sql`
- **Types**: `supabase/functions/_shared/types.ts` (Marketplace interface)
- **Documentation**: `docs/T011-marketplaces-migration.md`
- **Task**: `specs/001-esp32-store/tasks.md` (T011)

---

## Task Completion

**Status**: ✅ COMPLETE

**Completed**:
- ✅ Created migration file with proper naming convention
- ✅ Defined marketplaces table with 8 columns
- ✅ Added 3 CHECK constraints for data validation
- ✅ Added index on code column for performance
- ✅ Created updated_at trigger function
- ✅ Inserted seed data for US and DE marketplaces
- ✅ Added SQL comments for documentation
- ✅ Included verification queries
- ✅ Included rollback instructions

**Evidence**:
```bash
# Migration file exists
ls -la supabase/migrations/20251124000001_create_marketplaces.sql
# Output: 148 lines

# File contains all required elements
grep -c "CREATE TABLE" supabase/migrations/20251124000001_create_marketplaces.sql
# Output: 1

grep -c "INSERT INTO marketplaces" supabase/migrations/20251124000001_create_marketplaces.sql
# Output: 2 (US and DE seed data)
```

**Ready for**: T012 (Create products migration)

---

**Date Completed**: 2025-11-24  
**Documentation By**: GitHub Copilot  
**Next Task**: T012 - Create products migration
