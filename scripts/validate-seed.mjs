import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(join(root, "seed", "seed.json"), "utf8"));

const { validateSeed } = await import("emdash/seed");
const result = validateSeed(seed);
console.log("Valid:", result.valid);
if (result.errors.length) console.log("Errors:", JSON.stringify(result.errors, null, 2));
if (result.warnings.length) console.log("Warnings:", JSON.stringify(result.warnings, null, 2));
