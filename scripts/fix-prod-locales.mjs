#!/usr/bin/env node
/**
 * Bilingual CMS locale repair (Phase D).
 *
 * Fixes the "Arabic shows up in the English site" reports and makes the Arabic
 * inner pages editable in the CMS. Idempotent: safe to re-run, every step
 * skips work that is already done.
 *
 * What it does:
 *   1. Exports the local EN `home_page/home` entry (dev bypass on
 *      http://localhost:4322) as the English reference. The seed EN home is
 *      the fallback reference.
 *   2. Repairs the production EN home: any field whose current value contains
 *      Arabic script is replaced with the English reference value. Non-Arabic
 *      values (owner edits, the restored split panels) are never touched.
 *      Image objects keep their src; only an Arabic alt/caption is repaired.
 *      Publishes when anything changed.
 *   3. Publishes the existing AR home draft unchanged (the owner's own
 *      translation), so /ar/ renders from the CMS instead of bundled copy.
 *   4. Creates published AR entries for about_page, courses_page,
 *      pricing_page, contact_page and faq_page, linked to their EN entries
 *      via translationOf. Values come from getPageCopy("ar") in
 *      src/i18n/pages.ts (plus the AR UI dictionary where a page falls back
 *      to t.home), mapped field-by-field to mirror each page's
 *      pageText/pageRows/pageImage calls. Image fields stay unset so the
 *      bundled photography is used. Existing AR entries only get empty
 *      fields filled. Unmapped schema fields are listed in the report and
 *      keep the bundled-AR fallback.
 *   5. Soft-deletes the legacy `pages/home` and `pages/about` rows (both
 *      locale variants, recoverable from Trash). Terms/Privacy/Refund stay.
 *
 * Safety:
 *   - Before/after snapshots of every touched collection (both locales),
 *     written to .tmp-locale-repair/ with a numeric report.
 *   - Assertions: no entry lost, no non-Arabic EN value changed, AR home
 *     data published as-is, EN page entries untouched, counts stable.
 *   - --dry-run computes and logs everything without writing.
 *
 * Requirements:
 *   - Node 26+ (loads the TypeScript copy via type stripping).
 *   - The dev server running on http://localhost:4322 (pnpm dev) for the
 *     English reference export.
 *   - Production auth: --token / EMDASH_TOKEN, or the EmDash CLI credentials
 *     in ~/.config/emdash/auth.json (expired access tokens are refreshed
 *     automatically and the new token is saved back, like the CLI does).
 *
 * Usage:
 *   node scripts/fix-prod-locales.mjs --dry-run
 *   node scripts/fix-prod-locales.mjs
 *   node scripts/fix-prod-locales.mjs --url https://kanwalquranacademy.com --token em_pat_xxx
 *   node scripts/fix-prod-locales.mjs --local          # rehearsal on the dev instance
 *   node scripts/fix-prod-locales.mjs --local --dry-run
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPageCopy } from "../src/i18n/pages.ts";
import { ar as arUi } from "../src/i18n/ui/ar.ts";

const args = process.argv.slice(2);
function arg(name) {
	const idx = args.indexOf(name);
	if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
	return undefined;
}
const local = args.includes("--local");
const dryRun = args.includes("--dry-run");

const DEV_URL = "http://localhost:4322";
const baseUrl = (
	arg("--url") ?? process.env.EMDASH_URL ?? (local ? DEV_URL : "https://kanwalquranacademy.com")
).replace(/\/$/, "");

const seed = JSON.parse(readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"));
const seedHomeEn = seed.content.home_page.find((e) => e.slug === "home" && !e.locale)?.data ?? {};

// Arabic script: base block, supplement, extended-A, presentation forms.
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const hasArabic = (value) => typeof value === "string" && ARABIC.test(value);
const isEmpty = (value) =>
	value == null ||
	(typeof value === "string" && value.trim() === "") ||
	(Array.isArray(value) && value.length === 0);
const nonEmptyString = (value) => (typeof value === "string" && value.trim() ? value : undefined);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const authFile = join(homedir(), ".config", "emdash", "auth.json");

function readStoredCred() {
	try {
		const auth = JSON.parse(readFileSync(authFile, "utf8"));
		return auth[baseUrl] ?? null;
	} catch {
		return null;
	}
}

function saveStoredCred(cred) {
	try {
		const auth = JSON.parse(readFileSync(authFile, "utf8"));
		auth[baseUrl] = cred;
		writeFileSync(authFile, JSON.stringify(auth, null, 2));
	} catch (err) {
		console.warn(`  warning: could not save refreshed token: ${err.message}`);
	}
}

async function refreshToken(cred) {
	const res = await fetch(`${baseUrl}/_emdash/api/oauth/token/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ grant_type: "refresh_token", refresh_token: cred.refreshToken }),
		signal: AbortSignal.timeout(30000),
	});
	const json = await res.json().catch(() => null);
	const data = json?.data?.access_token ? json.data : json;
	if (!res.ok || !data?.access_token) {
		throw new Error(`token refresh failed (HTTP ${res.status}): ${JSON.stringify(json).slice(0, 200)}`);
	}
	const updated = {
		...cred,
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? cred.refreshToken,
		expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString(),
	};
	saveStoredCred(updated);
	return updated;
}

let headers = { "Content-Type": "application/json", "X-EmDash-Request": "1" };
let storedCred = null;

if (local) {
	const auth = await fetch(`${DEV_URL}/_emdash/api/auth/dev-bypass`, {
		signal: AbortSignal.timeout(30000),
	});
	if (!auth.ok) {
		console.error(`dev-bypass failed: HTTP ${auth.status}. Is the dev server running (pnpm dev)?`);
		process.exit(1);
	}
	const cookie = (auth.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
	headers = { ...headers, Cookie: cookie };
} else {
	let token = arg("--token") ?? process.env.EMDASH_TOKEN;
	if (!token) {
		storedCred = readStoredCred();
		if (!storedCred) {
			console.error("No production credentials. Pass --token, set EMDASH_TOKEN, or run `emdash login`.");
			process.exit(1);
		}
		if (new Date(storedCred.expiresAt) <= new Date()) {
			console.log("  access token expired, refreshing...");
			storedCred = await refreshToken(storedCred);
		}
		token = storedCred.accessToken;
	}
	headers.Authorization = `Bearer ${token}`;
}

async function api(method, path, body, { retried = false } = {}) {
	const res = await fetch(`${baseUrl}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(60000),
	});
	if (res.status === 401 && storedCred && !retried) {
		storedCred = await refreshToken(storedCred);
		headers.Authorization = `Bearer ${storedCred.accessToken}`;
		return api(method, path, body, { retried: true });
	}
	const text = await res.text();
	let data = null;
	try {
		data = JSON.parse(text);
	} catch {
		data = { raw: text };
	}
	if (!res.ok || (data && data.success === false)) {
		const err = new Error(`${method} ${path}: ${data?.error?.message ?? data?.raw ?? `HTTP ${res.status}`}`);
		err.code = data?.error?.code;
		err.status = res.status;
		throw err;
	}
	return data;
}

// Entry locks: a repair run by the owner may override a stale editor lock,
// but only after the plain write was refused, and it is logged.
async function writeWithLockRetry(method, path, body) {
	try {
		return await api(method, path, body);
	} catch (err) {
		if (err.code === "ENTRY_LOCKED" || err.status === 409) {
			console.warn(`  warning: ${path} is locked by an editor, overriding the lock`);
			const retryBody = method === "DELETE" ? undefined : { ...(body ?? {}), overrideLock: true };
			const retryPath = method === "DELETE" ? `${path}?overrideLock=true` : path;
			return await api(method, retryPath, retryBody);
		}
		throw err;
	}
}

async function getEntry(collection, slug, locale) {
	try {
		const got = await api("GET", `/_emdash/api/content/${collection}/${slug}?locale=${locale}`);
		return got?.data?.item ?? null;
	} catch (err) {
		if (err.code === "NOT_FOUND" || err.status === 404) return null;
		throw err;
	}
}

async function listEntries(collection, locale) {
	const data = await api("GET", `/_emdash/api/content/${collection}?locale=${locale}&limit=100`);
	return data?.data?.items ?? [];
}

async function listFields(collection) {
	const data = await api("GET", `/_emdash/api/schema/collections/${collection}/fields`);
	return data?.data?.items ?? [];
}

// ---------------------------------------------------------------------------
// Arabic page copy, mapped to CMS field slugs exactly as each page reads them
// (pageText / pageRows / pageImage in src/pages/*.astro). Image fields are
// intentionally absent: the bundled photography stays in use.
// ---------------------------------------------------------------------------

const arCopy = getPageCopy("ar");

function aboutData(ctx) {
	const c = arCopy.about;
	return {
		hero_eyebrow: c.eyebrow,
		hero_heading_before: c.headingBefore,
		hero_heading_highlight: c.headingHighlight,
		hero_heading_after: c.headingAfter,
		hero_lead: c.lead,
		hero_image_alt: c.heroImageAlt,
		hero_since: c.heroSince,
		philosophy_eyebrow: c.philosophyEyebrow,
		philosophy_heading_before: c.philosophyBefore,
		philosophy_heading_highlight: c.philosophyHighlight,
		philosophy_heading_after: c.philosophyAfter,
		philosophy_text: c.philosophyText,
		// about.astro falls back to homeText("about_image_alt") here.
		philosophy_image_alt: nonEmptyString(ctx.arHome?.about_image_alt) ?? arUi.home.about_image_alt,
		founder_eyebrow: c.founderEyebrow,
		founder_heading: c.founderHeading,
		founder_name: c.founderName,
		founder_role: c.founderRole,
		founder_credential: c.founderCredential,
		founder_image_alt: c.founderImageAlt,
		founder_paragraphs: c.founderParagraphs.slice(0, 4).map((paragraph) => ({ paragraph })),
		founder_closing: c.founderParagraphs[4],
		founder_milestones: c.founderMilestones.map(({ label, title, text }) => ({ label, title, text })),
		credentials_eyebrow: c.credentialsEyebrow,
		credentials_heading: c.credentialsHeading,
		credentials_lead: c.credentialsLead,
		credentials: c.credentials.map(({ title, issuer, motif }) => ({ title, issuer, motif })),
		approach_eyebrow: c.approachEyebrow,
		approach_heading: c.approachHeading,
		approach_lead: c.approachLead,
		approach_steps: c.approachSteps.map(({ title, text }) => ({ title, text })),
		trust_eyebrow: c.trustEyebrow,
		trust_heading: c.trustHeading,
		trust_intro: c.trustIntro,
		trust_operator_name: c.trustOperatorName,
		trust_operator_place: c.trustOperatorPlace,
		trust_operator: c.trustOperator,
		trust_chips: c.trustChips.map((label) => ({ label })),
		cta_heading: c.ctaHeading,
		cta_text: c.ctaText,
	};
}

function coursesData() {
	const c = arCopy.courses;
	return {
		eyebrow: c.eyebrow,
		heading: c.heading,
		lead: c.lead,
		cta_heading: c.ctaHeading,
		cta_text: c.ctaText,
		hero_heading_before: c.headingBefore,
		hero_heading_highlight: c.headingHighlight,
		hero_heading_after: c.headingAfter,
		hero_image_alt: c.heroImageAlt,
		hero_badge: c.heroBadge,
		hero_chips: c.heroChips.map((label) => ({ label })),
		note: c.note,
		method_eyebrow: c.methodEyebrow,
		method_heading_before: c.methodBefore,
		method_heading_highlight: c.methodHighlight,
		method_heading_after: c.methodAfter,
		method_text: c.methodText,
		method_image_alt: c.methodImageAlt,
		lessons_eyebrow: c.lessonsEyebrow,
		lessons_heading: c.lessonsHeading,
		lessons_steps: c.lessonsSteps.map(({ title, text }) => ({ title, text })),
		split1_heading_before: c.split1Before,
		split1_heading_highlight: c.split1Highlight,
		split1_heading_after: c.split1After,
		split1_paragraph_1: c.split1Text1,
		split1_paragraph_2: c.split1Text2,
		split1_image_alt: c.split1ImageAlt,
		split1_image_label: c.split1ImageLabel,
		split2_heading_before: c.split2Before,
		split2_heading_highlight: c.split2Highlight,
		split2_heading_after: c.split2After,
		split2_paragraph_1: c.split2Text1,
		// courses/index.astro reads this as newline-separated text.
		split2_list_items: c.split2List.join("\n"),
		split2_image_alt: c.split2ImageAlt,
		split2_image_label: c.split2ImageLabel,
	};
}

function pricingData() {
	const c = arCopy.pricing;
	return {
		eyebrow: c.eyebrow,
		heading: c.heading,
		lead: c.lead,
		cancel_note: c.cancelNote,
		billing_note: c.note,
		faq_heading: c.faqHeading,
		cta_heading: c.ctaHeading,
		cta_text: c.ctaText,
		hero_heading_before: c.headingBefore,
		hero_heading_highlight: c.headingHighlight,
		hero_heading_after: c.headingAfter,
		hero_image_alt: c.heroImageAlt,
		hero_badge: c.heroBadge,
		hero_chips: c.heroChips.map((label) => ({ label })),
		includes_eyebrow: c.includesEyebrow,
		includes_heading: c.includesHeading,
		includes_lead: c.includesLead,
		includes_items: c.includesItems.map((label) => ({ label })),
	};
}

function contactData() {
	const c = arCopy.contact;
	return {
		eyebrow: c.eyebrow,
		heading: c.heading,
		lead: c.lead,
		hero_heading_before: c.headingBefore,
		hero_heading_highlight: c.headingHighlight,
		hero_heading_after: c.headingAfter,
		hero_image_alt: c.heroImageAlt,
		hero_badge: c.heroBadge,
		hero_chips: c.heroChips.map((label) => ({ label })),
		next_eyebrow: c.nextEyebrow,
		next_heading: c.nextHeading,
		next_steps: c.nextSteps.map(({ title, text }) => ({ title, text })),
		assurance_heading: c.assuranceHeading,
		assurance_text: c.assuranceText,
		assurance_chips: c.assuranceChips.map((label) => ({ label })),
	};
}

function faqData() {
	const c = arCopy.faq;
	return {
		eyebrow: c.eyebrow,
		heading: c.heading,
		lead: c.lead,
		// faq.astro falls back to the UI dictionary for the closing CTA.
		cta_heading: arUi.home.book_heading,
		cta_text: arUi.home.book_form_sub,
		hero_heading_before: c.headingBefore,
		hero_heading_highlight: c.headingHighlight,
		hero_heading_after: c.headingAfter,
		hero_image_alt: c.heroImageAlt,
		hero_badge: c.heroBadge,
		facts_items: c.factsItems.map((label) => ({ label })),
		more_text: c.moreText,
	};
}

const PAGE_COLLECTIONS = [
	{ collection: "about_page", slug: "about", copy: arCopy.about, build: aboutData },
	{ collection: "courses_page", slug: "courses", copy: arCopy.courses, build: coursesData },
	{ collection: "pricing_page", slug: "pricing", copy: arCopy.pricing, build: pricingData },
	{ collection: "contact_page", slug: "contact-us", copy: arCopy.contact, build: contactData },
	{ collection: "faq_page", slug: "faq", copy: arCopy.faq, build: faqData },
];

const SNAPSHOT_COLLECTIONS = [
	"home_page",
	...PAGE_COLLECTIONS.map((p) => p.collection),
	"pages",
];

// ---------------------------------------------------------------------------
// Snapshots and assertions
// ---------------------------------------------------------------------------

const report = {
	startedAt: new Date().toISOString(),
	target: baseUrl,
	dryRun,
	actions: [],
	flags: [],
	assertions: [],
};

function logAction(step, detail) {
	report.actions.push({ step, ...detail });
}
function flag(message) {
	report.flags.push(message);
	console.warn(`  FLAG: ${message}`);
}
function assert(ok, message) {
	report.assertions.push({ ok, message });
	if (!ok) throw new Error(`ASSERTION FAILED: ${message}`);
	console.log(`  assert ok: ${message}`);
}

async function snapshot(label) {
	const snap = {};
	for (const collection of SNAPSHOT_COLLECTIONS) {
		snap[collection] = {};
		for (const locale of ["en", "ar"]) {
			const items = await listEntries(collection, locale);
			snap[collection][locale] = items.map((e) => ({
				id: e.id,
				slug: e.slug,
				status: e.status,
				locale: e.locale,
				translationGroup: e.translationGroup,
				data: e.data ?? {},
				seo: e.seo ?? null,
			}));
		}
	}
	report[label] = snap;
	return snap;
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log(`Target: ${baseUrl}${dryRun ? " (DRY RUN, no writes)" : ""}`);

	// --- 1. English reference export (local dev instance) -------------------
	console.log("\n[1] English reference export");
	let refHome;
	if (local) {
		refHome = await getEntry("home_page", "home", "en");
	} else {
		const auth = await fetch(`${DEV_URL}/_emdash/api/auth/dev-bypass`, {
			signal: AbortSignal.timeout(30000),
		});
		if (!auth.ok) {
			console.error(`Dev server not reachable at ${DEV_URL} (HTTP ${auth.status}). Run \`pnpm dev\` first.`);
			process.exit(1);
		}
		const cookie = (auth.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
		const res = await fetch(`${DEV_URL}/_emdash/api/content/home_page/home?locale=en`, {
			headers: { Cookie: cookie, "X-EmDash-Request": "1" },
			signal: AbortSignal.timeout(60000),
		});
		const json = await res.json();
		refHome = json?.data?.item ?? null;
	}
	if (!refHome) {
		console.error("Local EN home_page/home not found. Seed the dev database first.");
		process.exit(1);
	}
	const localRef = refHome.data ?? {};
	const refArabic = Object.entries(localRef).filter(([, v]) => hasArabic(v)).map(([k]) => k);
	if (refArabic.length > 0) {
		console.error(`Local EN reference contains Arabic in: ${refArabic.join(", ")}. Aborting.`);
		process.exit(1);
	}
	console.log(`  local EN home: ${Object.keys(localRef).length} fields, 0 Arabic`);

	const before = await snapshot("before");

	// --- 2. Repair the EN home ----------------------------------------------
	console.log("\n[2] Repair EN home_page/home");
	const homeFields = (await listFields("home_page")).map((f) => f.slug);
	const enHome = await getEntry("home_page", "home", "en");
	assert(enHome !== null, "EN home entry exists");
	const enBefore = before.home_page.en.find((e) => e.slug === "home");

	const patch = {};
	const keptArabic = [];
	const replaced = [];
	const keys = new Set([...homeFields, ...Object.keys(enHome.data ?? {})]);
	for (const key of keys) {
		const current = enHome.data?.[key];
		if (hasArabic(current)) {
			const ref = nonEmptyString(localRef[key]) ?? nonEmptyString(seedHomeEn[key]);
			if (ref !== undefined && !hasArabic(ref)) {
				patch[key] = ref;
				replaced.push(key);
			} else {
				keptArabic.push(key);
				flag(`EN home.${key}: Arabic value has no English reference, kept as-is`);
			}
		} else if (current && typeof current === "object" && !Array.isArray(current)) {
			// Image object: keep the owner's media, repair only Arabic alt/caption.
			const refImage = localRef[key] ?? seedHomeEn[key];
			const fixed = { ...current };
			let changed = false;
			for (const textKey of ["alt", "caption"]) {
				if (hasArabic(current[textKey])) {
					const refText = nonEmptyString(refImage?.[textKey]);
					if (refText !== undefined && !hasArabic(refText)) {
						fixed[textKey] = refText;
						changed = true;
					} else {
						keptArabic.push(`${key}.${textKey}`);
						flag(`EN home.${key}.${textKey}: Arabic text has no English reference, kept as-is`);
					}
				}
			}
			if (changed) {
				patch[key] = fixed;
				replaced.push(key);
			}
		}
	}
	console.log(`  ${replaced.length} Arabic field(s) to replace, ${keptArabic.length} kept, ${keys.size - replaced.length - keptArabic.length} untouched`);
	for (const key of replaced) {
		const from = typeof enHome.data[key] === "string" ? enHome.data[key] : JSON.stringify(enHome.data[key]);
		const to = typeof patch[key] === "string" ? patch[key] : JSON.stringify(patch[key]);
		console.log(`    ${key}: ${JSON.stringify(from.slice(0, 40))} -> ${JSON.stringify(to.slice(0, 60))}`);
	}
	if (Object.keys(patch).length > 0) {
		if (!dryRun) {
			await writeWithLockRetry("PUT", `/_emdash/api/content/home_page/${enHome.id}`, { data: patch });
			await writeWithLockRetry("POST", `/_emdash/api/content/home_page/${enHome.id}/publish`, {});
		}
		logAction("repair-en-home", { replaced, keptArabic, published: true });
		console.log(`  ${dryRun ? "would replace + publish" : "replaced + published"}: home_page/home (en)`);
	} else {
		console.log("  skip: no Arabic values in EN home");
		logAction("repair-en-home", { replaced: [], keptArabic, published: false });
	}

	// --- 3. Publish the AR home draft unchanged ------------------------------
	console.log("\n[3] Publish AR home_page/home");
	const arHome = await getEntry("home_page", "home", "ar");
	let arHomeData = null;
	if (!arHome) {
		flag("AR home entry missing: /ar/ keeps the bundled Arabic copy");
		logAction("publish-ar-home", { skipped: "missing" });
	} else {
		arHomeData = arHome.data ?? {};
		if (arHome.status === "published") {
			console.log("  skip: AR home already published");
			logAction("publish-ar-home", { skipped: "already-published" });
		} else {
			if (!dryRun) {
				await writeWithLockRetry("POST", `/_emdash/api/content/home_page/${arHome.id}/publish`, {});
			}
			logAction("publish-ar-home", { id: arHome.id, statusBefore: arHome.status });
			console.log(`  ${dryRun ? "would publish" : "published"}: home_page/home (ar), data unchanged`);
		}
	}

	// --- 4. AR page entries ---------------------------------------------------
	console.log("\n[4] AR page entries");
	const coverage = {};
	for (const { collection, slug, copy, build } of PAGE_COLLECTIONS) {
		const fields = await listFields(collection);
		const fieldSlugs = new Set(fields.map((f) => f.slug));
		const imageFields = new Set(fields.filter((f) => f.type === "image").map((f) => f.slug));
		const mapped = build({ arHome: arHomeData });
		const unmapped = [...fieldSlugs].filter((s) => !(s in mapped) && !imageFields.has(s));
		const notInSchema = Object.keys(mapped).filter((s) => !fieldSlugs.has(s));
		coverage[collection] = {
			schemaFields: fieldSlugs.size,
			mapped: Object.keys(mapped).filter((s) => fieldSlugs.has(s)).length,
			imageFieldsSkipped: [...imageFields],
			unmapped,
			mappedNotInSchema: notInSchema,
		};
		if (unmapped.length > 0) {
			flag(`${collection}: unmapped field(s) keep the bundled AR fallback: ${unmapped.join(", ")}`);
		}
		if (notInSchema.length > 0) {
			console.log(`  note: ${collection} mapping key(s) not in schema, skipped: ${notInSchema.join(", ")}`);
		}

		// Only send keys the live schema actually has.
		const data = {};
		for (const [key, value] of Object.entries(mapped)) {
			if (fieldSlugs.has(key) && !imageFields.has(key)) data[key] = value;
		}

		const enEntry = await getEntry(collection, slug, "en");
		if (!enEntry) {
			flag(`${collection}/${slug}: EN entry missing, cannot link AR translation`);
			continue;
		}
		const existing = await getEntry(collection, slug, "ar");
		if (!existing) {
			if (!dryRun) {
				const created = await api("POST", `/_emdash/api/content/${collection}`, {
					slug,
					locale: "ar",
					translationOf: enEntry.id,
					data,
					seo: { title: copy.title, description: copy.description },
				});
				const createdId = created?.data?.item?.id ?? created?.data?.id;
				await writeWithLockRetry("POST", `/_emdash/api/content/${collection}/${createdId}/publish`, {});
			}
			logAction("create-ar-entry", { collection, slug, fields: Object.keys(data).length });
			console.log(`  ${dryRun ? "would create" : "created"} + published: ${collection}/${slug} (ar, ${Object.keys(data).length} fields)`);
		} else {
			const fill = {};
			for (const [key, value] of Object.entries(data)) {
				if (!isEmpty(value) && isEmpty(existing.data?.[key])) fill[key] = value;
			}
			const seoFill = {};
			if (!nonEmptyString(existing.seo?.title)) seoFill.title = copy.title;
			if (!nonEmptyString(existing.seo?.description)) seoFill.description = copy.description;
			if (Object.keys(fill).length === 0 && Object.keys(seoFill).length === 0) {
				console.log(`  skip: ${collection}/${slug} (ar) already complete`);
				logAction("fill-ar-entry", { collection, slug, filled: 0 });
			} else {
				if (!dryRun) {
					const body = {};
					if (Object.keys(fill).length > 0) body.data = fill;
					if (Object.keys(seoFill).length > 0) body.seo = seoFill;
					await writeWithLockRetry("PUT", `/_emdash/api/content/${collection}/${existing.id}`, body);
					await writeWithLockRetry("POST", `/_emdash/api/content/${collection}/${existing.id}/publish`, {});
				}
				logAction("fill-ar-entry", { collection, slug, filled: Object.keys(fill).length });
				console.log(`  ${dryRun ? "would fill" : "filled"} ${Object.keys(fill).length} empty field(s) + published: ${collection}/${slug} (ar)`);
			}
		}

		// Coverage assertion: every mapped field must now hold its value.
		// Intentionally empty copy (e.g. headingAfter "") stays empty.
		if (!dryRun) {
			const after = await getEntry(collection, slug, "ar");
			const missing = Object.keys(data).filter(
				(key) => !isEmpty(data[key]) && isEmpty(after?.data?.[key]),
			);
			assert(missing.length === 0, `${collection}/${slug} (ar): all ${Object.keys(data).length} mapped fields filled${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`);
		}
	}
	report.coverage = coverage;

	// --- 5. Legacy cleanup -----------------------------------------------------
	console.log("\n[5] Legacy Legal Pages cleanup (soft delete)");
	const deleted = [];
	for (const slug of ["home", "about"]) {
		for (const locale of ["en", "ar"]) {
			const entry = await getEntry("pages", slug, locale);
			if (!entry) {
				console.log(`  skip: pages/${slug} (${locale}) absent`);
				continue;
			}
			if (!dryRun) {
				await writeWithLockRetry("DELETE", `/_emdash/api/content/pages/${entry.id}`);
			}
			deleted.push({ slug, locale, id: entry.id });
			logAction("soft-delete-legacy", { collection: "pages", slug, locale, id: entry.id });
			console.log(`  ${dryRun ? "would soft-delete" : "soft-deleted"}: pages/${slug} (${locale})`);
		}
	}

	// --- After snapshot + safety assertions ------------------------------------
	if (!dryRun) {
		console.log("\n[6] After snapshot + assertions");
		const after = await snapshot("after");

		const expectedGone = new Set(deleted.map((d) => `pages/${d.slug}/${d.locale}`));
		for (const collection of SNAPSHOT_COLLECTIONS) {
			for (const locale of ["en", "ar"]) {
				const beforeItems = before[collection][locale];
				const afterItems = after[collection][locale];
				const afterIds = new Set(afterItems.map((e) => e.id));
				for (const item of beforeItems) {
					if (expectedGone.has(`${collection}/${item.slug}/${locale}`)) continue;
					assert(afterIds.has(item.id), `${collection} (${locale}): entry ${item.slug} still present`);
				}
			}
		}

		// EN home: non-Arabic values preserved, repaired values landed.
		const enHomeAfter = after.home_page.en.find((e) => e.slug === "home");
		for (const [key, value] of Object.entries(enBefore.data)) {
			if (key in patch) {
				assert(deepEqual(enHomeAfter.data[key], patch[key]), `EN home.${key}: repaired value landed`);
			} else {
				assert(deepEqual(enHomeAfter.data[key], value), `EN home.${key}: non-Arabic value unchanged`);
			}
		}
		const stillArabic = Object.entries(enHomeAfter.data)
			.filter(([, v]) => hasArabic(v))
			.map(([k]) => k);
		assert(
			stillArabic.every((k) => keptArabic.includes(k)),
			`EN home: no unexpected Arabic remains (${stillArabic.length} kept field(s) flagged)`,
		);

		// AR home: published as-is.
		if (arHome) {
			const arHomeAfter = after.home_page.ar.find((e) => e.slug === "home");
			assert(arHomeAfter?.status === "published", "AR home is published");
			assert(deepEqual(arHomeAfter?.data, arHome.data), "AR home data published unchanged");
		}

		// EN page entries and legal pages: never written by this script.
		for (const { collection } of PAGE_COLLECTIONS) {
			const beforeEn = before[collection].en;
			const afterEn = after[collection].en;
			assert(deepEqual(beforeEn, afterEn), `${collection} (en): untouched`);
		}
		for (const locale of ["en", "ar"]) {
			const legalBefore = before.pages[locale].filter((e) => !["home", "about"].includes(e.slug));
			const legalAfter = after.pages[locale].filter((e) => !["home", "about"].includes(e.slug));
			assert(deepEqual(legalBefore, legalAfter), `pages legal entries (${locale}): untouched`);
		}

		// Counts: AR page entries additive, legacy rows gone.
		for (const { collection, slug } of PAGE_COLLECTIONS) {
			const had = before[collection].ar.some((e) => e.slug === slug);
			const has = after[collection].ar.some((e) => e.slug === slug);
			assert(has, `${collection}/${slug} (ar): entry exists after run`);
			if (!had) {
				assert(
					after[collection].ar.length === before[collection].ar.length + 1,
					`${collection} (ar): exactly one entry added`,
				);
			}
		}
	} else {
		console.log("\n[6] Dry run: skipping after snapshot and write assertions");
	}

	// --- Report -----------------------------------------------------------------
	const stamp = report.startedAt.replace(/[:.]/g, "-");
	const outDir = fileURLToPath(new URL("../.tmp-locale-repair/", import.meta.url));
	mkdirSync(outDir, { recursive: true });
	const outPath = join(outDir, `fix-prod-locales-${stamp}.json`);
	report.finishedAt = new Date().toISOString();
	writeFileSync(outPath, JSON.stringify(report, null, 2));

	console.log("\n=== Summary ===");
	console.log(`  EN home fields replaced: ${replaced.length} (kept/flagged: ${keptArabic.length})`);
	console.log(`  AR home: ${arHome ? (arHome.status === "published" ? "already published" : "published") : "MISSING (flagged)"}`);
	for (const { collection, slug } of PAGE_COLLECTIONS) {
		const action = report.actions.find(
			(a) => (a.step === "create-ar-entry" || a.step === "fill-ar-entry") && a.collection === collection,
		);
		console.log(`  ${collection}/${slug} (ar): ${action ? (action.step === "create-ar-entry" ? `created (${action.fields} fields)` : `filled ${action.filled} field(s)`) : "skipped"}`);
	}
	console.log(`  Legacy rows soft-deleted: ${deleted.length}`);
	console.log(`  Flags: ${report.flags.length}`);
	console.log(`  Report + snapshots: ${outPath}`);
	console.log(dryRun ? "\nDry run complete. Re-run without --dry-run to apply." : "\nDone.");
}

main().catch((err) => {
	console.error("FAILED:", err.message);
	process.exit(1);
});
