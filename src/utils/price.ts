/**
 * Formats a plan price with the supplied currency symbol, for example "$40".
 * Falls back to "$" and the raw value when the symbol is missing or the price
 * is not a finite number.
 */
export const formatUsdPrice = (
	price: number | string,
	symbol: string | undefined = "$",
): string => {
	const numeric = typeof price === "number" ? price : Number(price);
	const prefix = symbol?.trim() || "$";
	if (!Number.isFinite(numeric)) return `${prefix}${price}`;
	return `${prefix}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(numeric)}`;
};
