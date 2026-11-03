/**
 * Static photography shipped in public/images.
 *
 * The CMS does not store these paths yet, so the map keeps them in one place.
 * If a path is missing at runtime, the ImagePlaceholder component shows a
 * labelled box instead of a broken image.
 */
export const heroImage = {
	src: "/images/hero-quran.png",
	alt: "An open Qur'an resting on a carved wooden rehal",
} as const;

export const courseImages: Record<string, { src: string; alt: string }> = {
	"quranic-recitation": {
		src: "/images/course-recitation.jpg",
		alt: "An open Qur'an on a wooden rehal, ready for a recitation lesson",
	},
	"tajweed-proficiency": {
		src: "/images/course-tajweed.jpg",
		alt: "An open Qur'an on a wooden rehal, ready for a tajweed lesson",
	},
	"memorization-excellence": {
		src: "/images/course-memorization.jpg",
		alt: "An open Qur'an on a wooden rehal, ready for a memorization lesson",
	},
};
