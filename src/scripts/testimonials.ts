export function initTestimonials(root: HTMLElement): void {
	const items = Array.from(root.querySelectorAll<HTMLElement>(".tm-item"));
	const quotes = Array.from(root.querySelectorAll<HTMLElement>(".tm-quote"));
	const progress = root.querySelector<HTMLElement>("[data-progress]");
	const count = items.length;
	if (!count) return;

	let active = 0;

	const restartProgress = () => {
		if (!progress) return;
		progress.style.animation = "none";
		void progress.offsetWidth;
		progress.style.animation = "";
	};

	const render = () => {
		items.forEach((element, index) => {
			let offset = (((index - active) % count) + count) % count;
			if (offset > count / 2) offset -= count;
			element.style.setProperty("--off", String(offset));
			element.dataset.state = offset === 0 ? "active" : Math.abs(offset) === 1 ? "near" : "far";
			element.setAttribute("aria-selected", String(offset === 0));
			element.tabIndex = offset === 0 ? 0 : -1;
		});
		quotes.forEach((quote, index) => (quote.dataset.active = String(index === active)));
		restartProgress();
	};

	const go = (index: number) => {
		active = ((index % count) + count) % count;
		render();
	};

	if (progress && count > 1) {
		progress.addEventListener("animationend", () => go(active + 1));
	} else if (progress) {
		progress.parentElement?.setAttribute("hidden", "");
	}

	items.forEach((element, index) => element.addEventListener("click", () => go(index)));
	root.querySelector("[data-prev]")?.addEventListener("click", () => go(active - 1));
	root.querySelector("[data-next]")?.addEventListener("click", () => go(active + 1));
	root.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown" || event.key === "ArrowRight") go(active + 1);
		else if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(active - 1);
		else return;
		items[active].focus();
	});

	const card = root.querySelector<HTMLElement>(".tm-card");
	card?.addEventListener("mouseenter", () => progress?.classList.add("is-paused"));
	card?.addEventListener("mouseleave", () => progress?.classList.remove("is-paused"));

	render();
}
