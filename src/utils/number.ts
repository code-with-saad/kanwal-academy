/**
 * One place for every number the site renders.
 *
 * NUMERAL_SYSTEM is the single switch for the digit set:
 *   "latin"        -> 5+, $20, 20 (default, Western digits)
 *   "arabic-indic" -> ٥+, ٢٠$ (through Intl.NumberFormat("ar-EG"))
 *
 * Numbers are isolated from RTL text with a Unicode LTR isolate (or the
 * <NumberText /> / <bdi dir="ltr"> wrapper) so "5+" never flips to "+5" and
 * "$20" never flips to "20$".
 */
export type NumeralSystem = "latin" | "arabic-indic";

export const NUMERAL_SYSTEM: NumeralSystem = "latin";

/** Locale used by Intl.NumberFormat for the active numeral system. */
export const NUMBER_LOCALE = NUMERAL_SYSTEM === "latin" ? "en-US" : "ar-EG";

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const LATIN_DIGITS = /[0-9]/g;
const ANY_DIGIT = /[0-9\u0660-\u0669]/;

/** Formats a finite number with the active numeral system. */
export function formatNumber(
	value: number | string,
	options: Intl.NumberFormatOptions = {},
): string {
	const numeric = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(numeric)) return formatNumericText(String(value));
	return new Intl.NumberFormat(NUMBER_LOCALE, {
		maximumFractionDigits: 0,
		...options,
	}).format(numeric);
}

/**
 * Converts the ASCII digits inside arbitrary text (for example a CMS value
 * like "5+" or "[000]+") to the active numeral system. Non-digit characters
 * are left untouched.
 */
export function formatNumericText(text: string): string {
	if (NUMERAL_SYSTEM === "latin") return text;
	return text.replace(LATIN_DIGITS, (digit) => ARABIC_INDIC_DIGITS[Number(digit)] ?? digit);
}

/** True when the text contains any Latin or Arabic-Indic digit. */
export function hasDigits(text: string): boolean {
	return ANY_DIGIT.test(text);
}

/**
 * Wraps a number (or numeric token) in a Unicode LTR isolate so it keeps its
 * order inside an RTL sentence. Use this for plain-text interpolation; use
 * <NumberText /> when you control the markup.
 */
export function isolateLtr(text: string): string {
	return `\u2066${formatNumericText(text)}\u2069`;
}

/**
 * Formats a price with an optional currency symbol. The default keeps the
 * familiar "$20" order; pass an empty symbol for the "20 USD" style.
 */
export function formatPrice(price: number | string, symbol = "$"): string {
	const prefix = symbol?.trim() ?? "";
	return `${prefix}${formatNumber(price)}`;
}
