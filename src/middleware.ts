/**
 * Locale routing, redirects and removed URLs.
 *
 * There is exactly one set of pages. A request for /ar/<path> is rewritten to
 * /<path> and the locale is kept in Astro.locals, so every page, component
 * and CMS query can read it without duplicating routes. The browser URL never
 * changes, which keeps canonical and hreflang URLs honest.
 *
 * Before routing, the Worker answers the legacy redirects (301) and the
 * removed spam URLs (410) defined in src/config/route-rules.ts. Those run on
 * every hostname and for both locales. Only the /ar prefix and these rules are
 * intercepted: /api, the EmDash admin, media and asset URLs are untouched.
 */
import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LOCALE, localizePath, stripLocalePrefix } from "./i18n/config";
import {
	isGoneRoute,
	normalizeRoutePath,
	redirectForRoute,
} from "./config/route-rules";

function goneResponse(locale: "en" | "ar"): Response {
	const isArabic = locale === "ar";
	const title = isArabic ? "هذه الصفحة محذوفة" : "This page is gone";
	const body = isArabic
		? "تم حذف هذه الصفحة نهائيًا ولم تعد متاحة."
		: "This page has been removed permanently and is no longer available.";
	const home = isArabic ? "العودة إلى الرئيسية" : "Go to the homepage";
	const homeHref = localizePath("/", locale);
	return new Response(
		`<!doctype html><html lang="${locale}" dir="${isArabic ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>410 ${title}</title></head><body style="font-family:system-ui,sans-serif;max-width:44rem;margin:12vh auto;padding:0 1.25rem;line-height:1.6"><p style="font-size:3rem;margin:0;font-weight:600">410</p><h1 style="font-size:1.5rem;margin:0.5rem 0 1rem">${title}</h1><p style="margin:0 0 1.5rem">${body}</p><p><a href="${homeHref}">${home}</a></p></body></html>`,
		{
			status: 410,
			headers: {
				"content-type": "text/html; charset=utf-8",
				"cache-control": "public, max-age=3600",
				"x-robots-tag": "noindex",
			},
		},
	);
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { locale: requestLocale, path } = stripLocalePrefix(context.url.pathname);
	const { locale: originLocale } = stripLocalePrefix(context.originPathname);
	const locale =
		requestLocale === DEFAULT_LOCALE
			? (context.locals.locale ?? originLocale)
			: requestLocale;
	context.locals.locale = locale;

	// Admin, API, media and asset requests are never matched by these rules
	// because the rules only list public page paths.
	const normalized = normalizeRoutePath(path);

	if (isGoneRoute(normalized)) {
		return goneResponse(locale);
	}

	const redirectTarget = redirectForRoute(normalized);
	if (redirectTarget) {
		return context.redirect(
			`${localizePath(redirectTarget, locale)}${context.url.search}`,
			301,
		);
	}

	if (requestLocale === DEFAULT_LOCALE) return next();

	// Astro.rewrite re-matches the route (params included) while keeping the
	// original URL. The query string is preserved for deep links such as
	// /ar/?plan=plan-ii#book and for EmDash preview tokens.
	return context.rewrite(`${path}${context.url.search}`);
});
