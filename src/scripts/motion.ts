/**
 * Site motion system.
 *
 * One IntersectionObserver reveals every [data-reveal] element, splits
 * [data-reveal-words] headings into words and starts [data-count-to]
 * counters. Everything runs once per element. Elements stay visible when
 * this script never runs, and the whole system is skipped under
 * prefers-reduced-motion (the `js-motion` class is not added then).
 */

import { NUMBER_LOCALE } from "../utils/number";

const COUNTER_DURATION = 1400;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function applyDelay(element: HTMLElement) {
	const raw = element.dataset.revealDelay;
	if (!raw) return;
	const value = Number(raw);
	if (Number.isFinite(value)) element.style.setProperty("--reveal-delay", `${value}ms`);
}

function splitHeading(heading: HTMLElement) {
	const text = (heading.textContent ?? "").replace(/\s+/g, " ").trim();
	if (!text) return;

	if (!heading.hasAttribute("aria-label")) heading.setAttribute("aria-label", text);

	const wrapper = document.createElement("span");
	wrapper.className = "reveal-words";
	wrapper.setAttribute("aria-hidden", "true");
	while (heading.firstChild) wrapper.appendChild(heading.firstChild);
	heading.appendChild(wrapper);

	let index = 0;
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const parts = (node.textContent ?? "").split(/(\s+)/);
			const fragment = document.createDocumentFragment();
			for (const part of parts) {
				if (part === "") continue;
				if (/^\s+$/.test(part)) {
					fragment.appendChild(document.createTextNode(part));
					continue;
				}
				const word = document.createElement("span");
				word.className = "reveal-word";
				word.style.setProperty("--word-index", String(index));
				word.textContent = part;
				index += 1;
				fragment.appendChild(word);
			}
			(node as ChildNode).replaceWith(fragment);
			return;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) return;
		for (const child of Array.from(node.childNodes)) walk(child);
	};
	walk(wrapper);
}

function startCounter(element: HTMLElement) {
	const target = Number(element.dataset.countTo);
	// Placeholder statistics such as "[000]+" never animate.
	if (!Number.isFinite(target) || (element.textContent ?? "").includes("[")) return;

	const prefix = element.dataset.countPrefix ?? "";
	const suffix = element.dataset.countSuffix ?? "";
	const decimals = Number(element.dataset.countDecimals ?? "0");
	const format = (value: number) =>
		`${prefix}${value.toLocaleString(NUMBER_LOCALE, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		})}${suffix}`;

	const started = performance.now();
	const step = (now: number) => {
		const progress = Math.min((now - started) / COUNTER_DURATION, 1);
		element.textContent = format(target * easeOutCubic(progress));
		if (progress < 1) {
			requestAnimationFrame(step);
		} else {
			element.textContent = format(target);
		}
	};
	element.textContent = format(0);
	requestAnimationFrame(step);
}

function init() {
	if (!document.documentElement.classList.contains("js-motion")) return;

	document.documentElement.setAttribute("data-motion-ready", "1");

	const revealTargets = Array.from(
		document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-words], [data-count-to]"),
	);

	for (const target of revealTargets) {
		applyDelay(target);
		if (target.hasAttribute("data-reveal-words")) splitHeading(target);
	}

	const reveal = (target: HTMLElement) => {
		if (target.classList.contains("is-revealed")) return;
		target.classList.add("is-revealed");
		if (target.hasAttribute("data-count-to")) startCounter(target);
	};

	if (!("IntersectionObserver" in window)) {
		for (const target of revealTargets) reveal(target);
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				reveal(entry.target as HTMLElement);
				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
	);

	for (const target of revealTargets) observer.observe(target);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
	init();
}
