# Kanwal Quran Academy

Website for Kanwal Quran Academy, an online Quran academy serving students worldwide. The public address is managed in EmDash under Site Settings.

Built with Astro (SSR) and the EmDash CMS, deployed on Cloudflare Workers with D1 for the database and R2 for media.

## Requirements

- Node.js 22.16 or newer
- pnpm

## Local development

```bash
pnpm install
pnpm dev
```

- Site: http://localhost:4322
- Admin: http://localhost:4322/_emdash/admin

The first request runs the database migrations and applies `seed/seed.json`. On a fresh local database, open the development bypass first. It creates a dev admin user without a passkey and applies the seed:

```
http://localhost:4322/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin
```

The bypass only works in development mode. In production the first administrator is created through the passkey setup wizard in a browser.

## Content model

Editors manage the site from `/_emdash/admin`. The seed creates these collections:

| Collection | What it holds |
| --- | --- |
| Pages | Home hero copy and metadata, About, Terms of Service and Privacy Policy |
| Blog posts | Optional articles under `/blog` |
| Courses | The three courses and their long descriptions |
| Plans | The four monthly plans and prices |
| Teachers | Teacher profiles and photos |
| Testimonials | Real reviews, hidden until consent is marked |
| FAQs | Questions and answers used on the contact and free trial pages |
| Site settings | Contact details, social links and headline numbers |

EmDash requires lowercase snake_case field slugs, so the admin labels are written in plain English while the stored fields use names such as `classes_per_week`, `consent_given` and `social_links`. The home page reads courses, plans, testimonials and site settings directly from these collections. There is one Site settings entry; edit the entry with the slug `site`.

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
| `src/components/` | Layout and shared UI components |
| `src/styles/` | Global design tokens and base styles |
| `seed/seed.json` | Content schema, site settings, menus, seed content |
| `wrangler.jsonc` | Worker, D1 and R2 configuration |
| `emdash-env.d.ts` | Generated collection types |
| `.agents/skills/` | EmDash, plugin and CLI reference skills for agents |

## Deployment

```bash
pnpm wrangler login
pnpm deploy
```

Set the production secrets with `wrangler secret put` and keep them out of the repository. The D1 database and R2 bucket are provisioned from `wrangler.jsonc` on the first deploy.

## Demo deployment

See [DEMO.md](./DEMO.md) for the no-R2 investigation, free-plan limits, and the proposed `wrangler.demo.jsonc`. The demo config is not used by `pnpm deploy`.

## Security notes

- No WordPress code, themes or database is imported. Only content is migrated.
- Secrets live in `.env` locally (gitignored) and in Wrangler secrets in production.
- Forms use server-side validation, Cloudflare Turnstile and rate limiting.
