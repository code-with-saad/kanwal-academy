/**
 * Page-level copy for the static pages.
 *
 * Kept out of ui/en.ts because it is long-form editorial copy, not interface
 * strings. `Record<Locale, PageCopy>` makes a missing Arabic key a typecheck
 * error, the same guarantee the UI dictionaries use.
 */
import type { Locale } from "./config";

export interface PageCopy {
	about: {
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		lead: string;
		storyEyebrow: string;
		storyHeading: string;
		storyParagraph1: string;
		storyParagraph2: string;
		badgeOneToOne: string;
		approachEyebrow: string;
		approachHeading: string;
		approachSteps: Array<{ title: string; text: string }>;
		values: Array<{ title: string; text: string }>;
		teachHeading: string;
		teachLead: string;
		whyHeading: string;
		ctaHeading: string;
		ctaText: string;
	};
	courses: {
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		lead: string;
		listHeading: string;
		note: string;
		ctaHeading: string;
		ctaText: string;
	};
	pricing: {
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		lead: string;
		note: string;
		cancelNote: string;
		faqHeading: string;
		ctaHeading: string;
		ctaText: string;
	};
	contact: {
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		lead: string;
		faqHeading: string;
	};
	faq: {
		title: string;
		description: string;
		eyebrow: string;
		heading: string;
		lead: string;
		moreText: string;
	};
}

const en: PageCopy = {
	about: {
		title: "About Kanwal Quran Academy",
		description:
			"How Kanwal Quran Academy teaches Qur'anic recitation, tajweed and memorization online, one to one, with a free trial class to begin.",
		eyebrow: "About us",
		heading: "A teacher who knows your name",
		lead: "One teacher, one student, one lesson at a time.",
		storyEyebrow: "Our story",
		storyHeading: "Why Kanwal exists",
		storyParagraph1:
			"Kanwal began with a simple frustration: group classes move at one pace, and most students never get the moment where a teacher stops and fixes just their recitation. We built the academy around that moment.",
		storyParagraph2:
			"Every lesson is one teacher and one student, live from your home. Your teacher hears every letter, corrects gently in the moment, and keeps a written plan so progress is visible week after week. It suits children starting out, adults returning to the Qur'an, and anyone who learns better without an audience.",
		badgeOneToOne: "1-to-1 live",
		approachEyebrow: "Our approach",
		approachHeading: "How a class works",
		approachSteps: [
			{
				title: "You recite",
				text: "You read aloud from your own mushaf while your teacher listens without interrupting.",
			},
			{
				title: "Live correction",
				text: "Your teacher stops at the exact letter or rule and models it again until it lands.",
			},
			{
				title: "Tajweed notes",
				text: "Each session ends with short written notes on what to fix before the next class.",
			},
			{
				title: "Revision and next lesson",
				text: "The following class opens with revision, then moves to the next portion at your pace.",
			},
		],
		values: [
			{
				title: "Patience",
				text: "No rushing and no comparison. The pace is set by the student, not the clock.",
			},
			{
				title: "Tajweed accuracy",
				text: "Correct pronunciation first, speed later. Rules are taught as they appear in your portion.",
			},
			{
				title: "Safe one-to-one space",
				text: "A private live room with one vetted teacher. Mistakes are welcome here.",
			},
		],
		teachHeading: "What we teach",
		teachLead: "Three courses, each taught one to one. Pick the path that matches where you are and your teacher sets the pace from there.",
		whyHeading: "Why families choose us",
		ctaHeading: "Start with a free trial",
		ctaText: "Every student starts with a free trial class. No payment details are needed.",
	},
	courses: {
		title: "Online Qur'an courses",
		description:
			"Three one to one online courses: Qur'anic Recitation, Tajweed Proficiency and Memorization Excellence. See what each course covers and book a free trial.",
		eyebrow: "Courses",
		heading: "Three paths to the Qur'an",
		lead: "Every course is taught live, one to one. Choose the course that matches where you are today, and your teacher adjusts the pace after the trial class.",
		listHeading: "Choose a course",
		note: "Classes are 30 minutes and run live in a video call. Every student starts with one free trial class.",
		ctaHeading: "Not sure which course?",
		ctaText: "Book a free trial and your teacher will help you choose the right path.",
	},
	pricing: {
		title: "Plans and pricing",
		description:
			"Four monthly plans from $20 to $102, with one to four classes each week. Every plan starts with a free trial class.",
		eyebrow: "Pricing",
		heading: "Plans that fit your week",
		lead: "Every plan is billed monthly and starts with a free trial class. Prices are in US dollars.",
		note: "All plans are billed monthly in US dollars and include one free trial class before the first payment.",
		cancelNote: "Cancel anytime.",
		faqHeading: "Questions about plans",
		ctaHeading: "Ready to start?",
		ctaText: "Book a free trial class and choose a plan after you meet your teacher.",
	},
	contact: {
		title: "Contact us",
		description:
			"Contact Kanwal Quran Academy by phone, email or the free trial form. Tell us your time zone and the times that suit you.",
		eyebrow: "Contact",
		heading: "Talk to the academy",
		lead: "Tell us a little about the student and the times that suit you. We will reply with the next available trial slot.",
		faqHeading: "Before you write",
	},
	faq: {
		title: "Frequently asked questions",
		description:
			"Answers about the free trial, class length, choosing a course, children and adults, booking a time and starting a plan.",
		eyebrow: "FAQ",
		heading: "Frequently asked questions",
		lead: "Answers to the questions students and parents ask most. If your question is not here, contact us.",
		moreText: "Still have questions? Chat with us on WhatsApp.",
	},
};

