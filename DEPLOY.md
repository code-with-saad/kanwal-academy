# Deploy Guide

## Production schema setup

After deploying the code, the production D1 database needs the new collections
and fields. Run:

```bash
node scripts/apply-prod-schema.mjs \
  --url https://kanwalquranacademy.com \
  --token <your-api-token>
```

Get an API token from the admin panel (Settings → API tokens) with scopes
`schema:read` and `schema:manage`. Or use `npx emdash login --url ...` then
`npx emdash api-token create` (if available).

The script is idempotent — safe to re-run. It creates:

- **enrolments** collection (name, email, phone, course, plan, message, submitted_at, lead_status)
- **subscribers** collection (email, subscriber_status, subscribed_at)
- **owner_email** field on site_settings

After running the script, set `owner_email` in the admin UI under Site settings
(one-time).

## EmailJS setup

1. Create an EmailJS account at https://www.emailjs.com/
2. Add your email service (Gmail, Outlook, etc.)
3. Create a template with these variables:
   - `{{to_email}}` in the "To" field
   - `{{name}}`, `{{email}}`, `{{phone}}`, `{{course}}`, `{{plan}}`, `{{message}}`, `{{time}}`
4. Set environment variables:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_PRIVATE_KEY`

**Server-side calls:** EmailJS allows server-side REST API calls by default.
If you get origin errors, check EmailJS docs for "REST API" settings.

## Wrangler secrets

Before deploying, set these as Wrangler secrets:

```bash
pnpm wrangler secret put EMDASH_ENCRYPTION_KEY
pnpm wrangler secret put EMAILJS_SERVICE_ID
pnpm wrangler secret put EMAILJS_TEMPLATE_ID
pnpm wrangler secret put EMAILJS_PUBLIC_KEY
pnpm wrangler secret put EMAILJS_PRIVATE_KEY
pnpm wrangler secret put TURNSTILE_SECRET_KEY
```

Public vars (safe in `wrangler.jsonc` or Cloudflare dashboard):

- `PUBLIC_TURNSTILE_SITE_KEY`

## Post-deploy checklist

- [ ] Run `scripts/apply-prod-schema.mjs`
- [ ] Set `owner_email` in Site settings
- [ ] Test the contact form (should save to enrolments)
- [ ] Test the newsletter form (should save to subscribers)
- [ ] Verify owner receives email notification
