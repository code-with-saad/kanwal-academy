import { getEmDashEntry } from "emdash";
import { site } from "../config/site";

export interface SocialLink {
	label: string;
	url: string;
}

export interface SiteContact {
	phone: string;
	email: string;
	address: string;
	socialLinks: SocialLink[];
	stats: {
		years: string;
		countries: string;
		students: string;
		sessions: string;
	};
}

interface SiteSettingsData {
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	social_links?: Array<{ label?: string | null; url?: string | null }> | null;
	years?: string | null;
	countries?: string | null;
	students?: string | null;
	sessions?: string | null;
}

const FALLBACK: SiteContact = {
	phone: site.phone,
	email: site.email,
	address: site.address,
	socialLinks: [],
	stats: { ...site.stats },
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
		address: clean(data?.address, FALLBACK.address),
		socialLinks,
		stats: {
			years: clean(data?.years, FALLBACK.stats.years),
			countries: clean(data?.countries, FALLBACK.stats.countries),
			students: clean(data?.students, FALLBACK.stats.students),
			sessions: clean(data?.sessions, FALLBACK.stats.sessions),
		},
	};
}

export function phoneHref(phone: string): string {
	const digits = phone.replace(/[^\d+]/g, "");
	return `tel:${digits}`;
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
	return { data: normalize(data), cacheHint };
}
