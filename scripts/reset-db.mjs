/**
 * Wipe the local dev D1 database (the .wrangler miniflare state) so the next
 * `pnpm dev` boot starts from an empty database. EmDash then runs its
 * migrations and applies seed/seed.json automatically on first request, and
 * the admin setup wizard creates the first user. R2 media (uploads) is left
 * in place.
 *
 * Usage: pnpm db:reset   (then pnpm dev)
 */
import { rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, ".wrangler", "state", "v3", "d1");

if (!existsSync(target)) {
	console.log("Nothing to wipe: the local D1 folder does not exist yet.");
	process.exit(0);
}

try {
	rmSync(target, { recursive: true, force: true });
} catch (error) {
	const code = error && typeof error === "object" && "code" in error ? error.code : "";
	if (code === "EBUSY" || code === "EPERM") {
		console.error(
			"The local D1 file is locked. Stop the running dev server (astro dev / workerd) and run `pnpm db:reset` again.",
		);
		process.exit(1);
	}
	throw error;
}
console.log("Local D1 wiped:", target);
console.log(
	"Start the dev server next. The first request runs migrations and applies seed/seed.json.",
);
