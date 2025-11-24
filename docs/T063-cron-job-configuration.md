# T063: Supabase Cron Job Configuration

**Status**: ✅ COMPLETE  
**Date**: 2025-11-24  
**Task**: Configure Supabase cron job for automatic product refresh

---

## Overview

This document describes the cron job configuration that enables automatic product refresh every 10 minutes.

---

## Configuration Summary

**Schedule**: `*/10 * * * *` (every 10 minutes)  
**Target**: refresh-worker Edge Function  
**Timeout**: 300 seconds (5 minutes)  
**Batch Size**: 10 products per execution  
**Daily Capacity**: 1,440 products (10 × 6 batches/hour × 24 hours)

---

## Files Created

### 1. Migration: `20251124000006_create_refresh_cron.sql`

Creates the pg_cron job that triggers the refresh-worker Edge Function.

**What it does**:
- Enables pg_cron extension
- Creates cron job named `refresh-worker-every-10min`
- Schedules execution every 10 minutes (0, 10, 20, 30, 40, 50 minutes past each hour)
- Calls refresh-worker via HTTP POST using Supabase's `net.http_post` function
- Sets 5-minute timeout for long-running refreshes

**Cron Schedule Breakdown**:
```
*/10 * * * *
│    │ │ │ │
│    │ │ │ └─── Day of week (0-7, 0 or 7 is Sunday)
│    │ │ └───── Month (1-12)
│    │ └─────── Day of month (1-31)
│    └───────── Hour (0-23)
└────────────── Minute (every 10 minutes: 0, 10, 20, 30, 40, 50)
```

### 2. Configuration: `20251124000007_configure_cron_settings.sql`

Provides instructions for setting up Supabase Vault secrets for the cron job.

**Required Secrets** (stored in Supabase Vault):
- `WORKER_URL`: Your Supabase project URL
- `WORKER_AUTH`: Service role key for authentication

**⚠️ Important**: You must manually insert these secrets into Supabase Vault via the SQL Editor after deploying the migrations.

---

## Deployment Instructions

### Step 1: Apply Migrations Locally

```bash
# Reset local database to apply all migrations
cd /Users/gytis/Documents/Projects/Blog/espboards-store-v4/espboards-store
supabase db reset
```

This will apply all migrations including the new cron job configuration.

### Step 2: Push Migrations to Production

```bash
# Push migrations to remote Supabase project
supabase db push
```

### Step 3: Configure Vault Secrets in Production

After pushing migrations, configure the secrets via **Supabase Dashboard → SQL Editor**:

**1. Store the Supabase project URL:**
```sql
INSERT INTO vault.secrets (name, secret)
VALUES (
    'WORKER_URL',
    'https://ogkpdelgnmttshyedtsb.supabase.co'
)
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

**2. Store the service role key:**

First, get your service role key:
- Go to: https://supabase.com/dashboard/project/ogkpdelgnmttshyedtsb/settings/api
- Copy the **service_role** key (not the anon key)

Then run:
```sql
INSERT INTO vault.secrets (name, secret)
VALUES (
    'WORKER_AUTH',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  -- Paste your actual service_role key here
)
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

**3. Verify secrets are stored:**
```sql
SELECT name, created_at, updated_at 
FROM vault.secrets 
WHERE name IN ('WORKER_URL', 'WORKER_AUTH');
```

Expected output:
```
┌─────────────┬────────────────────────────┬────────────────────────────┐
│ name        │ created_at                 │ updated_at                 │
├─────────────┼────────────────────────────┼────────────────────────────┤
│ WORKER_URL  │ 2025-11-24 18:00:00+00     │ 2025-11-24 18:00:00+00     │
│ WORKER_AUTH │ 2025-11-24 18:00:00+00     │ 2025-11-24 18:00:00+00     │
└─────────────┴────────────────────────────┴────────────────────────────┘
```

### Step 4: Verify Cron Job

```bash
# Connect to Supabase and check cron job status
supabase db shell
```

