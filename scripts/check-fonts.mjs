#!/usr/bin/env node
/**
 * Font discipline check.
 *
 * The site uses one family (Figtree) plus Amiri for Arabic. Only the font
 * token file may declare a font-family. Everything else must inherit --font.
 */
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const tokenFile = resolve(root, "src/styles/global.css");
const scanRoots = [resolve(root, "src"), resolve(root, "public")];
const textExtensions = new Set([
	".astro",
	".css",
	".html",
	".js",
	".jsx",
	".json",
	".md",
	".mjs",
	".scss",
	".svg",
	".ts",
	".tsx",
	".vue",
]);
const declaration = /font-family\s*:/i;

async function* walk(directory) {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (entry.isFile()) yield path;
	}
}

const offenders = [];
let scanned = 0;

for (const scanRoot of scanRoots) {
	for await (const file of walk(scanRoot)) {
		if (!textExtensions.has(extname(file).toLowerCase())) continue;
		if (resolve(file) === tokenFile) continue;
		const contents = await readFile(file, "utf8");
		scanned += 1;
		const lines = contents.split(/\r?\n/);
		lines.forEach((line, index) => {
			if (declaration.test(line)) {
				offenders.push(`${relative(root, file)}:${index + 1}  ${line.trim()}`);
			}
		});
	}
}

if (offenders.length > 0) {
	console.error("font-family is only allowed in src/styles/global.css.\n");
	for (const offender of offenders) console.error(`  ${offender}`);
	console.error(`\n${offenders.length} declaration(s) found outside the font token file.`);
	process.exit(1);
}

console.log(`Font check passed: ${scanned} files, one font-family token file.`);
