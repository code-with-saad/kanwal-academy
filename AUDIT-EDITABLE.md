# Editable-content audit

Date: 9 November 2026  
Repository: `D:\OFFICE PROJECTS\kanwal-academy`  
Commit audited: `f1dc7ee` (`f1dc7ee7884dfad1ad6fba643847d1aed2052b93`)  
Live site checked: `https://kanwalquranacademy.com`

This is a read-only audit. No code, content, schema, deployment or existing file was changed. This report is the only new file.

## 1. Scope and method

- Read every route, layout, component and the seed schema under `src/` and `seed/seed.json`.
- Checked the installed EmDash source at `node_modules/emdash` (`emdash@1.4.0`) for visual-editing behaviour.
- Fetched the live home, Terms, Privacy and 404 pages and compared the rendered text with the fields present in the repository schema.
- The production admin was not available (no credentials were provided), so "cannot be changed from the admin" is proven from the repository schema and the code that reads it, not by logging into the production admin UI.

### Important structural facts

1. The site is one public page. `/about`, `/courses`, `/courses/[slug]`, `/pricing`, `/teachers`, `/contact`, `/free-trial`, `/blog` and `/blog/[slug]` are redirects. Their visible copy is the relevant section on `/`.
2. `/about` redirects to `/#about`; `/teachers` redirects to `/#teachers`, but no element with `id="teachers"` exists on the live home page. `/blog` redirects to `/`.
3. The Home page sets `Cache-Control: no-store` (`src/pages/index.astro:133`). The live home response also returned `Cache-Control: no-store`.
4. `seed/seed.json` defines the real field set. `emdash-env.d.ts` contains fields that do not exist in the current seed (for example `home_eyebrow`, `home_primary_cta`, `courses_heading`, `testimonials_eyebrow`). The generated type file is stale relative to the seed. This audit uses `seed/seed.json`.
5. The seeded `pages` entries for About, Terms and Privacy contain rich text, but the static route files `src/pages/about.astro`, `src/pages/terms-of-service.astro` and `src/pages/privacy-policy.astro` take precedence over `src/pages/[slug].astro`. Their CMS `content` is never rendered.
6. The `teachers`, `faqs` and `posts` collections are seeded but not rendered anywhere. `TeachersGrid.astro` and `PostsGrid.astro` are not imported by any route. No FAQ component or query exists.
7. Course long descriptions (`courses.description`) are not rendered because course detail routes redirect to `/#courses`.

### Source labels used below

- **(a) Direct CMS value**: a CMS field is read and no competing code literal supplies the same text. The current value may come from the seed.
- **(b) Hard-coded in code**: a literal in an Astro component, layout, config, API route or script. No CMS field controls it.
- **(c) Seed-only default**: a direct CMS value whose current text exists only because the seed supplied it. It is editable, but if cleared or missing the page shows nothing (unless the component itself has a default).
- **(d) CMS with a hard-coded fallback**: the CMS field is preferred, but when it is missing, or in some helpers when it is blank, a code literal appears instead.

Counts below are inventory entries, not raw occurrences. A row such as "nav labels x5" counts once. Repeated strings such as "Book free trial" are grouped when they share a source and section.

## 2. Summary counts

| Page or area | (a) Direct CMS | (b) Hard-coded | (c) Seed-only | (d) CMS + fallback | Total entries |
|---|---:|---:|---:|---:|---:|
| Global shell (header, footer, newsletter UI, modal, shared SEO) | 0 | 22 | 1 | 19 | 42 |
| Home page (all sections) | 0 | 20 | 4 | 39 | 63 |
| 404 | 0 | 6 | 0 | 0 | 6 |
| Terms of Service | 0 | 7 | 0 | 0 | 7 |
| Privacy Policy | 0 | 7 | 0 | 0 | 7 |
| Dynamic CMS page (`/[slug]`) | 0 | 1 | 3 | 0 | 4 |
| Internal styleguide | 0 | 1 | 0 | 0 | 1 |
| **Total** | **0** | **64** | **8** | **58** | **130** |

Redirect-only routes (About, Courses, Pricing, Teachers, Contact, Free Trial, Blog) contain no copy of their own. Their content is counted under Home or is absent.

The headline result: 64 of 130 inventoried text entries are hard-coded and cannot be edited from the admin today. Another 58 are editable but silently fall back to code text, which makes an empty admin field look like a successful edit while old text remains.

## 3. Full inventory

