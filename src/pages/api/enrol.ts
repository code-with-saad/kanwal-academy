/**
 * POST /api/enrol
 *
 * Receives enrolment / free-trial leads from the modal form.
 *
 * Security layers (in order):
 *   1. Honeypot field: silent accept so bots learn nothing.
 *   2. Zod schema validation.
 *   3. Per-IP rate limit (hashed, stored in D1): 5 per hour.
 *   4. Cloudflare Turnstile verification (skipped when no secret is set).
 *
 * On success:
 *   - Saves lead to the EmDash `enrolments` collection via D1 directly
 *     (the collection schema stores the row; EmDash picks it up in admin).
 *   - Sends a notification email via Resend to the owner address from
 *     site_settings.owner_email, falling back to OWNER_EMAIL env var.
 *   - If email fails the lead is still saved and success is returned.
 *
 * Personal data is never logged.
 */

import type { APIRoute } from "astro";
import { z } from "zod";
import { env as hostEnv } from "virtual:emdash/env";
import { getEmDashEntry } from "emdash";

export const prerender = false;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const EnrolSchema = z.object({
	name: z.string().min(2).max(120),
	email: z.email().max(254),
	phone: z
		.string()
		.min(7, "Phone number is too short.")
		.max(20, "Phone number is too long.")
		.regex(/^\+[1-9]\d{6,14}$/, "Enter a valid phone number with country code."),
	course: z.string().max(120).optional().default(""),
	plan: z.string().max(120).optional().default(""),
	message: z.string().max(2000).optional().default(""),
	turnstileToken: z.string().max(2048).optional().default(""),
	website: z.string().optional().default(""), // honeypot
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const json = (body: { ok: boolean; message: string; field?: string }, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
	});

/** SHA-256 hex of the IP: we never store the raw address. */
async function hashIp(ip: string): Promise<string> {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function verifyTurnstile(
	secret: string,
	token: string,
	ip: string | null,
): Promise<boolean> {
	if (!token) return false;
	const body = new URLSearchParams({ secret, response: token });
	if (ip) body.set("remoteip", ip);
	try {
		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			body,
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

// ---------------------------------------------------------------------------
// D1 rate limiting (hashed IP, 5 per hour)
// ---------------------------------------------------------------------------

const RATE_LIMIT = 5;
const RATE_WINDOW_S = 3600; // 1 hour in seconds

let rateTableReady: Promise<void> | null = null;

const ensureRateTable = async (db: D1Database) => {
	rateTableReady ??= db
		.prepare(
			`CREATE TABLE IF NOT EXISTS enrol_rate (
				ip_hash TEXT NOT NULL,
				ts      INTEGER NOT NULL
			)`,
		)
		.run()
		.then(() => undefined)
		.catch((error: unknown) => {
			rateTableReady = null;
			throw error;
		});
	return rateTableReady;
};

const windowCount = async (db: D1Database, key: string, windowStart: number): Promise<number> => {
	await db
		.prepare(`DELETE FROM enrol_rate WHERE ip_hash = ? AND ts < ?`)
		.bind(key, windowStart)
		.run();
	const { results } = await db
		.prepare(`SELECT COUNT(*) AS cnt FROM enrol_rate WHERE ip_hash = ? AND ts >= ?`)
		.bind(key, windowStart)
		.all<{ cnt: number }>();
	return results[0]?.cnt ?? 0;
};

const recordAttempt = async (db: D1Database, key: string) => {
	await db
		.prepare(`INSERT INTO enrol_rate (ip_hash, ts) VALUES (?, ?)`)
		.bind(key, Math.floor(Date.now() / 1000))
		.run();
};

// ---------------------------------------------------------------------------
// Save lead to the EmDash enrolments collection
// ---------------------------------------------------------------------------

/** Minimal ULID generator (Crockford base32, 48-bit time + 80-bit randomness). */
function generateUlid(): string {
	const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	let time = Date.now();
	let timeChars = "";
	for (let i = 0; i < 10; i++) {
		timeChars = ENCODING[time % 32] + timeChars;
		time = Math.floor(time / 32);
	}
	const bytes = new Uint8Array(10);
	crypto.getRandomValues(bytes);
	let randomness = 0n;
	for (const b of bytes) randomness = (randomness << 8n) | BigInt(b);
	const randomChars = randomness.toString(2).padStart(80, "0").match(/.{5}/g) ?? [];
	let randomCharsJoined = "";
	for (const chunk of randomChars) randomCharsJoined += ENCODING[parseInt(chunk, 2)];
	return (timeChars + randomCharsJoined).slice(0, 26);
}

async function saveEnrolment(
	db: D1Database,
	data: {
		name: string;
		email: string;
		phone: string;
		course: string;
		plan: string;
		message: string;
	},
): Promise<void> {
	// EmDash stores content in per-collection tables (`ec_<slug>`) with one
	// column per field. This insert mirrors the columns and defaults EmDash
	// writes on its own create path (ulid id, version 1, locale, translation
	// group, published status) so the lead shows up in the admin like any
	// other entry of the collection.
	const now = new Date().toISOString();
	const id = generateUlid();
	const createdAt = now;

	await db
		.prepare(
			`INSERT INTO ec_enrolments (
				id, slug, status, author_id, primary_byline_id,
				created_at, updated_at, published_at, version, locale, translation_group,
				name, email, phone, course, plan, message, submitted_at, lead_status
			) VALUES (?, NULL, 'published', NULL, NULL, ?, ?, ?, 1, 'en', ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
		)
		.bind(id, createdAt, now, now, id, data.name, data.email, data.phone, data.course, data.plan, data.message, now)
		.run();
}

// ---------------------------------------------------------------------------
// Send owner notification via Resend
// ---------------------------------------------------------------------------

async function sendOwnerEmail(opts: {
	resendKey: string;
	ownerEmail: string;
	fromDomain: string;
	lead: {
		name: string;
		email: string;
		phone: string;
		course: string;
		plan: string;
		message: string;
		time: string;
	};
}): Promise<void> {
	const { resendKey, ownerEmail, fromDomain, lead } = opts;

	const lines = [
		`Name: ${lead.name}`,
		`Email: ${lead.email}`,
		`Phone: ${lead.phone}`,
		lead.plan ? `Plan: ${lead.plan}` : null,
		lead.course ? `Course: ${lead.course}` : null,
		lead.message ? `\nMessage:\n${lead.message}` : null,
		`\nSubmitted: ${lead.time}`,
	]
		.filter(Boolean)
		.join("\n");

	const html = [
		"<p>A new enrolment request was submitted on Kanwal Quran Academy.</p>",
		"<table>",
		`<tr><td><strong>Name</strong></td><td>${esc(lead.name)}</td></tr>`,
		`<tr><td><strong>Email</strong></td><td><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></td></tr>`,
		`<tr><td><strong>Phone</strong></td><td>${esc(lead.phone)}</td></tr>`,
		lead.plan
			? `<tr><td><strong>Plan</strong></td><td>${esc(lead.plan)}</td></tr>`
			: "",
		lead.course
			? `<tr><td><strong>Course</strong></td><td>${esc(lead.course)}</td></tr>`
			: "",
		"</table>",
		lead.message
			? `<p><strong>Message:</strong><br>${esc(lead.message).replace(/\n/g, "<br>")}</p>`
			: "",
		`<p style="color:#5A6C63;font-size:13px">Submitted: ${esc(lead.time)}</p>`,
	].join("");

	const payload = {
		from: `no-reply@${fromDomain}`,
		to: [ownerEmail],
		reply_to: lead.email,
		subject: `New enrolment request from ${lead.name}`,
		text: lines,
		html,
	};

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${resendKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Resend ${res.status}: ${body.slice(0, 120)}`);
	}
}

function esc(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, message: "Could not parse request." }, 400);
	}

	const parsed = EnrolSchema.safeParse(raw);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return json(
			{
				ok: false,
				message: first?.message ?? "Please check your entries and try again.",
				field: first?.path[0]?.toString(),
			},
			400,
		);
	}

	const { name, email, phone, course, plan, message, turnstileToken, website } = parsed.data;

	// Honeypot: return success silently so bots learn nothing.
	if (website.trim() !== "") {
		return json({ ok: true, message: "Thank you. We will be in touch soon." });
	}

	const env = hostEnv as Record<string, unknown> | undefined;
	const db = env?.DB as D1Database | undefined;

	if (!db) {
		return json(
			{ ok: false, message: "Service unavailable. Please email us directly." },
			503,
		);
	}

	// Rate limit: count attempts in the current window, but only record this
	// attempt once Turnstile has passed, so a failed challenge does not burn
	// the visitor's quota.
	let ip: string | null = null;
	try {
		ip = clientAddress ?? null;
	} catch {
		ip = null;
	}

	const rateKey = await hashIp(ip ?? "unknown").catch(() => "unknown");
	let rateLimited = true;
	try {
		await ensureRateTable(db);
		rateLimited =
			(await windowCount(db, rateKey, Math.floor(Date.now() / 1000) - RATE_WINDOW_S)) >=
			RATE_LIMIT;
	} catch {
		// If rate limiting fails we prefer availability over strictness.
		rateLimited = false;
	}
	if (rateLimited) {
		return json(
			{ ok: false, message: "Too many attempts. Please try again in an hour." },
			429,
		);
	}

	// Turnstile
	const tsSecret = String(env?.TURNSTILE_SECRET_KEY ?? "").trim();
	if (tsSecret) {
		const passed = await verifyTurnstile(tsSecret, turnstileToken, ip);
		if (!passed) {
			return json(
				{ ok: false, message: "The security check failed. Please try again." },
				400,
			);
		}
	}

	// Record the attempt now that it is a real submission.
	await recordAttempt(db, rateKey).catch(() => {});

	// Save lead
	try {
		await saveEnrolment(db, { name, email, phone, course, plan, message });
	} catch {
		return json(
			{ ok: false, message: "Could not save your request. Please try again." },
			500,
		);
	}

	// Email owner (best-effort; failure does not block success response)
	const resendKey = String(env?.RESEND_API_KEY ?? "").trim();
	if (resendKey) {
		// Resolve owner email: site_settings.owner_email → OWNER_EMAIL env → site email
		let ownerEmail = String(env?.OWNER_EMAIL ?? "").trim();
		try {
			const { entry } = await getEmDashEntry("site_settings", "site");
			const settingsOwner = (entry?.data as { owner_email?: string } | undefined)
				?.owner_email?.trim();
			if (settingsOwner) ownerEmail = settingsOwner;
		} catch {
			// ignore
		}

		const fromDomain =
			url.hostname !== "localhost" && !url.hostname.startsWith("127.")
				? url.hostname
				: "kanwalquranacademy.com";

		if (ownerEmail) {
			sendOwnerEmail({
				resendKey,
				ownerEmail,
				fromDomain,
				lead: {
					name,
					email,
					phone,
					course,
					plan,
					message,
					time: new Date().toUTCString(),
				},
			}).catch(() => {
				// Email failure must not expose internals. Already saved the lead.
				console.error("[enrol] Owner notification email could not be sent.");
			});
		}
	}

	return json({ ok: true, message: "Thank you. We will be in touch very soon." });
};

