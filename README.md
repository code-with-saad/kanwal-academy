# Kanwal Quran Academy

Website for Kanwal Quran Academy, an online Quran academy based in Karachi, Pakistan.

Built with Astro (SSR) and the EmDash CMS, deployed on Cloudflare Workers with D1 for the database and R2 for media.

## Requirements

- Node.js 20 or newer
- pnpm

## Local development

```bash
pnpm install
pnpm dev
```

- Site: http://localhost:4322
- Admin: http://localhost:4322/_emdash/admin

The first request runs the database migrations and applies `seed/seed.json`. On localhost, EmDash exposes a development bypass that creates a dev admin user without a passkey:

```
http://localhost:4322/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin
```

The bypass only works in development mode. In production the first administrator is created through the passkey setup wizard in a browser.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Astro dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm typecheck` | Run `astro check` |
| `pnpm deploy` | Build and deploy with Wrangler |
| `npx emdash types` | Regenerate TypeScript types from a running site |

## Project structure

| Path | Purpose |
| --- | --- |
| `astro.config.mjs` | Astro config, EmDash integration, D1 and R2 bindings, fonts |
| `src/live.config.ts` | EmDash live collection loader |
| `src/pages/` | Server-rendered routes |
| `src/layouts/Base.astro` | Shared layout, header, footer, SEO wiring |
| `src/components/` | Page and block components |
| `src/styles/` | Global design tokens and base styles |
| `seed/seed.json` | Content schema, site settings, menus, seed content |
| `wrangler.jsonc` | Worker, D1 and R2 configuration |
| `emdash-env.d.ts` | Generated collection types |
| `docs/` | Internal reference notes |

## Deployment

```bash
pnpm wrangler login
pnpm deploy
```

Set the production secrets with `wrangler secret put` and keep them out of the repository. The D1 database and R2 bucket are provisioned from `wrangler.jsonc` on the first deploy.

## Security notes

- No WordPress code, themes or database is imported. Only content is migrated.
- Secrets live in `.env` locally (gitignored) and in Wrangler secrets in production.
- Forms use server-side validation, Cloudflare Turnstile and rate limiting.
