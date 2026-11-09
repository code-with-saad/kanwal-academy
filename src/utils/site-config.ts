import { getEmDashEntry } from "emdash";
import type { ImageValue } from "emdash";
import { site } from "../config/site";
import { DEFAULT_LOCALE, getUi, type Locale, type UiDictionary } from "../i18n";

export interface SocialLink {
	label: string;
	url: string;
}

export interface SiteContact {
	phone: string;
	whatsappNumber: string;
	email: string;
	ownerEmail: string;
	address: string;
	socialLinks: SocialLink[];
	logoLight?: ImageValue | null;
	logoDark?: ImageValue | null;
	headerMarkLight?: ImageValue | null;
	headerMarkDark?: ImageValue | null;
	ogImage?: ImageValue | null;
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
		academyLabel: string;
		pricingLabel: string;
		teachersLabel: string;
		trialLabel: string;
		contactLinkLabel: string;
		termsLabel: string;
		privacyLabel: string;
		copyrightLabel: string;
		newsletterHeading: string;
		newsletterConsent: string;
		stayInTouch: string;
	};
}

interface SiteSettingsData {
	phone?: string | null;
	whatsapp_number?: string | null;
	email?: string | null;
	owner_email?: string | null;
	address?: string | null;
	social_links?: Array<{ label?: string | null; url?: string | null }> | null;
	logo_light?: ImageValue | null;
	logo_dark?: ImageValue | null;
	header_mark_light?: ImageValue | null;
	header_mark_dark?: ImageValue | null;
	og_image?: ImageValue | null;
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
	footer_academy_label?: string | null;
	footer_pricing_label?: string | null;
	footer_teachers_label?: string | null;
	footer_trial_label?: string | null;
	footer_contact_link_label?: string | null;
	footer_terms_label?: string | null;
	footer_privacy_label?: string | null;
	footer_copyright_label?: string | null;
	footer_newsletter_heading?: string | null;
	footer_newsletter_consent?: string | null;
	footer_stay_in_touch?: string | null;
}

const fallback = (t: UiDictionary): SiteContact => ({
	phone: site.phone,
	whatsappNumber: "923422766346",
	email: site.email,
	ownerEmail: site.email,
	address: site.address,
	socialLinks: [],
	stats: {
		...site.stats,
		labels: {
			years: t.stats.years,
			countries: t.stats.countries,
			students: t.stats.students,
			sessions: t.stats.sessions,
		},
	},
	footer: {
		tagline: t.footer.tagline,
		exploreLabel: t.footer.exploreLabel,
		contactLabel: t.footer.contactLabel,
		coursesLabel: t.footer.coursesLabel,
		academyLabel: t.footer.academyLabel,
		pricingLabel: t.footer.pricingLabel,
		teachersLabel: t.footer.teachersLabel,
		trialLabel: t.footer.trialLabel,
		contactLinkLabel: t.footer.contactLinkLabel,
		termsLabel: t.footer.termsLabel,
		privacyLabel: t.footer.privacyLabel,
		copyrightLabel: t.footer.copyrightLabel,
		newsletterHeading: t.footer.newsletterHeading,
		newsletterConsent: t.footer.newsletterConsent,
		stayInTouch: t.footer.stayInTouch,
	},
});

function clean(value: string | null | undefined, fallback: string): string {
	const trimmed = value?.trim();
	return trimmed ? trimmed : fallback;
}

function normalize(data: SiteSettingsData | undefined, t: UiDictionary): SiteContact {
	const FALLBACK = fallback(t);
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
		whatsappNumber: clean(data?.whatsapp_number, FALLBACK.whatsappNumber),
		email: clean(data?.email, FALLBACK.email),
		ownerEmail: clean(data?.owner_email, FALLBACK.ownerEmail),
		address: clean(data?.address, FALLBACK.address),
		socialLinks,
		logoLight: data?.logo_light ?? null,
		logoDark: data?.logo_dark ?? null,
		headerMarkLight: data?.header_mark_light ?? null,
		headerMarkDark: data?.header_mark_dark ?? null,
		ogImage: data?.og_image ?? null,
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
			academyLabel: clean(data?.footer_academy_label, FALLBACK.footer.academyLabel),
			pricingLabel: clean(data?.footer_pricing_label, FALLBACK.footer.pricingLabel),
			teachersLabel: clean(data?.footer_teachers_label, FALLBACK.footer.teachersLabel),
			trialLabel: clean(data?.footer_trial_label, FALLBACK.footer.trialLabel),
			contactLinkLabel: clean(data?.footer_contact_link_label, FALLBACK.footer.contactLinkLabel),
			termsLabel: clean(data?.footer_terms_label, FALLBACK.footer.termsLabel),
			privacyLabel: clean(data?.footer_privacy_label, FALLBACK.footer.privacyLabel),
			copyrightLabel: clean(data?.footer_copyright_label, FALLBACK.footer.copyrightLabel),
			newsletterHeading: clean(data?.footer_newsletter_heading, FALLBACK.footer.newsletterHeading),
			newsletterConsent: clean(data?.footer_newsletter_consent, FALLBACK.footer.newsletterConsent),
			stayInTouch: clean(data?.footer_stay_in_touch, FALLBACK.footer.stayInTouch),
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
export async function getSiteContact(locale: Locale = DEFAULT_LOCALE) {
	const { entry, cacheHint, fallbackLocale } = await getEmDashEntry("site_settings", "site", {
		locale,
	});
	const data = entry?.data as SiteSettingsData | undefined;
	const localizedData =
		locale !== DEFAULT_LOCALE && fallbackLocale
			? {
					...data,
					address: undefined,
					years_label: undefined,
					countries_label: undefined,
					students_label: undefined,
					sessions_label: undefined,
					footer_tagline: undefined,
					footer_explore_label: undefined,
					footer_contact_label: undefined,
					footer_courses_label: undefined,
					footer_academy_label: undefined,
					footer_pricing_label: undefined,
					footer_teachers_label: undefined,
					footer_trial_label: undefined,
					footer_contact_link_label: undefined,
					footer_terms_label: undefined,
					footer_privacy_label: undefined,
					footer_copyright_label: undefined,
					footer_newsletter_heading: undefined,
					footer_newsletter_consent: undefined,
					footer_stay_in_touch: undefined,
				}
			: data;
	const contact = normalize(localizedData, getUi(locale));
	if (locale !== DEFAULT_LOCALE && fallbackLocale) {
		contact.address = getUi(locale).catalog.address;
	}
	return { data: contact, cacheHint, entry, fallbackLocale };
}
