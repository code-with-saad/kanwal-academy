/**
 * Locale access for pages and components.
 *
 * Every .astro file can call useUi(Astro) without any prop threading: the
 * locale is set once per request by src/middleware.ts.
 */
import type { AstroGlobal } from "astro";
import { DEFAULT_LOCALE, dirFor, isLocale, type Locale } from "./config";
import { en, type FeedbackCode, type UiDictionary } from "./ui/en";
import { ar } from "./ui/ar";

const dictionaries: Record<Locale, UiDictionary> = { en, ar };

export function getLocale(Astro: AstroGlobal): Locale {
	const locale = Astro.locals.locale;
	return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getUi(locale: Locale): UiDictionary {
	return dictionaries[locale] ?? en;
}

export function useUi(Astro: AstroGlobal): {
	locale: Locale;
	t: UiDictionary;
	dir: "ltr" | "rtl";
} {
	const locale = getLocale(Astro);
	return { locale, t: getUi(locale), dir: dirFor(locale) };
}

/**
 * Translate an API feedback code. Unknown or missing codes fall back to the
 * server's own message (English), then to a generic local retry message, so a
 * new server code can never render an empty bubble.
 */
export function feedbackText(
	t: UiDictionary,
	code: string | undefined,
	fallback?: string,
): string {
	if (code && code in t.feedback) return t.feedback[code as FeedbackCode];
	return fallback?.trim() || t.feedback.unknown;
}

export {
	LOCALES,
	DEFAULT_LOCALE,
	LOCALE_LABELS,
	LOCALE_HREFLANG,
	OG_LOCALE,
	alternatePath,
	dirFor,
	isRtl,
	localizePath,
	stripLocalePrefix,
} from "./config";
export { getLocalizedCollection } from "./content";
export type { Locale, UiDictionary, FeedbackCode };
export type { HomeTextKey } from "./ui/en";
