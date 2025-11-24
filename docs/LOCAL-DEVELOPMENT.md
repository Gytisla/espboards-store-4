# Local Supabase Development Setup

**Status**: ✅ Running  
**Date**: 2025-11-24  
**Task**: T004 Enhancement - Local development environment

---

## Quick Access URLs

### 🎨 Supabase Studio (Database Management)
**URL**: http://127.0.0.1:54323  
**Description**: Visual interface for managing database, tables, and data  
**Usage**: Open in browser to view/edit tables, run SQL queries, manage auth

### 🔧 API Endpoint
**URL**: http://127.0.0.1:54321  
**Description**: Local Supabase API for Edge Functions and database access  
**Usage**: Base URL for all Edge Function calls during development

### 📧 Mailpit (Email Testing)
**URL**: http://127.0.0.1:54324  
**Description**: View all emails sent by Supabase Auth (no real emails sent)  
**Usage**: Test password reset, email verification flows

### 🗄️ Database Connection
**URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres  
**Description**: Direct PostgreSQL connection  
**Usage**: Connect with psql, TablePlus, or other database clients

---

## Local Credentials

### API Keys (from `.env.local`)

```bash
# Anon/Public Key (client-side safe)
SUPABASE_LOCAL_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Service Role Key (server-side only)
SUPABASE_LOCAL_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### Database Credentials

```bash
Host: 127.0.0.1
Port: 54322
Database: postgres
User: postgres
Password: postgres
```

### S3 Storage (Local)

```bash
S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
Region: local
Endpoint: http://127.0.0.1:54321/storage/v1/s3
```

---

## Common Commands

### Start/Stop Services

```bash
# Start all Supabase services
supabase start

# Stop all services
supabase stop

# Check status
supabase status

# View logs
supabase logs
```

### Database Management

```bash
# Reset database to clean state
supabase db reset

# Apply pending migrations
supabase db push

# Generate migration from changes
supabase db diff -f my_migration_name

# Connect to database with psql
supabase db shell
```

### Edge Functions

```bash
# Create new Edge Function
supabase functions new my-function

# Serve Edge Functions locally (with hot reload)
supabase functions serve

# Deploy Edge Function to cloud
supabase functions deploy my-function

# Invoke function locally
supabase functions invoke my-function --method POST --body '{"key":"value"}'
```

---

## Development Workflow

### 1. Start Local Environment

```bash
# From project root
supabase start

# Wait for services to start (30-60 seconds first time)
# Opens: http://127.0.0.1:54323 (Studio)
```

### 2. Access Supabase Studio

Open http://127.0.0.1:54323 in browser to:
- View/edit database tables
- Run SQL queries
- Test RLS policies
- Manage auth users
- View API logs

### 3. Develop Edge Functions

```bash
# Create new function
supabase functions new import-product

# Edit: supabase/functions/import-product/index.ts

# Serve locally with hot reload
supabase functions serve

# Test function
curl -X POST http://127.0.0.1:54321/functions/v1/import-product \
  -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08DQQ8CBP"}'
```

### 4. Test Database Changes

```bash
# Create migration
supabase migration new create_products_table

# Edit: supabase/migrations/YYYYMMDDHHMMSS_create_products_table.sql

# Apply migration
supabase db reset  # Applies all migrations + seed data

# Verify in Studio
# Open http://127.0.0.1:54323 → Tables
```

---

## Environment Variables Usage

### In Edge Functions (Deno)

```typescript
// Use local keys during development
const supabaseUrl = Deno.env.get('SUPABASE_LOCAL_URL') || 
                   Deno.env.get('SUPABASE_URL');
                   
const supabaseKey = Deno.env.get('SUPABASE_LOCAL_SERVICE_ROLE_KEY') || 
                   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);
```

### In Nuxt App (Client-side)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_LOCAL_URL || process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_LOCAL_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    }
  }
})
```

---

## Troubleshooting

### Issue: "Port already in use"

**Cause**: Previous Supabase instance still running

**Solution**:
```bash
supabase stop
supabase start
```

### Issue: "Services not starting"

**Cause**: Docker daemon not running or insufficient resources

**Solution**:
```bash
# Check Docker is running
docker ps

# If not, start Docker Desktop (macOS)
open -a Docker

# Wait 30 seconds, then retry
supabase start
```

### Issue: "Can't connect to database"

**Cause**: Services not fully started yet

**Solution**:
```bash
# Wait for health checks
supabase status

# Should show all services running
# If any service shows errors, check logs:
supabase logs db
```

### Issue: "Edge Function not found"

**Cause**: Function not deployed or not served locally

**Solution**:
```bash
# For local testing, use serve (not deploy)
supabase functions serve

# In another terminal, invoke function
curl http://127.0.0.1:54321/functions/v1/your-function
```

---

## Performance Notes

### First Start
- **Duration**: 2-5 minutes (downloads Docker images)
- **Disk Space**: ~2-3 GB for all images
- **Network**: Requires internet for initial pull

### Subsequent Starts
- **Duration**: 10-30 seconds (uses cached images)
- **Disk Space**: Minimal (only local data)
- **Network**: Not required

### Resource Usage
- **Memory**: ~1-2 GB RAM
- **CPU**: Minimal when idle
- **Disk**: ~100 MB for local database data

---

## Local vs Cloud

### Use Local For:
- ✅ Edge Function development and testing
- ✅ Database schema changes (migrations)
- ✅ Rapid iteration (hot reload)
- ✅ No API rate limits
- ✅ Offline development
- ✅ No cloud costs

### Use Cloud For:
- 🌐 Production deployment
- 🌐 Staging/preview environments
- 🌐 Team collaboration (shared database)
- 🌐 External API testing (webhooks)
- 🌐 Performance testing at scale

---

## Next Steps

1. **Open Studio**: http://127.0.0.1:54323
2. **Create migrations**: T011-T015 (database schema)
3. **Develop Edge Functions**: T021+ (import, refresh, health check)
4. **Test locally first**: Before deploying to cloud
5. **Deploy when ready**: `supabase db push` and `supabase functions deploy`

---

## Status: Ready for Development

✅ Local Supabase running  
✅ Studio accessible at http://127.0.0.1:54323  
✅ All credentials added to `.env.local`  
✅ Ready for Phase 2 (Database Migrations) and Phase 3 (Edge Functions)
