// Read-only audit: live nav hrefs + language state of every page collection.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
const URL = "https://kanwalquranacademy.com";
const auth = JSON.parse(readFileSync(`${homedir()}/.config/emdash/auth.json`, "utf8"));
const cred = Array.isArray(auth) ? auth.find((c) => c.url === URL) : auth[URL] ?? auth.sites?.[URL] ?? auth.credentials?.[URL];
const headers = { Authorization: `Bearer ${cred.accessToken}` };
const AR = /[؀-ۿ]/;

const res = await fetch(`${URL}/`, { signal: AbortSignal.timeout(30000) });
const h = await res.text();
const navStart = h.indexOf('class="header__nav');
const nav = h.slice(navStart, h.indexOf("header__end", navStart));
console.log("LIVE HEADER NAV:", JSON.stringify(nav.match(/href="[^"]*"/g)));
const foot = h.slice(h.indexOf('id="footer-academy"'));
console.log("LIVE FOOTER ABOUT:", JSON.stringify(foot.match(/href="[^"]*about[^"]*"/g)));

async function api(path) {
	const r = await fetch(`${URL}${path}`, { headers, signal: AbortSignal.timeout(30000) });
	if (!r.ok) return null;
	return r.json();
}
for (const coll of ["home_page", "about_page", "courses_page", "pricing_page", "contact_page", "faq_page", "courses", "plans", "teachers", "testimonials", "faqs", "site_settings"]) {
	for (const locale of ["en", "ar"]) {
		const data = await api(`/_emdash/api/content/${coll}?locale=${locale}&limit=10`);
		const items = data?.data?.items ?? [];
		if (items.length === 0) { console.log(`${coll} ${locale}: NO ENTRY`); continue; }
		const e = items[0];
		if (items.length > 1) {
			let ar = 0, en = 0, tot = 0;
			for (const it of items) for (const v of Object.values(it.data ?? {})) if (typeof v === "string" && v) { tot++; if (AR.test(v)) ar++; else if (/[a-zA-Z]{3,}/.test(v)) en++; }
			console.log(`${coll} ${locale}: ${items.length} entries, string fields=${tot} arabic=${ar} english=${en}`);
			continue;
		}
		const keys = Object.keys(e.data ?? {});
		const filled = keys.filter((k) => e.data[k] !== null && e.data[k] !== "" && e.data[k] !== undefined);
		const arabic = filled.filter((k) => typeof e.data[k] === "string" && AR.test(e.data[k]));
		const english = filled.filter((k) => typeof e.data[k] === "string" && !AR.test(e.data[k]) && /[a-zA-Z]{3,}/.test(e.data[k]));
		console.log(`${coll} ${locale}: slug=${e.slug} status=${e.status ?? "?"} fields=${keys.length} filled=${filled.length} arabic=${arabic.length} english=${english.length}`);
		console.log(`   hero: ${JSON.stringify(String(e.data?.hero_heading_before ?? e.data?.heading ?? "").slice(0, 60))}`);
		if (locale === "en" && arabic.length > 0) console.log(`   arabic fields: ${arabic.slice(0, 12).join(", ")}${arabic.length > 12 ? "…" : ""}`);
	}
}