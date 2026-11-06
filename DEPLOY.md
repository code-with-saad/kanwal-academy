# Deployment Guide

This guide covers deploying Kanwal Quran Academy to Cloudflare Workers with EmDash CMS. The site is a Worker (not Cloudflare Pages).

## Prerequisites

- Node.js 22.16+ and pnpm 11.9+
- Cloudflare account with Workers Paid plan ($5/month)
- Wrangler authenticated: `pnpm wrangler login`
- Domain managed by Cloudflare in the same account (for custom domain)

## Bindings and variables the code reads

These are every binding and environment variable referenced in `src/`:

| Name | Type | Required | Where set | Notes |
|---|---|---|---|---|
| `DB` | D1 binding | Yes | `wrangler.jsonc` `d1_databases` | EmDash database |
| `MEDIA` | R2 binding | Yes | `wrangler.jsonc` `r2_buckets` | Media uploads |
| `EMDASH_ENCRYPTION_KEY` | Worker secret | Yes | `wrangler secret put` | Encrypts plugin secrets. Generate with `npx emdash secrets generate` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public var | No | `.env` locally, `vars` in wrangler | Build-time value read by `import.meta.env`. Client-side Turnstile widget key |
| `TURNSTILE_SECRET_KEY` | Worker secret | No | `wrangler secret put` | Server-side Turnstile verification |
| `EMAILJS_SERVICE_ID` | Worker secret | No | `wrangler secret put` | EmailJS service ID for owner notifications |
| `EMAILJS_TEMPLATE_ID` | Worker secret | No | `wrangler secret put` | EmailJS template ID |
| `EMAILJS_PUBLIC_KEY` | Worker secret | No | `wrangler secret put` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | Worker secret | No | `wrangler secret put` | EmailJS private key (accessToken for server calls) |
| `OWNER_EMAIL` | Worker secret | No | `wrangler secret put` | Fallback recipient for lead notifications when `site_settings.owner_email` is empty |
| `EMDASH_DEMO` | Public var | No | `.env` locally, `vars` in wrangler | Set to `1` to show placeholder teachers and sample testimonials |
| `EMDASH_SITE_URL` | Worker var | Recommended | `vars` in wrangler | Canonical site URL. Set this before completing setup so passkeys are bound to the production domain |

`PUBLIC_TURNSTILE_SITE_KEY` is a public, build-time value. It is embedded in the client bundle by Vite and read from `import.meta.env` at runtime. Set it in `.env` locally and in `vars` in `wrangler.jsonc` for production. Do not use `wrangler secret put` for it.

`SESSION` KV is added automatically by the Astro Cloudflare adapter. `wrangler deploy` provisions it. You do not need to create it manually in `wrangler.jsonc`.

## First deployment

### 1. Install dependencies

```bash
git clone <your-repo-url>
cd kanwal-academy
pnpm install
```

### 2. Generate the encryption key

```bash
npx emdash secrets generate
```

Copy the key. Add it to your local `.env`:

```
EMDASH_ENCRYPTION_KEY=<the generated key>
```

Back up this key separately. EmDash cannot decrypt stored plugin secrets without it.

### 3. Create Cloudflare resources

```bash
# Create D1 database
pnpm wrangler d1 create kanwal-academy

# Create R2 bucket for media
pnpm wrangler r2 bucket create kanwal-academy-media
```

Wrangler prints the database ID. Update `wrangler.jsonc` with it:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kanwal-academy",
      "database_id": "<DATABASE_ID_FROM_OUTPUT>"
    }
  ]
}
```

### 4. Set Worker secrets

Only true secrets go through `wrangler secret put`. Public values go in `vars`.

```bash
# Encryption key (required)
pnpm wrangler secret put EMDASH_ENCRYPTION_KEY
# Paste the generated key

# Optional: Cloudflare Turnstile
pnpm wrangler secret put TURNSTILE_SECRET_KEY
# Get keys from https://dash.cloudflare.com/?to=/:account/turnstile

# Optional: EmailJS for owner lead notifications
pnpm wrangler secret put EMAILJS_SERVICE_ID
pnpm wrangler secret put EMAILJS_TEMPLATE_ID
pnpm wrangler secret put EMAILJS_PUBLIC_KEY
pnpm wrangler secret put EMAILJS_PRIVATE_KEY
# Get these from https://emailjs.com

