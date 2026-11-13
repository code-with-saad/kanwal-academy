/**
 * Structural site data and confirmed business facts.
 *
 * Editorial content (courses, plans, FAQs, stats) lives in EmDash. This file
 * only holds the navigation, legal links, contact details and Arabic text that
 * the shell needs before a CMS entry exists.
 *
 * Every navigation item points at a real page. In-page anchors are only used
 * for actions on the Home page (the free trial form at #book); they are never
 * part of the primary navigation.
 */

/** Identifies which dictionary key supplies the localized label. */
export type NavKey = "home" | "about" | "courses" | "pricing" | "contact" | "faq" | "teachers";

export interface NavItem {
	label: string;
	/** Internal path of a real page ("/about") or an in-page action ("/#book"). */
	href: string;
	/** Dictionary key used to translate the label. */
	key?: NavKey;
}

export const site = {
	name: "Kanwal Quran Academy",
	tagline: "Online Qur'an education for students worldwide.",
	description:
		"Learn Qur'anic recitation, tajweed and memorization online with a teacher who knows your name.",
	phone: "+92 342 2766346",
	phoneHref: "tel:+923422766346",
	email: "hello@kanwalquranacademy.com",
	emailHref: "mailto:hello@kanwalquranacademy.com",
	address: "Missouri, USA",
	bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
	stats: {
		years: "5+",
		countries: "5+",
		students: "[000]+",
		sessions: "[000]+",
	},
	nav: [
		{ label: "Home", href: "/", key: "home" },
		{ label: "About", href: "/about", key: "about" },
		{ label: "Courses", href: "/courses", key: "courses" },
		{ label: "Pricing", href: "/pricing", key: "pricing" },
		{ label: "Contact", href: "/contact-us", key: "contact" },
	] satisfies NavItem[],
	cta: { label: "Book free trial", href: "/contact-us#book" } satisfies NavItem,
	/** Links shown in the footer bottom row, in order. `key` selects the label. */
	legal: [
		{ label: "Terms of Service", href: "/terms-of-service", key: "terms" },
		{ label: "Privacy Policy", href: "/privacy-policy", key: "privacy" },
		{ label: "Refund Policy", href: "/refund-policy", key: "refund" },
	] satisfies Array<{ label: string; href: string; key: "terms" | "privacy" | "refund" }>,
	/** Paths that have a real page and are listed in the sitemap. */
	indexablePaths: [
		"/",
		"/about",
		"/courses",
		"/pricing",
		"/contact-us",
		"/faq",
		"/privacy-policy",
		"/terms-of-service",
		"/refund-policy",
	],
} as const;
