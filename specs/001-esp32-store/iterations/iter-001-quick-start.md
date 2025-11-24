# Iteration 001: Quick Start Implementation Guide

**Goal**: Get backend import & refresh working in Supabase

---

## Prerequisites Setup

### 1. Amazon PA-API 5.0 Credentials

Get your credentials from: https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html

You need:
- Access Key
- Secret Key  
- Associate Tag (Partner Tag)

### 2. Supabase Project

Create project at: https://supabase.com

Note your:
- Project URL: `https://xxxxx.supabase.co`
- Anon/Public Key: `eyJhbGc...`
- Service Role Key: `eyJhbGc...` (for edge functions)

---

## Step-by-Step Implementation (TDD)

### Phase 1: Database Schema (15 min)

1. **Create migration file**:
```bash
cd supabase
npx supabase migration new create_products_schema
```

2. **Write schema** (from iteration spec) in migration file

3. **Apply migration**:
```bash
npx supabase db push
```

4. **Verify tables** in Supabase dashboard > Table Editor

---

### Phase 2: PA-API Client (TDD - 2 hours)

#### Red: Write Tests First

```bash
mkdir -p supabase/functions/_shared/__tests__
touch supabase/functions/_shared/__tests__/paapi-client.test.ts
```

**Write failing tests**:
```typescript
// paapi-client.test.ts
import { describe, it, expect } from 'vitest';
import { PaapiClient } from '../paapi-client';

describe('PaapiClient', () => {
  it('should authenticate and sign requests', async () => {
    // Test AWS Signature V4 generation
    const client = new PaapiClient({...});
    const signature = await client.generateSignature({...});
    expect(signature).toBeDefined();
  });

  it('should fetch product by ASIN', async () => {
    // Mock PA-API response
    const client = new PaapiClient({...});
    const product = await client.getItems({ itemIds: ['B08DQQ8CBP'] });
    expect(product.ItemsResult.Items).toHaveLength(1);
    expect(product.ItemsResult.Items[0].ASIN).toBe('B08DQQ8CBP');
  });

  it('should handle PA-API errors', async () => {
    // Test error handling
    const client = new PaapiClient({...});
    await expect(client.getItems({ itemIds: ['INVALID'] }))
      .rejects.toThrow('InvalidParameterValue');
  });
});
```

**Run tests** (should fail):
```bash
npm test -- paapi-client.test.ts
```

#### Green: Implement Client

```bash
touch supabase/functions/_shared/paapi-client.ts
```

**Implement PA-API client** to make tests pass:
- Use `crypto` for AWS Signature V4
- Make HTTP request to PA-API endpoint
- Parse response and extract fields

**Run tests again** (should pass):
```bash
npm test -- paapi-client.test.ts
```

#### Refactor: Clean up code

- Extract signature logic
- Add types for all interfaces
- Add JSDoc comments

---

### Phase 3: Circuit Breaker (TDD - 1 hour)

#### Red: Write Tests First

```bash
touch supabase/functions/_shared/__tests__/circuit-breaker.test.ts
```

**Write failing tests** (from iteration spec)

#### Green: Implement

```bash
touch supabase/functions/_shared/circuit-breaker.ts
```

**Implement circuit breaker** to make tests pass

#### Refactor

---

### Phase 4: Import Product Edge Function (TDD - 2 hours)

#### Red: Write Tests First

```bash
mkdir -p supabase/functions/import-product
touch supabase/functions/import-product/__tests__/index.test.ts
```

**Write failing integration tests**:
```typescript
describe('import-product edge function', () => {
  it('should import product and store in database', async () => {
    const response = await importProduct({
      asin: 'B08DQQ8CBP',
      marketplace: 'www.amazon.com'
    });
    
    expect(response.status).toBe(200);
    
    // Verify database insert
    const product = await supabase
      .from('products')
      .select('*')
      .eq('asin', 'B08DQQ8CBP')
      .single();
    
    expect(product.data.title).toBeDefined();
    expect(product.data.current_price).toBeGreaterThan(0);
  });
});
```

