#!/usr/bin/env node
/**
 * EmailJS connectivity check (no dependencies).
 *
 * Reads EMAILJS_* values from .env (or the process environment) and sends one
 * test message through the same REST endpoint the site uses, so you can see
 * EmailJS's real answer instead of guessing.
 *
 * Usage:
 *   node scripts/test-emailjs.mjs --to hello@example.com
 *
 * Common answers:
 *   200  sent, check the inbox (and the spam folder)
 *   403  "API access from non-browser environments is currently disabled"
 *        -> EmailJS dashboard -> Account -> Security -> enable
 *           "Allow EmailJS API for non-browser applications"
 *   400  bad service/template id, or the template has no To/From set
 *   401  wrong public/private key pair
 */
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const arg = (name) => {
	const i = args.indexOf(name);
	return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};

// Minimal .env reader so the script works without dotenv.
const fileEnv = {};
if (existsSync(".env")) {
	for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
		const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) fileEnv[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
	}
}
const env = { ...fileEnv, ...process.env };

const serviceId = (env.EMAILJS_SERVICE_ID ?? "").trim();
const templateId = (env.EMAILJS_TEMPLATE_ID ?? "").trim();
const publicKey = (env.EMAILJS_PUBLIC_KEY ?? "").trim();
const privateKey = (env.EMAILJS_PRIVATE_KEY ?? "").trim();
const to = (arg("--to") ?? "hello@kanwalquranacademy.com").trim();

const missing = Object.entries({
	EMAILJS_SERVICE_ID: serviceId,
	EMAILJS_TEMPLATE_ID: templateId,
	EMAILJS_PUBLIC_KEY: publicKey,
	EMAILJS_PRIVATE_KEY: privateKey,
}).filter(([, v]) => !v);

if (missing.length) {
	console.error("Missing:", missing.map(([k]) => k).join(", "));
	process.exit(1);
}

const payload = {
	service_id: serviceId,
	template_id: templateId,
	user_id: publicKey,
	accessToken: privateKey,
	template_params: {
		name: "Kanwal Academy email test",
		email: "test@example.com",
		phone: "+923001234567",
		course: "Quran Recitation",
		plan: "Plan I",
		message: "Test message sent by scripts/test-emailjs.mjs",
		time: new Date().toUTCString(),
		to_email: to,
		reply_to: "test@example.com",
	},
};

console.log(`Sending test message to ${to} ...`);
const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(payload),
});
const body = await res.text();
console.log(`Status: ${res.status}`);
console.log(`Response: ${body.slice(0, 500) || "(empty)"}`);
process.exit(res.ok ? 0 : 1);
