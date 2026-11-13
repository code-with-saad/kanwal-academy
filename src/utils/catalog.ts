/**
 * Localized views of CMS catalog entries.
 *
 * Collection queries cannot translate an entry per field, so when a locale has
 * no published entries the query falls back to English. In that case the
 * dictionary supplies the translated course names, summaries and plan names;
 * otherwise the CMS values win.
 */
import type { ContentEntry } from "emdash";
import type { Course, Plan } from "../../emdash-env";
import type { Locale, UiDictionary } from "../i18n";

export interface CourseCopy {
	name: string;
	summary: string;
	level: string;
}

/** Data PlanCard renders. Kept here so .astro files and helpers share one type. */
export interface PlanCardData {
	slug?: string;
	name: string;
	price: number | string;
	currencySymbol?: string;
	billingPeriod?: string;
	classesPerWeek: number;
	classesPerMonth: number;
	hoursPerMonth: number;
	isPopular?: boolean;
}

export function getCourseCopy(
	course: ContentEntry<Course>,
	fallbackLocale: string | undefined,
	t: UiDictionary,
): CourseCopy {
	if (fallbackLocale && course.id in t.catalog.courses) {
		return t.catalog.courses[course.id as keyof typeof t.catalog.courses];
	}
	return {
		name: String(course.data.name ?? ""),
		summary: String(course.data.summary ?? ""),
		level: String(course.data.level ?? ""),
	};
}

export function getPlanName(
	plan: ContentEntry<Plan>,
	fallbackLocale: string | undefined,
	t: UiDictionary,
): string {
	return fallbackLocale && plan.id in t.catalog.plans
		? t.catalog.plans[plan.id as keyof typeof t.catalog.plans]
		: String(plan.data.name ?? "");
}

export function toPlanCard(
	plan: ContentEntry<Plan>,
	fallbackLocale: string | undefined,
	t: UiDictionary,
	locale: Locale,
): PlanCardData {
	return {
		slug: plan.id,
		name: getPlanName(plan, fallbackLocale, t),
		price: plan.data.price,
		currencySymbol: plan.data.currency_symbol ?? "$",
		// The CMS stores an English "/ month"; Arabic uses the localized label.
		billingPeriod: locale === "en" ? (plan.data.billing_period ?? "/ month") : undefined,
		classesPerWeek: plan.data.classes_per_week,
		classesPerMonth: plan.data.classes_per_month,
		hoursPerMonth: plan.data.hours_per_month,
		isPopular: plan.data.is_popular ?? false,
	};
}
