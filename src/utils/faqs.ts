import { getLocalizedCollection } from "../i18n";
import type { Locale } from "../i18n";

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
}

/**
 * Visible FAQs in display order. Shared by the FAQ page, the Home teaser and
 * the contact page, so the order and the `visible` flag are applied once.
 */
export async function getFaqs(locale: Locale, limit?: number) {
	const result = await getLocalizedCollection("faqs", locale, {
		status: "published",
		orderBy: { order: "asc" },
	});

	const items: FaqItem[] = result.entries
		.filter((entry) => entry.data.visible !== false)
		.map((entry) => ({
			id: entry.id,
			question: String(entry.data.question ?? ""),
			answer: String(entry.data.answer ?? ""),
		}))
		.filter((item) => item.question && item.answer);

	return {
		items: typeof limit === "number" ? items.slice(0, limit) : items,
		cacheHint: result.cacheHint,
		fallbackLocale: result.fallbackLocale,
	};
}
