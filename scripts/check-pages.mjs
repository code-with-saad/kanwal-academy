/**
 * Route, SEO and accessibility checks for the public site.
 *
 * Usage:
 *   pnpm dev            (or any server on http://localhost:4322)
 *   pnpm check:pages    (BASE_URL=https://... to target another origin)
 *
 * No dependencies: plain fetch and regular expressions. Prints one PASS/FAIL
 * line per check and exits non-zero when anything fails.
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:4322").replace(/\/$/, "");
const ORIGIN = new URL(BASE).origin;

const PAGES = [
	"/",
	"/about",
	"/courses",
	"/pricing",
	"/contact-us",
	"/faq",
	"/privacy-policy",
	"/terms-of-service",
	"/refund-policy",
];
const LEGAL = new Set(["/privacy-policy", "/terms-of-service", "/refund-policy"]);
const LOCALES = [
	{ prefix: "", lang: "en", dir: "ltr" },
	{ prefix: "/ar", lang: "ar", dir: "rtl" },
];

let passed = 0;
const failures = [];
const metrics = [];

const check = (name, condition, detail = "") => {
	if (condition) {
		passed += 1;
		console.log(`PASS ${name}`);
	} else {
		failures.push(`${name}${detail ? `: ${detail}` : ""}`);
		console.log(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
	}
};

const localized = (path, prefix) =>
	prefix === "" ? path : path === "/" ? "/ar/" : `${prefix}${path}`;

const decode = (value) =>
	value
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">");

const stripTags = (html) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const attr = (tag, name) => {
	const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
	return match ? decode(match[1]) : null;
};

const anchors = (html) => html.match(/<a\b[^>]*>/g) ?? [];

/** Count elements that carry an exact class token (not a prefix). */
const classTokenCount = (html, name) =>
	(html.match(/class="[^"]*"/g) ?? []).filter((attribute) =>
		attribute
			.replace(/^class="|"$/g, "")
			.split(/\s+/)
			.includes(name),
	).length;

const routeOf = (href) => {
	if (!href) return null;
	const path = href.split("#")[0].split("?")[0];
	const stripped = path.startsWith("/ar/") ? path.slice(3) : path === "/ar" ? "/" : path;
	return stripped.length > 1 ? stripped.replace(/\/+$/, "") : stripped || "/";
};

const jsonLd = (html) => {
	const blocks = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) ?? [];
	const parsed = [];
	for (const block of blocks) {
		const body = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
		try {
			parsed.push(JSON.parse(body));
		} catch {
			parsed.push(null);
		}
	}
	return parsed.filter(Boolean);
};

const NAV_ROUTES = new Set(["/", "/about", "/courses", "/pricing", "/contact-us"]);

const collect = async (path, prefix) => {
	const url = `${BASE}${localized(path, prefix)}`;
	const response = await fetch(url);
	const html = await response.text();
	return { url, response, html };
};

