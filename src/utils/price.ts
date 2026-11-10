import { formatPrice } from "./number";

/**
 * Formats a plan price with the supplied currency symbol, for example "$40".
 * Delegates to the shared number helper so the numeral system is controlled
 * by one constant (src/utils/number.ts). Falls back to "$" and the raw value
 * when the symbol is missing or the price is not a finite number.
 */
export const formatUsdPrice = (
	price: number | string,
	symbol: string | undefined = "$",
): string => {
	const numeric = typeof price === "number" ? price : Number(price);
	if (!Number.isFinite(numeric)) return `${symbol?.trim() || "$"}${price}`;
	return formatPrice(numeric, symbol?.trim() || "$");
};
