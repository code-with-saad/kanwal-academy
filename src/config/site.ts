/**
 * Structural site data and confirmed business facts.
 *
 * Editorial content (courses, plans, FAQs, stats) lives in EmDash. This file
 * only holds the navigation, legal links, contact details and Arabic text that
 * the shell needs before a CMS entry exists.
 */
export interface NavItem {
	label: string;
	url: string;
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
		{ label: "Home", url: "/" },
		{ label: "About", url: "/about" },
		{ label: "Courses", url: "/courses" },
		{ label: "Pricing", url: "/pricing" },
		{ label: "Teachers", url: "/teachers" },
		{ label: "Contact", url: "/contact" },
	] satisfies NavItem[],
	cta: { label: "Get free trial", url: "/free-trial" } satisfies NavItem,
	legal: [
		{ label: "Terms of Service", url: "/terms-of-service" },
		{ label: "Privacy Policy", url: "/privacy-policy" },
	] satisfies NavItem[],
	footerLinks: [
		{ label: "Courses", url: "/courses" },
		{ label: "Pricing", url: "/pricing" },
		{ label: "Teachers", url: "/teachers" },
		{ label: "Free trial", url: "/free-trial" },
		{ label: "Contact", url: "/contact" },
	] satisfies NavItem[],
} as const;
