# T003: Configure Supabase CLI with Project Credentials

**Task**: Link local Supabase environment to cloud project  
**Date**: 2025-11-24  
**Prerequisites**: T001 ✅ (cloud project created), T002 ✅ (local init completed)  
**Status**: IN PROGRESS

---

## Overview

This task connects your local Supabase development environment (created in T002) to your cloud Supabase project (created in T001). This enables:

- Running migrations on cloud database from local CLI
- Deploying Edge Functions to production
- Syncing schema changes between local and cloud
- Testing with production database configuration

---

## Prerequisites Checklist

Before proceeding, ensure you have:

- [x] **T002 Complete**: Local Supabase initialized (`supabase/` directory exists)
- [ ] **Project Reference ID**: From T001 (format: `abc123xyz456`, found in Settings > API)
- [ ] **Database Password**: The password you set when creating the project in T001

---

## Instructions

### Step 1: Locate Your Project Reference ID

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your `espboards-store-v4` project
3. Navigate to **Settings** → **API**
4. Find **Project Reference ID** (short alphanumeric code)
5. Copy this value (example: `abcdefghijklmnop`)

**Where to find it**:
```
Settings > API > Configuration > Project Reference ID: [your-ref-id]
```

### Step 2: Link Local Environment to Cloud

Run the following command in your project root:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual Project Reference ID from Step 1.

**Example**:
```bash
supabase link --project-ref abcdefghijklmnop
```

### Step 3: Enter Database Password

The CLI will prompt you for:

```
Enter your database password (or leave blank to skip):
```

- **Option 1**: Enter the database password from T001
  - Use the password you set when creating the Supabase project
  - This is NOT your Supabase account password
  - This is the PostgreSQL database password

- **Option 2**: Leave blank to skip
  - You can link without the password
  - Some features may require the password later

**Recommendation**: Enter the password now to enable full functionality.

### Step 4: Confirm Connection

After successful linking, you should see:

```
Finished supabase link.
```

The CLI creates a `.supabase/` directory in your project root with connection details.

---

## Verification Steps

### Test 1: Check Link Status

```bash
supabase status
```

**Expected Output**:
- Shows local services running (API, DB, Studio, etc.)
- Shows connection to cloud project
- All services should be "RUNNING" or "HEALTHY"

### Test 2: View Remote Project Info

```bash
supabase projects list
```

**Expected Output**:
- Shows your linked project with details
- Project Reference ID matches
- Organization and region displayed

### Test 3: Access Supabase Studio

```bash
supabase studio
```

**Expected Output**:
- Opens local Supabase Studio in browser (http://localhost:54323)
- Can view tables, run queries, manage data
- Connected to local database (not cloud yet)

---

## Troubleshooting

### Issue: "Project ref is required"

**Cause**: Missing or invalid Project Reference ID

**Solution**:
1. Double-check Project Reference ID in Supabase Dashboard (Settings > API)
2. Ensure no extra spaces or characters
3. Use the exact format: `supabase link --project-ref abc123xyz`

### Issue: "Invalid database password"

**Cause**: Wrong password or password not set

**Solution**:
1. Reset database password in Supabase Dashboard (Settings > Database)
2. Wait 2-3 minutes for password update to propagate
3. Try linking again with new password
4. Or skip password prompt (leave blank)

### Issue: "Already linked to a different project"

**Cause**: Local environment previously linked to another project

**Solution**:
1. Unlink current project: `supabase unlink`
2. Re-run link command with correct Project Reference ID

### Issue: "Command not found: supabase"

**Cause**: Supabase CLI not installed or not in PATH

**Solution**:
1. Verify installation: `supabase --version`
2. Should show version 2.58.5 or higher
3. If missing, reinstall: `brew install supabase/tap/supabase` (macOS)

---

## What Gets Created

### `.supabase/` Directory

The link command creates:

```
.supabase/
├── .gitignore          # Prevents committing local state
└── remote-config.json  # Stores connection to cloud project
```

**Important**: `.supabase/` is already in `.gitignore` - connection details are local to your machine.

---

## Security Notes

### What's Safe to Share

- ✅ Project Reference ID (not sensitive)
- ✅ Project URL (public anyway)
- ✅ Anon/Public API Key (designed for client-side use)

### What to KEEP SECRET

- ❌ Database Password (admin access to PostgreSQL)
- ❌ Service Role Key (bypasses Row Level Security)
- ❌ `.supabase/remote-config.json` (contains connection details)

### Best Practices

1. **Never commit** `.env.local` or `.supabase/remote-config.json`
2. **Use password manager** for database password
3. **Rotate keys** if accidentally exposed (Settings > API > "Generate new key")
4. **Enable 2FA** on Supabase account (Settings > Account)

---

## Next Steps

After completing T003:

- **T004**: Create `.env.local` file with Supabase keys and PA-API credentials
- **T005-T010**: Complete remaining Phase 1 setup (Deno, Vitest, ESLint, logging)
- **T011-T016**: Phase 2 - Create database migrations (BLOCKS all user stories)

---

## Completion Checklist

- [ ] Project Reference ID obtained from Supabase Dashboard
- [ ] `supabase link --project-ref` command executed successfully
- [ ] Database password entered (or skipped)
- [ ] `supabase status` shows services running
- [ ] `.supabase/remote-config.json` exists
- [ ] Can access local Supabase Studio via `supabase studio`
- [ ] T003 marked complete in `specs/001-esp32-store/tasks.md`

---

## Status: Ready for Execution

**Action Required**: Run the `supabase link` command with your Project Reference ID.

**Estimated Time**: 2-3 minutes

**Dependencies**: None (prerequisites already met)