const ar: PageCopy = {
	about: {
		title: "عن أكاديمية كنول",
		description:
			"كيف تعلّم أكاديمية كنول التلاوة والتجويد والحفظ عبر الإنترنت بحصص فردية، مع حصة تجريبية مجانية للبداية.",
		eyebrow: "من نحن",
		heading: "معلم يعرف اسمك",
		lead: "معلم واحد، وطالب واحد، ودرس واحد في كل مرة.",
		storyEyebrow: "قصتنا",
		storyHeading: "لماذا وُجدت كنول",
		storyParagraph1:
			"بدأت كنول من إحباط بسيط: الحصص الجماعية تسير بوتيرة واحدة، ومعظم الطلاب لا يحصلون على اللحظة التي يتوقف فيها المعلم ليصحح تلاوته هو وحده. بنينا الأكاديمية حول تلك اللحظة.",
		storyParagraph2:
			"كل درس معلم واحد وطالب واحد، مباشرة من بيتك. يسمع معلمك كل حرف، ويصحح بلطف في حينها، ويحتفظ بخطة مكتوبة حتى يكون التقدم واضحًا أسبوعًا بعد أسبوع. يناسب ذلك الأطفال المبتدئين، والكبار العائدين إلى القرآن، وكل من يتعلم أفضل دون جمهور.",
		badgeOneToOne: "فردي مباشر",
		approachEyebrow: "منهجنا",
		approachHeading: "كيف تسير الحصة",
		approachSteps: [
			{
				title: "أنت تتلو",
				text: "تقرأ بصوت عالٍ من مصحفك الخاص بينما يستمع معلمك دون مقاطعة.",
			},
			{
				title: "تصحيح مباشر",
				text: "يتوقف معلمك عند الحرف أو الحكم بالضبط ويعيده حتى يرسخ.",
			},
			{
				title: "ملاحظات التجويد",
				text: "تنتهي كل حصة بملاحظات مكتوبة قصيرة عما يجب تحسينه قبل الحصة التالية.",
			},
			{
				title: "مراجعة ودرس تالٍ",
				text: "تبدأ الحصة التالية بالمراجعة، ثم تنتقل إلى المقطع التالي وفق وتيرتك.",
			},
		],
		values: [
			{
				title: "صبر",
				text: "لا استعجال ولا مقارنة. الوتيرة يحددها الطالب لا الساعة.",
			},
			{
				title: "دقة التجويد",
				text: "النطق الصحيح أولًا والسرعة لاحقًا. تُعلَّم الأحكام كما ترد في مقطعك.",
			},
			{
				title: "مساحة فردية آمنة",
				text: "غرفة مباشرة خاصة مع معلم واحد موثوق. الأخطاء مرحب بها هنا.",
			},
		],
		teachHeading: "ماذا نعلّم",
		teachLead: "ثلاث دورات، تُقدَّم كل منها بحصص فردية. اختر المسار الذي يناسب مستواك، ويحدد معلمك الوتيرة بعد ذلك.",
		whyHeading: "لماذا تختارنا العائلات",
		ctaHeading: "ابدأ بحصة تجريبية مجانية",
		ctaText: "يبدأ كل طالب بحصة تجريبية مجانية. لا حاجة إلى بيانات الدفع.",
	},
	courses: {
		title: "دورات القرآن عبر الإنترنت",
		description:
			"ثلاث دورات فردية عبر الإنترنت: التلاوة القرآنية وإتقان التجويد والتميز في الحفظ. تعرّف على كل دورة واحجز حصة تجريبية مجانية.",
		eyebrow: "الدورات",
		heading: "ثلاثة مسارات إلى القرآن",
		lead: "كل دورة تُقدَّم مباشرة وبشكل فردي. اختر الدورة التي تناسب مستواك اليوم، ويعدّل معلمك الوتيرة بعد الحصة التجريبية.",
		listHeading: "اختر دورة",
		note: "مدة الحصة 30 دقيقة وتُعقد مباشرة عبر مكالمة فيديو. يبدأ كل طالب بحصة تجريبية مجانية واحدة.",
		ctaHeading: "لست متأكدًا من الدورة؟",
		ctaText: "احجز حصة تجريبية وسيساعدك معلمك على اختيار المسار المناسب.",
	},
	pricing: {
		title: "الخطط والأسعار",
		description:
			"أربع خطط شهرية من 20 إلى 102 دولارًا، بحصة إلى أربع حصص كل أسبوع. تبدأ كل خطة بحصة تجريبية مجانية.",
		eyebrow: "الأسعار",
		heading: "خطط تناسب أسبوعك",
		lead: "تُدفع قيمة كل خطة شهريًا، وتبدأ بحصة تجريبية مجانية. الأسعار بالدولار الأمريكي.",
		note: "تُدفع جميع الخطط شهريًا بالدولار الأمريكي، وتشمل حصة تجريبية مجانية قبل أول دفعة.",
		cancelNote: "يمكنك الإلغاء في أي وقت.",
		faqHeading: "أسئلة عن الخطط",
		ctaHeading: "جاهز للبدء؟",
		ctaText: "احجز حصة تجريبية واختر خطتك بعد لقاء معلمك.",
	},
	contact: {
		title: "تواصل معنا",
		description:
			"تواصل مع أكاديمية كنول عبر الهاتف أو البريد الإلكتروني أو نموذج الحصة التجريبية. أخبرنا بمنطقتك الزمنية والأوقات التي تناسبك.",
		eyebrow: "تواصل",
		heading: "تحدث مع الأكاديمية",
		lead: "أخبرنا قليلًا عن الطالب والأوقات التي تناسبك. سنرد عليك بأقرب موعد متاح للحصة التجريبية.",
		faqHeading: "قبل أن تراسلنا",
	},
	faq: {
		title: "الأسئلة الشائعة",
		description:
			"إجابات عن الحصة التجريبية ومدة الحصة واختيار الدورة والأطفال والكبار وحجز الوقت وبدء الخطة.",
		eyebrow: "الأسئلة الشائعة",
		heading: "الأسئلة الشائعة",
		lead: "إجابات عن الأسئلة التي يطرحها الطلاب وأولياء الأمور كثيرًا. إن لم تجد سؤالك، تواصل معنا.",
		moreText: "ما زالت لديك أسئلة؟ تحدث معنا عبر واتساب.",
	},
};

const dictionaries: Record<Locale, PageCopy> = { en, ar };

export function getPageCopy(locale: Locale): PageCopy {
	return dictionaries[locale] ?? en;
}
