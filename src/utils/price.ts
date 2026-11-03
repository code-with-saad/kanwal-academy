/**
 * Formats a plan price as a whole US dollar amount, for example "$40".
 * Falls back to the raw value when it is not a finite number.
 */
export const formatUsdPrice = (price: number | string): string => {
	const numeric = typeof price === "number" ? price : Number(price);
	if (!Number.isFinite(numeric)) return String(price);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(numeric);
};