### 3.1 Global shell

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| G01 | Site name shown in header and footer | `Header.astro:69`, `Footer.astro:141` via `siteName` | d | `resolveSiteIdentity()` falls back to `site.name` in `src/config/site.ts:32`. |
| G02 | Brand aria-label `` `${siteName}, home` `` | `Header.astro:34`, `Footer.astro:42` | d | Same CMS title with code fallback. |
| G03 | Nav labels: Home, About, Courses, Pricing, Contact | `src/config/site.ts:49-53`, rendered `Header.astro:82`, `139` | b | The seeded EmDash menu `primary` is not read. |
| G04 | Header CTA: "Book free trial" | `src/config/site.ts:55`, `Header.astro:92`, `147` | b | Seeded menu has "Get free trial", also unused. |
| G05 | Nav aria-label "Primary" (desktop and mobile) | `Header.astro:72`, `129` | b | Accessibility text. |
| G06 | "Open menu" / "Close menu" | `Header.astro:102`, `117`, `166` | b | Accessibility text. |
| G07 | "Switch to dark theme" / "Switch to light theme" | `ThemeToggle.astro:16`, `55` | b | Accessibility text. |
| G08 | Footer brand aria-label | `Footer.astro:42` | d | Uses CMS site title with fallback. |
| G09 | Footer logo alt text | `Footer.astro:46`, `53`, `61`, `68` | d | `siteName`. |
| G10 | Footer tagline | `Footer.astro:74-76` | d | `footer_tagline` with `site.tagline` fallback via `clean()`. |
| G11 | Footer "Courses" heading | `Footer.astro:81-83` | d | `footer_courses_label`. |
| G12 | Footer course link names | `Footer.astro:22-28`, `86-89` | d | Course names from CMS, or three hard-coded names when the collection is empty. |
| G13 | Footer "Academy" heading | `Footer.astro:96-98` | d | `footer_academy_label`. |
| G14 | Footer "About" link | `Footer.astro:31` | b | Only this academy link is hard-coded. |
| G15 | Footer "Pricing", "Free trial", "Contact" link labels | `Footer.astro:32-34` | d | Three CMS fields. |
| G16 | Footer "Contact" heading | `Footer.astro:114-116` | d | `footer_contact_label`. |
| G17 | Footer address, phone, email | `Footer.astro:117-121` | d | Site settings with fallbacks. |
| G18 | Footer "Stay in touch" heading | `Footer.astro:127-129` | d | Uses `footer_stay_in_touch`. The separate `footer_newsletter_heading` field is unused. |
| G19 | Footer newsletter consent | `Footer.astro:130-132` | d | `footer_newsletter_consent`; no edit annotation. |
| G20 | Footer copyright label | `Footer.astro:140-142` | d | `footer_copyright_label`; the year and `©` are generated. |
| G21 | Copyright symbol and current year | `Footer.astro:20`, `141` | b | Generated, not editable. |
| G22 | Legal link labels: Terms of Service, Privacy Policy | `Footer.astro:144-155` | d | CMS footer labels; hrefs come from `site.legal`. |
| G23 | Newsletter hidden label "Email address" | `Newsletter.astro:26` | b | Screen-reader label. |
| G24 | Newsletter placeholder "you@example.com" | `Newsletter.astro:34` | b | |
| G25 | Newsletter button "Subscribe" / "Subscribing" | `Newsletter.astro:41`, `99` | b | |
| G26 | Newsletter honeypot label "Website" | `Newsletter.astro:46` | b | Hidden anti-spam field. |
| G27 | Newsletter invalid, success, error and connection messages | `Newsletter.astro:116`, `140`, `149`, `154` | b | "Enter a valid email address.", "You are on the list. JazakAllah khair.", "Something went wrong. Please try again.", "We could not reach the server. Check your connection and try again." |
| G28 | Enrolment API response messages | `src/pages/api/enrol.ts:318-479` | b | See section 4.5 for the exact list. |
| G29 | Zod validation messages | `src/pages/api/enrol.ts:42-58` | b | Name, email, phone length and phone format messages. |
| G30 | Result modal close aria-label "Close" | `ResultModal.astro:36` | b | |
| G31 | Success modal: "Request received", body, "Close" | `ResultModal.astro:48-53` | b | API success message can overwrite the body. |
| G32 | Error modal: "We could not send your request", "Please try again.", "Try again" | `ResultModal.astro:62-65` | b | |
| G33 | Rate-limit modal: "Too many attempts", body, "Close" | `ResultModal.astro:82-87` | b | |
| G34 | "WhatsApp us" links | `ResultModal.astro:69`, `91` | b | |
| G35 | Skip link "Skip to content" | `Base.astro:142` | b | Accessibility text. |
| G36 | "Back to top" aria-label | `Base.astro:168` | b | Accessibility text. |
| G37 | Page `<title>` composition and site suffix | `Base.astro:60-64`, `135` | d | Site title and separator come from settings, with hard-coded fallbacks in `site.ts` and `site.ts`/`site.ts:5`. |
| G38 | Default meta description | `Base.astro:75`, `site.ts:34-35` | d | Home uses `getSeoMeta` with `site.description` as the fallback; an SEO panel description overrides it. |
| G39 | OG and Twitter title/description | EmDash `EmDashHead` fed by `Base.astro:69-81` | d | Mirrors title and description. |
| G40 | JSON-LD `WebSite` name and URL | `node_modules/emdash/src/page/jsonld.ts:100-105` | d | Name is the CMS site title; URL is the canonical URL. No separate JSON-LD copy exists. |
| G41 | Social links aria-label "Social media links" | `SocialLinks.astro:58` | b | |
| G42 | Individual social link aria-label | `SocialLinks.astro:61-70` | c | From the site settings repeater; no fallback. |
| G43 | Social link labels in admin | `site_settings.social_links` | a | Same value as G42, listed once. |

Rows G42 and G43 describe the same repeater value. They are both kept because one is the rendered attribute and one is the admin field. Counted as one c and one a above; adjust to 21 b, 19 d, 1 c, 1 a for the global row if counting unique values. The summary above treats G42 as c and G43 as a, so the global total is 42 entries.

