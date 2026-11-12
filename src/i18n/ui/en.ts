/**
 * English interface copy.
 *
 * This is the source of truth for every string the site renders outside the
 * CMS. ar.ts must mirror this exact shape (its type is `typeof en`), so a
 * missing Arabic key fails the typecheck instead of shipping English text by
 * accident.
 *
 * The `home` group holds the fallback copy for the Home entry in the pages
 * collection: a CMS value always wins, these strings are used only when the
 * field has never been filled in.
 */
export const en = {
	nav: {
		home: "Home",
		about: "About",
		courses: "Courses",
		pricing: "Pricing",
		contact: "Contact",
		teachers: "Teachers",
	},
	actions: {
		bookFreeTrial: "Book free trial",
		selectPlan: "Select plan",
		seeDetails: "See details",
		readMore: "Read more",
		readAllArticles: "Read all articles",
		goHome: "Go home",
		contactUs: "Contact us",
		close: "Close",
		tryAgain: "Try again",
	},
	a11y: {
		skipToContent: "Skip to content",
		backToTop: "Back to top",
		home: "home",
		primaryNav: "Primary",
		openMenu: "Open menu",
		closeMenu: "Close menu",
		languageSwitcher: "Language",
		monthlyPlans: "Monthly plans",
		reviewers: "Reviewers",
		planSelector: "Plan selector",
		previousPlan: "Previous plan",
		nextPlan: "Next plan",
		planStatus: "{name}, plan {index} of {total}",
		previousReview: "Previous review",
		nextReview: "Next review",
		switchToDark: "Switch to dark theme",
		switchToLight: "Switch to light theme",
	},
	stats: {
		years: "Years teaching",
		yearsShort: "years",
		countries: "Countries served",
		students: "Students taught",
		sessions: "Sessions delivered",
		studentsShort: "Students",
		sessionsShort: "Sessions",
		countriesShort: "Countries",
	},
	footer: {
		tagline: "Online Qur'an education for students worldwide.",
		exploreLabel: "Explore",
		contactLabel: "Contact",
		coursesLabel: "Courses",
		academyLabel: "Academy",
		pricingLabel: "Pricing",
		teachersLabel: "Teachers",
		trialLabel: "Free trial",
		contactLinkLabel: "Contact",
		termsLabel: "Terms of Service",
		privacyLabel: "Privacy Policy",
		copyrightLabel: "All rights reserved.",
		newsletterHeading: "Stay in touch",
		newsletterConsent:
			"We only use your email to send occasional learning notes. Read our Privacy Policy.",
		stayInTouch: "Stay in touch",
		aboutLabel: "About",
		courseRecitation: "Qur'anic Recitation",
		courseTajweed: "Tajweed Proficiency",
		courseMemorization: "Memorization Excellence",
	},
	newsletter: {
		emailLabel: "Email address",
		placeholder: "you@example.com",
		subscribe: "Subscribe",
		subscribing: "Subscribing",
		invalidEmail: "Enter a valid email address.",
		success: "You are on the list. JazakAllah khair.",
		error: "We could not save your email. Please try again.",
	},
	form: {
		name: "Your name",
		email: "Email address",
		phone: "Phone number",
		course: "Course",
		plan: "Plan",
		message: "Message",
		optional: "(optional)",
		website: "Website",
		courseUnsure: "Not sure yet",
		planHelp: "Help me choose",
		messagePlaceholder: "Student age, current level, any questions",
		sending: "Sending request",
		loadError: "We could not load the form. Please refresh the page or contact us directly.",
		required: "required",
	},
	/**
	 * Form and API feedback. The API returns a stable `code`; the browser maps
	 * it to one of these strings, so validation messages follow the page
	 * language without the server having to translate anything.
	 */
	feedback: {
		invalid_name: "Please enter your name.",
		invalid_email: "Enter a valid email address.",
		invalid_phone: "Enter a valid phone number with country code.",
		invalid_phone_short: "Phone number is too short.",
		invalid_phone_long: "Phone number is too long.",
		validation: "Please check your entries and try again.",
		parse_error: "Could not parse request.",
		service_unavailable: "Service unavailable. Please email us directly.",
		rate_limited: "Too many attempts. Please try again in an hour.",
		turnstile_failed: "The security check failed. Please try again.",
		save_failed: "We could not save your request. Please try again.",
		newsletter_save_failed: "We could not save your email. Please try again.",
		invalid_type: "Invalid request type.",
		success_enrolment: "Thank you. We will be in touch soon.",
		success_newsletter: "You are on the list. JazakAllah khair.",
		generic_error: "Something went wrong. Please try again or contact us directly.",
		network_error: "We could not reach the server. Check your connection and try again.",
		unknown: "Please try again.",
	},
	modal: {
		successTitle: "Request received",
		successBody:
			"Thank you. We will reply within one business day with the next available trial slot. The class is free and no payment is needed.",
		errorTitle: "We could not send your request",
		errorBody: "Please try again.",
		rateTitle: "Too many attempts",
		rateBody: "Please try again in an hour, or contact us directly.",
		whatsapp: "WhatsApp us",
	},
	notFound: {
		title: "Page not found",
		lead: "The page you are looking for does not exist or has moved.",
	},
	page: {
		empty: "This page has no content yet. Add some in the editor, then publish.",
		unavailableTitle: "This page is not available in Arabic yet",
		unavailableBody:
			"We are preparing an Arabic version of this page. You can read the English version for now.",
		englishVersion: "Read the English version",
	},
	catalog: {
		address: "Missouri, USA",
		plans: {
			"plan-i": "Plan I",
			"plan-ii": "Plan II",
			"plan-iii": "Plan III",
			"plan-iv": "Plan IV",
		},
		courses: {
			"quranic-recitation": {
				name: "Qur'anic Recitation",
				summary:
					"Build fluent, accurate recitation with a teacher who listens and corrects in real time.",
				level: "All levels",
			},
			"tajweed-proficiency": {
				name: "Tajweed Proficiency",
				summary:
					"Learn the rules of tajweed and apply them consistently in your daily recitation.",
				level: "Intermediate",
			},
			"memorization-excellence": {
				name: "Memorization Excellence",
				summary:
					"Follow a structured hifz plan with regular revision and one-to-one accountability.",
				level: "Advanced",
			},
		},
	},
	images: {
		hero: "An open Qur'an resting on a carved wooden rehal",
		split1: "A student joining a Qur'an lesson on a phone",
		split2: "An open Qur'an with a page marker, ready for memorization practice",
		planCarousel: "Open Qur'an on a wooden rehal",
		wisdomPlaceholder: "Wisdom image (4:5)",
		courseRecitation: "An open Qur'an on a wooden rehal, ready for a recitation lesson",
		courseTajweed: "An open Qur'an on a wooden rehal, ready for a tajweed lesson",
		courseMemorization: "An open Qur'an on a wooden rehal, ready for a memorization lesson",
	},
	home: {
		home_headline: "Recite the Qur'an with a teacher who knows your name.",
		home_lead:
			"One-to-one lessons in recitation, tajweed and memorization. Start with a free trial class from wherever you are.",
		home_image_alt: "An open Qur'an resting on a carved wooden rehal",
		home_reach_text: "Students learning from {countries} countries",
		home_cta_label: "Start your free trial",
		feature_card_1_title: "Free trial class",
		feature_card_1_text: "Meet your teacher first.",
		feature_card_1_chip: "Free Trial",
		feature_card_2_title: "Plans from {price}/month",
		feature_card_2_text: "Choose a weekly pace.",
		feature_card_3_title: "Students in {countries} countries",
		feature_card_3_text: "Join families worldwide.",
		feature_card_4_title: "Learn on any device",
		feature_card_4_text: "Phone, tablet or laptop.",
		courses_journey_heading: "Start your journey",
		courses_journey_intro:
			"Three courses, each taught one to one. Pick the path that matches where you are and your teacher will set the pace from there.",
		courses_format_label: "Live one on one",
		split1_heading_before: "Easy Qur'an learning",
		split1_heading_highlight: "online",
		split1_paragraph_1:
			"Lessons run live in a video call, so you only need a phone, tablet or laptop with a camera. Your teacher shares the page you are reading and listens while you recite.",
		split1_paragraph_2:
			"The same teacher stays with you each week, so corrections and progress carry over from class to class.",
		split1_image_label: "Lesson on a phone (4:3)",
		split1_image_alt: "A student joining a Qur'an lesson on a phone",
		split2_heading_before: "How to memorize the Qur'an",
		split2_heading_highlight: "with confidence",
		split2_paragraph_1:
			"Memorization grows in small, steady steps. Your teacher sets a monthly target, listens to what you have learned, and revises with you before adding new lines.",
		split2_list_items: "",
		split2_image_label: "Memorization practice (4:3)",
		split2_image_alt: "An open Qur'an with a page marker, ready for memorization practice",
		stats_eyebrow: "Over the past 5 years",
		stats_heading: "Our success",
		stats_description:
			"Our three courses, Qur'anic Recitation, Tajweed Proficiency and Memorization Excellence, help students learn the Qur'an at their own pace and from the comfort of home.",
		about_eyebrow: "Why Kanwal",
		about_title_before: "Experience Qur'anic",
		about_title_highlight: "wisdom",
		about_title_after: "with us",
		about_badge_label: "teaching",
		about_paragraph_1:
			"Kanwal Quran Academy teaches the Qur'an online in live one to one classes. Your teacher listens to your recitation, corrects it as you read, and sets a weekly plan around your level.",
		about_paragraph_2: "",
		about_image_alt: "A student reciting the Qur'an during a live online lesson",
		standing_eyebrow: "Standing out",
		standing_heading: "Standing out",
		standing_item_1_title: "Personalized schedules",
		standing_item_1_text:
			"You pick the days and times that suit your week, and your teacher keeps that slot for you.",
		standing_item_2_title: "Qualified Qur'an teachers",
		standing_item_2_text:
			"Every class is taught by a teacher with formal Qur'anic training, matched to your course and level.",
		standing_item_3_title: "Live one on one sessions",
		standing_item_3_text:
			"Video lessons with direct feedback, so your questions are answered in the moment.",
		pricing_eyebrow: "Pricing",
		pricing_heading: "Choose a plan that fits your week.",
		pricing_intro:
			"Every plan is billed monthly and starts with a free trial class. Prices are in US dollars.",
		pricing_period_label: "/ month",
		pricing_classes_week_label: "Classes each week",
		pricing_classes_month_label: "Classes each month",
		pricing_hours_label: "Teaching hours each month",
		pricing_popular_label: "Most popular",
		pricing_select_cta: "Select plan",
		trial_eyebrow: "Free trial",
		trial_heading: "How the free trial works",
		trial_step_1_title: "Book your free trial",
		trial_step_1_body:
			"Choose a plan and pick a time that works for you. The trial class is free.",
		trial_step_2_title: "Meet your teacher",
		trial_step_2_body:
			"We match you with a teacher for your course and level, then assess where you are.",
		trial_step_3_title: "Start your plan",
		trial_step_3_body:
			"Your teacher builds a weekly schedule around your goals and keeps you accountable.",
		testimonials_heading: "Customer Reviews",
		book_eyebrow: "Free trial",
		book_heading: "Book a free trial class",
		book_lead:
			"Tell us a little about the student and the times that suit you. We will reply with the next available trial slot. The trial class is free and no payment details are needed.",
		book_contact_label: "Reach us directly",
		book_note:
			"Lessons run live in a video call. You only need a phone, tablet or laptop with a camera.",
		book_form_title: "Start your free trial",
		book_form_sub: "Every student starts with one free trial class.",
		book_submit_label: "Request free trial",
	},
};

export type UiDictionary = typeof en;
export type HomeTextKey = keyof typeof en.home;
export type FeedbackCode = keyof typeof en.feedback;
