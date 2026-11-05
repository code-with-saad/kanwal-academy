/**
 * Structural site data and confirmed business facts.
 *
 * Editorial content (courses, plans, FAQs, stats) lives in EmDash. This file
 * only holds the navigation, legal links, contact details and Arabic text that
 * the shell needs before a CMS entry exists.
 *
 * The site ships as one page. Each navigation item points at an anchor for
 * now, and keeps the future standalone page path beside it. To switch an item
 * from an anchor to a real page, change its `href` to the value in `page`.
 * That is the only edit needed.
 */
export interface NavItem {
	label: string;
	/** Active target: an in-page anchor ("#about") or a page path ("/about"). */
	href: string;
	/** Section id this item scrolls to, used by the scroll-spy. */
	anchor?: string;
	/** Future standalone page path, unused while `href` is an anchor. */
	page?: string;
}

export const site = {
	name: "Kanwal Quran Academy",
	tagline: "Online Qur'an education from Karachi, Pakistan.",
	description:
		"Learn Qur'anic recitation, tajweed and memorization online with a teacher who knows your name.",
	phone: "+92 342 2766346",
	phoneHref: "tel:+923422766346",
	email: "hello@kanwalquranacademy.com",
	emailHref: "mailto:hello@kanwalquranacademy.com",
	address: "Karachi, Pakistan",
	bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
	stats: {
		years: "5+",
		countries: "5+",
		students: "[000]+",
		sessions: "[000]+",
	},
	nav: [
		{ label: "Home", href: "/#home", anchor: "home", page: "/" },
		{ label: "About", href: "/#about", anchor: "about", page: "/about" },
		{ label: "Courses", href: "/#courses", anchor: "courses", page: "/courses" },
		{ label: "Pricing", href: "/#pricing", anchor: "pricing", page: "/pricing" },
		// Teachers joins the navigation once the teachers collection has data:
		// { label: "Teachers", href: "/#teachers", anchor: "teachers", page: "/teachers" },
		{ label: "Contact", href: "/#book", anchor: "book", page: "/contact" },
	] satisfies NavItem[],
	cta: { label: "Book free trial", href: "/#book", anchor: "book" } satisfies NavItem,
	legal: [
		{ label: "Terms of Service", href: "/terms-of-service" },
		{ label: "Privacy Policy", href: "/privacy-policy" },
	] satisfies Array<{ label: string; href: string }>,
	footerLinks: [
		{ label: "Courses", href: "/#courses", anchor: "courses" },
		{ label: "Pricing", href: "/#pricing", anchor: "pricing" },
		{ label: "About", href: "/#about", anchor: "about" },
		{ label: "Free trial", href: "/#book", anchor: "book" },
		{ label: "Contact", href: "/#book", anchor: "book" },
	] satisfies NavItem[],
} as const;