### 3.2 Home page

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| H01 | Hero h1 | `index.astro:352` | d | `home_headline`; markdown asterisks are stripped before display. |
| H02 | Hero lead paragraph | `index.astro:353-355` | d | `home_lead`. |
| H03 | Hero reach line | `index.astro:369` | d | `home_reach_text`; `{countries}` token replaced. |
| H04 | Hero CTA "Start your free trial" | `index.astro:371-376` | d | `home_cta_label`. |
| H05 | Hero image alt "An open Qur'an resting on a carved wooden rehal" | `index.astro:413`, `418`, `config/images.ts:10` | b | Used even when a CMS image is set; the CMS image alt is ignored. |
| H06 | Hero course pill labels (three course names) | `index.astro:285-289` | c | From `courses.name`. |
| H07 | Hero pill "Live one on one" | `index.astro:290-294` | d | Uses `courses_format_label`. |
| H08 | Floating card 1 title, text and chip | `index.astro:208-216` | d | `feature_card_1_*`; tokens replaced. |
| H09 | Floating cards 2 to 4 titles and texts | `index.astro:217-235` | d | `feature_card_2_*` to `feature_card_4_*`; tokens replaced. |
| H10 | Floating card chip fallback "Free Trial" | `FeatureCards.astro:17` | d | Only used when `feature_card_1_chip` is missing. |
| H11 | About eyebrow "Why Kanwal" | `index.astro:485` | d | `about_eyebrow`. |
| H12 | About heading before and highlight | `index.astro:486-487` | d | `about_title_before`, `about_title_highlight`. |
| H13 | Hard-coded heading suffix "with us" | `WisdomPanel.astro:70` | b | Appended after the CMS heading. Not editable. |
| H14 | About paragraph 1 | `index.astro:488` | d | `about_paragraph_1`. |
| H15 | About paragraph 2 | `index.astro:489` | d | `about_paragraph_2`, rendered only when non-empty. The seed supplies a value, and the live page shows it. No rendering bug was reproduced. |
| H16 | About badge "years" and "teaching" | `WisdomPanel.astro:59-61` | b | Number comes from site settings `years`; the two words are hard-coded. |
| H17 | About image alt and placeholder label | `index.astro:490-491`, `WisdomPanel.astro:44-52` | d | CMS image alt preferred, then `about_image_alt`, then a hard-coded alt. Placeholder label "Wisdom image (4:5)" is hard-coded. |
| H18 | About CTA "Book free trial" | `WisdomPanel.astro:81` | b | |
| H19 | Standing Out eyebrow | `index.astro:500`, `StandingOut.astro:39` | d | Parsed but never rendered by `StandingOut`. Editing it has no visible effect. |
| H20 | Standing Out heading | `index.astro:501` | d | `standing_heading`. |
| H21 | Three Standing Out item titles and texts | `index.astro:238-257` | d | `standing_item_*`. |
| H22 | Courses journey heading | `index.astro:511-513` | d | `courses_journey_heading`. |
| H23 | Courses journey intro | `index.astro:514-516` | d | `courses_journey_intro`. |
| H24 | Courses CTA "Book free trial" | `index.astro:518` | b | |
| H25 | Course row name, summary, level and Arabic name | `index.astro:523-532` | c | From the `courses` collection. |
| H26 | Split 1 heading before and highlight | `index.astro:538-539` | d | `split1_heading_*`. |
| H27 | Split 1 paragraphs | `index.astro:540-543` | d | `split1_paragraph_1`, `split1_paragraph_2`. |
| H28 | Split 1 image label | `index.astro:547` | d | `split1_image_label`. |
| H29 | Split 1 image alt | `index.astro:546` | b | "A student joining a Qur'an lesson on a phone". |
| H30 | Split 1 CTA "Book free trial" | `index.astro:549` | b | |
| H31 | Split 2 heading before and highlight | `index.astro:553-554` | d | `split2_heading_*`. |
| H32 | Split 2 paragraph and list items | `index.astro:555-557`, `279-282` | d | `split2_paragraph_1`, `split2_list_items` (newline-separated). |
| H33 | Split 2 image label | `index.astro:561` | d | `split2_image_label`. |
| H34 | Split 2 image alt | `index.astro:560` | b | "An open Qur'an with a page marker, ready for memorization practice". |
| H35 | Split 2 CTA "Book free trial" | `index.astro:564` | b | |
| H36 | Stats eyebrow, heading and description | `index.astro:572-575` | d | `stats_*`. |
| H37 | Stats values: years, countries, students, sessions | `index.astro:576-578` | d | `site_settings.years`, `countries`, `students`, `sessions`; `clean()` fallbacks. Students and sessions are still `[000]+`. |
| H38 | Stats labels | `index.astro:579-581` | d | `site_settings.*_label`; `clean()` fallbacks. |
| H39 | Stats CTA "Book free trial" | `StatsBand.astro:55` | b | |
| H40 | Stats ring aria-label `` `${raw} ${label}` `` | `StatsBand.astro:67` | d | Generated from CMS values. |
| H41 | How it works eyebrow and heading | `index.astro:587-588` | d | `trial_eyebrow`, `trial_heading`. |
| H42 | Three how-it-works step titles and bodies | `index.astro:260-275` | d | `trial_step_*`. |
| H43 | Pricing eyebrow, heading and intro | `index.astro:597-608` | d | `pricing_*`. |
| H44 | Plan names, prices, currency and billing period | `index.astro:181-191`, `613-625` | c | From the `plans` collection. Billing period falls back to "/ month" if null. |
| H45 | Plan labels: classes each week/month, teaching hours, most popular, select plan | `index.astro:618-623` | d | `pricing_*_label`, `pricing_select_cta`. |
| H46 | Pricing region aria-label "Monthly plans" | `index.astro:611` | b | |
| H47 | Pricing carousel aria-labels and status | `PricingCarousel.astro:38`, `60`, `66`, `82`, `159` | b | "Monthly plans", "Previous plan", "Next plan", "Plan selector", "Plan X, plan N of M". |
| H48 | Testimonials heading | `index.astro:646` | d | `testimonials_heading`. |
| H49 | Testimonial quote, author, country, relation and avatar alt | `index.astro:649-657` | c | From the `testimonials` collection. The collection is empty in the seed, so the section is hidden in production. |
| H50 | Testimonial rating fallback "5.0" | `index.astro:652` | d | Silently invents a rating when `rating` is empty. |
| H51 | Testimonial carousel aria-labels | `Testimonials.astro:43`, `90`, `93` | b | "Reviewers", "Previous review", "Next review". |
| H52 | Book section eyebrow, heading and lead | `index.astro:680-682` | d | `book_*`. |
| H53 | Book contact label and lesson note | `index.astro:683-684` | d | `book_contact_label`, `book_note`. |
| H54 | Book form card title and subheading | `index.astro:685-686` | d | `book_form_title`, `book_form_sub`. |
| H55 | Book submit label | `index.astro:687` | d | `book_submit_label`. |
| H56 | "WhatsApp" link text | `BookTrial.astro:91` | b | |
| H57 | Form labels: Your name, Email address, Phone number, Course, Plan, Message, (optional) | `BookTrial.astro:114`, `132`, `151`, `173`, `191`, `212` | b | |
| H58 | Select placeholders: "Not sure yet", "Help me choose" | `BookTrial.astro:175`, `193` | b | |
| H59 | Message placeholder "Student age, current level, any questions" | `BookTrial.astro:220` | b | |
| H60 | Honeypot label "Website" | `BookTrial.astro:108` | b | Hidden anti-spam field. |
| H61 | Busy submit label "Sending request" | `BookTrial.astro:435` | b | |
| H62 | Client validation and error fallbacks | `BookTrial.astro:443`, `448`, `452`, `510`, `518`, `522` | b | "Please enter your name.", "Enter a valid email address.", "Enter a valid phone number with country code.", "Please check this field.", "Something went wrong. Please try again or contact us directly.", "We could not reach the server. Check your connection and try again." |
| H63 | Book contact phone, email, WhatsApp and address | `BookTrial.astro:89-92` | d | Site settings with `clean()` fallbacks. |

