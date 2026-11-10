import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	server: { port: 4322 },
	site: "https://kanwalquranacademy.com",
	// English stays at the root (existing URLs and SEO keep working), Arabic is
	// served under /ar. src/middleware.ts strips the prefix and rewrites to the
	// same routes, so there is only one set of pages for both languages.
	i18n: {
		defaultLocale: "en",
		locales: ["en", "ar"],
		fallback: { ar: "en" },
		routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
	},
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			// Ship the Arabic admin UI so editors can work in either language.
			admin: { locales: ["en", "ar"] },
		}),
	],
	fonts: [
		{
			// Downloaded at build time and served from this site (self-hosted).
			provider: fontProviders.google(),
			name: "Figtree",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			styles: ["normal"],
			subsets: ["latin"],
			display: "swap",
			fallbacks: ["Arial", "sans-serif"],
		},
		{
			// Arabic interface text: IBM Plex Sans Arabic. Arabic and Latin
			// subsets only, no italic. Amiri below stays reserved for actual
			// Qur'anic text. Loaded only on /ar (see Base.astro).
			provider: fontProviders.google(),
			name: "IBM Plex Sans Arabic",
			cssVariable: "--font-arabic-ui",
			weights: [400, 500, 600, 700],
			styles: ["normal"],
			subsets: ["arabic", "latin"],
			display: "swap",
			fallbacks: ["Segoe UI", "Tahoma", "Arial", "sans-serif"],
		},
		{
			// Candidate alternate for the /styleguide font comparison only.
			// Never loaded on public pages.
			provider: fontProviders.google(),
			name: "Cairo",
			cssVariable: "--font-arabic-alt",
			weights: [400, 500, 600, 700],
			styles: ["normal"],
			subsets: ["arabic", "latin"],
			display: "swap",
			fallbacks: ["Segoe UI", "Tahoma", "Arial", "sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "Amiri",
			cssVariable: "--font-arabic",
			weights: [400],
			styles: ["normal"],
			subsets: ["arabic"],
			display: "swap",
			fallbacks: ["Traditional Arabic", "serif"],
		},
	],
	devToolbar: { enabled: false },
});
