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

## Design: "Dark hero with featured plan" (approved by the client)
Reference mockup: the canvas board "A. FINAL". Layout order on Home:
1. Dark hero: wordmark + nav + "Get free trial" button; left headline and two CTAs; right a featured plan card (Plan II) with the bismillah in Arabic at its top.
2. Courses: two columns, heading on the left, numbered rows on the right separated by hairlines.
3. Numbers band (sand background).
4. Pricing: 4 plan cards, Plan II inverted (dark).
5. How the free trial works: 3 steps in a row separated by a top rule.
6. Testimonial: real reviews only. Until we have them, show nothing or a clearly marked placeholder in dev only.
7. Footer: dark, with Terms of Service and Privacy Policy links.

Tokens (put them in one CSS file as custom properties):
- bg-dark #101A16, surface-dark #17231E, line-dark #2A3A33
- sage (accent on dark, buttons) #6FAE7B, sage-deep (accent on light) #3F7A4E
- cream (page) #F6F2E9, sand (bands) #E7DFCB, hairline-light #CFC6B2
- ink #1B2A24, muted-ink #4F5A54, muted-on-dark #A9B8AE, text-on-dark #F6F2E9
Fonts (Google Fonts, self-host in production): Fraunces (headings, 600), Instrument Sans (body 400/500/600), Amiri (Arabic).
Sizes: h1 64px desktop (40px mobile), h2 44px, body 17 to 19px, line-height 1.6.
Corners: buttons 6px, cards 10px. Max content width 1200px, side padding 32px (20px mobile).
Mobile first, check at 360px, 768px, 1280px.

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