### 3.3 404

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| N01 | "404" | `404.astro:12` | b | |
| N02 | Page title "Page not found" | `404.astro:8` | b | Becomes "Page not found | Kanwal Quran Academy". |
| N03 | H1 "Page not found" | `404.astro:13` | b | |
| N04 | Lead "The page you are looking for does not exist or has moved." | `404.astro:14-16` | b | |
| N05 | "Go home" | `404.astro:18` | b | |
| N06 | "Contact us" | `404.astro:19` | b | |

### 3.4 Terms of Service

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| T01 | Page title "Terms of Service" | `terms-of-service.astro:11` | b | |
| T02 | Meta description template | `terms-of-service.astro:12` | b | Interpolates the hard-coded `site.name`. |
| T03 | H1 "Terms of Service" | `terms-of-service.astro:17` | b | |
| T04 | "Last updated 5 November 2026. Please read these terms before booking a class." | `terms-of-service.astro:7`, `18` | b | Date is a code literal and will go stale. |
| T05 | Six section headings | `terms-of-service.astro:22`, `29`, `40`, `46`, `53`, `60` | b | About these terms, Lessons and plans, Payments, Use of the site, Changes, Contact. |
| T06 | Seven body paragraphs | `terms-of-service.astro:23-64` | b | Includes interpolated `site.name`. |
| T07 | Contact email and phone links | `terms-of-service.astro:62-63` | b | Uses `src/config/site.ts`, not CMS site settings. |

The seeded `pages` entry for Terms has its own rich text, but this file shadows `/[slug]`, so that CMS content is ignored.

### 3.5 Privacy Policy

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| P01 | Page title "Privacy Policy" | `privacy-policy.astro:11` | b | |
| P02 | Meta description template | `privacy-policy.astro:12` | b | |
| P03 | H1 "Privacy Policy" | `privacy-policy.astro:17` | b | |
| P04 | "Last updated 5 November 2026. This page explains what we collect and why." | `privacy-policy.astro:7`, `18` | b | Date is hard-coded. |
| P05 | Six section headings | `privacy-policy.astro:22`, `30`, `36`, `42`, `49`, `55` | b | What we collect, Why we use it, Where it is stored, Forms and security, Cookies and local storage, Your choices. |
| P06 | Six body paragraphs | `privacy-policy.astro:23-60` | b | Includes interpolated `site.name`. |
| P07 | Contact email and phone links | `privacy-policy.astro:58-59` | b | Uses `src/config/site.ts`, not CMS site settings. |

The seeded `pages` entry for Privacy has its own rich text, but this file shadows `/[slug]`, so that CMS content is ignored.

### 3.6 Dynamic CMS page (`/[slug]`)

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| D01 | Page H1 | `PageView.astro:23` | c | `page.title`. |
| D02 | Page body rich text | `PageView.astro:28-30` | c | `page.content` as Portable Text. |
| D03 | Empty state "This page has no content yet. Add some in the editor, then publish." | `PageView.astro:33-34` | b | Only shown to a logged-in user. |
| D04 | SEO title and description | `[slug].astro:14-23` | c | From the page entry and its SEO panel. |

