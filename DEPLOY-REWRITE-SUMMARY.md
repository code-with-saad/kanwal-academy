# DEPLOY.md Rewrite Summary

## What was fixed

### 1. **Cloudflare deployment method** (CRITICAL)
- **Old**: Said "Cloudflare Pages" with `pnpm run deploy`
- **Fixed**: Correctly states "Cloudflare Workers" with `pnpm build && pnpm wrangler deploy`
- **Verified**: `package.json` line 14 has `"deploy": "astro build && wrangler deploy"`, `wrangler.jsonc` has `main: "./src/worker.ts"`, and `src/worker.ts` exists with the correct Worker export structure

### 2. **Plan prices** (CRITICAL)
- **Old**: Listed Plan III as $60 and Plan IV as $80
- **Fixed**: Correctly shows $20, $40, $82, $102
- **Verified**: `seed/seed.json` lines 1375-1444 contain the correct prices. No $60/$80 values exist anywhere else in the codebase.

### 3. **Admin path and authentication** (CRITICAL)
- **Old**: Said `/_emdash/setup` and `/_emdash` with password login
- **Fixed**: Correctly states `/_emdash/admin` with passkey (WebAuthn) authentication
- **Verified**: EmDash documentation confirms passkey-first auth with OAuth fallbacks. Passkeys are domain-bound (only work on the hostname where created).

### 4. **PUBLIC_TURNSTILE_SITE_KEY handling** (CRITICAL)
- **Old**: Listed as a secret with `wrangler secret put`
- **Fixed**: Correctly identified as a public build-time value set via `.env` locally and `vars` in wrangler.jsonc
- **Verified**: `src/components/BookTrial.astro` line 61 reads from `runtimeEnv?.PUBLIC_TURNSTILE_SITE_KEY ?? buildEnv.PUBLIC_TURNSTILE_SITE_KEY` where `buildEnv = import.meta.env`. Public vars are embedded at build time by Vite.

### 5. **EmDash CLI commands** (CRITICAL)
- **Old commands removed**:
  - `npx emdash generate secret` → **Does not exist**. Correct command: `npx emdash secrets generate` (verified in CLI docs)
  - `npx emdash reset-password` → **Does not exist** (searched CLI docs and dist files, not found)
  - `pnpm run seed` → **Does not exist** in package.json scripts
  - `npx wrangler kv namespace create SESSION` → **Not needed**. The Astro Cloudflare adapter adds SESSION KV automatically and `wrangler deploy` provisions it

### 6. **Custom domain configuration** (CRITICAL)
- **Old**: Used `routes` with `zone_name` pattern
- **Fixed**: Uses correct format `{ "pattern": "www.kanwalquranacademy.com", "custom_domain": true }`
- **Verified**: EmDash Cloudflare deployment docs show this exact format

### 7. **Production schema sync** (NEW SECTION)
- **Added**: Explains that seed only applies on empty DB
- **Added**: Shows how to evolve schema on existing deployments via admin or CLI
- **Added**: Includes commands to verify leads save in production D1
- **Verified**: EmDash schema evolution docs confirm seed applies once on first request, subsequent schema changes require manual sync

### 8. **Bindings and variables reference** (NEW SECTION)
- **Added**: Complete table of every binding and environment variable the code reads
- **Verified**: Searched all `src/` files for `env`, `PUBLIC_*`, `TURNSTILE_*`, `EMAILJS_*`, `EMDASH_*`

## What was verified

| Item | Source |
|---|---|
| Workers deploy (not Pages) | `package.json` deploy script, `wrangler.jsonc`, `src/worker.ts` |
| Plan prices $20/$40/$82/$102 | `seed/seed.json` lines 1375-1444 |
| Admin path `/_emdash/admin` | EmDash docs: getting-started, authentication |
| Passkey-only auth, domain-bound | EmDash docs: authentication |
| `npx emdash secrets generate` exists | EmDash CLI reference (docs.emdashcms.com/reference/cli) |
| `PUBLIC_TURNSTILE_SITE_KEY` is public | `src/components/BookTrial.astro`, `src/components/Newsletter.astro` |
| No KV SESSION in wrangler.jsonc | EmDash Cloudflare deploy docs state Astro adapter adds it automatically |
| Custom domain route format | EmDash Cloudflare deploy docs |
| Seed only applies on empty DB | EmDash schema evolution docs |

## What could not be verified

| Item | Reason |
|---|---|
| `npx emdash reset-password` | Command does not exist in CLI reference or dist files |
| `pnpm run seed` script | Not defined in package.json scripts |
| Whether `EMDASH_SITE_URL` can be set via `siteUrl` in astro.config.mjs | Docs mention both; we use `vars` which is simpler |

## Files checked

- `DEPLOY.md` (rewritten)
- `package.json` (scripts verified)
- `wrangler.jsonc` (bindings verified)
- `seed/seed.json` (prices verified correct)
- `src/worker.ts` (Worker entry point verified)
- `src/pages/api/enrol.ts` (env variables verified)
- `src/components/BookTrial.astro` (PUBLIC_TURNSTILE_SITE_KEY verified as public)
- `src/components/Newsletter.astro` (PUBLIC_TURNSTILE_SITE_KEY verified as public)
- `src/utils/env.ts` (EMDASH_DEMO handling verified)
- `astro.config.mjs` (D1/R2 bindings verified)
- EmDash CLI reference (docs.emdashcms.com/reference/cli)
- EmDash Cloudflare deployment guide (docs.emdashcms.com/deployment/cloudflare)
- EmDash authentication guide (docs.emdashcms.com/guides/authentication)
- EmDash schema evolution guide (docs.emdashcms.com/deployment/schema-evolution)