const main = async () => {
	console.log(`Checking ${BASE}`);
	const titles = new Map();
	const descriptions = new Map();
	const pageData = [];

	// ---- Pages, metadata, headings, breadcrumbs, structured data ----------
	for (const locale of LOCALES) {
		for (const path of PAGES) {
			const { url, response, html } = await collect(path, locale.prefix);
			const label = `${locale.prefix || ""}${path}`;
			check(`status 200 ${label}`, response.status === 200, `got ${response.status}`);

			const title = (html.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1]?.trim() ?? "";
			check(`title ${label}`, title.length > 0);
			const previousTitle = titles.get(`${locale.prefix}|${title}`);
			check(
				`unique title ${label}`,
				!previousTitle,
				previousTitle ? `same as ${previousTitle}` : "",
			);
			titles.set(`${locale.prefix}|${title}`, label);

			const descriptionTag = (html.match(/<meta name="description"[^>]*>/) ?? [])[0] ?? "";
			const description = attr(descriptionTag, "content") ?? "";
			check(`description ${label}`, description.length > 40);
			const previousDescription = descriptions.get(`${locale.prefix}|${description}`);
			check(
				`unique description ${label}`,
				!previousDescription,
				previousDescription ? `same as ${previousDescription}` : "",
			);
			descriptions.set(`${locale.prefix}|${description}`, label);

			const canonicalTag = (html.match(/<link rel="canonical"[^>]*>/) ?? [])[0] ?? "";
			const canonical = attr(canonicalTag, "href");
			const expectedCanonical = `${ORIGIN}${localized(path, locale.prefix)}`;
			const canonicalMatches =
				path === "/"
					? canonical === expectedCanonical ||
						canonical === `https://kanwalquranacademy.com${localized(path, locale.prefix)}`
					: canonical === expectedCanonical;
			check(`canonical ${label}`, canonicalMatches, `${canonical} vs ${expectedCanonical}`);

			const alternates = {};
			for (const tag of html.match(/<link rel="alternate"[^>]*>/g) ?? []) {
				const code = attr(tag, "hreflang");
				const href = attr(tag, "href");
				if (!code || !href) continue;
				(alternates[code] ??= []).push(href);
			}
			const expectedEn = `${ORIGIN}${path === "/" ? "/" : path}`;
			const expectedAr = `${ORIGIN}${localized(path, "/ar")}`;
			check(`hreflang en ${label}`, alternates.en?.includes(expectedEn), `${alternates.en?.join(",")}`);
			check(`hreflang ar ${label}`, alternates.ar?.includes(expectedAr), `${alternates.ar?.join(",")}`);
			check(`hreflang x-default ${label}`, alternates["x-default"]?.includes(expectedEn));

			const htmlTag = (html.match(/<html[^>]*>/) ?? [])[0] ?? "";
			check(`html lang ${label}`, attr(htmlTag, "lang") === locale.lang);
			check(`html dir ${label}`, attr(htmlTag, "dir") === locale.dir);

			const h1s = html.match(/<h1\b[\s\S]*?<\/h1>/g) ?? [];
			check(`one h1 ${label}`, h1s.length === 1, `${h1s.length}`);
			check(`h1 text ${label}`, h1s[0] ? stripTags(h1s[0]).length > 3 : false);

			const blocks = jsonLd(html);
			const org = blocks.find((block) => block["@type"] === "Organization");
			const breadcrumb = blocks.find((block) => block["@type"] === "BreadcrumbList");
			check(`Organization JSON-LD ${label}`, Boolean(org?.name && org?.url));
			const items = breadcrumb?.itemListElement ?? [];
			check(`BreadcrumbList JSON-LD ${label}`, items.length >= (path === "/" ? 1 : 2), `${items.length}`);
			check(
				`breadcrumb ends at page ${label}`,
				items.at(-1)?.item === expectedCanonical,
				`${items.at(-1)?.item}`,
			);

			// Navigation: five real pages, active state from the route.
			const desktopNav = (html.match(/<nav class="header__nav"[\s\S]*?<\/nav>/) ?? [])[0] ?? "";
			const navTags = anchors(desktopNav);
			check(`primary nav has 5 links ${label}`, navTags.length === 5, `${navTags.length}`);
			const navRoutes = navTags.map((tag) => routeOf(attr(tag, "href")));
			check(
				`primary nav routes ${label}`,
				["/", "/about", "/courses", "/pricing", "/contact-us"].every((route) =>
					navRoutes.includes(route),
				),
				navRoutes.join(","),
			);
			check(
				`primary nav has no anchors ${label}`,
				navTags.every((tag) => !(attr(tag, "href") ?? "").includes("#")),
			);
			const currentTags = navTags.filter((tag) => attr(tag, "aria-current") === "page");
			if (NAV_ROUTES.has(path)) {
				check(`header aria-current ${label}`, currentTags.length === 1, `${currentTags.length}`);
				check(
					`header current route ${label}`,
					currentTags[0] ? routeOf(attr(currentTags[0], "href")) === path : false,
					currentTags[0] ? routeOf(attr(currentTags[0], "href")) : "none",
				);
			} else {
				check(`header no current off-nav ${label}`, currentTags.length === 0, `${currentTags.length}`);
			}

			const mobileBar = (html.match(/<nav class="mobile-bar"[\s\S]*?<\/nav>/) ?? [])[0] ?? "";
			const mobileTags = anchors(mobileBar);
			check(`mobile bar has 5 links ${label}`, mobileTags.length === 5, `${mobileTags.length}`);
			const mobileCurrent = mobileTags.filter((tag) => attr(tag, "aria-current") === "page");
			if (NAV_ROUTES.has(path)) {
				check(`mobile aria-current ${label}`, mobileCurrent.length === 1, `${mobileCurrent.length}`);
				check(
					`mobile current route ${label}`,
					mobileCurrent[0] ? routeOf(attr(mobileCurrent[0], "href")) === path : false,
				);
			} else {
				check(`mobile no current off-nav ${label}`, mobileCurrent.length === 0, `${mobileCurrent.length}`);
			}
			check(
				`mobile bar FAQ absent ${label}`,
				!mobileTags.some((tag) => routeOf(attr(tag, "href")) === "/faq"),
			);

			// FAQ lives in the hamburger panel and the footer, never the desktop nav.
			const panelNav = (html.match(/<nav class="header__panel-nav"[\s\S]*?<\/nav>/) ?? [])[0] ?? "";
			check(`FAQ in menu ${label}`, anchors(panelNav).some((tag) => routeOf(attr(tag, "href")) === "/faq"));
			const footer = (html.match(/<footer[\s\S]*?<\/footer>/) ?? [])[0] ?? "";
			const footerLinks = anchors(footer);
			check(`FAQ in footer ${label}`, footerLinks.some((tag) => routeOf(attr(tag, "href")) === "/faq"));
			for (const legalPath of LEGAL) {
				check(
					`footer link ${legalPath} ${label}`,
					footerLinks.some((tag) => routeOf(attr(tag, "href")) === legalPath),
				);
			}

			// FAQ accordion.
			const details = html.match(/<details\b[^>]*>/g) ?? [];
			if (path === "/faq") {
				check(`FAQ count 11 ${label}`, details.length === 11, `${details.length}`);
			}
			if (path === "/pricing") {
				check(`pricing FAQ count 4 ${label}`, details.length === 4, `${details.length}`);
			}
			if (path === "/") {
				check(`home FAQ count 5 ${label}`, details.length === 5, `${details.length}`);
			}
			if (path === "/contact-us") {
				check(`contact has no FAQ ${label}`, details.length === 0, `${details.length}`);
			}
			if (details.length > 0) {
				const summaries = html.match(/<summary\b[\s\S]*?<\/summary>/g) ?? [];
				check(`FAQ summaries ${label}`, summaries.length === details.length);
				check(
					`FAQ questions are headings ${label}`,
					summaries.every((summary) => /<h3\b/.test(summary)),
				);
				check(`FAQ first item open ${label}`, /\bopen\b/.test(details[0]), details[0]);
				check(`FAQPage schema ${label}`, html.includes('"@type":"FAQPage"'));
			}

			// Home page: full sections, three Learn more buttons, FAQ, form.
			if (path === "/") {
				const learnLinks = [
					...html.matchAll(
						/<a\b[^>]*href="([^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?(?:Learn more|اعرف المزيد)(?:(?!<\/a>)[\s\S])*?<\/a>/g,
					),
				].map((match) => decode(match[1]));
				const learnRoutes = learnLinks.map(routeOf);
				for (const target of ["/about", "/courses", "/pricing"]) {
					check(`home learn more ${target} ${label}`, learnRoutes.includes(target), learnRoutes.join(","));
				}
				check(`home three learn buttons ${label}`, learnLinks.length === 3, `${learnLinks.length}`);
				check(`home no contact teaser ${label}`, !learnRoutes.includes("/contact-us"));
				check(`home about panel ${label}`, /class="wisdom"/.test(html));
				check(`home standing out ${label}`, /id="standing-out"/.test(html));
				check(`home course rows ${label}`, /class="journey-list"/.test(html));
				check(
					`home feature splits ${label}`,
					classTokenCount(html, "feature-split") === 2,
					`${classTokenCount(html, "feature-split")}`,
				);
				check(`home stats ${label}`, /id="success"/.test(html));
				check(`home how it works ${label}`, /id="how-it-works"/.test(html));
				check(`home pricing cards ${label}`, /class="plan-grid"/.test(html));
				check(`home form ${label}`, /id="book"/.test(html));
				check(`home FAQ section ${label}`, /id="faq"/.test(html));
				check(`home FAQ two-column ${label}`, /class="faq-layout"/.test(html));
				check(
					`home FAQ WhatsApp line ${label}`,
					/class="faq-more"/.test(html) && /href="https:\/\/wa\.me\/923422766346"[^>]*target="_blank"/.test(html),
				);
				check(`home no scroll-spy ${label}`, !/data-nav-anchor/.test(html));
			}

			// Inner pages reuse the Home sections.
			if (path === "/about") {
				check(`about panel ${label}`, /class="wisdom"/.test(html));
				check(`about standing out ${label}`, /id="standing-out"/.test(html));
				check(`about stats ${label}`, /id="success"/.test(html));
				check(`about trial steps ${label}`, /id="how-it-works"/.test(html));
			}
			if (path === "/courses") {
				check(`courses rows ${label}`, /class="journey-list"/.test(html));
				check(
					`courses feature splits ${label}`,
					classTokenCount(html, "feature-split") === 2,
					`${classTokenCount(html, "feature-split")}`,
				);
				check(`courses images ${label}`, /section-phone|section-memorize/.test(html));
			}
			if (path === "/pricing") {
				check(`pricing cards ${label}`, /class="plan-grid"/.test(html));
				check(`pricing carousel ${label}`, /class="pricing-carousel"/.test(html));
				check(`pricing billing note ${label}`, /billed monthly|تُدفع جميع الخطط/.test(html));
			}
			if (path === "/contact-us") {
				check(`contact form ${label}`, /class="book__form"/.test(html) && /id="book"/.test(html));
				check(`contact phone ${label}`, /tel:\+923422766346/.test(html));
				check(`contact email ${label}`, /mailto:hello@kanwalquranacademy\.com/.test(html));
			}

			// Mobile CTA rule.
			if (path === "/") {
				check(
					`home mobile CTA to form ${label}`,
					anchors(mobileBar).some((tag) => (attr(tag, "href") ?? "") === "#book"),
				);
			} else {
				check(
					`mobile CTA to contact ${label}`,
					anchors(mobileBar).some((tag) =>
						(attr(tag, "href") ?? "").includes(`${locale.prefix}/contact-us`.replace("//", "/")),
					),
				);
			}

			// Copy hygiene: no em dashes in our own pages. CMS legal text is
			// reported separately because editors paste it themselves.
			const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) ?? [])[1] ?? "";
			const emDashes = (stripTags(main).match(/—/g) ?? []).length;
			if (emDashes > 0) metrics.push(`em dash count ${label}: ${emDashes}`);
			if (!LEGAL.has(path)) check(`no em dashes ${label}`, emDashes === 0, `${emDashes}`);

			// Theme tokens and responsive rules ship in the inlined CSS.
			check(
				`dark tokens ${label}`,
				html.includes('[data-theme="dark"]') || html.includes("[data-theme=dark]"),
			);
			check(`mobile breakpoint ${label}`, html.includes("767px"));
			check(`desktop breakpoint ${label}`, html.includes("1024px"));

			pageData.push({ label, path, prefix: locale.prefix, html, url });
		}
	}

	// ---- Mobile CTA keeps the prefill query --------------------------------
	for (const prefix of ["", "/ar"]) {
		const url = `${BASE}${prefix}/pricing?plan=plan-ii&course=tajweed-proficiency`;
		const html = await (await fetch(url)).text();
		const mobileBar = (html.match(/<nav class="mobile-bar"[\s\S]*?<\/nav>/) ?? [])[0] ?? "";
		const contact = anchors(mobileBar).find((tag) => (attr(tag, "href") ?? "").includes("contact-us"));
		const href = contact ? attr(contact, "href") : "";
		check(
			`prefill query ${prefix || "en"}`,
			href.includes("plan=plan-ii") && href.includes("course=tajweed-proficiency") && href.endsWith("#book"),
			href,
		);
	}

	// ---- Redirects --------------------------------------------------------
	const redirects = [
		["/teachers", "/about"],
		["/ar/teachers", "/ar/about"],
		["/contact", "/contact-us"],
		["/ar/contact", "/ar/contact-us"],
		["/free-trial", "/contact-us"],
		["/ar/free-trial", "/ar/contact-us"],
		["/our-story", "/about"],
		["/ar/our-story", "/ar/about"],
		["/blog", "/"],
		["/ar/blog", "/ar/"],
		["/blog/old-post", "/"],
		["/courses/tajweed-proficiency", "/courses"],
	];
	for (const [path, target] of redirects) {
		const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
		check(`301 ${path}`, response.status === 301, `${response.status}`);
		check(`location ${path}`, response.headers.get("location") === target, `${response.headers.get("location")}`);
	}

	// ---- 404 and 410 ------------------------------------------------------
	for (const path of ["/not-a-real-page-9f2", "/ar/not-a-real-page-9f2", "/nested/not-real", "/ar/nested/not-real"]) {
		const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
		const html = await response.text();
		check(`404 ${path}`, response.status === 404, `${response.status}`);
		check(`404 page ${path}`, /Page not found|الصفحة غير موجودة/.test(html));
	}
	for (const path of ["/wp-admin", "/wp-admin/setup", "/xmlrpc.php", "/wp-content/uploads/x.php", "/ar/wp-admin"]) {
		const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
		check(`410 ${path}`, response.status === 410, `${response.status}`);
		check(`410 noindex ${path}`, (response.headers.get("x-robots-tag") ?? "").includes("noindex"));
		check(`410 not a redirect ${path}`, !response.headers.get("location"));
	}

	// ---- Sitemap and robots ----------------------------------------------
	const sitemap = await fetch(`${BASE}/sitemap.xml`);
	const sitemapXml = await sitemap.text();
	check("sitemap 200", sitemap.status === 200, `${sitemap.status}`);
	check("sitemap xml", /<urlset/.test(sitemapXml));
	const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
	check("sitemap 18 urls", locs.length === 18, `${locs.length}`);
	const sitemapPaths = locs.map((loc) => new URL(loc).pathname);
	for (const forbidden of ["/teachers", "/contact", "/free-trial", "/blog", "/our-story"]) {
		check(
			`sitemap excludes ${forbidden}`,
			!sitemapPaths.some((p) => {
				const route = p.replace(/^\/ar(?=\/|$)/, "") || "/";
				return route === forbidden || route.startsWith(`${forbidden}/`);
			}),
		);
	}
	check(
		"sitemap covers both locales",
		PAGES.every((path) => {
			const en = path === "/" ? "/" : path;
			const ar = path === "/" ? "/ar/" : `/ar${path}`;
			return sitemapPaths.includes(en) && sitemapPaths.includes(ar);
		}),
	);
	for (const loc of locs) {
		const path = new URL(loc).pathname;
		const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
		check(`sitemap url live ${path}`, response.status === 200, `${response.status}`);
	}

	const robots = await fetch(`${BASE}/robots.txt`);
	const robotsText = await robots.text();
	check("robots 200", robots.status === 200);
	check("robots sitemap", robotsText.includes("Sitemap: https://kanwalquranacademy.com/sitemap.xml"));
	check("robots admin disallow", robotsText.includes("Disallow: /_emdash/"));

	// ---- Language switch --------------------------------------------------
	for (const data of pageData.filter((page) => page.path === "/about" || page.path === "/faq")) {
		const switchHtml = (data.html.match(/<nav class="lang-switch"[\s\S]*?<\/nav>/) ?? [])[0] ?? "";
		const links = anchors(switchHtml).map((tag) => attr(tag, "href"));
		const expectedEn = data.path;
		const expectedAr = `/ar${data.path}`;
		check(`language switch en ${data.label}`, links.includes(expectedEn), links.join(","));
		check(`language switch ar ${data.label}`, links.includes(expectedAr), links.join(","));
		check(
			`language switch current ${data.label}`,
			anchors(switchHtml).some((tag) => attr(tag, "aria-current") === "true"),
		);
	}

	// ---- Copy inventory ---------------------------------------------------
	metrics.push(`pages checked: ${pageData.length}`);
	metrics.push(`unique titles: ${titles.size}`);
	metrics.push(`unique descriptions: ${descriptions.size}`);

	console.log("");
	for (const line of metrics) console.log(`METRIC ${line}`);
	console.log(`\n${passed} checks passed, ${failures.length} failed`);
	if (failures.length > 0) {
		for (const failure of failures) console.log(`  - ${failure}`);
		process.exit(1);
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
