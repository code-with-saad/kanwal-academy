import { createRequire } from "node:module";
import { readdir, stat, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const sharp = astroRequire("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const outputRoot = path.join(publicRoot, "images", "optimized");
const manifestPath = path.join(root, "src", "config", "optimized-images.ts");
const referenced = new Set([
	"/apple-touch-icon.png",
	"/favicon.png",
	"/images/course-memorization.jpg",
	"/images/course-recitation.jpg",
	"/images/course-tajweed.jpg",
	"/images/hero-quran.png",
	"/images/kanwal-logo-on-dark.png",
	"/images/kanwal-logo-on-light.png",
	"/images/kanwal-mark-on-dark.png",
	"/images/kanwal-mark-on-light.png",
	"/images/section-memorize.jpg",
	"/images/section-phone.png",
	"/images/wisdom.jpg",
]);
const displaySizes = new Map([
	["/apple-touch-icon.png", "180x180 device icon"],
	["/favicon.png", "192x192 browser icon"],
	["/images/course-memorization.jpg", "Course card, up to 380x238 CSS px"],
	["/images/course-recitation.jpg", "Course card, up to 380x238 CSS px"],
	["/images/course-tajweed.jpg", "Course card, up to 380x238 CSS px"],
	["/images/hero-quran.png", "About 68x45 at 360px, 114x76 at 768px, 186x124 at 1280px"],
	["/images/kanwal-logo-on-dark.png", "Up to 260x111 CSS px in the footer"],
	["/images/kanwal-logo-on-light.png", "Up to 260x111 CSS px in the footer"],
	["/images/kanwal-mark-on-dark.png", "About 38x44 CSS px in the header"],
	["/images/kanwal-mark-on-light.png", "About 38x44 CSS px in the header"],
	["/images/section-memorize.jpg", "Fluid 4:3 panel, up to about 480x360 CSS px"],
	["/images/section-phone.png", "Fluid 4:3 panel, up to about 480x360 CSS px"],
	["/images/wisdom.jpg", "Landscape panel, up to about 440x251 CSS px"],
]);
const maxBytes = new Map([
	["/images/hero-quran.png", 120 * 1024],
]);
const maxOtherBytes = 150 * 1024;
const widths = [96, 160, 320, 480, 800, 1200, 1600];
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

async function listImages(directory) {
	const result = [];
	for (const item of await readdir(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, item.name);
		if (item.isDirectory()) {
			result.push(...(await listImages(fullPath)));
		} else if (imageExtensions.has(path.extname(item.name).toLowerCase())) {
			result.push(fullPath);
		}
	}
	return result;
}

function publicUrl(filePath) {
	return `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`;
}

function outputWidths(sourceUrl, sourceWidth) {
	const maxWidth = sourceUrl.includes("mark-on-")
		? 96
		: sourceUrl.includes("logo-on-")
			? 480
			: sourceWidth;
	const targetWidth = Math.min(maxWidth, sourceWidth);
	return [...new Set([...widths.filter((width) => width < targetWidth), targetWidth])];
}

async function optimize(sourcePath, sourceUrl) {
	const metadata = await sharp(sourcePath).metadata();
	if (!metadata.width || !metadata.height) {
		throw new Error(`Could not read image dimensions: ${sourceUrl}`);
	}
	const rotated = metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8;
	const sourceWidth = rotated ? metadata.height : metadata.width;
	const sourceHeight = rotated ? metadata.width : metadata.height;
	const base = path.parse(sourcePath).name;
	const webp = [];
	const avif = [];

	for (const width of outputWidths(sourceUrl, sourceWidth)) {
		const webpBuffer = await sharp(sourcePath)
			.rotate()
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: 78, effort: 5 })
			.toBuffer();
		const avifBuffer = await sharp(sourcePath)
			.rotate()
			.resize({ width, withoutEnlargement: true })
			.avif({ quality: 76, effort: 5 })
			.toBuffer();

		const webpName = `${base}-${width}.webp`;
		await writeFile(path.join(outputRoot, webpName), webpBuffer);
		webp.push({
			src: `/images/optimized/${webpName}`,
			width,
			bytes: webpBuffer.length,
		});

		if (avifBuffer.length < webpBuffer.length) {
			const avifName = `${base}-${width}.avif`;
			await writeFile(path.join(outputRoot, avifName), avifBuffer);
			avif.push({
				src: `/images/optimized/${avifName}`,
				width,
				bytes: avifBuffer.length,
			});
		}

		const limit = maxBytes.get(sourceUrl) ?? maxOtherBytes;
		if (webpBuffer.length > limit) {
			throw new Error(
				`${sourceUrl} ${width}px WebP is ${webpBuffer.length} bytes, above the ${limit}-byte target`,
			);
		}
	}

	return {
		width: sourceWidth,
		height: sourceHeight,
		webp,
		avif,
	};
}

const sourceFiles = (await listImages(publicRoot))
	.filter((filePath) => {
		const sourceUrl = publicUrl(filePath);
		return (
			!filePath.startsWith(`${outputRoot}${path.sep}`) &&
			sourceUrl.startsWith("/images/")
		);
	})
	.sort();
await mkdir(outputRoot, { recursive: true });

const sourceNames = new Set(sourceFiles.map((filePath) => path.parse(filePath).name));
for (const entry of await readdir(outputRoot, { withFileTypes: true })) {
	if (
		entry.isFile() &&
		/\.(?:avif|webp)$/.test(entry.name) &&
		![...sourceNames].some((name) => entry.name.startsWith(`${name}-`))
	) {
		await unlink(path.join(outputRoot, entry.name));
	}
}

const manifest = {};
for (const sourcePath of sourceFiles) {
	const sourceUrl = publicUrl(sourcePath);
	manifest[sourceUrl] = await optimize(sourcePath, sourceUrl);
}

const generated = [
	"export interface OptimizedImageVariant {",
	"\tsrc: string;",
	"\twidth: number;",
	"\tbytes: number;",
	"}",
	"",
	"export interface OptimizedImage {",
	"\twidth: number;",
	"\theight: number;",
	"\twebp: OptimizedImageVariant[];",
	"\tavif: OptimizedImageVariant[];",
	"}",
	"",
	`export const optimizedImages: Record<string, OptimizedImage> = ${JSON.stringify(manifest, null, 2)};`,
	"",
].join("\n");
await writeFile(manifestPath, generated);

const allPublicImages = (await listImages(publicRoot)).sort();
console.log("Image inventory (source bytes and CSS display size):");
console.log("Referenced | Source | Dimensions | Original KiB | Displayed size | Largest optimized variant KiB");
for (const filePath of allPublicImages.filter((file) => !file.startsWith(`${outputRoot}${path.sep}`))) {
	const sourceUrl = publicUrl(filePath);
	const fileStats = await stat(filePath);
	const metadata = await sharp(filePath).metadata();
	const variants = manifest[sourceUrl];
	const largestVariant = variants
		? Math.max(...[...variants.webp, ...variants.avif].map((variant) => variant.bytes))
		: undefined;
	const size = metadata.width && metadata.height ? `${metadata.width}x${metadata.height}` : "unknown";
	console.log(
		`${referenced.has(sourceUrl) ? "yes" : "no"} | ${sourceUrl} | ${size} | ${(fileStats.size / 1024).toFixed(1)} | ${displaySizes.get(sourceUrl) ?? "Not referenced by the site"} | ${largestVariant === undefined ? "not generated" : (largestVariant / 1024).toFixed(1)}`,
	);
}
console.log(`Generated ${Object.keys(manifest).length} image manifests in public/images/optimized.`);
