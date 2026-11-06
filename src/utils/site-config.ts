import { getEmDashEntry } from "emdash";
import { site } from "../config/site";

export interface SocialLink {
	label: string;
	url: string;
}

export interface SiteContact {
	phone: string;
	email: string;
	ownerEmail: string;
	address: string;
	socialLinks: SocialLink[];
	stats: {
		years: string;
		countries: string;
		students: string;
		sessions: string;
		labels: {
			years: string;
			countries: string;
			students: string;
			sessions: string;
		};
	};
	footer: {
		tagline: string;
		exploreLabel: string;
		contactLabel: string;
		coursesLabel: string;
		pricingLabel: string;
		teachersLabel: string;
		trialLabel: string;
		contactLinkLabel: string;
		termsLabel: string;
		privacyLabel: string;
		copyrightLabel: string;
	};
}

interface SiteSettingsData {
	phone?: string | null;
	email?: string | null;
	owner_email?: string | null;
	address?: string | null;
	social_links?: Array<{ label?: string | null; url?: string | null }> | null;
	years?: string | null;
	countries?: string | null;
	students?: string | null;
	sessions?: string | null;
	years_label?: string | null;
	countries_label?: string | null;
	students_label?: string | null;
	sessions_label?: string | null;
	footer_tagline?: string | null;
	footer_explore_label?: string | null;
	footer_contact_label?: string | null;
	footer_courses_label?: string | null;
	footer_pricing_label?: string | null;
	footer_teachers_label?: string | null;
	footer_trial_label?: string | null;
	footer_contact_link_label?: string | null;
	footer_terms_label?: string | null;
	footer_privacy_label?: string | null;
	footer_copyright_label?: string | null;
}

const FALLBACK: SiteContact = {
	phone: site.phone,
	email: site.email,
	ownerEmail: site.email,
	address: site.address,
	socialLinks: [],
	stats: {
		...site.stats,
		labels: {
			years: "Years teaching",
			countries: "Countries served",
			students: "Students taught",
			sessions: "Sessions delivered",
		},
	},
	footer: {
		tagline: site.tagline,
		exploreLabel: "Explore",
		contactLabel: "Contact",
		coursesLabel: "Courses",
		pricingLabel: "Pricing",
		teachersLabel: "Teachers",
		trialLabel: "Free trial",
		contactLinkLabel: "Contact",
		termsLabel: "Terms of Service",
		privacyLabel: "Privacy Policy",
		copyrightLabel: "All rights reserved.",
	},
};

function clean(value: string | null | undefined, fallback: string): string {
	const trimmed = value?.trim();
	return trimmed ? trimmed : fallback;
}

function normalize(data: SiteSettingsData | undefined): SiteContact {
	const socialLinks = Array.isArray(data?.social_links)
		? data.social_links
				.map((link) => ({
					label: link?.label?.trim() ?? "",
					url: link?.url?.trim() ?? "",
				}))
				.filter((link) => link.label && link.url)
		: [];

	return {
		phone: clean(data?.phone, FALLBACK.phone),
		email: clean(data?.email, FALLBACK.email),
		ownerEmail: clean(data?.owner_email, FALLBACK.ownerEmail),
		address: clean(data?.address, FALLBACK.address),
		socialLinks,
		stats: {
			years: clean(data?.years, FALLBACK.stats.years),
			countries: clean(data?.countries, FALLBACK.stats.countries),
			students: clean(data?.students, FALLBACK.stats.students),
			sessions: clean(data?.sessions, FALLBACK.stats.sessions),
			labels: {
				years: clean(data?.years_label, FALLBACK.stats.labels.years),
				countries: clean(data?.countries_label, FALLBACK.stats.labels.countries),
				students: clean(data?.students_label, FALLBACK.stats.labels.students),
				sessions: clean(data?.sessions_label, FALLBACK.stats.labels.sessions),
			},
		},
		footer: {
			tagline: clean(data?.footer_tagline, FALLBACK.footer.tagline),
			exploreLabel: clean(data?.footer_explore_label, FALLBACK.footer.exploreLabel),
			contactLabel: clean(data?.footer_contact_label, FALLBACK.footer.contactLabel),
			coursesLabel: clean(data?.footer_courses_label, FALLBACK.footer.coursesLabel),
			pricingLabel: clean(data?.footer_pricing_label, FALLBACK.footer.pricingLabel),
			teachersLabel: clean(data?.footer_teachers_label, FALLBACK.footer.teachersLabel),
			trialLabel: clean(data?.footer_trial_label, FALLBACK.footer.trialLabel),
			contactLinkLabel: clean(data?.footer_contact_link_label, FALLBACK.footer.contactLinkLabel),
			termsLabel: clean(data?.footer_terms_label, FALLBACK.footer.termsLabel),
			privacyLabel: clean(data?.footer_privacy_label, FALLBACK.footer.privacyLabel),
			copyrightLabel: clean(data?.footer_copyright_label, FALLBACK.footer.copyrightLabel),
		},
	};
}

export function phoneHref(phone: string): string {
	const digits = phone.replace(/[^\d+]/g, "");
	return `tel:${digits}`;
}

/** wa.me link from any display format of the number ("", when none). */
export function whatsappHref(phone: string): string {
	const digits = phone.replace(/[^0-9]/g, "");
	return digits ? `https://wa.me/${digits}` : "";
}

export function emailHref(email: string): string {
	return `mailto:${email}`;
}

/**
 * Contact details and headline numbers from the Site settings collection.
 * Falls back to the confirmed values in src/config/site.ts so the shell still
 * renders if the collection has not been seeded yet.
 */
export async function getSiteContact() {
	const { entry, cacheHint } = await getEmDashEntry("site_settings", "site");
	const data = entry?.data as SiteSettingsData | undefined;
	return { data: normalize(data), cacheHint, entry };
}
