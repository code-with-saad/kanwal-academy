import type { Locale } from "../i18n";

// Reads a copy field from a per-page CMS collection entry (courses_page,
// pricing_page, contact_page, faq_page). Falls back to the bundled i18n copy
// when the entry is missing, the field is empty, or no translation exists for
// the current locale.
export function makePageText(
	data: Record<string, unknown> | null | undefined,
	fallbackLocale: string | undefined,
	locale: Locale,
) {
	const useCms = data !== null && data !== undefined && (locale === "en" || fallbackLocale === locale);
	return (key: string, fallback: string): string => {
		if (!useCms) return fallback;
		const value = data?.[key];
		return typeof value === "string" && value.trim() ? value : fallback;
	};
}