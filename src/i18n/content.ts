import { getEmDashCollection, type CollectionFilter } from "emdash";
import { DEFAULT_LOCALE, type Locale } from "./config";

type LocalizedCollectionOptions = {
	status?: CollectionFilter["status"];
	orderBy?: CollectionFilter["orderBy"];
};

/**
 * Keep data-driven sections visible while a locale is being translated.
 * EmDash resolves single entries through its configured fallback chain, but
 * collection queries are locale-specific, so query the default locale when a
 * translated collection has no published entries yet.
 */
export async function getLocalizedCollection<T extends string>(
	collection: T,
	locale: Locale,
	filter: LocalizedCollectionOptions = {},
) {
	const result = await getEmDashCollection(collection, { ...filter, locale });
	if (locale === DEFAULT_LOCALE || result.entries.length > 0 || result.error) {
		return { ...result, fallbackLocale: undefined };
	}

	const fallback = await getEmDashCollection(collection, {
		...filter,
		locale: DEFAULT_LOCALE,
	});
	return {
		...fallback,
		fallbackLocale: fallback.entries.length > 0 ? DEFAULT_LOCALE : undefined,
	};
}