This route currently only serves page slugs that are not shadowed by a static file. In the seed those are none: About, Terms and Privacy all have static routes.

### 3.7 Internal styleguide

| ID | String(s) | Location | Source | Notes |
|---|---|---|---|---|
| S01 | All styleguide headings, labels, examples and descriptions | `src/pages/styleguide.astro` | b | `noindex, nofollow`, not in public navigation. |

## 4. Risky fallbacks and ignored CMS values

### 4.1 Fallbacks that hide an empty CMS field

`src/utils/site-config.ts:126-129` defines `clean(value, fallback)`. It trims the admin value and returns the hard-coded fallback when the result is empty. It is used for every site setting below. Clearing the field in the admin does not produce an empty space; the old code text reappears:

- phone, WhatsApp number, email, owner email, address
- years, countries, students, sessions, and all four labels
- footer tagline, all footer column headings, all footer link labels, copyright label, newsletter heading and consent

This is the most likely reason an editor would say "I changed it but the site still shows the old text".

### 4.2 CMS fields that are read but never rendered

| Field | Where it is read | Why it has no effect |
|---|---|---|
| `site_settings.footer_newsletter_heading` | `site-config.ts:178` | `Footer.astro:128` uses `footer_stay_in_touch` instead. |
| `site_settings.footer_explore_label` | `site-config.ts:167` | No Explore column exists in the footer. |
| `site_settings.footer_teachers_label` | `site-config.ts:172` | No Teachers link exists in the footer. |
| `site_settings.og_image` | `site-config.ts:152` | Never passed to `Base` or any SEO call. |
| `pages.standing_eyebrow` | `index.astro:500` | `StandingOut.astro` accepts the prop but does not render it. |
| `pages.content` on About, Terms, Privacy | `seed/seed.json` entries | Static route files shadow `[slug].astro`. |
| `courses.description` | `seed/seed.json` | Course detail routes redirect; the description is never rendered. |
| `teachers`, `faqs`, `posts` collections | `seed/seed.json` | No route or component queries or renders them. |
| EmDash menu `primary` | `seed/seed.json` | Header and footer build links from `src/config/site.ts`, not from EmDash menus. |

### 4.3 Text that is partly editable

- About heading: `about_title_before` and `about_title_highlight` are editable, but `WisdomPanel.astro:70` appends "with us". The full heading cannot be changed from the admin.
- About badge: the number comes from `site_settings.years`, but "years" and "teaching" are hard-coded.
- Hero image: `home_image` is editable, but its alt text is always `heroImage.alt` from `src/config/images.ts:10`.
- Floating feature cards: titles and texts are editable, but `{countries}` and `{price}` tokens are replaced at render time. Inline editing would save the replaced text, not the token template.
- Pricing period: `plan.billing_period` is editable per plan, with a code fallback of "/ month". The same label also has a separate Home field `pricing_period_label`.
- Copyright: only the label is editable. The year and `©` are generated.
- Terms and Privacy: the academy name, email and phone are interpolated from `src/config/site.ts`, so editing the CMS phone or email does not update these pages.

### 4.4 Confirmed About paragraph 2 behaviour

`index.astro:489` passes `homeText("about_paragraph_2", "")` to `WisdomPanel`, and `WisdomPanel.astro:75-79` renders the second paragraph when it is non-empty. The seed contains a value, and the live home page shows it. This audit did not reproduce a paragraph 2 bug in the current code. The real About-related issue is different: the seeded About page rich text is unreachable because `/about` is a static redirect.

### 4.5 API messages that overwrite modal copy

`src/pages/api/enrol.ts` returns these hard-coded messages:

- "Could not parse request."
- "Please check your entries and try again."
- "Service unavailable. Please email us directly."
- "Too many attempts. Please try again in an hour."
- "The security check failed. Please try again."
- "We could not save your email. Please try again."
- "You are on the list. JazakAllah khair."
- "Invalid request type."
- "Could not save your request. Please try again."
- "Thank you. We will be in touch very soon."
- Honeypot successes: "You are on the list. JazakAllah khair." and "Thank you. We will be in touch soon."

`BookTrial.astro:503` and `Newsletter.astro:140` replace the modal or status text with the API `message` when one is returned. So even if the success modal body is made editable, the API success text wins.

### 4.6 Other silent substitutions and invented content

- `index.astro:652` falls back to rating "5.0" when a testimonial has no rating. This can show an invented rating.
- `index.astro:195` falls back to a lowest plan price of `20` when the plans collection is empty, which feeds the feature card "Plans from {price}/month".
- `Footer.astro:24-28` falls back to three hard-coded course names when the courses collection is empty.
- `Header.astro` and `Base.astro` fall back to `site.nav` and `site.cta` for navigation.
- `homeText` trims every value (`index.astro:158`). A value made only of spaces becomes empty, but an intentionally empty string is preserved as empty. This part behaves as documented.
- `PlanCard` uses `plan.billingPeriod ?? periodLabel`. An empty string is preserved, so clearing the billing period in the admin can produce a blank period while the Home label remains unchanged.

### 4.7 Demo and placeholder behaviour

- `EMDASH_DEMO=1` sets `hasTestimonials` true, but `index.astro:648-659` then passes `reviews={undefined}` to `Testimonials`. The component defaults to `[]` and renders nothing. The documented three "Sample" reviews do not appear.
- `TeachersGrid.astro` contains demo teacher cards, but the component is not used anywhere.
- No teacher section and no FAQ section exist on the home page.