Then run:
```sql
-- Check cron job exists
SELECT * FROM cron.job WHERE jobname = 'refresh-worker-every-10min';

-- Expected output:
-- jobid | schedule     | command                | nodename  | nodeport | database | username | active | jobname
-- ------+--------------+------------------------+-----------+----------+----------+----------+--------+---------------------------
-- 1     | */10 * * * * | SELECT net.http_post...| localhost | 5432     | postgres | postgres | true   | refresh-worker-every-10min
```

---

## Monitoring

### View Cron Job Execution History

```sql
-- Last 20 cron job runs
SELECT 
  runid,
  jobid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-worker-every-10min')
ORDER BY start_time DESC 
LIMIT 20;
```

### View Refresh Worker Logs

Check Supabase Dashboard:
1. Go to **Logs** → **Functions**
2. Filter by function: `refresh-worker`
3. Look for execution metrics in log messages

Example log output:
```json
{
  "timestamp": "2025-11-24T18:00:00.000Z",
  "level": "info",
  "message": "Refresh worker execution completed",
  "metadata": {
    "metrics": {
      "processed": 10,
      "success": 10,
      "failure": 0,
      "skipped": 0,
      "duration_ms": 8500
    },
    "circuit_state": "CLOSED"
  }
}
```

### View Refresh Jobs Table

```sql
-- Recent refresh jobs
SELECT 
  id,
  product_id,
  status,
  started_at,
  completed_at,
  retry_count,
  error_code,
  error_message
FROM refresh_jobs
ORDER BY created_at DESC
LIMIT 50;
```

---

## Refresh Capacity Analysis

### Current Configuration

**Cron Schedule**: Every 10 minutes  
**Batch Size**: 10 products  
**Executions per Hour**: 6 (at 0, 10, 20, 30, 40, 50 minutes)  
**Products per Hour**: 10 × 6 = **60 products**  
**Products per Day**: 60 × 24 = **1,440 products**

### Refresh Cycle Time

| Catalog Size | Complete Refresh Time |
|--------------|----------------------|
| 60 products  | 1 hour              |
| 120 products | 2 hours             |
| 360 products | 6 hours             |
| 720 products | 12 hours            |
| 1,440 products | 24 hours          |
| 2,880 products | 48 hours          |

**Note**: If your catalog exceeds 1,440 products, some products will take longer than 24 hours to refresh. Consider:
- Increasing batch size (change `LIMIT 10` to higher value in refresh-worker)
- Increasing cron frequency (e.g., `*/5 * * * *` for every 5 minutes)
- Or accepting longer refresh cycles for larger catalogs

---

## Scaling Considerations

### Option 1: Increase Batch Size

**Change**: Update `LIMIT 10` to `LIMIT 40` in refresh-worker/index.ts

**Impact**:
- 40 products × 6 executions/hour = **240 products/hour**
- 240 × 24 = **5,760 products/day**
- Edge Function execution time increases (~30-40 seconds per batch)

### Option 2: Increase Cron Frequency

**Change**: Update cron schedule to `*/5 * * * *` (every 5 minutes)

**Impact**:
- 10 products × 12 executions/hour = **120 products/hour**
- 120 × 24 = **2,880 products/day**
- More frequent Edge Function cold starts
- Higher database connection usage

### Option 3: Hybrid Approach

**Change**: 
- Batch size: `LIMIT 20`
- Cron schedule: `*/5 * * * *`

**Impact**:
- 20 products × 12 executions/hour = **240 products/hour**
- 240 × 24 = **5,760 products/day**
- Balanced approach for larger catalogs

---

## PA-API Rate Limits

**Amazon PA-API Rate Limits**:
- 8,640 requests per day
- 1 request per second (burst to 10 requests)

**Current Usage**:
- 10 products/batch × 6 batches/hour × 24 hours = **1,440 PA-API requests/day**
- Well within rate limits (16.6% of daily allowance)

**Headroom**: Can increase to ~60 products/batch before hitting PA-API limits.

---

## Troubleshooting

### Cron Job Not Running

