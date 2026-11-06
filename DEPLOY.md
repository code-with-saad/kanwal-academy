# Deployment Guide

This guide covers deploying Kanwal Quran Academy to Cloudflare Pages with EmDash CMS.

## Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account with Workers Paid plan ($5/month)
- Domain (optional, can use `kanwal-academy.pages.dev` initially)

## First Deployment

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd kanwal-academy
pnpm install
```

### 2. Configure Cloudflare

Create the required resources in Cloudflare:

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create kanwal-academy

# Create R2 bucket for media
npx wrangler r2 bucket create kanwal-academy-media

# Create KV namespace for sessions
npx wrangler kv namespace create SESSION
```

Update `wrangler.jsonc` with the IDs from the output:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kanwal-academy",
      "database_id": "<DATABASE_ID_FROM_OUTPUT>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA",
      "bucket_name": "kanwal-academy-media"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "SESSION",
      "id": "<KV_NAMESPACE_ID_FROM_OUTPUT>"
    }
  ]
}
```

### 3. Set Environment Secrets

Generate an encryption key and set all required secrets:

```bash
# Generate encryption key
npx emdash generate secret

# Set all secrets
npx wrangler secret put EMDASH_ENCRYPTION_KEY
# Paste the generated key

# Optional: Cloudflare Turnstile for form spam protection
npx wrangler secret put PUBLIC_TURNSTILE_SITE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
# Get these from https://dash.cloudflare.com/?to=/:account/turnstile

# Optional: EmailJS for lead notifications
npx wrangler secret put EMAILJS_SERVICE_ID
npx wrangler secret put EMAILJS_TEMPLATE_ID
npx wrangler secret put EMAILJS_PUBLIC_KEY
npx wrangler secret put EMAILJS_PRIVATE_KEY
# Get these from https://emailjs.com
```

### 4. Deploy

```bash
pnpm run deploy
```

This will:
- Build the Astro site
- Apply the seed (creates collections and initial content)
- Deploy to Cloudflare Pages

### 5. First Admin Setup

After deployment, complete the admin setup:

1. Visit `https://kanwal-academy.pages.dev/_emdash/setup`
2. Create your admin account (email + password)
3. Log in at `https://kanwal-academy.pages.dev/_emdash`

### 6. Configure Content

In the admin panel:

1. **Site Settings** → Update:
   - Phone, email, address
   - Social media links
   - Footer text
   - Logo images (upload via Media Library)

2. **Courses** → Verify the 3 courses are seeded:
   - Qur'anic Recitation
   - Tajweed Proficiency
   - Memorization Excellence

3. **Pricing Plans** → Verify the 4 plans are seeded:
   - Plan I ($20)
   - Plan II ($40)
   - Plan III ($60)
   - Plan IV ($80)

4. **Upload Images** via Media Library:
   - Hero image
   - Course images
   - Teacher photos
   - Logos (header and footer)

## Subsequent Deployments

```bash
# Pull latest changes
git pull

# Install any new dependencies
pnpm install

# Deploy
pnpm run deploy
```

## Schema Changes

If you've modified `seed/seed.json` to add new fields:

```bash
# Apply schema changes to production
pnpm run seed
```

⚠️ **Warning**: `pnpm run seed` only adds new fields. It does not delete fields or collections. To remove fields, you must manually delete them in the admin or database.

## Domain Configuration

### Using a Custom Domain

1. In Cloudflare Dashboard:
   - Go to Workers & Pages → kanwal-academy
   - Click "Custom domains" → "Set up a custom domain"
   - Enter your domain (e.g., `kanwalquranacademy.com`)
   - Follow the DNS instructions

2. Update `wrangler.jsonc`:

```jsonc
{
  "routes": [
    {
      "pattern": "kanwalquranacademy.com/*",
      "zone_name": "kanwalquranacademy.com"
    }
  ]
}
```

3. Deploy again: `pnpm run deploy`

### DNS Records

Cloudflare will automatically create the required DNS records. If you need to manually configure:

```
Type: CNAME
Name: @ (or your subdomain)
Target: kanwal-academy.pages.dev
Proxy: Enabled (orange cloud)
```

## Environment Variables Reference

### Required

- `EMDASH_ENCRYPTION_KEY` - Encryption key for sessions and sensitive data

### Optional

- `PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key (form spam protection)
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key
- `EMAILJS_SERVICE_ID` - EmailJS service ID (lead notifications)
- `EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `EMAILJS_PUBLIC_KEY` - EmailJS public key
- `EMAILJS_PRIVATE_KEY` - EmailJS private key

### Development Only

- `EMDASH_DEMO` - Set to `1` to show demo content (placeholder teachers, sample testimonials)

## Local Development

```bash
# Start dev server
pnpm dev

# Visit http://localhost:4322
# Admin at http://localhost:4322/_emdash
```

The local database is stored in `.wrangler/state/v3/d1/`. To reset:

```bash
rm -rf .wrangler/state
pnpm dev
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf dist .astro node_modules/.cache
pnpm install
pnpm build
```

### Seed Doesn't Apply

The seed only applies on first deployment when the database is empty. If you need to re-seed:

```bash
# ⚠️ This will delete all content!
npx wrangler d1 execute kanwal-academy --command "DROP TABLE IF EXISTS _emdash_collections"
pnpm run deploy
```

### Images Not Loading

1. Check R2 bucket is created: `npx wrangler r2 bucket list`
2. Check binding in `wrangler.jsonc`
3. Upload images via Media Library in admin

### Admin Can't Log In

1. Check `EMDASH_ENCRYPTION_KEY` is set: `npx wrangler secret list`
2. Try resetting admin password via CLI:
   ```bash
   npx emdash reset-password --email your@email.com
   ```

## Monitoring

### View Logs

```bash
npx wrangler pages deployment tail
```

### Database Access

```bash
# Open D1 console
npx wrangler d1 execute kanwal-academy --console

# Or query directly
npx wrangler d1 execute kanwal-academy --command "SELECT * FROM courses"
```

## Security Checklist

- [ ] `EMDASH_ENCRYPTION_KEY` is set and unique
- [ ] Turnstile is enabled for forms (optional but recommended)
- [ ] Admin password is strong
- [ ] No sensitive data in repository
- [ ] `.env` and `.dev.vars` are gitignored
- [ ] Security headers are configured in `_headers`

## Performance

The site is optimized for performance:

- **Astro SSR**: Server-side rendering on Cloudflare Workers
- **Image optimization**: Automatic via Cloudflare Images
- **Font loading**: Self-hosted with `font-display: swap`
- **Minimal JavaScript**: Progressive enhancement
- **Cache headers**: Static assets cached at edge

Target Lighthouse scores: 90+ on all metrics.

## Support

- EmDash docs: https://emdash.dev
- Cloudflare docs: https://developers.cloudflare.com/pages
- Astro docs: https://docs.astro.build

---

**Last updated**: 2026-01-06
