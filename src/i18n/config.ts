/**
 * Locale primitives for the public site.
 *
 * English is the default locale and lives at the root, so every URL that
 * ranked before Arabic existed keeps working. Arabic is served under /ar.
 * src/middleware.ts strips that prefix and rewrites to the same route, so
 * pages, slugs and anchors are identical in both languages and only the
 * locale changes.
 *
 * Keep the locales here in sync with `i18n` in astro.config.mjs. EmDash reads
 * that config to enable per-locale content, translation groups and fallbacks.
 */
export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Native name of each locale, used by the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
	en: "English",
	ar: "العربية",
};

/** BCP 47 tags for hreflang and og:locale. */
export const LOCALE_HREFLANG: Record<Locale, string> = {
	en: "en",
	ar: "ar",
};

export const OG_LOCALE: Record<Locale, string> = {
	en: "en_US",
	ar: "ar_AR",
};

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
	return locale === "ar" ? "rtl" : "ltr";
}

export function isRtl(locale: Locale): boolean {
	return dirFor(locale) === "rtl";
}

/**
 * Split a request pathname into its locale and the unprefixed route path.
 * "/ar/pricing" -> { locale: "ar", path: "/pricing" }, "/" -> en + "/".
 */
export function stripLocalePrefix(pathname: string): { locale: Locale; path: string } {
	for (const locale of LOCALES) {
		if (locale === DEFAULT_LOCALE) continue;
		const prefix = `/${locale}`;
		if (pathname === prefix || pathname === `${prefix}/`) {
			return { locale, path: "/" };
		}
		if (pathname.startsWith(`${prefix}/`)) {
			return { locale, path: pathname.slice(prefix.length) };
		}
	}
	return { locale: DEFAULT_LOCALE, path: pathname };
}

/**
 * Add the locale prefix to an internal path. Paths may carry a query string
 * and an anchor ("/?plan=plan-ii#book"), which must stay after the prefix.
 * External URLs, tel:/mailto: links and pure anchors are returned untouched.
 */
export function localizePath(path: string, locale: Locale): string {
	if (!path || path.startsWith("#")) return path;
	if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path) || path.startsWith("//")) return path;
	if (locale === DEFAULT_LOCALE) return path;

	const match = /^([^?#]*)(.*)$/.exec(path);
	const pathname = match?.[1] ?? path;
	const rest = match?.[2] ?? "";
	if (!pathname.startsWith("/")) return path;

	// Already prefixed (callers pass both raw and localized paths around).
	const stripped = stripLocalePrefix(pathname);
	return `/${locale}${stripped.path === "/" ? "/" : stripped.path}${rest}`;
}

/** The same page in another locale, keeping query string and anchor. */
export function alternatePath(pathname: string, locale: Locale): string {
	const { path } = stripLocalePrefix(pathname);
	return localizePath(path, locale);
}
