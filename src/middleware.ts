/**
 * Locale routing.
 *
 * There is exactly one set of pages. A request for /ar/<path> is rewritten to
 * /<path> and the locale is kept in Astro.locals, so every page, component
 * and CMS query can read it without duplicating routes. The browser URL never
 * changes, which keeps canonical and hreflang URLs honest.
 *
 * Only the /ar prefix is intercepted: /api, the EmDash admin, media and asset
 * URLs are untouched.
 */
import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LOCALE, stripLocalePrefix } from "./i18n/config";

export const onRequest = defineMiddleware(async (context, next) => {
	const { locale: requestLocale, path } = stripLocalePrefix(context.url.pathname);
	const { locale: originLocale } = stripLocalePrefix(context.originPathname);
	const locale =
		requestLocale === DEFAULT_LOCALE
			? (context.locals.locale ?? originLocale)
			: requestLocale;
	context.locals.locale = locale;

	if (requestLocale === DEFAULT_LOCALE) return next();

	// Astro.rewrite re-matches the route (params included) while keeping the
	// original URL. The query string is preserved for deep links such as
	// /ar/?plan=plan-ii#book and for EmDash preview tokens.
	return context.rewrite(`${path}${context.url.search}`);
});
