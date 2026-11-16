#!/usr/bin/env node
/**
 * Apply the missing Kanwal Academy schema to an existing production D1 via the
 * EmDash HTTP schema API. Safe to re-run: every step is idempotent (skips
 * anything that already exists).
 *
 * What it does:
 *   - Create the `enrolments` collection if missing.
 *   - Create the `subscribers` collection if missing.
 *   - Add the `lead_status` select field to `enrolments` if missing.
 *   - Add the `owner_email` field to `site_settings` if missing.
 *   - Ensure the `home_page` collection exists with every home field, and
 *     copy the `pages/home` entry (data + SEO) into it. Falls back to the
 *     seed when `pages/home` is already gone.
 *   - Ensure the five per-page copy collections exist (`about_page`,
 *     `courses_page`, `pricing_page`, `contact_page`, `faq_page`) with all
 *     their fields, and fill their single entries from seed/seed.json.
 *     Existing editor values are never overwritten: only empty fields are
 *     filled.
 *   - Ensure the `faqs` collection has the `category` select field, then
 *     sync the seed questions: missing entries are created (Arabic ones
 *     linked as translations), existing entries only get empty fields
 *     filled. Existing questions and answers are never overwritten.
 *   - Regroup the admin: the page collections move to the Content group
 *     with SEO enabled; `pages` is renamed to "Legal Pages".
 *   - With --cleanup (run only after the new code is deployed and verified):
 *     soft-delete the home/about/courses/pricing/contact-us/faq entries from
 *     `pages` and drop the home fields, leaving the three legal pages.
 *
 * Requirements:
 *   - Node 18+ (uses global fetch).
 *   - An EmDash API token with `schema:read` + `schema:manage` +
 *     `content:read` + `content:manage` scopes.
 *     Create one in the admin panel under "API tokens" or via the CLI.
 *
 * Usage:
 *   node scripts/apply-prod-schema.mjs \
 *     --url https://kanwalquranacademy.com \
 *     --token em_pat_xxxxxxxxxxxxx
 *
 * Or via environment variables:
 *   EMDASH_URL=https://kanwalquranacademy.com \
 *   EMDASH_TOKEN=em_pat_xxxxxxxxxxxxx \
 *     node scripts/apply-prod-schema.mjs
 *
 * Local dev (no token needed, uses the dev bypass):
 *   node scripts/apply-prod-schema.mjs --local
 *   node scripts/apply-prod-schema.mjs --local --cleanup
 *
 * After this, the site_settings entry still needs `owner_email` populated
 * (in the admin under Site settings). That's one click in the UI.
 */

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
function arg(name) {
	const idx = args.indexOf(name);
	if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
	return undefined;
}

const local = args.includes("--local");
const cleanup = args.includes("--cleanup");

const baseUrl = (
	arg("--url") ?? process.env.EMDASH_URL ?? (local ? "http://localhost:4322" : "")
).replace(/\/$/, "");
const token = arg("--token") ?? process.env.EMDASH_TOKEN ?? "";

if (!baseUrl || (!local && !token)) {
	console.error("Usage: node apply-prod-schema.mjs --url <site> --token <api-token>");
	console.error("       (or set EMDASH_URL and EMDASH_TOKEN env vars, or --local)");
	process.exit(1);
}

let headers = { "Content-Type": "application/json" };
if (local) {
	const auth = await fetch(`${baseUrl}/_emdash/api/auth/dev-bypass`);
	if (!auth.ok) {
		console.error(`dev-bypass failed: HTTP ${auth.status}`);
		process.exit(1);
	}
	const cookie = (auth.headers.getSetCookie?.() ?? [])
		.map((c) => c.split(";")[0])
		.join("; ");
	headers = { ...headers, Cookie: cookie, "X-EmDash-Request": "1" };
} else {
	headers.Authorization = `Bearer ${token}`;
}

