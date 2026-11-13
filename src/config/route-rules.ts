/**
 * Route rules the Worker applies before Astro renders a page.
 *
 * Redirects and 410 responses live here instead of public/_redirects because
 * the site runs on Cloudflare Workers, not Pages, and the Worker must answer
 * these on every hostname. `src/middleware.ts` is the only consumer.
 *
 * Rules are matched on the locale-stripped path, so /ar/teachers follows the
 * same rule as /teachers and the redirect target is localized by the caller.
 */
import goneList from "../data/gone-urls.txt?raw";

/** Normalize a path for matching: no trailing slash (except the root). */
export function normalizeRoutePath(pathname: string): string {
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return path === "" ? "/" : path;
}

/** 301 targets, keyed by the normalized source path. */
const REDIRECTS: Record<string, string> = {
	"/teachers": "/about",
	"/contact": "/contact-us",
	"/free-trial": "/contact-us",
	"/our-story": "/about",
	"/blog": "/",
};

const GONE_EXACT = new Set<string>();
const GONE_PREFIXES: string[] = [];

for (const rawLine of goneList.split(/\r?\n/)) {
	const line = rawLine.trim();
	if (!line || line.startsWith("#")) continue;
	const normalized = normalizeRoutePath(line.startsWith("/") ? line : `/${line}`);
	if (normalized.endsWith("/*")) {
		GONE_PREFIXES.push(normalized.slice(0, -2));
	} else {
		GONE_EXACT.add(normalized);
	}
}

/** Redirect target for a normalized path, or null when the path is a page. */
export function redirectForRoute(path: string): string | null {
	const normalized = normalizeRoutePath(path);
	if (REDIRECTS[normalized]) return REDIRECTS[normalized];
	// The blog is out of scope for now: every post URL returns home.
	if (normalized.startsWith("/blog/")) return "/";
	// Course detail pages are not published yet; the course list is the page.
	if (normalized.startsWith("/courses/")) return "/courses";
	return null;
}

/** True when the URL was permanently removed and must answer 410. */
export function isGoneRoute(path: string): boolean {
	const normalized = normalizeRoutePath(path);
	if (GONE_EXACT.has(normalized)) return true;
	return GONE_PREFIXES.some(
		(prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
	);
}
