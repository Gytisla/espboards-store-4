# Netlify Deployment Guide

This project is configured for easy deployment on Netlify.

## Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

## Manual Deployment Steps

### 1. Prerequisites

- Node.js 20.x (specified in `.nvmrc`)
- pnpm package manager
- Netlify account
- Supabase project

### 2. Environment Variables

Set the following environment variables in your Netlify site settings:

```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Build Settings

The build is configured automatically via `netlify.toml`:

- **Build command**: `cd app && pnpm install && pnpm run build`
- **Publish directory**: `app/.output/public`
- **Functions directory**: `app/.output/server`
- **Node version**: 20

### 4. Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your Netlify site (or create new)
netlify link

# Deploy to production
netlify deploy --prod
```

### 5. Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository in Netlify dashboard
3. Netlify will automatically detect `netlify.toml` and deploy

## Configuration Files

### netlify.toml

Main configuration file that defines:
- Build commands and publish directory
- Redirect rules for SPA routing
- Security headers
- Asset caching rules

### nuxt.config.ts

Updated with:
- Netlify preset in Nitro configuration
- Asset compression enabled
- Runtime config for environment variables

### .nvmrc

Specifies Node.js version 20 for consistent builds.

### app/public/_headers

Additional security headers and caching policies:
- XSS protection
- Frame options
- Content security policy
- Cache control for static assets

## Features

✅ Server-Side Rendering (SSR) support
✅ API routes via Netlify Functions
✅ Automatic redirects for SPA
✅ Security headers (XSS, CSP, etc.)
✅ Asset compression and caching
✅ Environment variable support
✅ Dark mode support
✅ SEO optimized with structured data

## Troubleshooting

### Build fails

1. Check Node.js version matches `.nvmrc` (20)
2. Verify all environment variables are set
3. Check build logs for specific errors

### Functions don't work

1. Verify Supabase credentials are correct
2. Check function logs in Netlify dashboard
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### Styles don't load

1. Check `_headers` file is in `app/public/` directory
2. Verify CSP policy allows your domains
3. Clear cache and redeploy

## Performance

- Static assets cached for 1 year (immutable)
- HTML not cached (always fresh)
- Compressed assets (Gzip/Brotli)
- Optimized images with lazy loading

## Security

- CSP headers protect against XSS
- Frame-ancestors prevents clickjacking
- HTTPS enforced
- Secure environment variables

## Support

For issues with:
- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **Nuxt**: [Nuxt Documentation](https://nuxt.com/docs)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
