# T001: Supabase Project Setup

**Task**: Create Supabase project (cloud) and note Project URL, API keys  
**Date**: 2025-11-24  
**Status**: IN PROGRESS

---

## Instructions

### 1. Create Supabase Account

1. Visit https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 2. Create New Project

1. Click "New project" button
2. Select or create an organization (e.g., "ESPBoards Store")
3. Fill in project details:
   - **Project Name**: `espboards-store-v4` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `us-east-1` for US, `eu-central-1` for Europe)
   - **Pricing Plan**: Free (sufficient for development and MVP)

4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### 3. Collect Project Credentials

Once project is ready, navigate to **Settings** > **API**:

**Copy these values** (you'll need them for `.env.local`):

1. **Project URL**: 
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **API Keys**:
   - **anon / public key**: Used for client-side requests (safe to expose)
   - **service_role key**: Used for server-side/admin requests (KEEP SECRET!)

3. **Project Reference ID**: 
   - Short alphanumeric code (e.g., `abcdefghijklmnop`)
   - Used for Supabase CLI configuration

### 4. Document Credentials

**IMPORTANT**: Store these credentials securely!

#### For Development (Local)

Create `.env.local` file in repository root with these credentials.
Do NOT commit this file to git (already in .gitignore).

#### For Team (Secure Sharing)

- Use password manager (1Password, LastPass, Bitwarden)
- Share via encrypted channel (Signal, encrypted email)
- Document who has access

---

## Credentials Collected

### Project Information

- [ ] **Project Name**: `espboards-store-v4`
- [ ] **Project URL**: `https://_____________________________.supabase.co`
- [ ] **Region**: `_____________`
- [ ] **Database Password**: (saved in password manager) ✓

### API Keys

- [ ] **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (copy full key)
- [ ] **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...` (copy full key)

### Project Reference

- [ ] **Project Ref ID**: `_____________`

---

## Verification Steps

- [ ] Can access project dashboard at https://supabase.com/dashboard/project/YOUR_PROJECT_REF
- [ ] Can view Database tab (shows PostgreSQL database ready)
- [ ] Can view API Settings (shows keys)
- [ ] Credentials documented in secure location

---

## Next Steps

After completing T001:
- **T002**: Initialize local Supabase development environment
- **T004**: Create `.env.local` file with these credentials

---

## Troubleshooting

**Issue**: Project creation fails
- **Solution**: Try different region, check account email verification

**Issue**: Can't find API keys
- **Solution**: Navigate to Settings > API in left sidebar

**Issue**: Forgot database password
- **Solution**: Reset password in Settings > Database > Database Settings

---

## Security Checklist

- [ ] Database password saved in password manager (NOT in git)
- [ ] Service role key NEVER committed to git
- [ ] `.env.local` added to `.gitignore` (will verify in T004)
- [ ] Team members only receive credentials via secure channel

---

## Task Completion

**Task T001 Complete When**:
- [x] Supabase project created successfully
- [x] Project URL documented
- [x] API keys (anon + service_role) documented
- [x] Database password saved securely
- [x] All credentials verified accessible

**Completed**: ________ (date/time)  
**Verified By**: ________ (your name)

---

**Ready for T002**: Initialize local Supabase development environment ✅
