/**
 * Reads a Home page CMS field with the dictionary fallback, for inner pages
 * that render the same sections as the Home page.
 *
 * The Home route keeps its own local helper. This module exists so the About,
 * Courses and Pricing pages show exactly the same CMS copy without changing
 * the Home implementation.
 */
import type { HomeTextKey, Locale, UiDictionary } from "../i18n";

export function makeHomeText(
	data: Record<string, unknown> | undefined,
	fallbackLocale: string | undefined,
	locale: Locale,
	t: UiDictionary,
) {
	return (field: HomeTextKey): string => {
		if (locale !== "en" && fallbackLocale) return t.home[field];
		const value = data?.[field];
		if (value == null) return t.home[field];
		return typeof value === "string" ? value.trim() : t.home[field];
	};
}
