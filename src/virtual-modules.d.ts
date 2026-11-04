/**
 * Ambient types for the EmDash virtual modules this site imports.
 *
 * These modules are provided by the EmDash Astro integration at build time.
 * The upstream package does not ship the declaration under its `exports`,
 * so it is repeated here for `astro check`.
 */
declare module "virtual:emdash/env" {
	/** Worker bindings and secrets, or `undefined` when running on Node. */
	export const env: Record<string, unknown> | undefined;
}
