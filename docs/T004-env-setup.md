# T004: Create .env.local File with Credentials

**Task**: Create `.env.local` file with Supabase keys and PA-API credentials  
**Date**: 2025-11-24  
**Prerequisites**: T001 ✅ (Supabase project created), .env.example ✅  
**Status**: IN PROGRESS

---

## Overview

This task sets up local environment variables for development. These credentials enable:

- **Supabase Edge Functions**: Connect to database, authenticate requests
- **PA-API Integration**: Import and refresh product data from Amazon
- **Local Development**: Run and test Edge Functions locally

---

## Prerequisites Checklist

Before proceeding, ensure you have:

- [x] **T001 Complete**: Supabase project created with credentials collected
- [x] **.env.example exists**: Template file with all required variables
- [ ] **Supabase Credentials**: Project URL, Anon Key, Service Role Key from dashboard
- [ ] **PA-API Credentials** (optional for now): Can be added later when testing import

---

## Instructions

### Step 1: Copy Template File

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

This creates a local copy that you'll fill with real credentials.

**Important**: `.env.local` should already be in `.gitignore` - never commit this file!

---

### Step 2: Fill in Supabase Credentials

Open `.env.local` in your editor and replace the placeholder values:

#### 2.1 Get Credentials from Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your `espboards-store` project
3. Navigate to **Settings** → **API**

#### 2.2 Update SUPABASE_URL

**Find**: "Project URL" in Settings > API > Configuration

**Replace in .env.local**:
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
```

**With your actual URL**:
```bash
SUPABASE_URL=https://qvyzksffdnsuyqjawdvc.supabase.co
```

#### 2.3 Update SUPABASE_ANON_KEY

**Find**: "Project API keys" → "anon public" in Settings > API

**Copy the entire JWT token** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Replace in .env.local**:
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY_HERE.SIGNATURE_HERE
```

**Note**: The key is very long (300+ characters) - make sure to copy the entire string.

#### 2.4 Update SUPABASE_SERVICE_ROLE_KEY

**Find**: "Project API keys" → "service_role" in Settings > API

**⚠️ CRITICAL**: This key bypasses Row Level Security - KEEP SECRET!

**Copy the entire JWT token**

**Replace in .env.local**:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE.SIGNATURE_HERE
```

#### 2.5 Update SUPABASE_DB_PASSWORD (Optional)

**Find**: The database password you set when creating the project in T001

**If you remember it**, replace:
```bash
SUPABASE_DB_PASSWORD=your-actual-password-here
```

**If you don't remember it**, you can:
- Reset it in Settings > Database > "Reset database password"
- Or leave the placeholder for now (not needed for MVP)

---

### Step 3: PA-API Credentials (Optional - Can Skip for Now)

PA-API credentials are needed for importing products, but you can skip this section if:
- You don't have Amazon Associates account yet
- You want to focus on Supabase setup first
- You'll add PA-API credentials later when implementing T021-T041

**If you have PA-API credentials**, update these fields:

```bash
PAAPI_ACCESS_KEY=your-actual-access-key
PAAPI_SECRET_KEY=your-actual-secret-key
PAAPI_PARTNER_TAG_US=your-amazon-tag-20
PAAPI_PARTNER_TAG_DE=your-amazon-tag-21  # Optional for MVP
```

**If you DON'T have them yet**, leave the placeholders:
```bash
PAAPI_ACCESS_KEY=your-access-key-here
PAAPI_SECRET_KEY=your-secret-key-here
PAAPI_PARTNER_TAG_US=your-tag-20
```

You can obtain PA-API credentials from:
1. Sign up for Amazon Associates: https://affiliate-program.amazon.com
2. Get approved (may take 24-48 hours)
3. Request PA-API access: https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html

---

### Step 4: Verify .env.local Configuration

Your `.env.local` should now look like this (with real values):

```bash
# ============================================================================
# SUPABASE CONFIGURATION (from T001)
# ============================================================================

SUPABASE_URL=https://qvyzksffdnsuyqjawdvc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eXprc2ZmZG5zdXlxamF3ZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2ODI1MDMsImV4cCI6MjA0NzI1ODUwM30.SIGNATURE_HERE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eXprc2ZmZG5zdXlxamF3ZHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTY4MjUwMywiZXhwIjoyMDQ3MjU4NTAzfQ.SIGNATURE_HERE
SUPABASE_DB_PASSWORD=your-actual-password-here

# ============================================================================
# AMAZON PRODUCT ADVERTISING API 5.0 (PA-API)
# ============================================================================