# Optional: Fallback owner notification email
pnpm wrangler secret put OWNER_EMAIL
```

`PUBLIC_TURNSTILE_SITE_KEY` is set separately in `vars` (see step 6).

### 5. Deploy

```bash
pnpm build
pnpm wrangler deploy
```

The `deploy` script in `package.json` runs both steps. On first deploy the Worker boots against an empty D1 database and applies the seed schema (collections and fields) plus structure on its first request. Content from the seed is only applied when the admin chooses it in the setup wizard.

After deploy, the Worker responds at its `workers.dev` URL: `https://kanwal-academy.<subdomain>.workers.dev`.

### 6. Add public vars for the production domain

Edit `wrangler.jsonc` to set the site URL and any public build-time values:

```jsonc
{
  "vars": {
    "EMDASH_SITE_URL": "https://kanwalquranacademy.com",
    "PUBLIC_TURNSTILE_SITE_KEY": "<your turnstile site key>",
    "EMDASH_DEMO": "0"
  }
}
```

Redeploy after editing `vars`: `pnpm wrangler deploy`.

### 7. Complete setup and register a passkey

1. Visit `https://kanwal-academy.<subdomain>.workers.dev/_emdash/admin`
2. The setup wizard opens. Enter the site title and tagline, then continue.
3. Enter your email address and optional name, then continue.
4. Register a passkey when the browser prompts. This becomes the admin account.
5. Open the dashboard.

**Important**: passkeys are bound to the hostname where they were created. A passkey registered on `workers.dev` will not work on `kanwalquranacademy.com`. Set `EMDASH_SITE_URL` in `vars` before setup, or complete setup on the final production domain, so the passkey is created for the correct address. If you set up on the wrong hostname, visit the correct URL, sign in with a magic link (needs email configured), and register a new passkey there.

## Configure the custom domain

After the Worker is live at its `workers.dev` URL, add the production domain as a Wrangler route in `wrangler.jsonc`:

```jsonc
{
  "routes": [
    { "pattern": "www.kanwalquranacademy.com", "custom_domain": true }
  ]
}
```

The domain must already be an active domain managed by Cloudflare in the same account. Deploy again:

```bash
pnpm wrangler deploy
```

Verify both the `workers.dev` address and the custom domain work.

## Production schema sync

The seed file applies its schema and structure only once, on the first request against an empty database. Subsequent deploys against an existing database leave the schema and content alone.

For the initial deployment, the seed creates all collections and fields including:

- `enrolments` collection with the `lead_status` select field (options: `new`, `contacted`, default: `new`)
- `subscribers` collection with the `subscriber_status` select field (options: `active`, `unsubscribed`, default: `active`)
- `site_settings` collection with the `owner_email` field

All four plan prices are seeded as `$20`, `$40`, `$82`, `$102`.

If you later add a new field or collection to the seed, the change does not propagate to the existing production database automatically. Evolve the live schema through the admin panel (Content Types) or the CLI:

```bash
# Authenticate against the live site
npx emdash login --url https://kanwalquranacademy.com

# Add a field
npx emdash schema add-field <collection> <field> --type <type> --label "Label" --url https://kanwalquranacademy.com

# List collections to verify
npx emdash schema list --url https://kanwalquranacademy.com
```

After any schema change, regenerate types:

```bash
npx emdash types --url https://kanwalquranacademy.com
```

Then update `seed/seed.json` to match (or export it with `npx emdash export-seed` from a local copy of the production database) so fresh environments always bootstrap to the same model.

## Verify leads save in production

After deployment, confirm the enrolment path works end to end:

1. Open `https://kanwalquranacademy.com/free-trial` and submit the form with test data.
2. The form should return: `"Thank you. We will be in touch very soon."`
3. Query the production database to confirm the row was written:

```bash
pnpm wrangler d1 execute kanwal-academy --remote --command \
  "SELECT id, name, email, plan, lead_status, submitted_at FROM ec_enrolments ORDER BY submitted_at DESC LIMIT 5"
```

4. Check the admin panel at `/_emdash/admin` under Enrolments to see the new entry.

To test the newsletter path, submit the footer newsletter form and query:

