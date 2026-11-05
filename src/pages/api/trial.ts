import type { APIRoute } from "astro";
import { env as hostEnv } from "virtual:emdash/env";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

/** Best-effort per-isolate rate limit. */
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
			`CREATE TABLE IF NOT EXISTS trial_requests (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				phone TEXT,
				course TEXT,
				plan TEXT,
				timezone TEXT,
				message TEXT,
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
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body,
	});
	if (!response.ok) return false;
	const result = (await response.json()) as { success?: boolean };
	return result.success === true;
};

const text = (value: unknown, max: number) =>
	typeof value === "string" ? value.trim().slice(0, max) : "";

export const POST: APIRoute = async ({ request, clientAddress }) => {
	let payload: Record<string, unknown>;
	try {
		payload = (await request.json()) as Record<string, unknown>;
	} catch {
		return respond({ ok: false, message: "Send the form as JSON." }, 400);
	}

	// Honeypot: accept silently so bots do not learn the trap.
	if (text(payload.website, 200) !== "") {
		return respond({ ok: true, message: "Your request is with us. JazakAllah khair." });
	}

	const name = text(payload.name, 120);
	const email = text(payload.email, 254).toLowerCase();
	const phone = text(payload.phone, 40);
	const course = text(payload.course, 120);
	const plan = text(payload.plan, 120);
	const timezone = text(payload.timezone, 120);
	const message = text(payload.message, 2000);

	if (name.length < 2) {
		return respond({ ok: false, message: "Enter the student's name." }, 400);
	}
	if (!email || !EMAIL_PATTERN.test(email)) {
		return respond({ ok: false, message: "Enter a valid email address." }, 400);
	}
	if (timezone.length < 2) {
		return respond({ ok: false, message: "Tell us your time zone or preferred times." }, 400);
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
		const token = text(payload.turnstileToken, 2048);
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
			{ ok: false, message: "Requests are unavailable right now. Please email us instead." },
			503,
		);
	}

	try {
		await ensureTable(db);
		await db
			.prepare(
				`INSERT INTO trial_requests (name, email, phone, course, plan, timezone, message)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(name, email, phone, course, plan, timezone, message)
			.run();
		return respond({
			ok: true,
			message: "Your trial request is with us. We will reply with the next available slot.",
		});
	} catch {
		return respond(
			{ ok: false, message: "We could not send your request. Please try again." },
			500,
		);
	}
};
