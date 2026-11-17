const base = "https://kanwalquranacademy.com";
for (const path of ["/pricing?cb=1", "/courses?cb=1", "/about?cb=1", "/?cb=1"]) {
	const r = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
	const h = await r.text();
	const hero = h.match(/<h1[\s\S]{0,260}?<\/h1>/)?.[0]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
	console.log(path, r.status, "cf-cache:", r.headers.get("cf-cache-status"), "age:", r.headers.get("age"));
	console.log("   h1:", JSON.stringify(hero?.slice(0, 90)));
}