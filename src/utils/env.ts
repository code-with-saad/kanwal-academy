import { env as hostEnv } from "virtual:emdash/env";

/**
 * True when the site is running as the free demo build or deployment.
 *
 * Reads the build environment, the Worker bindings (through EmDash's host env
 * module, which is `undefined` on Node) and the Node process, so the same code
 * works in dev, preview and on Workers.
 */
export function isDemoMode(): boolean {
	const buildEnv = import.meta.env as unknown as Record<string, string | undefined>;
	if (buildEnv.EMDASH_DEMO === "1") return true;

	if (String(hostEnv?.EMDASH_DEMO ?? "") === "1") return true;

	const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })
		.process;
	return nodeProcess?.env?.EMDASH_DEMO === "1";
}