async function api(method, path, body) {
	const res = await fetch(`${baseUrl}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	let data = null;
	try {
		data = JSON.parse(text);
	} catch {
		data = { raw: text };
	}
	if (!res.ok || (data && data.success === false)) {
		const msg = data?.error?.message ?? data?.raw ?? `HTTP ${res.status}`;
		throw new Error(`${method} ${path}: ${msg}`);
	}
	return data;
}

async function listCollections() {
	const data = await api("GET", "/_emdash/api/schema/collections");
	return data?.data?.items ?? [];
}

async function listFields(collectionSlug) {
	const data = await api("GET", `/_emdash/api/schema/collections/${collectionSlug}/fields`);
	return data?.data?.items ?? [];
}

async function ensureCollection(spec) {
	const existing = await listCollections();
	if (existing.some((c) => c.slug === spec.slug)) {
		console.log(`  skip: ${spec.slug} already exists`);
		return false;
	}
	const { fields, titleField, ...rest } = spec;
	await api("POST", "/_emdash/api/schema/collections", rest);
	console.log(`  created: ${spec.slug}`);
	return true;
}

// Create a seed-defined collection, then its fields and title field.
async function ensureSeedCollection(spec) {
	await ensureCollection(spec);
	const existing = new Set((await listFields(spec.slug)).map((f) => f.slug));
	for (const field of spec.fields ?? []) {
		if (existing.has(field.slug)) continue;
		await api("POST", `/_emdash/api/schema/collections/${spec.slug}/fields`, field);
		console.log(`  created: ${spec.slug}.${field.slug}`);
	}
	if (spec.titleField) {
		await api("PUT", `/_emdash/api/schema/collections/${spec.slug}`, {
			titleField: spec.titleField,
		});
	}
}

async function getEntry(collection, slug) {
	try {
		const got = await api("GET", `/_emdash/api/content/${collection}/${slug}`);
		return got?.data?.item ?? null;
	} catch {
		return null;
	}
}

async function ensureField(collectionSlug, spec) {
	const existing = await listFields(collectionSlug);
	if (existing.some((f) => f.slug === spec.slug)) {
		console.log(`  skip: ${collectionSlug}.${spec.slug} already exists`);
		return false;
	}
	await api("POST", `/_emdash/api/schema/collections/${collectionSlug}/fields`, spec);
	console.log(`  created: ${collectionSlug}.${spec.slug}`);
	return true;
}

async function updateCollection(collectionSlug, patch) {
	await api("PUT", `/_emdash/api/schema/collections/${collectionSlug}`, patch);
	console.log(`  updated: ${collectionSlug}`);
}

async function main() {
	console.log(`Target: ${baseUrl}`);

	// --- enrolments ---------------------------------------------------------
	await ensureCollection({
		slug: "enrolments",
		label: "Enrolments",
		labelSingular: "Enrolment",
		description:
			"Leads submitted via the contact and free trial form. Status moves from new to contacted once the academy reaches out.",
		icon: "user-plus",
		group: "Settings",
		sortOrder: 90,
		routable: false,
		hasSeo: false,
		supports: [],
		admin: { listColumns: ["email", "plan", "course", "lead_status"] },
	});

	for (const field of [
		{ slug: "name", label: "Name", type: "string", required: true, sortOrder: 0 },
		{ slug: "email", label: "Email", type: "string", required: true, sortOrder: 1 },
		{ slug: "phone", label: "Phone", type: "string", sortOrder: 2 },
		{ slug: "course", label: "Course", type: "string", sortOrder: 3 },
		{ slug: "plan", label: "Plan", type: "string", sortOrder: 4 },
		{ slug: "message", label: "Message", type: "text", sortOrder: 5 },
		{ slug: "submitted_at", label: "Submitted at", type: "string", sortOrder: 6 },
		{
			slug: "lead_status",
			label: "Status",
			type: "select",
			required: true,
			sortOrder: 7,
			defaultValue: "new",
			validation: { options: ["new", "contacted"] },
		},
	]) {
		await ensureField("enrolments", field);
	}

	await updateCollection("enrolments", { titleField: "name" });

	// --- subscribers --------------------------------------------------------
	await ensureCollection({
		slug: "subscribers",
		label: "Subscribers",
		labelSingular: "Subscriber",
		description:
			"Email addresses collected through the footer newsletter form. Stored only, no emails are sent from the site.",
		icon: "envelope",
		group: "Settings",
		sortOrder: 100,
		routable: false,
		hasSeo: false,
		supports: [],
		admin: { listColumns: ["email", "subscriber_status", "subscribed_at"] },
	});

	for (const field of [
		{ slug: "email", label: "Email", type: "string", required: true, sortOrder: 0 },
		{
			slug: "subscriber_status",
			label: "Status",
			type: "select",
			required: true,
			sortOrder: 1,
			defaultValue: "active",
			validation: { options: ["active", "unsubscribed"] },
		},
		{ slug: "subscribed_at", label: "Subscribed at", type: "string", sortOrder: 2 },
	]) {
		await ensureField("subscribers", field);
	}

	await updateCollection("subscribers", { titleField: "email" });

	// --- site_settings: add owner_email if missing --------------------------
	await ensureField("site_settings", {
		slug: "owner_email",
		label: "Owner notification email (receives enrolment leads)",
		type: "string",
		sortOrder: 99,
	});

	// --- per-page copy collections -----------------------------------------
	// Each inner page reads its copy from its own collection (D1 caps tables
	// at 100 columns, so all copy cannot live in `pages`). Additive only:
	// existing collections, fields and editor values are left untouched.
	const seed = JSON.parse(
		readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"),
	);

	const isEmpty = (value) =>
		value == null ||
		(typeof value === "string" && value.trim() === "") ||
		(Array.isArray(value) && value.length === 0);

	// --- home_page: extract the home entry out of pages ---------------------
	const homeSpec = seed.collections.find((c) => c.slug === "home_page");
	await ensureSeedCollection(homeSpec);
	const seedHome = seed.content.home_page.find((e) => e.slug === "home");
	const sourceHome = await getEntry("pages", "home");
	let home = await getEntry("home_page", "home");
	if (!home) {
		const created = await api("POST", "/_emdash/api/content/home_page", {
			slug: "home",
			data: sourceHome?.data ?? seedHome.data,
		});
		const createdId = created?.data?.item?.id ?? created?.data?.id;
		await api("POST", `/_emdash/api/content/home_page/${createdId}/publish`, {});
		home = await getEntry("home_page", "home");
		console.log("  created + published: home_page/home");
	} else if (sourceHome) {
		const fill = {};
		for (const [key, value] of Object.entries(sourceHome.data)) {
			if (isEmpty(home.data?.[key])) fill[key] = value;
		}
		if (Object.keys(fill).length === 0) {
			console.log("  skip: home_page/home already complete");
		} else {
			await api("PUT", `/_emdash/api/content/home_page/${home.id}`, { data: fill });
			await api("POST", `/_emdash/api/content/home_page/${home.id}/publish`, {});
			console.log(`  filled ${Object.keys(fill).length} empty field(s) + published: home_page/home`);
		}
	}
	// Carry SEO across (only keys the target does not have yet).
	if (sourceHome?.seo && home) {
		const seoFill = {};
		for (const key of ["title", "description", "image"]) {
			if (sourceHome.seo[key] && !home.seo?.[key]) seoFill[key] = sourceHome.seo[key];
		}
		if (Object.keys(seoFill).length > 0) {
			await api("PUT", `/_emdash/api/content/home_page/${home.id}`, { seo: seoFill });
			console.log(`  carried ${Object.keys(seoFill).length} SEO value(s) into home_page/home`);
		}
	}

	const pageCollections = [
		{ collection: "about_page", slug: "about" },
		{ collection: "courses_page", slug: "courses" },
		{ collection: "pricing_page", slug: "pricing" },
		{ collection: "contact_page", slug: "contact-us" },
		{ collection: "faq_page", slug: "faq" },
	];

	for (const { collection, slug } of pageCollections) {
		const spec = seed.collections.find((c) => c.slug === collection);
		await ensureSeedCollection(spec);

		const seedEntry = seed.content[collection].find((e) => e.slug === slug);
		const seedData = seedEntry.data;

		let existing = null;
		try {
			const got = await api("GET", `/_emdash/api/content/${collection}/${slug}`);
			existing = got?.data?.item ?? null;
		} catch {
			// NOT_FOUND: create below.
		}

		if (!existing) {
			const created = await api("POST", `/_emdash/api/content/${collection}`, {
				slug,
				data: seedData,
			});
			const createdId = created?.data?.item?.id ?? created?.data?.id;
			await api("POST", `/_emdash/api/content/${collection}/${createdId}/publish`, {});
			console.log(`  created + published: ${collection}/${slug}`);
			continue;
		}

		// Fill only empty fields; the update API merges into existing data, so
		// sending just the filled keys leaves every editor value untouched.
		const fill = {};
		for (const [key, value] of Object.entries(seedData)) {
			if (isEmpty(existing.data?.[key])) fill[key] = value;
		}
		if (Object.keys(fill).length === 0) {
			console.log(`  skip: ${collection}/${slug} already complete`);
			continue;
		}
		await api("PUT", `/_emdash/api/content/${collection}/${existing.id}`, { data: fill });
		await api("POST", `/_emdash/api/content/${collection}/${existing.id}/publish`, {});
		console.log(`  filled ${Object.keys(fill).length} empty field(s) + published: ${collection}/${slug}`);
	}

	// --- faqs: category field + seed questions (additive, fill-only-empty) ---
	const faqsSpec = seed.collections.find((c) => c.slug === "faqs");
	await ensureSeedCollection(faqsSpec);
	await updateCollection("faqs", {
		description: faqsSpec.description,
		admin: faqsSpec.admin,
	});

	async function listFaqs(locale) {
		const data = await api(
			"GET",
			`/_emdash/api/content/faqs?locale=${locale}&limit=100`,
		);
		return data?.data?.items ?? [];
	}
	const enBySlug = new Map((await listFaqs("en")).map((e) => [e.slug, e]));
	const arBySlug = new Map((await listFaqs("ar")).map((e) => [e.slug, e]));
	let faqCreated = 0;
	let faqFilled = 0;
	async function syncFaq(seedFaq, bySlug, locale, sourceId) {
		let existing = bySlug.get(seedFaq.slug);
		if (!existing) {
			const body = { slug: seedFaq.slug, data: seedFaq.data };
			if (locale !== "en") {
				body.locale = locale;
				if (sourceId) body.translationOf = sourceId;
			}
			const created = await api("POST", "/_emdash/api/content/faqs", body);
			const createdId = created?.data?.item?.id ?? created?.data?.id;
			await api("POST", `/_emdash/api/content/faqs/${createdId}/publish`, {});
			bySlug.set(seedFaq.slug, { id: createdId, slug: seedFaq.slug, data: seedFaq.data });
			faqCreated++;
			return;
		}
		const fill = {};
		for (const [key, value] of Object.entries(seedFaq.data)) {
			if (isEmpty(existing.data?.[key])) fill[key] = value;
		}
		if (Object.keys(fill).length === 0) return;
		await api("PUT", `/_emdash/api/content/faqs/${existing.id}`, { data: fill });
		await api("POST", `/_emdash/api/content/faqs/${existing.id}/publish`, {});
		faqFilled++;
	}
	for (const seedFaq of seed.content.faqs.filter((e) => !e.locale)) {
		await syncFaq(seedFaq, enBySlug, "en");
	}
	for (const seedFaq of seed.content.faqs.filter((e) => e.locale === "ar")) {
		await syncFaq(seedFaq, arBySlug, "ar", enBySlug.get(seedFaq.slug)?.id);
	}
	console.log(
		`  faqs: ${faqCreated} created, ${faqFilled} filled + published (existing answers untouched)`,
	);

	// --- admin regroup: Content group, SEO, Legal Pages label ---------------
	const pagesSpec = seed.collections.find((c) => c.slug === "pages");
	await updateCollection("pages", {
		label: pagesSpec.label,
		labelSingular: pagesSpec.labelSingular,
		description: pagesSpec.description,
		sortOrder: pagesSpec.sortOrder,
	});
	for (const { collection } of pageCollections) {
		const spec = seed.collections.find((c) => c.slug === collection);
		await updateCollection(collection, {
			group: spec.group,
			sortOrder: spec.sortOrder,
			hasSeo: true,
			supports: spec.supports,
		});
	}

	// --- cleanup: only with --cleanup, after the new code is verified -------
	if (cleanup) {
		const homeNow = await getEntry("home_page", "home");
		if (!homeNow || homeNow.status !== "published") {
			throw new Error("cleanup refused: home_page/home is not published");
		}
		const source = await getEntry("pages", "home");
		if (source) {
			for (const key of Object.keys(source.data)) {
				if (!(key in (homeNow.data ?? {}))) {
					throw new Error(`cleanup refused: home_page/home is missing key ${key}`);
				}
			}
		}
		for (const slug of ["home", "about", "courses", "pricing", "contact-us", "faq"]) {
			const entry = await getEntry("pages", slug);
			if (!entry) {
				console.log(`  skip: pages/${slug} absent`);
				continue;
			}
			await api("DELETE", `/_emdash/api/content/pages/${entry.id}`);
			console.log(`  deleted: pages/${slug}`);
		}
		let dropped = 0;
		for (const field of await listFields("pages")) {
			if (field.slug === "title" || field.slug === "content") continue;
			await api("DELETE", `/_emdash/api/schema/collections/pages/fields/${field.slug}`);
			dropped++;
		}
		console.log(`  dropped ${dropped} home field(s) from pages`);
	}

	console.log("\nDone. Remember to set site_settings.owner_email in the admin UI.");
}

main().catch((err) => {
	console.error("FAILED:", err.message);
	process.exit(1);
});