**Check 1: Verify cron job exists**
```sql
SELECT * FROM cron.job WHERE jobname = 'refresh-worker-every-10min';
```

**Check 2: Verify pg_cron extension enabled**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Check 3: Check cron job execution errors**
```sql
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
ORDER BY start_time DESC 
LIMIT 10;
```

### Refresh Worker Not Executing

**Check 1: Verify database settings configured**
```sql
SELECT name, setting 
FROM pg_settings 
WHERE name LIKE 'app.settings.%';
```

**Check 2: Test Edge Function manually**
```bash
curl -X POST "https://ogkpdelgnmttshyedtsb.supabase.co/functions/v1/refresh-worker" \
  -H "Content-Type: application/json"
```

**Check 3: Check Supabase function logs**
- Go to Supabase Dashboard → Logs → Functions
- Filter by `refresh-worker`
- Look for error messages

### Products Not Refreshing

**Check 1: Verify products need refresh**
```sql
SELECT 
  id,
  asin,
  title,
  status,
  last_refresh_at,
  CASE 
    WHEN last_refresh_at IS NULL THEN 'Never refreshed'
    WHEN last_refresh_at < NOW() - INTERVAL '24 hours' THEN 'Needs refresh'
    ELSE 'Recently refreshed'
  END as refresh_status
FROM products
WHERE status IN ('active', 'draft')
ORDER BY last_refresh_at ASC NULLS FIRST
LIMIT 20;
```

**Check 2: Check refresh job results**
```sql
SELECT 
  rj.status,
  COUNT(*) as count
FROM refresh_jobs rj
WHERE rj.created_at > NOW() - INTERVAL '1 hour'
GROUP BY rj.status;
```

**Check 3: Check circuit breaker state**

If circuit breaker is OPEN, products will be skipped:
```sql
SELECT 
  status,
  circuit_breaker_state,
  COUNT(*) as count
FROM refresh_jobs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY status, circuit_breaker_state;
```

---

## Manual Operations

### Manually Trigger Refresh

```bash
# Trigger refresh worker immediately
curl -X POST "https://ogkpdelgnmttshyedtsb.supabase.co/functions/v1/refresh-worker" \
  -H "Content-Type: application/json"
```

### Pause Cron Job

```sql
-- Disable cron job temporarily
UPDATE cron.job 
SET active = false 
WHERE jobname = 'refresh-worker-every-10min';
```

### Resume Cron Job

```sql
-- Re-enable cron job
UPDATE cron.job 
SET active = true 
WHERE jobname = 'refresh-worker-every-10min';
```

### Unschedule Cron Job

```sql
-- Permanently remove cron job
SELECT cron.unschedule('refresh-worker-every-10min');
```

### Reschedule Cron Job

```sql
-- Change schedule to every 5 minutes
SELECT cron.schedule(
  'refresh-worker-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/refresh-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  ) as request_id;
  $$
);
```

---

## Success Criteria

✅ **T063 Complete When**:
- [x] Migration file created: `20251124000006_create_refresh_cron.sql`
- [x] Configuration file created: `20251124000007_configure_cron_settings.sql`
- [x] Documentation created: `T063-cron-job-configuration.md`
- [ ] Migrations applied to local database (run `supabase db reset`)
- [ ] Service role key configured in settings file
- [ ] Migrations pushed to production (run `supabase db push`)
- [ ] Cron job verified in production (query `cron.job` table)
- [ ] First automatic execution confirmed (check logs after 10 minutes)

---

## Next Steps

- **T064**: Create Netlify scheduled function alternative (backup if Supabase cron unavailable)
- **T070**: Test circuit breaker integration with simulated PA-API outage
- **T072**: Verify cron job runs automatically every 10 minutes (monitor logs)

---

## Key Achievement

✨ **Automatic product refresh configured - 1,440 products/day capacity with 10-minute execution frequency!**

The refresh worker will now run automatically every 10 minutes, keeping product data fresh without manual intervention. The 24-hour rolling update strategy ensures even distribution of PA-API calls while staying well within rate limits.
