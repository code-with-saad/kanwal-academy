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
 *
 * Requirements:
 *   - Node 18+ (uses global fetch).
 *   - An EmDash API token with `schema:read` + `schema:manage` scopes.
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
 * After this, the site_settings entry still needs `owner_email` populated
 * (in the admin under Site settings). That's one click in the UI.
 */

const args = process.argv.slice(2);
function arg(name) {
	const idx = args.indexOf(name);
	if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
	return undefined;
}

const baseUrl = (arg("--url") ?? process.env.EMDASH_URL ?? "").replace(/\/$/, "");
const token = arg("--token") ?? process.env.EMDASH_TOKEN ?? "";

if (!baseUrl || !token) {
	console.error("Usage: node apply-prod-schema.mjs --url <site> --token <api-token>");
	console.error("       (or set EMDASH_URL and EMDASH_TOKEN env vars)");
	process.exit(1);
}

const headers = {
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
};

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
	await api("POST", "/_emdash/api/schema/collections", spec);
	console.log(`  created: ${spec.slug}`);
	return true;
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

	console.log("\nDone. Remember to set site_settings.owner_email in the admin UI.");
}

main().catch((err) => {
	console.error("FAILED:", err.message);
	process.exit(1);
});
