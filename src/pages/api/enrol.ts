/**
 * POST /api/enrol
 *
 * One server route for both forms on the site:
 *
 *   { type: "enrolment" }   the inline free-trial form in the #book section
 *   { type: "newsletter" }  the footer newsletter field (store only, no emails)
 *
 * Security layers (in order):
 *   1. Zod schema validation.
 *   2. Honeypot field: silent accept so bots learn nothing.
 *   3. Per-IP rate limit (hashed, stored in D1): 5 per hour per form type.
 *   4. Cloudflare Turnstile verification (skipped when no secret is set).
 *
 * Enrolment success path:
 *   - The lead is saved FIRST into the EmDash `enrolments` collection
 *     (ec_enrolments table).
 *   - The owner notification is sent SECOND through the EmailJS REST API.
 *     If the email fails the request still returns success and only a
 *     generic error is logged. Personal data is never logged.
 *   - Recipient address: site_settings.owner_email, fallback env OWNER_EMAIL.
 *
 * Newsletter success path:
 *   - The address is stored in the EmDash `subscribers` collection
 *     (ec_subscribers) with status "active". Duplicates are accepted
 *     silently. No email of any kind is sent.
 */

import type { APIRoute } from "astro";
import { z } from "zod";
import { env as hostEnv } from "virtual:emdash/env";
import { getEmDashEntry } from "emdash";