## 5. Proposed CMS homes

Keep the model simple. The Home page already has most of the editorial fields. Add fields to the existing `pages` entry for Home, extend `site_settings`, and add one global `site_texts` collection for UI copy that is not page content.

| Group | Proposed home | Fields | Type | Effort | Notes |
|---|---|---|---|---|---|
| Home hero | `pages` (Home) | Existing `home_headline`, `home_lead`, `home_reach_text`, `home_cta_label`, `home_image`; add `home_image_alt` | plain text, image | S | Use image alt from the media record instead of a new field if the hero image always comes from the CMS. |
| Floating cards | `pages` (Home) | Existing `feature_card_1_*` to `feature_card_4_*` | plain text | S | Add help text explaining `{countries}` and `{price}` tokens. |
| About panel | `pages` (Home) | Existing `about_*`; add `about_title_after` ("with us"), `about_badge_years_label`, `about_badge_teaching_label` | plain text, textarea | S | Makes the full heading and badge editable. |
| Standing Out | `pages` (Home) | Existing `standing_*` | plain text | S | Render or remove `standing_eyebrow`. |
| Courses intro and splits | `pages` (Home) | Existing `courses_journey_*`, `split1_*`, `split2_*`; add `split1_image_alt`, `split2_image_alt` | plain text, textarea | S | Or use media alt. |
| Courses collection | `courses` | Existing `name`, `summary`, `level`, `arabic_name`; render `description` on a real course page if wanted | plain text, rich text | M | Course pages are currently redirects. |
| Stats | `pages` (Home) + `site_settings` | Existing `stats_*` and stats fields/labels | plain text | S | Keep `[000]+` placeholders until real numbers exist. |
| How it works | `pages` (Home) | Existing `trial_*` | plain text, textarea | S | |
| Pricing | `pages` (Home) + `plans` | Existing `pricing_*` and plan fields | plain text, number, boolean | S | Keep one source for the billing period; today both `plans.billing_period` and `pricing_period_label` exist. |
| Testimonials | `testimonials` + `pages` | Existing `testimonials_heading`; review fields | plain text, textarea, boolean | S | Remove the "5.0" fallback and require a rating or show none. |
| Book section | `pages` (Home) | Existing `book_*` | plain text, textarea | S | |
| Book form UI | new `site_texts` | `form_name_label`, `form_email_label`, `form_phone_label`, `form_course_label`, `form_plan_label`, `form_message_label`, `form_message_optional`, `form_course_placeholder`, `form_plan_placeholder`, `form_message_placeholder`, `form_submit_busy`, `form_whatsapp_label` | plain text | M | Group label "Book trial form". |
| Result modal | new `site_texts` | `result_success_title`, `result_success_body`, `result_error_title`, `result_error_body`, `result_rate_title`, `result_rate_body`, `result_retry_label`, `result_close_label`, `result_whatsapp_label` | plain text, textarea | M | Server API messages must stop overriding these, or the same fields must be reused by the API. |
| Newsletter UI | new `site_texts` | `newsletter_email_label`, `newsletter_placeholder`, `newsletter_submit_label`, `newsletter_submitting_label`, `newsletter_invalid_message`, `newsletter_success_message`, `newsletter_error_message`, `newsletter_connection_message` | plain text | M | |
| 404 page | new `site_texts` | `not_found_title`, `not_found_heading`, `not_found_lead`, `not_found_home_label`, `not_found_contact_label` | plain text, textarea | S | Or a dedicated `not_found` page entry. |
| Header navigation | EmDash `menus` | Existing `primary` menu labels and CTA item | menu items | M | Wire `getMenus` into `Header`; today the seeded menu is ignored. Keep the CTA as a menu item with a button class, or keep it in `site_texts`. |
| Footer | `site_settings` | Existing footer fields; use `footer_newsletter_heading` or remove it; add `footer_about_label` | plain text, textarea | S | Remove unused `footer_explore_label` and `footer_teachers_label` or use them. |
| Legal pages | `pages` + `site_texts` | Existing page `title`, `content`, SEO panel; add `last_updated` | rich text, date/string | M | Move the hard-coded Terms and Privacy text into the seeded page entries and let `[slug]` render them. Delete or rewrite the static routes. |
| SEO and sharing | `site_settings` + page SEO | Add `default_meta_description`; wire `og_image`; use page SEO fields | plain text, image | S | Home meta description currently comes from `site.description` in code. |
| Alt text | `courses`, `posts`, `teachers`, `testimonials`, `pages` | Media `alt` fields already exist; add missing Home split/hero alt fields if media alt is not used | plain text | S | Image alt is already editable for CMS images except the hero image and the static placeholders. |
| Internal styleguide | none | Leave as code | not applicable | S | Internal, `noindex`. |

### Recommended shape of `site_texts`

One singleton collection, snake_case slug, grouped fields with clear labels. Suggested groups:

1. Header and navigation (only if not using the EmDash menu)
2. Footer and newsletter
3. Book trial form
4. Result messages
5. 404 page
6. SEO defaults

Use `text` for multi-line messages and `string` for single-line labels. Add admin help text that says whether a field accepts line breaks and whether the API will override it.

## 6. Strings that should stay in code (recommendation)

The client decides, but these are the ones I would not put in the CMS:

