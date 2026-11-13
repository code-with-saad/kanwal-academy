import { getLocalizedCollection } from "../i18n";
import type { Locale } from "../i18n";

export interface FaqItem {
	id: string;
	slug: string;
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
			// EmDash returns a slug on each entry; the public ContentEntry type
			// only names id/data, so read it defensively and fall back to id.
			slug: (entry as typeof entry & { slug?: string }).slug ?? entry.id,
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

/** FAQPage schema for the FAQs actually rendered on the page. */
export function faqPageJsonLd(items: FaqItem[]) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: { "@type": "Answer", text: item.answer },
		})),
	};
}
