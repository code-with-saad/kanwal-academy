import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	server: { port: 4322 },
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
