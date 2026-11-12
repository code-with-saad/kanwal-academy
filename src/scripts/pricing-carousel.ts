export function initPricingCarousel(root: HTMLElement): void {
	const track = root.querySelector<HTMLElement>(".pricing-carousel__track")!;
	const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
	const dots = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-dot]"));
	const prevBtn = root.querySelector<HTMLButtonElement>("[data-prev]")!;
	const nextBtn = root.querySelector<HTMLButtonElement>("[data-next]")!;
	const statusEl = root.querySelector<HTMLElement>("[data-status]")!;
	const statusTemplate = root.dataset.statusTemplate ?? "{name}, plan {index} of {total}";
	const total = slides.length;
	const start = Number(root.dataset.start ?? 1);
	let current = start;

	const isRtl = () => document.documentElement.dir === "rtl";
	const offsetTo = (index: number) => {
		const trackRect = track.getBoundingClientRect();
		const slideRect = slides[index].getBoundingClientRect();
		return slideRect.left - trackRect.left;
	};
	const scrollTo = (index: number, behavior: ScrollBehavior = "smooth") => {
		if (index < 0 || index >= total) return;
		current = index;
		track.scrollBy({ left: offsetTo(index), behavior });
	};
	const scrollToStart = () => {
		if (slides[start]) track.scrollLeft += offsetTo(start);
	};

	if (slides[start]?.offsetWidth) scrollToStart();
	else requestAnimationFrame(scrollToStart);

	const updateUI = () => {
		const trackRect = track.getBoundingClientRect();
		const center = trackRect.left + trackRect.width / 2;
		let closest = 0;
		let closestDist = Infinity;

		slides.forEach((slide, index) => {
			const rect = slide.getBoundingClientRect();
			const distance = Math.abs(rect.left + rect.width / 2 - center);
			if (distance < closestDist) {
				closestDist = distance;
				closest = index;
			}
		});

		current = closest;
		dots.forEach((dot, index) => {
			const active = index === current;
			dot.classList.toggle("pricing-carousel__dot--active", active);
			dot.setAttribute("aria-selected", String(active));
		});
		prevBtn.disabled = current === 0;
		nextBtn.disabled = current === total - 1;
		const planName = slides[current]?.querySelector(".plan-card__name")?.textContent?.trim() ?? "";
		statusEl.textContent = statusTemplate
			.replace("{name}", planName)
			.replace("{index}", String(current + 1))
			.replace("{total}", String(total));
	};

	prevBtn.addEventListener("click", () => scrollTo(current - 1));
	nextBtn.addEventListener("click", () => scrollTo(current + 1));
	dots.forEach((dot, index) => dot.addEventListener("click", () => scrollTo(index)));

	let scrollTimer: ReturnType<typeof setTimeout>;
	track.addEventListener(
		"scroll",
		() => {
			clearTimeout(scrollTimer);
			scrollTimer = setTimeout(updateUI, 80);
		},
		{ passive: true },
	);
	root.addEventListener("keydown", (event: KeyboardEvent) => {
		const step = isRtl() ? -1 : 1;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			scrollTo(current - step);
		}
		if (event.key === "ArrowRight") {
			event.preventDefault();
			scrollTo(current + step);
		}
	});

	updateUI();
}
