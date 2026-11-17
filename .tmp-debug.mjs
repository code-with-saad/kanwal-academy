import { readFileSync } from "node:fs";
import { homedir } from "node:os";
const URL = "https://kanwalquranacademy.com";
const auth = JSON.parse(readFileSync(`${homedir()}/.config/emdash/auth.json`, "utf8"));
const cred = Array.isArray(auth) ? auth.find((c) => c.url === URL) : auth[URL] ?? auth.sites?.[URL] ?? auth.credentials?.[URL];
console.log("token expiresAt:", cred?.expiresAt);
const headers = { Authorization: `Bearer ${cred.accessToken}` };
for (const path of ["/_emdash/api/content/home_page?locale=en&limit=10", "/_emdash/api/content/home_page?locale=ar&limit=10", "/_emdash/api/schema/collections"]) {
	const r = await fetch(`${URL}${path}`, { headers, signal: AbortSignal.timeout(30000) });
	const t = await r.text();
	console.log(path, "->", r.status, t.slice(0, 400));
}
const about = await fetch(`${URL}/about`, { signal: AbortSignal.timeout(30000), redirect: "manual" });
console.log("/about ->", about.status, about.headers.get("location"));
const home = await fetch(`${URL}/`, { signal: AbortSignal.timeout(30000) });
const h = await home.text();
console.log("any #about href in live home:", JSON.stringify(h.match(/href="[^"]*#about[^"]*"/g)));
console.log("live home hero h1:", JSON.stringify(h.match(/<h1[\s\S]{0,220}?<\/h1>/)?.[0]?.replace(/<[^>]+>/g, "").trim()));