# Admin Authentication Setup

This guide explains how to set up Supabase authentication for the admin dashboard.

## Prerequisites

- Supabase CLI installed and local instance running
- PostgreSQL database with user table

## Quick Setup

### 1. Get Your Supabase Credentials

Run this command to see your local Supabase credentials:

```bash
cd /Users/gytis/Documents/Projects/Blog/espboards-store-v4/espboards-store
supabase status
```

You'll see output like:
```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Configure Environment Variables

Copy the `.env.example` to `.env.local`:

```bash
cd app
cp .env.example .env.local
```

Edit `app/.env.local` and add your credentials:

```bash
NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key-from-supabase-status
```

### 3. Create Admin User

You need to create an admin user in Supabase. You can do this via:

**Option A: Supabase Studio (Recommended)**
1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to Authentication → Users
3. Click "Add User"
4. Enter email and password
5. Click "Create User"

**Option B: SQL**
```sql
-- Insert a test admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

### 4. Restart Dev Server

```bash
cd app
pnpm dev
```

### 5. Test Login

1. Visit: http://localhost:3001/admin
2. You'll be redirected to: http://localhost:3001/admin/login
3. Login with your admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

## Features

✅ **Secure Authentication**: Uses Supabase Auth with JWT tokens
✅ **Protected Routes**: `/admin/*` routes require authentication
✅ **Auto-redirect**: Unauthenticated users → login page
✅ **Session Management**: Automatic token refresh
✅ **Sign Out**: Full session cleanup on logout
✅ **Beautiful UI**: Modern gradient login form

## File Structure

```
app/
├── plugins/
│   └── supabase.client.ts         # Supabase client setup
├── composables/
│   └── useAuth.ts                 # Authentication composable
├── middleware/
│   └── auth.ts                    # Route protection middleware
├── pages/
│   └── admin/
│       ├── index.vue              # Protected dashboard (requires auth)
│       └── login.vue              # Public login page
├── components/
│   ├── AdminTopBar.vue            # Includes sign out button
│   └── AdminSidebar.vue           # Navigation
└── .env.local                     # Your credentials (not in git)
```

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the correct `anon key` from `supabase status`
- Check that `.env.local` is in the `app/` directory
- Restart the dev server after changing `.env.local`

### "User not found" error
- Make sure you created an admin user in Supabase
- Verify the email/password are correct
- Check Supabase Studio → Authentication → Users

### Can't access `/admin` after login
- Check browser console for errors
- Verify the JWT token is being stored
- Try clearing cookies and logging in again

### Middleware infinite loop
- Make sure `auth.ts` middleware is configured correctly
- Check that `/admin/login` is excluded from auth checks

## Security Notes

🔒 **Never commit `.env.local` to git!**
- It's already in `.gitignore`
- Use `.env.example` for templates only

🔒 **Production Setup**
- Use Supabase hosted project URL
- Enable Row Level Security (RLS)
- Add admin role checks
- Use environment-specific keys

## Next Steps

- [ ] Add admin role checking
- [ ] Implement password reset
- [ ] Add 2FA (two-factor authentication)
- [ ] Create admin user management page
- [ ] Add session timeout
- [ ] Implement remember me functionality
