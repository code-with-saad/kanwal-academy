/// <reference types="astro/client" />

/**
 * Request-scoped values set by src/middleware.ts.
 */
declare namespace App {
	interface Locals {
		/** Content locale of the current request, derived from the /ar prefix. */
		locale?: import("./i18n/config").Locale;
	}
}
