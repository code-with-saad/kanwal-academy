import type { APIRoute } from "astro";
import { env as hostEnv } from "virtual:emdash/env";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

/** Best-effort per-isolate rate limit. D1 still enforces a unique email. */
const attempts = new Map<string, { count: number; resetAt: number }>();

const respond = (body: { ok: boolean; message: string }, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});

const rateLimited = (key: string) => {
	const now = Date.now();
	if (attempts.size > 500) {
		for (const [entryKey, entry] of attempts) {
			if (entry.resetAt <= now) attempts.delete(entryKey);
		}
	}
	const current = attempts.get(key);
	if (!current || current.resetAt <= now) {
		attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return false;
	}
	current.count += 1;
	return current.count > RATE_LIMIT;
};

let schemaReady: Promise<void> | null = null;

const ensureTable = async (db: D1Database) => {
	schemaReady ??= db
		.prepare(
			`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				email TEXT NOT NULL UNIQUE,
				source TEXT NOT NULL DEFAULT 'website',
				created_at TEXT NOT NULL DEFAULT (datetime('now'))
			)`,
		)
		.run()
		.then(() => undefined)
		.catch((error: unknown) => {
			schemaReady = null;
			throw error;
		});
	return schemaReady;
};

const verifyTurnstile = async (secret: string, token: string, ip: string | null) => {
	if (!token) return false;
	const body = new URLSearchParams({ secret, response: token });
	if (ip) body.set("remoteip", ip);
	const response = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{ method: "POST", body },
	);
	if (!response.ok) return false;
	const result = (await response.json()) as { success?: boolean };
	return result.success === true;
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
	let payload: { email?: unknown; website?: unknown; turnstileToken?: unknown };
	try {
		payload = await request.json();
	} catch {
		return respond({ ok: false, message: "Send the form as JSON." }, 400);
	}

	// Honeypot: accept silently so bots do not learn the trap.
	if (typeof payload.website === "string" && payload.website.trim() !== "") {
		return respond({ ok: true, message: "You are on the list. JazakAllah khair." });
	}

	const email =
		typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
	if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
		return respond({ ok: false, message: "Enter a valid email address." }, 400);
	}

	let ip: string | null = null;
	try {
		ip = clientAddress ?? null;
	} catch {
		ip = null;
	}
	if (rateLimited(ip ?? "unknown")) {
		return respond(
			{ ok: false, message: "Too many attempts. Please try again in a few minutes." },
			429,
		);
	}

	const env = hostEnv as Record<string, unknown> | undefined;
	const secret = String(env?.TURNSTILE_SECRET_KEY ?? "").trim();
	if (secret) {
		const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
		const passed = await verifyTurnstile(secret, token, ip);
		if (!passed) {
			return respond(
				{ ok: false, message: "The security check did not pass. Please try again." },
				400,
			);
		}
	}

	const db = env?.DB as D1Database | undefined;
	if (!db) {
		return respond(
			{ ok: false, message: "Subscriptions are unavailable right now. Please try again later." },
			503,
		);
	}

	try {
		await ensureTable(db);
		await db
			.prepare(
				"INSERT OR IGNORE INTO newsletter_subscribers (email, source) VALUES (?, ?)",
			)
			.bind(email, "website")
			.run();
		return respond({ ok: true, message: "You are on the list. JazakAllah khair." });
	} catch {
		return respond(
			{ ok: false, message: "We could not save your email. Please try again." },
			500,
		);
	}
};
