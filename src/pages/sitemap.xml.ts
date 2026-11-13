/**
 * sitemap.xml
 *
 * One entry per real page, in both languages, with hreflang alternates.
 * Redirected URLs (/teachers, /contact, /free-trial, /blog, /our-story,
 * /courses/<slug>) and 410 URLs are never listed here.
 */
import type { APIRoute } from "astro";
import { site } from "../config/site";

const PRIORITY: Record<string, string> = {
	"/": "1.0",
	"/courses": "0.9",
	"/pricing": "0.9",
	"/contact-us": "0.9",
	"/about": "0.8",
	"/faq": "0.8",
};

const escapeXml = (value: string) =>
	value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const GET: APIRoute = ({ site: astroSite }) => {
	const origin = (astroSite ?? new URL("https://kanwalquranacademy.com")).origin;

	const urls = site.indexablePaths.flatMap((path) => {
		const english = `${origin}${path}`;
		const arabic = `${origin}/ar${path === "/" ? "/" : path}`;
		return [english, arabic].map((loc) => ({
			loc,
			priority: PRIORITY[path] ?? "0.3",
			alternates: [
				{ hreflang: "en", href: english },
				{ hreflang: "ar", href: arabic },
				{ hreflang: "x-default", href: english },
			],
		}));
	});

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map(
		(url) => `	<url>
		<loc>${escapeXml(url.loc)}</loc>
${url.alternates
	.map(
		(alternate) =>
			`		<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />`,
	)
	.join("\n")}
		<changefreq>monthly</changefreq>
		<priority>${url.priority}</priority>
	</url>`,
	)
	.join("\n")}
</urlset>
`;

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
};