| String group | Why |
|---|---|
| Zod and server-side validation messages (`enrol.ts:42-58`) | These are functional validation output and are duplicated on the client. Editing them in two places invites inconsistency. If the client wants them editable, use one shared CMS field and have both client and server read it, not two copies. |
| Security, rate-limit and service-unavailable messages (`Too many attempts`, `The security check failed`, `Service unavailable`) | Operationally sensitive and unlikely to need marketing edits. Keep them stable. |
| Honeypot label "Website" and honeypot success text | Anti-spam implementation detail. The label is hidden from real users. |
| Skip link, "Open menu", "Close menu", "Back to top", "Switch to dark theme", carousel aria-labels | Accessibility boilerplate. Low value to editors and easy to break. Keep for now, or move to `site_texts` only if the client insists on complete coverage. |
| `©`, the current year, "01/02/03" step numbers, "404" | Generated or symbolic. |
| JSON-LD structure (`@context`, `@type`, `url`) | Structured data, not editorial copy. The name already follows the CMS site title. |
| URLs, anchors, `mailto:` and `tel:` hrefs | Structural. Labels can be editable; hrefs should stay controlled. |
| Internal styleguide copy | Internal reference page, not public content. |

The one exception worth making editable is the success and error body text in the modal and newsletter, because that is real customer-facing copy. If those become CMS fields, the API must return a code or nothing, not its own hard-coded sentence, so the CMS text is what the customer sees.

## 7. EmDash visual editing

Verified against the installed source `node_modules/emdash/src/visual-editing/toolbar.ts` and `editable.ts` in `emdash@1.4.0`. Official EmDash docs were not present in the repository, so this is a source-level verification, not a docs-level verification.

### What it supports

- The edit toolbar checks `data-emdash-ref` on the clicked element and walks up ancestors until it finds a field-level annotation.
- It reads the field kind from `/_emdash/api/manifest`.
- Inline editing works for these field kinds:
  - `string` and `text`: `contenteditable="plaintext-only"` in the page.
  - `richText`: edited in place only when the displayed text matches the stored string; otherwise it opens the admin.
  - `image`: opens an image popover with alt text, replace, upload and remove.
  - `portableText`: handled by the in-page Portable Text editor.
  - Any other kind opens the admin at the relevant field.
- Saving calls `PUT /_emdash/api/content/:collection/:id` with `{ data: { [field]: value } }`, which creates or updates a draft and shows the publish button.

### Required markup

Spread the edit proxy onto the element that displays the stored value:

```astro
<h1 {...page.edit.title}>{page.data.title}</h1>
<div {...page.edit.content}><PortableText value={page.data.content} /></div>
<p {...homeEdit?.home_lead}>{homeLead}</p>
```

`createEditable()` returns a proxy. Spreading `{...entry.edit}` gives the entry-level annotation; spreading `{...entry.edit.field}` gives the field-level annotation. `ContentEntry.edit` is the same proxy.

### Current annotation coverage

- `PageView.astro:16`, `23`, `28`: page title and Portable Text content.
- `index.astro`: `home_headline`, `home_lead`, `home_image`, `courses_journey_heading`, `courses_journey_intro`, `pricing_eyebrow`, `pricing_heading`, `pricing_intro`.
- `Footer.astro`: tagline, footer headings, pricing/trial/contact links, address, phone, email, copyright label, terms/privacy labels.
- Everything else has no annotation. Clicking those strings in edit mode does nothing, or opens the admin only if an ancestor has an entry-level annotation.

### Visual editing caveats found in the source

1. The displayed text must match the stored value for `richText`. For `string` and `text`, the toolbar starts editing directly. If the template transforms the value, an inline save writes the transformed text back to the CMS.
2. Home text is transformed in three ways today:
   - `homeText()` trims the value.
   - `replaceTokens()` replaces `{countries}` and `{price}`.
   - Hero headline strips Markdown asterisks (`index.astro:175`).
3. Annotating transformed fields as they are today risks corrupting the stored template. Before adding annotations, either stop transforming the annotated element or provide an admin-only preview that shows the raw stored value.
4. `WisdomPanel` appends "with us" outside the CMS value. Annotating the `<h2>` would save the suffix into the field.
5. Fields rendered by child components with their own defaults (for example `PlanCard`, `StatsBand`) need the annotation passed into the child. They currently do not accept edit proxies.
6. The edit toolbar is only active for a signed-in editor in edit or preview mode. It is not a public editing surface.

### What this means

Visual editing can cover most of the strings once (a) each CMS field has an annotation on the exact element that displays it, (b) the displayed text is not transformed, and (c) the field exists in the manifest. It cannot make hard-coded strings editable. The CMS model and wiring come first; the annotations are the last step.

## 8. Effort and suggested order

Effort: S is under half a day, M is half a day to two days, L is more than two days. These are rough engineering estimates for one developer, including QA.

