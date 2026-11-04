/**
 * True when the site is running as the free demo build or deployment.
 *
 * The flag is read from the build environment (astro.config.mjs), the
 * Cloudflare runtime bindings (wrangler.demo.jsonc vars) and the Node
 * process, so the same code works in dev, preview and on Workers.
 */
export function isDemoMode(locals: unknown): boolean {
	const buildEnv = import.meta.env as unknown as Record<string, string | undefined>;
	if (buildEnv.EMDASH_DEMO === "1") return true;

	const runtime = (locals as { runtime?: { env?: Record<string, unknown> } } | undefined)?.runtime;
	if (String(runtime?.env?.EMDASH_DEMO ?? "") === "1") return true;

	const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })
		.process;
	return nodeProcess?.env?.EMDASH_DEMO === "1";
}