# Leave placeholders for now - add when implementing import feature
PAAPI_ACCESS_KEY=your-access-key-here
PAAPI_SECRET_KEY=your-secret-key-here
PAAPI_PARTNER_TAG_US=your-tag-20
PAAPI_PARTNER_TAG_DE=your-tag-21

PAAPI_ENDPOINT_US=https://webservices.amazon.com/paapi5/getitems
PAAPI_ENDPOINT_DE=https://webservices.amazon.de/paapi5/getitems

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

NODE_ENV=development
APP_URL=http://localhost:3000
```

---

## Security Verification

### Check .gitignore

Verify `.env.local` is listed in `.gitignore`:

```bash
cat .gitignore | grep ".env.local"
```

**Expected output**: `.env.local` should appear in the list

If it's NOT there, add it:
```bash
echo ".env.local" >> .gitignore
```

### Verify Not Tracked by Git

Check that `.env.local` is ignored:

```bash
git status
```

**Expected**: `.env.local` should NOT appear in untracked files

**If it appears**, add it to `.gitignore` and run:
```bash
git rm --cached .env.local 2>/dev/null || true
```

---

## Testing Credentials

### Test 1: Verify Supabase Connection (Local)

Run this command to test if Supabase CLI can connect:

```bash
supabase status
```

**Expected Output**:
- Shows services running
- No authentication errors
- API URL matches your SUPABASE_URL

### Test 2: Verify Environment Variables Load

Create a quick test script (optional):

```bash
# Test if .env.local is readable
cat .env.local | grep "SUPABASE_URL=" | grep -v "your-project-ref"
```

**Expected**: Should show your actual Supabase URL (not the placeholder)

---

## Troubleshooting

### Issue: "Permission denied" when creating .env.local

**Cause**: File permissions or directory access issue

**Solution**:
```bash
# Ensure you're in project root
cd /Users/gytis/Documents/Projects/Blog/espboards-store-v4/espboards-store

# Try creating with explicit permissions
touch .env.local
chmod 600 .env.local  # Read/write for owner only
```

### Issue: Can't find Supabase credentials

**Cause**: Not looking in the right place

**Solution**:
1. Dashboard → Select Project
2. Settings (gear icon in left sidebar)
3. API (in settings menu)
4. Scroll down to "Project API keys"
5. Click "Reveal" to show keys
6. Click copy icon next to each key

### Issue: Accidentally committed .env.local to git

**Cause**: Forgot to add to .gitignore before committing

**Solution**:
```bash
# Remove from git tracking (keeps local file)
git rm --cached .env.local

# Add to .gitignore
echo ".env.local" >> .gitignore

# Commit the fix
git add .gitignore
git commit -m "chore: ensure .env.local is gitignored"

# Rotate credentials in Supabase dashboard (important!)
# Settings > API > "Generate new key" for both anon and service_role
```

### Issue: JWT keys are truncated or invalid

**Cause**: Didn't copy entire key (they're very long)

**Solution**:
1. Delete partial key from .env.local
2. In Supabase dashboard, click the copy icon (don't manually select text)
3. Paste directly into .env.local
4. Verify key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.` and has 2 dots (.)

---

## What's Next

After completing T004:

- **T005**: Setup Deno/TypeScript for Edge Functions with strict type checking
- **T006**: Configure Vitest for unit testing with coverage reporting (80% target)
- **T007**: Setup ESLint + Prettier for TypeScript with strict rules
- **T008-T009**: Create shared utilities (logger, types)
- **T010**: Already complete (document .env.example) ✅

**Note**: PA-API credentials can be added later when you reach Phase 3 (T021-T041: Import Product Implementation)

---

## Completion Checklist

- [ ] `.env.local` file created from `.env.example`
- [ ] `SUPABASE_URL` filled with actual project URL
- [ ] `SUPABASE_ANON_KEY` filled with actual anon key (full JWT)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` filled with actual service role key (full JWT)
- [ ] `SUPABASE_DB_PASSWORD` filled or marked optional
- [ ] PA-API credentials filled OR acknowledged as "add later"
- [ ] `.env.local` listed in `.gitignore`
- [ ] `git status` does NOT show `.env.local` as untracked
- [ ] `supabase status` command works without errors
- [ ] T004 marked complete in `specs/001-esp32-store/tasks.md`

---

## Status: Ready for Execution

**Action Required**: 
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials from dashboard
3. Verify security (gitignore, not tracked)

**Estimated Time**: 5-10 minutes

**Dependencies**: T001 complete (Supabase credentials available)
