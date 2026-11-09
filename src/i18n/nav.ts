/**
 * Navigation labels and hrefs per locale.
 *
 * NavItem stays the single structural definition (src/config/site.ts); this
 * only swaps the label and prefixes the href, so the Arabic navigation points
 * at /ar/#courses instead of jumping back to English.
 */
import type { NavItem } from "../config/site";
import { localizePath, type Locale } from "./config";
import type { UiDictionary } from "./ui/en";

/** Nav anchors that have a translated label. "book" is the contact section. */
function labelFor(item: NavItem, t: UiDictionary): string {
	switch (item.anchor) {
		case "home":
			return t.nav.home;
		case "about":
			return t.nav.about;
		case "courses":
			return t.nav.courses;
		case "pricing":
			return t.nav.pricing;
		case "teachers":
			return t.nav.teachers;
		case "book":
			return t.nav.contact;
		default:
			break;
	}

	// Legal and other non-anchor links are matched by path.
	if (item.href.includes("terms-of-service")) return t.footer.termsLabel;
	if (item.href.includes("privacy-policy")) return t.footer.privacyLabel;
	if (item.href.includes("free-trial")) return t.footer.trialLabel;
	return item.label;
}

export function localizedNav(items: NavItem[], t: UiDictionary, locale: Locale): NavItem[] {
	return items.map((item) => ({
		...item,
		label: labelFor(item, t),
		href: localizePath(item.href, locale),
		page: item.page ? localizePath(item.page, locale) : undefined,
	}));
}

export function localizedCta(item: NavItem, t: UiDictionary, locale: Locale): NavItem {
	return { ...item, label: t.actions.bookFreeTrial, href: localizePath(item.href, locale) };
}
