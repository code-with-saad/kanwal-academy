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
		headingBefore: string;
		headingHighlight: string;
		headingAfter: string;
		lead: string;
		philosophyEyebrow: string;
		philosophyBefore: string;
		philosophyHighlight: string;
		philosophyAfter: string;
		philosophyText: string;
		founderEyebrow: string;
		founderHeading: string;
		founderName: string;
		founderRole: string;
		founderCredential: string;
		founderMilestones: Array<{ label: string; title: string; text: string }>;
		founderParagraphs: string[];
		founderImageAlt: string;
		heroImageAlt: string;
		heroSince: string;
		credentialsEyebrow: string;
		credentialsHeading: string;
		credentialsLead: string;
		credentials: Array<{
			title: string;
			issuer: string;
			motif: "book" | "pen" | "teacher";
		}>;
		trustEyebrow: string;
		trustHeading: string;
		trustIntro: string;
		trustOperator: string;
		trustOperatorName: string;
		trustOperatorPlace: string;
		trustChips: string[];
		badgeOneToOne: string;
		approachEyebrow: string;
		approachHeading: string;
		approachLead: string;
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
		headingBefore: "Where ",
		headingHighlight: "young hearts",
		headingAfter: " meet the Quran.",
		lead: "One teacher, one student, one lesson at a time.",
		philosophyEyebrow: "Our philosophy",
		philosophyBefore: "A journey rooted in",
		philosophyHighlight: "faith",
		philosophyAfter: ", patience and global connection",
		philosophyText:
			"At the heart of Kanwal Quran Academy is a simple, enduring philosophy: learning the Quran should be a journey of love, carried one patient lesson at a time. We bridge the gap between traditional Islamic scholarship and the modern needs of families around the world.",
		founderEyebrow: "Our founder",
		founderHeading: "Meet Kanwal Awais",
		founderName: "Kanwal Awais",
		founderRole: "Founder & Lead Teacher",
		founderCredential: "Hafiz-e-Quran",
		founderMilestones: [
			{
				label: "2017",
				title: "First students",
				text: "Kanwal begins teaching young children to read the Quran.",
			},
			{
				label: "UAE",
				title: "Formal scholarship",
				text: "Arabic and Islamic studies at the Mohammed bin Rashid Center.",
			},
			{
				label: "Online",
				title: "A digital classroom",
				text: "One-to-one lessons reach students across the Emirates.",
			},
			{
				label: "Global",
				title: "Worldwide families",
				text: "A curriculum for diaspora families in the US, UK and beyond.",
			},
		],
		founderParagraphs: [
			"Kanwal's dedication to Quranic education began deeply and personally. As a Hafiz-e-Quran, she experienced firsthand the discipline, spiritual connection, and patience required to carry the words of Allah in her heart. In 2017, she translated that personal devotion into a teaching career, taking on her first students and guiding young children through their foundational steps in reading the Quran.",
			"When she relocated to the United Arab Emirates, Kanwal sought to elevate her own linguistic and spiritual knowledge. She pursued formal Arabic studies at the Mohammed bin Rashid Center for Islamic Culture. Immersed in the multicultural landscape of the UAE, she began conducting one-on-one, in-person classes, specializing in creating a comfortable, nurturing environment for young girls and children.",
			"Word of her patient, highly empathetic teaching style quickly spread. Within a few years, her physical classroom transitioned into a digital one as she began teaching students across the wider Emirates.",
			"After three years of refining her online teaching methodology, Kanwal recognized a growing, unfulfilled need. Diaspora families in the United States, the United Kingdom, and globally were struggling to find qualified, patient, and female-led Quran instruction for their children. She expanded her reach internationally, building a curriculum that respects traditional Tajweed and Hifz principles while seamlessly adapting to the schedules and cultural contexts of students living in the West.",
			"Today, Kanwal Quran Academy stands as a testament to that journey: a globally accessible, deeply authentic institution dedicated to nurturing the next generation's love for the Holy Quran.",
		],
		founderImageAlt: "Hands holding an open Quran on a study desk",
		heroImageAlt: "An open Quran on a wooden stand in soft window light",
		heroSince: "Teaching since 2017",
		credentialsEyebrow: "Verified scholarship",
		credentialsHeading: "Qualifications and certifications",
		credentialsLead:
			"Parents trust us because our foundation is built on verified, traditional scholarship.",
		credentials: [
			{
				title: "Hifz-e-Quran certification",
				issuer: "Issuing authority to be confirmed",
				motif: "book",
			},
			{
				title: "Arabic language and Islamic studies",
				issuer: "Mohammed bin Rashid Center for Islamic Culture, UAE",
				motif: "pen",
			},
			{
				title: "Teaching experience",
				issuer:
					"Active educator since 2017, with specialized experience in early childhood Quranic literacy.",
				motif: "teacher",
			},
		],
		trustEyebrow: "Infrastructure",
		trustHeading: "Engineered for global reliability",
		trustIntro:
			"While our teaching is rooted in tradition, our infrastructure is built for the modern world.",
		trustOperator:
			"Kanwal Quran Academy is proudly backed and operated by Cheeltech LLC (Missouri, USA), ensuring enterprise-grade platform stability, secure international payment processing, and uninterrupted learning for our students worldwide.",
		trustOperatorName: "Cheeltech LLC",
		trustOperatorPlace: "Missouri, USA",
		trustChips: [
			"Enterprise-grade stability",
			"Secure international payments",
			"Uninterrupted learning",
		],
		badgeOneToOne: "1-to-1 live",
		approachEyebrow: "Our approach",
		approachHeading: "How a class works",
		approachLead:
			"Four steps, one promise: a qualified teacher, a plan that fits your life, and progress you can actually see.",
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
		headingBefore: "حيث تلتقي ",
		headingHighlight: "القلوب الصغيرة",
		headingAfter: " بالقرآن.",
		lead: "معلم واحد، وطالب واحد، ودرس واحد في كل مرة.",
		philosophyEyebrow: "فلسفتنا",
		philosophyBefore: "رحلة جذورها",
		philosophyHighlight: "الإيمان",
		philosophyAfter: "، والصبر، والتواصل العالمي",
		philosophyText:
			"في قلب أكاديمية كنول فلسفة بسيطة وراسخة: تعلّم القرآن رحلة محبة تُبنى درسًا صبورًا بعد درس. ونحن نصل بين العلم الإسلامي الأصيل واحتياجات العائلات الحديثة حول العالم.",
		founderEyebrow: "مؤسِّستنا",
		founderHeading: "تعرّفوا على كنول أويس",
		founderName: "كنول أويس",
		founderRole: "المؤسِّسة والمعلّمة الأولى",
		founderCredential: "حافظة للقرآن الكريم",
		founderMilestones: [
			{
				label: "2017",
				title: "أوائل الطلاب",
				text: "تبدأ كنول بتعليم الأطفال الصغار قراءة القرآن.",
			},
			{
				label: "الإمارات",
				title: "علم رسمي",
				text: "دراسة العربية والعلوم الإسلامية في مركز محمد بن راشد.",
			},
			{
				label: "عبر الإنترنت",
				title: "فصل رقمي",
				text: "حصص فردية تصل إلى طلاب في أنحاء الإمارات.",
			},
			{
				label: "عالميًا",
				title: "عائلات حول العالم",
				text: "منهج للعائلات المغتربة في الولايات المتحدة والمملكة المتحدة وما بعدهما.",
			},
		],
		founderParagraphs: [
			"بدأ تفاني كنول في تعليم القرآن عميقًا وشخصيًا. بصفتها حافظة للقرآن الكريم، عاشت بنفسها الانضباط والصلة الروحية والصبر اللازم لحمل كلمات الله في قلبها. وفي عام 2017 حوّلت ذلك التفاني الشخصي إلى مسيرة تعليمية، فاستقبلت أوائل طلابها وقادت الأطفال الصغار في خطواتهم الأولى لقراءة القرآن.",
			"وعندما انتقلت إلى الإمارات العربية المتحدة، سعت كنول إلى صقل معرفتها اللغوية والروحية. فدرست العربية دراسة رسمية في مركز محمد بن راشد للثقافة الإسلامية. وفي خضم المشهد الثقافي المتنوع في الإمارات، بدأت بتقديم حصص فردية حضورية، متخصصة في تهيئة بيئة مريحة وحاضنة للفتيات الصغيرات والأطفال.",
			"وسرعان ما انتشر صيت أسلوبها الصبور والمفعم بالتعاطف. وخلال بضع سنوات تحوّلت غرفتها الصفية الواقعية إلى رقمية، إذ بدأت بتعليم طلاب في أنحاء الإمارات الأوسع.",
			"وبعد ثلاث سنوات من صقل منهجيتها في التعليم عبر الإنترنت، أدركت كنول حاجة متنامية غير ملبّاة. فالعائلات المغتربة في الولايات المتحدة والمملكة المتحدة وحول العالم كانت تكافح للعثور على تعليم قرآني مؤهل وصبور تقوده معلمات لأطفالهن. فوسّعت نطاقها دوليًا، وبنت منهجًا يحترم مبادئ التجويد والحفظ الأصيلة ويتكيف بسلاسة مع جداول الطلاب وسياقاتهم الثقافية في الغرب.",
			"واليوم تقف أكاديمية كنول للقرآن شاهدًا على تلك الرحلة: مؤسسة أصيلة ومتاحة عالميًا، مكرّسة لتنمية حب الجيل القادم للقرآن الكريم.",
		],
		founderImageAlt: "يدان تمسكان مصحفًا مفتوحًا على مكتب دراسة",
		heroImageAlt: "مصحف مفتوح على حامل خشبي في ضوء نافذة ناعم",
		heroSince: "التعليم منذ 2017",
		credentialsEyebrow: "علم موثّق",
		credentialsHeading: "المؤهلات والشهادات",
		credentialsLead: "يثق بنا أولياء الأمور لأن أساسنا مبني على علم تقليدي موثّق.",
		credentials: [
			{
				title: "شهادة حفظ القرآن",
				issuer: "الجهة المانحة ستُحدَّد لاحقًا",
				motif: "book",
			},
			{
				title: "اللغة العربية والدراسات الإسلامية",
				issuer: "مركز محمد بن راشد للثقافة الإسلامية، الإمارات",
				motif: "pen",
			},
			{
				title: "الخبرة التعليمية",
				issuer:
					"معلّمة نشطة منذ 2017، بخبرة متخصصة في محو الأمية القرآنية لدى الأطفال الصغار.",
				motif: "teacher",
			},
		],
		trustEyebrow: "البنية التحتية",
		trustHeading: "بنية موثوقة عالميًا",
		trustIntro:
			"بينما يتجذر تعليمنا في الأصالة، فإن بنيتنا التحتية مبنية للعالم الحديث.",
		trustOperator:
			"تفخر أكاديمية كنول للقرآن بدعم وتشغيل شركة Cheeltech LLC (ميزوري، الولايات المتحدة)، بما يضمن استقرار المنصة على مستوى المؤسسات، ومعالجة مدفوعات دولية آمنة، وتعلّمًا متواصلًا لطلابنا حول العالم.",
		trustOperatorName: "Cheeltech LLC",
		trustOperatorPlace: "ميزوري، الولايات المتحدة",
		trustChips: [
			"استقرار على مستوى المؤسسات",
			"مدفوعات دولية آمنة",
			"تعلّم دون انقطاع",
		],
		badgeOneToOne: "فردي مباشر",
		approachEyebrow: "منهجنا",
		approachHeading: "كيف تسير الحصة",
		approachLead:
			"أربع خطوات ووعد واحد: معلم مؤهل، وخطة تناسب حياتك، وتقدم يمكنك رؤيته فعلاً।",
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
