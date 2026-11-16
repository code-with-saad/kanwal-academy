import type { ImageValue } from "emdash";
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

// Same gate as makePageText, for repeater fields (chips, steps, list items).
export function makePageRows(
	data: Record<string, unknown> | null | undefined,
	fallbackLocale: string | undefined,
	locale: Locale,
) {
	const useCms = data !== null && data !== undefined && (locale === "en" || fallbackLocale === locale);
	return <T,>(key: string, fallback: T[]): T[] => {
		if (!useCms) return fallback;
		const value = data?.[key];
		return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
	};
}

// Same gate, for image fields: null when unset so callers can fall back to
// the bundled photography.
export function makePageImage(
	data: Record<string, unknown> | null | undefined,
	fallbackLocale: string | undefined,
	locale: Locale,
) {
	const useCms = data !== null && data !== undefined && (locale === "en" || fallbackLocale === locale);
	return (key: string): ImageValue | null => {
		if (!useCms) return null;
		const value = data?.[key] as ImageValue | undefined;
		return value?.src ? value : null;
	};
}