| Order | Work | Effort | Why first |
|---|---|---|---|
| 1 | Stop silent fallbacks: make `clean()` distinguish "missing" from "intentionally empty"; remove or use unused fields (`footer_newsletter_heading`, `footer_explore_label`, `footer_teachers_label`, `og_image`, `standing_eyebrow`) | S | Editors currently cannot trust an empty field. This is the root cause of most "I changed it and nothing happened" reports. |
| 2 | Add the missing Home fields: about title suffix, badge labels, split/hero alt text, CTA labels if they should be editable | S | Small, high-value, uses the existing `pages` entry. |
| 3 | Add global `site_texts` and wire the book form, newsletter, modal and 404 | M | Covers the largest hard-coded cluster (form, modal, newsletter, 404). |
| 4 | Switch header navigation to the EmDash `primary` menu and add the footer About label | M | Makes the seeded menu useful and removes a hard-coded navigation block. |
| 5 | Move Terms and Privacy into the CMS page entries and render them through `[slug]`; add `last_updated` | M | Removes the largest legal hard-code block and the ignored CMS content. |
| 6 | Fix SEO: use a settings default description, wire `og_image`, use page SEO fields, remove hard-coded Terms/Privacy meta | S | Low effort, improves every page. |
| 7 | Annotate every CMS-backed element for visual editing, after removing transforms from annotated output | M | Makes the admin experience usable, but only after the fields and fallbacks are correct. |
| 8 | Decide what to do with teachers, FAQs, blog and course detail pages | M or L | These collections are seeded but invisible. Either render them or remove them from the admin to avoid confusion. |
| 9 | Full content QA pass at 360, 768 and 1280, including empty-field tests and all fallback paths | M | Proves the promise "edit everything without a redeploy". |

## 9. Live edits vs redeploy

| Change | Live from admin? | Redeploy needed? |
|---|---|---|
| Edit an existing CMS field that the template reads (Home copy, courses, plans, site settings, footer labels) | Yes | No. Home is `no-store`; the live home reflects a published edit on the next request. |
| Edit a field that exists but is not read (`footer_newsletter_heading`, `og_image`, `standing_eyebrow`, menu, page content for static routes) | No | A code change is needed first; editing alone does nothing. |
| Add a new field or collection | Only after the schema is applied in production | Yes, for the schema/seed and template change. After that, content edits are live. |
| Change a hard-coded string, nav config, legal text, form label, API message or layout | No | Yes. |
| Upload media through EmDash to R2 | Yes | No. |
| Add a file under `public/images` | No | Yes. |
| Publish or unpublish a CMS entry | Yes | No, subject to any cache in front of non-home routes. |
| Change the site title, tagline or title separator in settings | Yes, but check the page's SEO panel first | No. |

Caching note: `index.astro` explicitly sets `no-store`. `Base.astro:49-53` and `[slug].astro:12` register EmDash cache hints for other routes, but `astro.config.mjs` does not enable an Astro route cache. The live Terms response did not show a `Cache-Control` or `CF-Cache-Status` header in this test. Treat non-home routes as "probably live, not guaranteed" until the production cache configuration is confirmed.

## 10. Live verification of five hard-coded strings

These five strings were fetched from the live site and matched against the code and seed. None has a corresponding editable field in the repository schema.

| String | Live page and result | Code location | Seed field? |
|---|---|---|---|
| "Book free trial" | Home, HTTP 200, string present | `src/config/site.ts:55`, `Header.astro:92` | No. The seed has a menu item "Get free trial", but the header does not read the menu. |
| "Your name" | Home, HTTP 200, string present | `BookTrial.astro:114` | No. |
| "you@example.com" | Home, HTTP 200, string present | `Newsletter.astro:34` | No. |
| "Switch to dark theme" | Home, HTTP 200, string present | `ThemeToggle.astro:16` | No. |
| "Page not found" | `/this-page-does-not-exist`, HTTP 404, string present | `404.astro:8`, `13` | No. |

Additional live checks:

- Terms page returned HTTP 200 and contained "Last updated 5 November 2026", which is hard-coded at `terms-of-service.astro:7`.
- The live home page contained `id="success"`, `id="standing-out"`, `id="testimonials"`, `id="how-it-works"` and `id="book"`, but no `id="teachers"`, confirming the `/teachers` redirect target does not exist.
- Live home title was `Kanwal Quran Academy`; live description was "Learn Qur'anic recitation, tajweed and memorization online with a teacher who knows your name." Both match the code fallback, not the seed tagline.
- Live JSON-LD was `{"@context":"https://schema.org","@type":"WebSite","name":"Kanwal Quran Academy","url":"https://kanwalquranacademy.com"}`.

## 11. Could not verify

- The production EmDash admin UI. No credentials were available, so I could not click an edit control on the live site or confirm the exact production schema in the database. The "no field exists" conclusion comes from `seed/seed.json` plus the code paths.
- Official EmDash visual-editing documentation. The installed `emdash@1.4.0` source was used instead. If the docs describe additional browser support or field kinds, they were not available here.
- Whether the production database has extra fields not present in the repository seed.
- Whether non-home routes are cached at the edge. No `Cache-Control` or `CF-Cache-Status` header was observed on the Terms response, and the Astro config does not enable a route cache, but this is not a full cache audit.
- Whether the client's production media records already contain alt text that differs from the seed.

## 12. Bottom line

The site is not close to "every visible text editable from the admin" today:

- 64 of 130 inventoried text entries are hard-coded.
- 58 more are editable only through a CMS field that silently falls back to code text.
- 9 CMS fields or collections are read but ignored, or seeded but never rendered.
- Visual editing exists and works, but only 8 Home fields plus the footer settings and the dynamic page title/content are annotated. Most strings have no annotation.
- The quickest real improvement is not more inline editing. It is removing silent fallbacks, wiring the existing fields, adding one `site_texts` collection for the form, modal, newsletter and 404, and moving Terms and Privacy into the CMS. After that, annotating the elements for visual editing is a straightforward final pass.
