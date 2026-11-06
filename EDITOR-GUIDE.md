# Editor Guide

This guide explains where every piece of content on the site lives in the EmDash admin (`/_emdash/admin`). A non-technical editor should be able to change anything important from there.

---

## Admin Menu

The admin sidebar has three groups:

| Group      | Collections inside                                                        |
| ---------- | ----------------------------------------------------------------------- |
| **Content** | Pages, Blog posts                                                       |
| **Academy** | Courses, Plans, Teachers, Testimonials, FAQs                            |
| **Settings** | Site settings, Enrolments, Subscribers                                 |

Everything below maps to one of these collections.

---

## 1. Plans

**Academy → Plans**

Each plan is one row. Edit any row to change:

- **Plan name** (e.g. "Plan I")
- **Price in US dollars** (e.g. 20)
- **Currency symbol** shown before the price (default `$`)
- **Billing period** shown after the price (default `/ month`)
- **Classes each week** / **Classes each month** / **Teaching hours each month**
- **Mark as the most popular plan** (tick the box on exactly one plan)
- **Display order** (lowest first; 1, 2, 3, 4)
- **Visible on the site** (uncheck to hide a plan without deleting it)

**To change a plan price:** open Plans → click the plan → change Price → Save.

The pricing section on the home page and the mobile carousel both read from this list.

---

## 2. Courses

**Academy → Courses**

Each course is one row. Edit any row to change:

- **Course name** (this is the title on the course card and in the contact form dropdown)
- **Summary** (one sentence shown on the course row)
- **Long description** (rich text editor; supports headings and paragraphs)
- **Level** (All levels, Beginner, Intermediate, Advanced)
- **Course image** (pick from the Media Library)
- **Arabic name** (shown on the right side of the course row on the home page)
- **Display order** (lowest first)
- **Visible on the site** (uncheck to hide a course everywhere: home page, course list, and contact form dropdown)

**Adding a course:** click New entry, fill in the fields, Save. It automatically appears on the home page and in the contact form dropdown.

**Renaming a course** updates every place the name appears: the home page, the contact form dropdown, and the course page.

---

## 3. Site settings

**Settings → Site settings**

There is one entry. Open it to change:

### Contact details
- **Phone number**
- **WhatsApp number** (digits only with country code; leave empty to hide the WhatsApp link)
- **Email address**
- **Owner notification email** (receives lead submissions from the trial form)
- **Address**
- **Social links** (add rows with Platform name + Profile URL)

### Logos and sharing
- **Logo for light background** (header and footer, pick from Media Library)
- **Logo for dark background**
- **Default sharing image** (used when a page has no specific OG image)

### Counter stats
- **Years teaching** (for example `5+`)
- **Countries served** (for example `5+`)
- **Students taught** (leave as `[000]+` until you have a real number)
- **Sessions delivered** (same)
- **Years / Countries / Students / Sessions label** (the text under each number on the stats band)

### Footer text
- **Footer introduction**
- **Footer explore heading**
- **Footer contact heading**
- **Footer courses heading**
- **Footer academy heading**
- **Footer pricing link** / **Teachers** / **Free trial** / **Contact**
- **Footer terms link** / **Privacy link**
- **Footer copyright text**
- **Footer stay in touch heading**
- **Footer newsletter heading**
- **Footer newsletter consent text**

---

## 4. Testimonials

**Academy → Testimonials**

The testimonials section only appears when at least one published testimonial with both **consent given** and **Visible** checked exists. When there are no published testimonials, the section is hidden.

Each row has:

- **Quote**
- **Author name**
- **Country**
- **Relation to the academy** (e.g. Student, Parent, Graduate)
- **Rating** (e.g. `5.0`)
- **Author photo** (optional; initials are shown when empty)
- **Consent given** (must be ticked for the review to appear)
- **Visible on the site** (uncheck to hide without deleting)
- **Display order**

**Seeding:** no testimonials are seeded. Add them only after getting written permission from the author.

---

## 5. Home page content (hero, sections, headings)

**Content → Pages → Home**

This single entry controls every piece of text on the home page. Open it and scroll down.

### Hero
- **Eyebrow** (small label above the headline)
- **Headline** (the big title)
- **Highlighted phrase**
- **Introduction** (the paragraph under the headline)
- **Reach line** (supports `{countries}` token, replaced by the countries stat)
- **Mobile call to action** label

### Floating feature cards (the four white cards under the hero)
Each card has a title, text, and the first card also has a **chip label**. Titles support tokens: `{price}` (lowest plan price), `{countries}` (countries stat).

