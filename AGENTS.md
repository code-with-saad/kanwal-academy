# Kanwal Quran Academy: website rebuild

Online Quran academy based in Karachi, Pakistan. We are replacing an old, hacked WordPress site with a new site on Astro + EmDash CMS, hosted on Cloudflare.

Language of this brief: English. Site copy language: English (Urdu may come later, keep layout RTL-ready).

## Stack
- Astro (SSR on Cloudflare Workers) with the EmDash CMS integration (`emdash/astro`).
- Database: Cloudflare D1. Media: Cloudflare R2.
- TypeScript everywhere. React components allowed only where interactivity needs them.
- Package manager: pnpm. Deploy: `pnpm deploy`.
- Dev server runs on port 4322 on this machine (`http://localhost:4322`).
- EmDash is stable (v1.4.0). Before using any EmDash API, read its docs and source (github.com/emdash-cms/emdash, docs and packages/core) and verify names. Never guess an API.

## Business content (real, keep as is)
Courses: Qur'anic Recitation, Tajweed Proficiency, Memorization Excellence.
Plans (billed monthly):
| Plan | Price | Classes/week | Classes/month | Hours/month |
|---|---|---|---|---|
| Plan I | $20 | 1 | 4 | 2 |
| Plan II (popular) | $40 | 2 | 8 | 4 |
| Plan III | $82 | 4 | 16 | 8 |
| Plan IV | $102 | 5 | 20 | 10 |
Every student starts with a free trial class.
Contact: Karachi, Pakistan. +92 342 2766346. hello@kanwalquranacademy.com
Stats: "5+ years", "5+ countries". Student and session counts are UNKNOWN: keep `[000]+` placeholders and flag them in the final report.
Pages: Home, About, Courses (+ one page per course), Pricing, Teachers, Contact, Free Trial, Blog (optional), Terms of Service, Privacy Policy.
Payments are NOT in scope yet. "Select plan" opens the trial/enrolment form with the plan preselected.

## Design (v2, mint)
- Mood: calm, airy, rounded, light grotesque type, soft mint panels on a white page.
- Light tokens: --page #FCFEFD, --mint-300 #A9D4C4 (hero panel), --mint-100 #D6ECE2 (tinted panels), --mint-50 #EAF5F0, --ink #0B1A14, --ink-muted #5A6C63, --line #E1EBE6, --green #0E8660 (primary, white text, must pass 4.5:1: darken if not), --green-deep #0A6B4B (hover, links), --deep #0F3D2E (testimonial panel).
- Dark tokens: --page #0D1612, --surface #131F1A, --mint-300 #1B3A2E, --mint-100 #162A22, --mint-50 #1A2F26, --ink #EAF4EF, --ink-muted #9DB3A8, --line #24362E, --green #3FC391 (text on it #062017), --green-deep #6FD9AE, --deep #0A1F18.
- Type: Instrument Sans only (400, 500, 600) plus Amiri for Arabic. H1 64px/1.04 weight 400 letter-spacing -0.03em (40px mobile). H2 48px/1.08 weight 400 (32px mobile). Body 17px/1.6, small 14px. The highlighted word in a heading is weight 500 in --green-deep. No serif anywhere.
- Shape: big panels radius 28px, cards 20px, inputs 12px, buttons and chips fully round. Panel inner padding 24 to 40px. Max content width 1200px.
- Layout: the site is full bleed on --page at every width. No outer inset, no rounded sheet anywhere.
- Chips: 1px outline of --ink at 20%, 36px tall, 14px text. Primary button: --green fill, white text, 48px tall. Secondary: outline. Selected or hovered list row: --green fill, white text.
- Texture: a very faint (6% opacity) Islamic geometric line pattern, flat SVG, only inside the hero panel. No gradients, no glass, no orbs, no dot grids, no emojis, no default icon set.
- Mobile first, check at 360px, 768px, 1280px.

## Hard rules (client taste, do not break)
- Do not use the template's marketing blocks, its glass header, glows, logo marquee, or 3-plan pricing. Build our own Astro components and our own collections (courses, plans, teachers, testimonials, faqs, site_settings; EmDash requires snake_case slugs) as planned. The home page reads from those collections.
- Do not add a "Powered by EmDash" credit to the footer.
- No emojis, no gradients, no glassmorphism, no purple or neon colors.
- No orbs, dot grids, sparkles or decorative animated arrows.
- No 3-card feature rows, no bento grids.
- No em dashes in any copy. Do not write "It's not X, it's Y" style copy.
- No fake testimonials, fake ratings or invented statistics. Use placeholders and flag them.
- Icons: custom or restyled, never default unstyled Lucide.
- Loading states: use a spinner or progress bar, not skeleton loaders.
- Hover effects only where they carry meaning (links, buttons).
- Terms of Service and Privacy Policy pages must exist and be linked in the footer.
- Accessibility: semantic HTML, one h1 per page, text contrast 4.5:1, visible focus states, alt text, Arabic text with `lang="ar" dir="rtl"`.
- Performance: Lighthouse 90+ on mobile for Performance, SEO, Accessibility, Best Practices.
- Never type Qur'anic text from memory: use only verified text (Tanzil.net, Uthmani) and flag it for a teacher to verify before launch.

## Security (the old site was hacked)
- Do not import any WordPress theme, plugin, PHP or database. Only content (text, images) is migrated.
- No secrets in the repo. Keep local secrets in `.env` (gitignored) and production secrets in Wrangler secrets.
- All forms: server-side validation, Cloudflare Turnstile, rate limiting.
- Admin panel only behind strong auth (use EmDash auth, enable 2FA if available).

## Working agreement
- Work in small steps, one phase at a time, and commit after each phase with a clear message.
- Run `pnpm build` and a typecheck before saying a phase is done.
- At the end of each phase, report: what was done, what is placeholder, what needs a decision from me.
- Ask before adding any new dependency.
