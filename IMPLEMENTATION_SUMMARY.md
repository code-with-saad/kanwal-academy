# Implementation Summary

## What Was Done

### 1. Schema Reproducibility (Admin Fix)
**Root Cause**: Invalid JSON in `_emdash_collections.admin_config` and `_emdash_fields.validation` columns (manual D1 UPDATEs) caused the schema registry to fail when parsing, throwing "Collection not found" for ALL collections.

**Fix**:
- Fixed `seed/seed.json` validation errors:
  - Reduced `enrolments.admin.listColumns` from 5 to 4 (max allowed)
  - Added `subscribers` collection with fields: email, subscriber_status, subscribed_at
  - Added `owner_email` field to `site_settings` content entry
- Created `scripts/reset-db.mjs` for wiping local D1
- Added `pnpm db:reset` npm script
- Created `scripts/validate-seed.mjs` for pre-deploy validation

**Verification**: From empty database:
```bash
pnpm db:reset
pnpm dev
# Dev bypass auto-seeds and creates admin
# All 10 collections registered and accessible in admin
```

### 2. Contact Form (Inline + Result Modal)
**Changes**:
- **Removed**: `EnrolmentModal.astro` (form-in-modal UI)
- **Created**: `ResultModal.astro` (success/error/rate-limit popup only)
- **Rewrote**: `BookTrial.astro` (inline form in #book section)
- **Updated**: CTA wiring from `data-open-modal` to `data-book-cta`
  - Scrolls to #book section
  - Prefills course/plan from URL params or data attributes
  - Focuses first empty field
- **Removed**: standalone `<Newsletter />` section between `<main>` and `<footer>`
- **Updated**: `Footer.astro` to include inline newsletter form
- **Updated**: All CTA components (Header, Hero, PlanCard, CourseCard, CourseRow, FeatureSplit, StatsBand, WisdomPanel, Button)

**Form Flow**:
1. User fills inline form in #book section
2. Submits to `/api/enrol` with `type: "enrolment"`
3. Server validates, saves to `ec_enrolments`, sends EmailJS notification
4. ResultModal opens with success/error/rate-limit state
5. Retry button resubmits; Close returns to form

**CTA Flow**:
- "Book free trial" / "Select plan" / course CTAs: scroll to #book, prefill, focus
- From other pages: navigate to `/?plan=...&course=...#book`

### 3. EmailJS Integration
**Replaced**: Resend → EmailJS REST API

**Changes**:
- Updated `src/pages/api/enrol.ts` to use EmailJS
- Env vars: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`
- Template params: `name`, `email`, `phone`, `course`, `plan`, `message`, `time`, `to_email`, `reply_to`
- Recipient: `site_settings.owner_email` → fallback `OWNER_EMAIL` env
- Email failure: logged, lead still saved, success returned

**Template Requirements**:
- "To" field: `{{to_email}}`
- "Reply to": `{{reply_to}}`
- Body: use `{{name}}`, `{{email}}`, etc.

**Server-Side Calls**: EmailJS allows REST API calls from backend. If origin errors occur, check EmailJS dashboard for "allowed origins" settings.

### 4. Newsletter (Store Only)
**Changes**:
- Created `subscribers` collection (email, subscriber_status, subscribed_at)
- Newsletter form moved to footer (inline, one field + Subscribe button)
- Added consent text: "We only use your email to send occasional learning notes. Read our Privacy Policy."
- API route: `POST /api/enrol` with `type: "newsletter"`
- Duplicate emails: accepted silently (no error)
- No email sent to subscribers

### 5. Production Deployment
**Created**: `scripts/apply-prod-schema.mjs`
- Idempotent script to create missing collections/fields
- Creates: `enrolments`, `subscribers`, `owner_email` field
- Uses EmDash HTTP schema API with API token
- Safe to re-run

**Created**: `DEPLOY.md` with:
- Schema application commands
- EmailJS setup instructions
- Wrangler secrets to set
- Post-deploy checklist

## Verification

### Admin Panel
- [x] Courses, Plans, Site settings, Enrolments, Subscribers all accessible
- [x] Fields correctly registered (6 for courses, 8 for enrolments, 3 for subscribers)
- [x] Content API returns correct data

### Forms
- [x] Enrolment form: validates, saves to `ec_enrolments`, returns success
- [x] Newsletter form: validates, saves to `ec_subscribers`, returns success
- [x] Validation: empty name → 400 error with message
- [x] Honeypot: silently accepts bots

### HTML Structure
- [x] #book section with inline form (9 fields + submit + honeypot)
- [x] Result modal with 3 panels (success, error, rate)
- [x] Footer newsletter (1 occurrence, not standalone)
- [x] 19 `data-book-cta` triggers across the site
- [x] Old EnrolmentModal removed

### Build
- [x] `pnpm typecheck` passes (0 errors)
- [x] `pnpm build` succeeds (36.67s)

## What Needs Manual Setup

### Production
1. Run schema migration:
   ```bash
   node scripts/apply-prod-schema.mjs --url https://kanwalquranacademy.com --token <api-token>
   ```

2. Set `owner_email` in Site settings (admin UI)

3. Configure EmailJS:
   - Create account at https://www.emailjs.com/
   - Add email service
   - Create template with `{{to_email}}`, `{{name}}`, etc.
   - Set Wrangler secrets:
     ```bash
     pnpm wrangler secret put EMAILJS_SERVICE_ID
     pnpm wrangler secret put EMAILJS_TEMPLATE_ID
     pnpm wrangler secret put EMAILJS_PUBLIC_KEY
     pnpm wrangler secret put EMAILJS_PRIVATE_KEY
     ```

4. Test forms end-to-end

### Browser Testing
**Not completed** due to environment limitations (no browser automation tool in OpenCode).

**What should be tested**:
- [ ] Submit enrolment form with empty fields → inline errors
- [ ] Submit with invalid email → error message under field
- [ ] Submit with invalid phone → error message under field
- [ ] Submit with valid data → success modal, then close → form resets
- [ ] Submit 6 times in 1 hour → rate-limit modal
- [ ] Submit newsletter → success message in footer
- [ ] Click "Book free trial" from header → scroll to #book, focus name field
- [ ] Click "Select plan" → scroll to #book, plan preselected, focus first empty
- [ ] Navigate to `/?plan=Plan II#book` → scroll to #book, Plan II selected
- [ ] Light/dark theme toggle works
- [ ] Mobile layout (360px width) stacks correctly
- [ ] Desktop layout (1280px width) two-column form

## Placeholders

- Student count: `[000]+` (needs real number)
- Session count: `[000]+` (needs real number)
- Teacher photos: placeholder initials (add real photos in admin)
- Testimonials: hidden until real reviews with `consent_given = true` exist
- Owner email: set to `hello@kanwalquranacademy.com` (change to private owner address in admin)

## File Changes

**Modified**:
- `seed/seed.json` (added subscribers collection, owner_email, fixed listColumns)
- `src/pages/api/enrol.ts` (EmailJS, newsletter routing, type narrowing)
- `src/components/BookTrial.astro` (complete rewrite)
- `src/components/Footer.astro` (added newsletter)
- `src/components/Newsletter.astro` (complete rewrite)
- `src/components/Button.astro` (modal → book prop)
- `src/components/CourseCard.astro` (data-open-modal → data-book-cta)
- `src/components/CourseRow.astro` (data-open-modal → data-book-cta)
- `src/components/FeatureSplit.astro` (modal → book prop)
- `src/components/Header.astro` (data-open-modal → data-book-cta)
- `src/components/PlanCard.astro` (data-open-modal → data-book-cta)
- `src/components/StatsBand.astro` (modal → book prop)
- `src/components/WisdomPanel.astro` (modal → book prop)
- `src/layouts/Base.astro` (removed EnrolmentModal/Newsletter, added ResultModal, CTA controller)
- `src/pages/index.astro` (data-open-modal → data-book-cta, BookTrial props)
- `src/utils/site-config.ts` (added whatsappHref)
- `package.json` (added db:reset script)
- `.env.example` (EmailJS vars)

**Created**:
- `src/components/ResultModal.astro`
- `scripts/reset-db.mjs`
- `scripts/validate-seed.mjs`
- `scripts/apply-prod-schema.mjs`
- `scripts/cdp-screenshot.mjs` (not used)
- `DEPLOY.md`

**Deleted**:
- `src/components/EnrolmentModal.astro`
- `src/pages/api/newsletter.ts`