export const prerender = false;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const EnrolmentSchema = z.object({
	type: z.literal("enrolment").optional().default("enrolment"),
	name: z.string().min(2, "Please enter your name.").max(120),
	email: z.email("Enter a valid email address.").max(254),
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

const NewsletterSchema = z.object({
	type: z.literal("newsletter"),
	email: z.email("Enter a valid email address.").max(254),
	turnstileToken: z.string().max(2048).optional().default(""),
	website: z.string().optional().default(""), // honeypot
});

const BodySchema = z.union([NewsletterSchema, EnrolmentSchema]);

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
// D1 rate limiting (hashed IP + form type, 5 per hour)
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
// EmDash content tables
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

/**
 * INSERT into `ec_<collection>` mirroring the columns and defaults EmDash
 * writes on its own create path (ulid id, version 1, locale en, translation
 * group = id, published status), so rows show up in the admin like any other
 * entry of the collection. `status` and `created_at` are reserved EmDash
 * column names, which is why the subscriber fields are called
 * `subscriber_status` and `subscribed_at`.
 */

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
	const now = new Date().toISOString();
	const id = generateUlid();

	await db
		.prepare(
			`INSERT INTO ec_enrolments (
				id, slug, status, author_id, primary_byline_id,
				created_at, updated_at, published_at, version, locale, translation_group,
				name, email, phone, course, plan, message, submitted_at, lead_status
			) VALUES (?, NULL, 'published', NULL, NULL, ?, ?, ?, 1, 'en', ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
		)
		.bind(
			id,
			now,
			now,
			now,
			id,
			data.name,
			data.email,
			data.phone,
			data.course,
			data.plan,
			data.message,
			now,
		)
		.run();
}

/** Returns false when the address is already stored (duplicates accepted silently). */
async function saveSubscriber(db: D1Database, email: string): Promise<boolean> {
	const existing = await db
		.prepare(
			`SELECT 1 AS hit FROM ec_subscribers WHERE lower(email) = lower(?) AND deleted_at IS NULL LIMIT 1`,
		)
		.bind(email)
		.first();
	if (existing) return false;

	const now = new Date().toISOString();
	const id = generateUlid();

	await db
		.prepare(
			`INSERT INTO ec_subscribers (
				id, slug, status, author_id, primary_byline_id,
				created_at, updated_at, published_at, version, locale, translation_group,
				email, subscriber_status, subscribed_at
			) VALUES (?, NULL, 'published', NULL, NULL, ?, ?, ?, 1, 'en', ?, ?, 'active', ?)`,
		)
		.bind(id, now, now, now, id, email, now)
		.run();
	return true;
}

// ---------------------------------------------------------------------------
// Owner notification via the EmailJS REST API (server-side call)
// ---------------------------------------------------------------------------

/**
 * EmailJS needs: service template configured with {{to_email}} in the
 * "To" field and {{reply_to}} in "Reply to". Calls from outside a browser
 * authenticate with the private key (accessToken); the public key alone is
 * origin-checked against the dashboard's allowed-origin list.
 */
async function sendOwnerEmail(opts: {
	serviceId: string;
	templateId: string;
	publicKey: string;
	privateKey: string;
	toEmail: string;
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
	const { serviceId, templateId, publicKey, privateKey, toEmail, lead } = opts;

	const payload: Record<string, unknown> = {
		service_id: serviceId,
		template_id: templateId,
		user_id: publicKey,
		template_params: {
			name: lead.name,
			email: lead.email,
			phone: lead.phone,
			course: lead.course,
			plan: lead.plan,
			message: lead.message,
			time: lead.time,
			to_email: toEmail,
			reply_to: lead.email,
		},
	};
	if (privateKey) payload.accessToken = privateKey;

	const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`EmailJS ${res.status}: ${body.slice(0, 120)}`);
	}
}

/** Escape a value for the plain-text notification lines. */
function oneLine(s: string): string {
	return s.replace(/\s+/g, " ").trim().slice(0, 2000);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const POST: APIRoute = async ({ request, clientAddress }) => {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, message: "Could not parse request." }, 400);
	}

	const parsed = BodySchema.safeParse(raw);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		const field = first?.path?.[0];
		return json(
			{
				ok: false,
				message:
					first && "message" in first && typeof first.message === "string"
						? first.message
						: "Please check your entries and try again.",
				field: typeof field === "string" ? field : undefined,
			},
			400,
		);
	}

	const isNewsletter = parsed.data.type === "newsletter";

	// Honeypot: return success silently so bots learn nothing.
	if (parsed.data.website.trim() !== "") {
		return json({
			ok: true,
			message: isNewsletter
				? "You are on the list. JazakAllah khair."
				: "Thank you. We will be in touch soon.",
		});
	}

	const env = hostEnv as Record<string, unknown> | undefined;
	const db = env?.DB as D1Database | undefined;

	if (!db) {
		return json({ ok: false, message: "Service unavailable. Please email us directly." }, 503);
	}

	// Rate limit: attempts are counted per hashed IP and form type. Only a
	// verified attempt is recorded, so a failed Turnstile challenge does not
	// burn the visitor's quota.
	let ip: string | null = null;
	try {
		ip = clientAddress ?? null;
	} catch {
		ip = null;
	}

	const bucket = isNewsletter ? "newsletter" : "enrolment";
	const rateKey = await hashIp(`${ip ?? "unknown"}:${bucket}`).catch(() => `unknown:${bucket}`);
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
		return json({ ok: false, message: "Too many attempts. Please try again in an hour." }, 429);
	}

	// Turnstile
	const tsSecret = String(env?.TURNSTILE_SECRET_KEY ?? "").trim();
	if (tsSecret) {
		const passed = await verifyTurnstile(tsSecret, parsed.data.turnstileToken, ip);
		if (!passed) {
			return json({ ok: false, message: "The security check failed. Please try again." }, 400);
		}
	}

	// Record the attempt now that it is a real submission.
	await recordAttempt(db, rateKey).catch(() => {});

	// ------------------------------------------------------------------
	// Newsletter: store only. No email is sent to anyone.
	// ------------------------------------------------------------------
	if (isNewsletter) {
		const email = parsed.data.email;
		try {
			await saveSubscriber(db, email);
		} catch {
			return json(
				{ ok: false, message: "We could not save your email. Please try again." },
				500,
			);
		}
		return json({ ok: true, message: "You are on the list. JazakAllah khair." });
	}

	// ------------------------------------------------------------------
	// Enrolment: save the lead first, email second.
	// ------------------------------------------------------------------
	if (parsed.data.type !== "enrolment") {
		return json({ ok: false, message: "Invalid request type." }, 400);
	}

	const { name, email, phone, course, plan, message } = parsed.data;

	try {
		await saveEnrolment(db, { name, email, phone, course, plan, message });
	} catch {
		return json(
			{ ok: false, message: "Could not save your request. Please try again." },
			500,
		);
	}

	// Owner notification through EmailJS (best effort; failure does not block
	// the success response and is only logged generically).
	const serviceId = String(env?.EMAILJS_SERVICE_ID ?? "").trim();
	const templateId = String(env?.EMAILJS_TEMPLATE_ID ?? "").trim();
	const publicKey = String(env?.EMAILJS_PUBLIC_KEY ?? "").trim();
	const privateKey = String(env?.EMAILJS_PRIVATE_KEY ?? "").trim();

	if (serviceId && templateId && publicKey) {
		// Resolve the recipient: site_settings.owner_email -> OWNER_EMAIL env.
		let ownerEmail = String(env?.OWNER_EMAIL ?? "").trim();
		try {
			const { entry } = await getEmDashEntry("site_settings", "site");
			const settingsOwner = (entry?.data as { owner_email?: string } | undefined)
				?.owner_email?.trim();
			if (settingsOwner) ownerEmail = settingsOwner;
		} catch {
			// Settings lookup failure must not block the notification.
		}

		if (ownerEmail) {
			// Awaited on purpose: Cloudflare Workers can end the request context
			// as soon as the response is returned, which would kill a floating
			// promise and the email would silently never be sent.
			try {
				await sendOwnerEmail({
					serviceId,
					templateId,
					publicKey,
					privateKey,
					toEmail: ownerEmail,
					lead: {
						name: oneLine(name),
						email,
						phone,
						course: oneLine(course),
						plan: oneLine(plan),
						message: oneLine(message),
						time: new Date().toUTCString(),
					},
				});
			} catch (error) {
				// Email failure must not expose internals or block the success
				// response. The lead is already saved. Log only the EmailJS
				// status text, never the form contents.
				const reason = error instanceof Error ? error.message : "unknown error";
				console.error("[enrol] Owner notification failed:", reason.slice(0, 200));
			}
		}
	}

	return json({ ok: true, message: "Thank you. We will be in touch very soon." });
};