- Card 1: title, text, chip
- Card 2: title (default uses `{price}`), text
- Card 3: title (default uses `{countries}`), text
- Card 4: title, text

### About panel (Why Kanwal)
- **Eyebrow**, **Heading before highlight**, **Highlighted word**
- **Paragraph 1**, **Paragraph 2**
- **Image alt text**

### Standing out section
- **Eyebrow**, **Heading**
- Item 1/2/3: **title** and **text**

### Courses section
- **Eyebrow**, **Heading**, **Introduction**
- **Journey heading** (above the course list) and **Journey introduction**
- **Trial button** / **Details button** / **Format label**

### Feature split panels (the two image+text panels below the course list)
- Split 1: **Heading before**, **Highlighted word**, **Paragraph 1**, **Paragraph 2**, **Image label**
- Split 2: **Heading before**, **Highlighted word**, **Paragraph 1**, **List items** (one per line), **Image label**

### Stats band
- **Eyebrow** (e.g. "Over the past 5 years")
- **Heading**
- **Description**

### How it works (free trial steps)
- **Eyebrow** (e.g. "Free trial")
- **Heading**
- Step 1/2/3: **Title** and **Description**

### Pricing section
- **Eyebrow**, **Heading**, **Introduction**
- **Billing period** / **Classes each week label** / **Classes each month label** / **Hours label**
- **Popular badge** text / **Select plan button** text

### Testimonials section
- **Eyebrow** (e.g. "Student voices")
- **Heading** (e.g. "Customer Reviews")

### Book trial section (the form at the bottom)
- **Eyebrow**, **Heading**, **Introduction**
- **Direct contact label**
- **Lesson note**
- **Form card heading** and **Subheading**
- **Submit button** label

---

## 6. Teachers and FAQs

### Teachers
**Academy → Teachers**

Each row has: name, role, photo (from Media Library), bio, qualifications (one per line), display order, and **Visible on the site**.

### FAQs
**Academy → FAQs**

Each row has: question, answer, display order, and **Visible on the site**.

---

## 7. Images

All images are managed through the **Media Library** in the admin.

- **Hero image**: Content → Pages → Home → Home hero: image
- **Course images**: Academy → Courses → each course → Course image
- **Teacher photos**: Academy → Teachers → each teacher → Photo
- **Logos (header/footer)**: Settings → Site settings → Logo for light/dark background
- **Default sharing image (OG)**: Settings → Site settings → Default sharing image

Always fill in the **alt text** when uploading images (the Media Library dialog has an alt field).

---

## 8. SEO per page

**Content → Pages → [Page]** → scroll to the **SEO** section at the bottom of the editor.

Each page can have its own:
- **SEO title** (if left blank, the page title + site name is used)
- **SEO description** (shown in search results and social sharing)
- **OG image** (shown when shared on social media; falls back to the site default)

---

## 9. Enrolments and Subscribers

### Enrolments (leads)
**Settings → Enrolments**

Read-only list of every form submission. Columns: name, email, phone, plan, course, status, submitted at.

**To update a lead's status:** open the entry → change Status from `new` to `contacted` → Save.

### Subscribers
**Settings → Subscribers**

Email addresses collected through the footer newsletter form. Columns: email, status, subscribed at.

---

## Checklist after editing

1. Click **Save** on the entry you changed.
2. Open the home page in a new tab and hard-refresh (Ctrl+Shift+R).
3. Verify the change appears in the right place.
4. If the change does not appear, check:
   - The entry is **Published** (not Draft)
   - For courses/teachers/testimonials/FAQs: **Visible on the site** is ticked
   - For testimonials: **Consent given** is also ticked

---

## Still hard-coded (cannot be changed from the admin)

The following are structural or design choices that are not editable from the admin:

- Navigation menu items (managed via admin menus, but the single-page anchor links are set in the seed)
- The header logo file paths (fall back to `/images/kanwal-mark-on-light.png` and `-on-dark.png` when no logo is uploaded in Site settings)
- The footer logo file paths (same fallback)
- The two FeatureSplit images (`/images/section-phone.png` and `/images/section-memorize.jpg`)
- The WisdomPanel image (`/images/wisdom.jpg`)
- The course pill chip icons (book/waves/bookmark/headset SVGs)
- The standing out item icons (clock/book/screens SVGs)
- The how-it-works step icons (book-trial/teacher/calendar-check SVGs)
- The feature card icons (trial/price/globe/device SVGs)
- The stats band ring labels (Students, Sessions, Countries) and their layout
- The plan card layout (which fields are shown in which order)

These can be changed by a developer in the source code.
