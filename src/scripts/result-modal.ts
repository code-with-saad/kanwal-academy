type ResultState = "success" | "error" | "rate";

let lastFocus: HTMLElement | null = null;
let initialized = false;

const dialog = document.getElementById("result-modal") as HTMLDialogElement | null;
const panels = () =>
	dialog ? Array.from(dialog.querySelectorAll<HTMLElement>("[data-rm-panel]")) : [];

const trapFocus = (event: KeyboardEvent) => {
	if (event.key !== "Tab" || !dialog) return;
	const focusable = Array.from(
		dialog.querySelectorAll<HTMLElement>(
			'a[href],button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
		),
	).filter((element) => element.offsetParent !== null || element === document.activeElement);
	if (!focusable.length) return;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
};

function initialize(): void {
	if (!dialog || initialized) return;
	initialized = true;

	const close = () => {
		if (dialog.open) dialog.close();
	};
	dialog.querySelectorAll<HTMLElement>("[data-rm-close]").forEach((button) =>
		button.addEventListener("click", close),
	);
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) close();
	});
	dialog.addEventListener("cancel", (event) => {
		event.preventDefault();
		close();
	});
	dialog.addEventListener("close", () => {
		document.body.removeAttribute("data-modal-open");
		dialog.removeEventListener("keydown", trapFocus);
		lastFocus?.focus();
		lastFocus = null;
	});
	dialog.querySelector<HTMLButtonElement>("[data-rm-retry]")?.addEventListener("click", () => {
		close();
		document.dispatchEvent(new CustomEvent("book-retry"));
	});
}

export function showResultModal(state: ResultState, message?: string): void {
	if (!dialog) return;
	initialize();
	if (!dialog.open) lastFocus = document.activeElement as HTMLElement | null;

	for (const panel of panels()) panel.hidden = panel.dataset.rmPanel !== state;
	if (message) {
		const slot = dialog.querySelector<HTMLElement>(
			`[data-rm-${state === "success" ? "success" : state}-text]`,
		);
		if (slot) slot.textContent = message;
	}

	if (!dialog.open) {
		dialog.showModal();
		dialog.addEventListener("keydown", trapFocus);
		document.body.setAttribute("data-modal-open", "1");
		const target = dialog.querySelector<HTMLElement>(
			state === "error" ? "[data-rm-retry]" : "[data-rm-close]",
		);
		requestAnimationFrame(() => target?.focus());
	}
}

Object.defineProperty(window, "showResultModal", { value: showResultModal });
