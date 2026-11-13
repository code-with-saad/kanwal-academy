/**
 * Navigation labels and hrefs per locale.
 *
 * NavItem stays the single structural definition (src/config/site.ts); this
 * only swaps the label and prefixes the href, so the Arabic navigation points
 * at /ar/about instead of the English page.
 */
import type { NavItem } from "../config/site";
import { localizePath, type Locale } from "./config";
import type { UiDictionary } from "./ui/en";

/** Nav items that have a translated label. Unknown keys fall back to the label. */
function labelFor(item: NavItem, t: UiDictionary): string {
	switch (item.key) {
		case "home":
			return t.nav.home;
		case "about":
			return t.nav.about;
		case "courses":
			return t.nav.courses;
		case "pricing":
			return t.nav.pricing;
		case "contact":
			return t.nav.contact;
		case "faq":
			return t.nav.faq;
		case "teachers":
			return t.nav.teachers;
		default:
			return item.label;
	}
}

export function localizedNav(items: NavItem[], t: UiDictionary, locale: Locale): NavItem[] {
	return items.map((item) => ({
		...item,
		label: labelFor(item, t),
		href: localizePath(item.href, locale),
	}));
}

export function localizedCta(item: NavItem, t: UiDictionary, locale: Locale): NavItem {
	return { ...item, label: t.actions.bookFreeTrial, href: localizePath(item.href, locale) };
}