```bash
pnpm wrangler d1 execute kanwal-academy --remote --command \
  "SELECT id, email, subscriber_status, subscribed_at FROM ec_subscribers ORDER BY subscribed_at DESC LIMIT 5"
```

## Admin panel

- URL: `/_emdash/admin`
- Authentication: passkey-first (WebAuthn). No passwords.
- Passkeys only work on the address where they were created. A passkey registered on `kanwalquranacademy.com` does not work on `workers.dev` or localhost.
- If you lose all passkeys and email is not configured, you must reset through the database.
- Magic link fallback requires an email provider to be configured.

## Local development

```bash
pnpm dev
```

The dev server runs at `http://localhost:4322`. The admin is at `http://localhost:4322/_emdash/admin`.

Local environment values go in `.env` (gitignored). See `.env.example` for the full list.

The local database is stored in `.wrangler/state/v3/d1/`. To reset:

```bash
pnpm db:reset
```

## Subsequent deployments

```bash
git pull
pnpm install
pnpm deploy
```

`pnpm deploy` runs `astro build && wrangler deploy`.

## Troubleshooting

### Build fails

```bash
rm -rf dist .astro node_modules/.cache
pnpm install
pnpm build
```

### Admin cannot log in

1. Check `EMDASH_ENCRYPTION_KEY` is set: `pnpm wrangler secret list`
2. Remember passkeys are hostname-bound. If you set up on the wrong address, sign in on the correct one with a magic link and register a new passkey.
3. If all passkeys are lost and email is not configured, you must reset through the D1 database directly. There is no `emdash reset-password` command.

### Images not loading

1. Check the R2 bucket exists: `pnpm wrangler r2 bucket list`
2. Check the binding in `wrangler.jsonc` matches `r2({ binding: "MEDIA" })` in `astro.config.mjs`
3. Upload images via the Media Library in the admin panel

### Scheduled posts not publishing

Run `pnpm emdash doctor` to check the cron trigger and scheduled handler. Watch runs with `pnpm wrangler tail`.

### View logs

```bash
pnpm wrangler tail
```

### Database access

```bash
# Open D1 console
pnpm wrangler d1 execute kanwal-academy --remote --console

# Query directly
pnpm wrangler d1 execute kanwal-academy --remote --command "SELECT * FROM ec_courses"
```

## Security checklist

- [ ] `EMDASH_ENCRYPTION_KEY` is set and backed up separately
- [ ] `EMDASH_SITE_URL` is set to the production domain before setup
- [ ] Passkey registered on the production domain, not `workers.dev`
- [ ] Turnstile keys are set (optional but recommended)
- [ ] No secrets in the repository
- [ ] `.env` and `.dev.vars` are gitignored
- [ ] Admin has 2FA on the underlying Cloudflare account

## What was verified

| Item | Verified against |
|---|---|
| Workers deploy (not Pages) | `package.json` `deploy` script, `src/worker.ts`, `wrangler.jsonc` `main` |
| Plan prices $20/$40/$82/$102 | `seed/seed.json` content entries |
| Admin path `/_emdash/admin` | EmDash docs (getting-started, authentication) |
| Passkey-only auth, domain-bound | EmDash docs (authentication) |
| `npx emdash secrets generate` | EmDash CLI reference (docs.emdashcms.com/reference/cli) |
| `PUBLIC_TURNSTILE_SITE_KEY` as public var | `src/components/BookTrial.astro`, `src/components/Newsletter.astro` read from `import.meta.env` |
| `TURNSTILE_SECRET_KEY` and `EMAILJS_*` as secrets | `src/pages/api/enrol.ts` reads from `hostEnv` (Worker runtime env) |
| No KV SESSION in wrangler.jsonc | Astro Cloudflare adapter adds SESSION KV automatically (EmDash Cloudflare deploy docs) |
| Custom domain route format | EmDash Cloudflare deploy docs |
| Seed only applies on empty DB | EmDash schema evolution docs |

## What could not be verified

| Item | Reason |
|---|---|
| Exact Cloudflare Wrangler version required for custom domain | Docs tested with Wrangler 4.125+ (installed); custom domain behavior depends on Cloudflare account settings |
| Whether `EMDASH_SITE_URL` can also be set via `siteUrl` in `astro.config.mjs` | Docs mention both; we use `vars` in wrangler which is simpler for per-environment values |
