const base = "https://kanwalquranacademy.com";
const probes = [
	["/pricing?cb=2", "Plans that fit", "اختر خطة تناسب"],
	["/courses?cb=2", "Three paths to the", "ابدأ رحلتك"],
	["/about?cb=2", "Where ", "ما يميزنا"],
	["/contact-us?cb=2", "Talk to", "تحدث"],
	["/faq?cb=2", "Frequently asked", "الأسئلة"],
];
for (const [path, en, ar] of probes) {
	const r = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
	const h = await r.text();
	console.log(path, "EN-marker:", h.includes(en), "AR-marker:", h.includes(ar));
}