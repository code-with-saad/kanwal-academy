// What Arabic text does an EN visitor actually see on each page?
const base = "https://kanwalquranacademy.com";
for (const path of ["/", "/courses", "/pricing", "/about", "/contact-us", "/faq"]) {
	const r = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
	const h = await r.text();
	const body = h.slice(h.indexOf("<main"), h.indexOf("</main>"));
	const runs = [...new Set((body.match(/[؀-ۿ][؀-ۿ\s،.؟!()0-9]{2,60}/g) ?? []).map((s) => s.trim()))];
	console.log(`\n${path} (${r.status}) arabic runs in <main>: ${runs.length}`);
	console.log(runs.slice(0, 14).join(" | "));
}