#### Green: Implement Edge Function

```bash
touch supabase/functions/import-product/index.ts
```

**Implement handler**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { PaapiClient } from '../_shared/paapi-client.ts';
import { CircuitBreaker } from '../_shared/circuit-breaker.ts';

serve(async (req) => {
  const { asin, marketplace } = await req.json();
  
  // 1. Fetch from PA-API with circuit breaker
  // 2. Transform response to database schema
  // 3. Upsert to products table
  // 4. Return success response with correlation ID
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### Refactor

---

### Phase 5: Refresh Worker (TDD - 2 hours)

Same TDD process:
1. Write tests for refresh logic
2. Implement to pass tests
3. Refactor

**Key logic**:
- Query products where `last_refresh_at < NOW() - INTERVAL '24 hours'`
- Limit to batch size (e.g., 10 products per run)
- For each product: call PA-API GetItems
- Update database with new data
- Log success/failure in `refresh_jobs` table

---

### Phase 6: Health Check (30 min)

Simple endpoint:
```typescript
// supabase/functions/health-check/index.ts
serve(async (req) => {
  // Check database connection
  // Check PA-API connectivity (ping)
  // Return circuit breaker state
  
  return new Response(JSON.stringify({
    status: 'healthy',
    components: {
      database: 'up',
      paapi: 'up',
      circuitBreaker: 'closed'
    }
  }));
});
```

---

## Testing & Validation

### Run All Tests

```bash
npm test
npm run test:coverage  # Verify 80%+ coverage
```

### Deploy to Supabase

```bash
# Set environment variables first
npx supabase secrets set PAAPI_ACCESS_KEY=xxx
npx supabase secrets set PAAPI_SECRET_KEY=xxx
npx supabase secrets set PAAPI_PARTNER_TAG=xxx

# Deploy functions
npx supabase functions deploy import-product
npx supabase functions deploy refresh-worker
npx supabase functions deploy health-check
```

### Manual Testing

**Test import**:
```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/import-product \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08DQQ8CBP","marketplace":"www.amazon.com"}'
```

**Verify in database**:
```sql
SELECT * FROM products WHERE asin = 'B08DQQ8CBP';
```

**Test health check**:
```bash
curl https://xxxxx.supabase.co/functions/v1/health-check
```

---

## Success Validation

Check all success criteria from iteration spec:

- [ ] ✅ SC-001: Import real ESP32 product with all metadata
- [ ] ✅ SC-002: Refresh worker updates product on schedule
- [ ] ✅ SC-003: Circuit breaker behavior validated
- [ ] ✅ SC-004: Tests pass with 80%+ coverage
- [ ] ✅ SC-005: Structured logs visible in Supabase
- [ ] ✅ SC-006: Health check returns 200 OK
- [ ] ✅ SC-007: Product unavailability handled

---

## Estimated Timeline

- **Database Schema**: 15 minutes
- **PA-API Client (TDD)**: 2 hours
- **Circuit Breaker (TDD)**: 1 hour
- **Import Function (TDD)**: 2 hours
- **Refresh Worker (TDD)**: 2 hours
- **Health Check**: 30 minutes
- **Testing & Deployment**: 1 hour

**Total**: ~9 hours (1-2 days)

---

## Troubleshooting

**PA-API Authentication Fails**:
- Verify AWS Signature V4 generation
- Check timestamp format (must be ISO 8601)
- Ensure credentials are correct

**Circuit Breaker Not Opening**:
- Check failure threshold logic
- Verify timestamp comparison
- Add debug logging

**Database Connection Issues**:
- Verify Supabase URL and keys
- Check RLS policies (should be permissive for MVP)
- Review edge function logs in Supabase dashboard

---

## Next Steps

After completing this iteration:
1. Demo the working backend to stakeholders
2. Review logs and metrics in Supabase dashboard  
3. Document any issues or improvements needed
4. Plan Iteration 002: Product Search + Admin UI

**Ready to start?** Begin with Phase 1: Database Schema! 🚀
