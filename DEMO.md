# Free demo deployment investigation

This note records whether the site can run as a free demo on Cloudflare Workers with D1 and no R2 bucket. Nothing here has been deployed.

## Verdict

A public, read-only demo is possible. A full CMS demo is not reliable on the Workers Free plan.

- Workers + D1 + static assets work without a payment method.
- R2 does not. R2 requires an R2 subscription and a completed checkout flow, which needs a payment method.
- Worker Loader does not. Sandboxed plugins need the Workers Paid plan.
- The Workers Free plan gives 10 ms of CPU per request. EmDash's own issue tracker reports public SSR requests over that budget on 1.2.0 (issue #4218), and image processing far over it (issue #4212). A demo can work, but it can also return Error 1102 under load.

## Free plan limits

Source: https://developers.cloudflare.com/workers/platform/limits/

| Limit | Workers Free |
| --- | --- |
| Requests | 100,000 per day |
| CPU time | 10 ms per request |
| Memory | 128 MB |
| Subrequests | 50 per request |
| Static asset files | 20,000 per Worker version |

Source: https://developers.cloudflare.com/d1/platform/pricing/

| D1 limit | Workers Free |
| --- | --- |
| Rows read | 5,000,000 per day |
| Rows written | 100,000 per day |
| Storage | 5 GB total |
| Databases | 10 |

Source: https://developers.cloudflare.com/r2/get-started/

R2 is free to start but requires an R2 subscription. The Cloudflare dashboard asks you to complete the checkout flow before the first bucket can be created. A no-payment account cannot enable it.

Source: https://developers.cloudflare.com/dynamic-workers/pricing/

Dynamic Workers, including the Worker Loader binding, are Workers Paid only. The EmDash Cloudflare adapter warns and disables sandboxed plugins when no `LOADER` binding exists.

## EmDash storage options

Source: https://docs.emdashcms.com/deployment/storage/

| Adapter | Works on Workers? | Use for the demo? |
| --- | --- | --- |
| `r2({ binding: "MEDIA" })` | Yes | No. Needs R2. |
| `s3({ ... })` | No. Node.js only. | No. R2 via S3 still needs R2. |
| `local({ ... })` | No. Needs a writable disk. | No. Workers have no persistent disk. |
| Custom `Storage` adapter | Yes | Possible, but extra code. Backup and range support are your responsibility. |

EmDash's Cloudflare adapter is the only documented persistent option for Workers, and it is R2. The integration makes `storage` optional, but omitting it falls back to the local filesystem adapter, which cannot persist uploads on Workers. Do not rely on that for a demo with a media library.

## What the demo config changes

`wrangler.demo.jsonc` removes:

- `r2_buckets`
- `worker_loaders`
- the every-minute cron trigger

It keeps the D1 binding and the Worker entry point. Wrangler creates the named D1 database on the first deploy.

Two code changes are still required, because `astro.config.mjs` currently always registers R2 storage and the production Wrangler config:

```js
const demo = process.env.EMDASH_DEMO === "1";

export default defineConfig({
	adapter: cloudflare(
		demo
			? { configPath: "./wrangler.demo.jsonc", imageService: "passthrough" }
			: {},
	),
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			...(demo ? {} : { storage: r2({ binding: "MEDIA" }) }),
		}),
	],
});
```

`imageService: "passthrough"` avoids the Cloudflare Images binding for the demo. Without it, the adapter adds an `IMAGES` binding. That free tier is separate and is not needed when images are already static files.

The adapter also adds a `SESSION` KV binding for Astro sessions. KV has a free tier and does not need R2. If the demo must use D1 only, set `session: false` and test admin sign-in carefully. Public pages do not need it, but the admin does.

## Demo images

Put demo images in `public/images` and reference them as `/images/...`.

For EmDash image fields, use an external image object instead of `$media`, for example:

```json
"photo": {
	"provider": "external",
	"id": "demo-teacher",
	"src": "/images/teacher.jpg",
	"alt": "Teacher portrait",
	"width": 1200,
	"height": 900
}
```

Render these with a plain `<img>` or with the image service set to `passthrough`. Do not use the Media Library for a no-R2 demo. Uploads will fail and nothing will persist.

## Setup and seed content

`wrangler.demo.jsonc` does not change how EmDash seeds content. On a fresh D1 database, the first request runs migrations. The setup wizard then creates the first administrator and offers to apply the seed content.

For a public demo, finish setup immediately at the `workers.dev` URL. The first visitor to complete the wizard becomes the administrator. If the demo is not protected, use Cloudflare Access or complete setup before sharing the URL.

Scheduled publishing does not run without the cron trigger. That is acceptable for a static demo. Do not promise scheduled posts or automatic backups.

## Recommendation

Use the demo config only for a review build with a fixed set of pages and static images.

1. Keep production on Workers Paid and R2.
2. If the demo must stay free, consider a static or mostly cached build so most requests never execute SSR code. Workers Cache in front of the public routes is the best mitigation for the 10 ms CPU limit.
3. Expect admin editing, media uploads, image transforms and scheduled publishing to be unavailable or unreliable.
4. If the client needs a real CMS demo with uploads, the account needs a payment method for Workers Paid and R2.

## Verification commands for a future demo

Do not run these until the demo decision is confirmed.

```powershell
$env:EMDASH_DEMO = "1"
pnpm build
pnpm wrangler deploy --config wrangler.demo.jsonc
```

The build must use the same Wrangler config as the deploy. Deploying the production build with `--config wrangler.demo.jsonc` will still contain the R2 storage adapter and fail at runtime.
