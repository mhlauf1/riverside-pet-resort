# Current Milestone: M2 — Resort Pages

**Dates:** 6/15–6/17 · **Status:** Active

## Context

M0 (investigation) and M1 (brand swap & strip) are complete. Sanity project `Riverside Pet Resort` (**`7ze0boy4`**, dataset `production`) is live; env wired in both workspaces; settings singleton seeded + published. Dev server runs at localhost:3000 rendering the Riverside shell. Now building out the resort pages as CMS content using the existing page-builder blocks + approved copy in `intake-content.md`.

## Pending human decisions/inputs

- [ ] Vercel project from repo; confirm preview deploy builds (add prod CORS origin when domain known)
- [ ] Form destination email (Brian) → `CONTACT_FORM_TO_EMAIL`
- [ ] Canonical domain (Peter) → `NEXT_PUBLIC_SITE_URL`
- [x] Goose booking links (Caitlin/Goose, 6/25) → wired to all "Book Now" CTAs (homepage + boarding + daycare heroes) + recorded in `settings.posUrls`. Daycare + Home → `.../search/daycare/pets`. ✓ **Boarding now on its own deep link** `.../search/boarding/pets` (Caitlin confirmed 6/25 — swap "daycare"→"boarding" in the path; boarding is the default selection). Updated in both `settings.posUrls.boardingBookingUrl` and the boarding hero Book Now CTA href. Grooming = **Booker phone-only** (Amy, 6/25; no booking link); grooming hero CTA → "Call to Book" `tel:651-480-4726`.
- [x] Brand-pack logo added → `frontend/public/images/riverside-logo.png` (serves 200; header/footer render it)
- [ ] Best client photos from Rio + Barks & Rec Facebook (imagery pass)

## M2 tasks

- [x] **Home** — CMS page (`homepage`): hero, intro (approved copy), services overview (6 cards), Why Riverside (iconGrid, 7 items). Published + verified rendering.
- [x] **Boarding** — `service` doc `service-boarding` (`/services/boarding`): heroMinimal, approved narrative, 6-item highlights (iconGrid), pricingList ($52/$69 + $129 renovation footnote). Published + verified.
- [x] **Daycare** — `service` doc `service-daycare` (`/services/daycare`): heroMinimal, approved narrative, 6-item highlights, pricingList ($39/$29), pricingMatrix packages table (5/10/20/30). Published + verified.
- [x] **Grooming** — `service` doc `service-grooming` (`/services/grooming`): heroMinimal, narrative, services iconGrid (7), Professional + Student infoSections, Cat Grooming iconGrid (6), 24-Hr Self-Serve Wash iconGrid (6) + pricingList ($20/20min). Published + verified.
- [x] **About** — `page` doc `page-about` (`/about`): heroMinimal, "new chapter" narrative (approved messaging), Our Commitment iconGrid (5). Published + verified.
- [x] **Careers** — `page` doc `page-careers` (`/careers`): heroMinimal, intro, featureGrid of 4 career areas. Published + verified.
- [x] **Contact** — `page` doc `page-contact` (`/contact`): heroMinimal + contactForm (6 fields, address, phone 651-480-4726, Google map embed, next-steps). Published + verified. ⚠️ Form posts to `/api/contact` but WON'T DELIVER until `CONTACT_FORM_TO_EMAIL` + SMTP creds set (pending Brian) — submitting now returns "Contact form is not configured". Email intentionally omitted from display until confirmed.
- [x] Wire nav + footer — seeded `settings.navItems` (Home · Services · About · Careers · Contact · Grooming School) + `footerColumns` (Services, Company). Verified: Services dropdown auto-fills from service docs; footer columns render. Site navigable end-to-end. (Nav targets /about, /careers, /contact, /school don't exist yet — built next / M3.)
- [x] Build pricing as structured CMS content — done via `pricingList` (boarding/daycare/grooming rates) + `pricingMatrix` (daycare packages); nothing hardcoded.
- [ ] Imagery pass once Facebook photos are gathered — BLOCKED on photos. All heroes/sections are text-only or icon-based right now; no `heroImage`/gallery imagery added yet.

## M2 status: content-complete except imagery + pending business inputs

All 7 resort pages built, published, and verified rendering; nav + footer wired; site navigable end-to-end. Remaining before M2 fully closes: imagery pass (needs Facebook photos), and the pending human inputs above (form email, Goose links, domain, Vercel). **Next milestone: M3 — Rio Grooming School site-within-a-site** (`(school)` route group, own layout/nav/theme, `schoolSettings` + `schoolPage` schema).

## Decisions / notes

- Homepage booking CTA = placeholder `#` and "Learn About Grooming School"/school links = `/school` (M3) and service-card CTAs = `/services/<slug>` — all resolve as those pages/booking URLs land.
- **DECIDED:** Boarding/Daycare/Grooming are modeled as `service` docs at `/services/[slug]` (auto-populate the Services nav dropdown via `servicesNavQuery`; match homepage card links). Service detail page renders only `pageBuilder`, so each starts with a `heroMinimal` header block.
- Page-builder recipe per service: `heroMinimal` (forest header) → `infoSection` (approved narrative) → `iconGrid` (highlights) → pricing block (`pricingList` / `pricingMatrix`).

---

# M3 — Rio Grooming School (site-within-a-site)

**Dates:** 6/17–6/19 · **Status:** Active (started early)

## Architecture decision (documented divergence)

The brief says the school gets its "own root layout." Next.js offers two routes: (A) **multiple root layouts** (two `<html>` roots via top-level route groups) or (B) **one root + nested section layouts**. **Chose (B):** keep a single `<html>`/global-concerns root (fonts, analytics, `SanityLive`, JSON-LD, Toaster, skip-link) and give each section a nested layout that fully owns its chrome (Header/Footer) and theme (scoped wrapper class). Rationale: (A) duplicates global infra across two roots and complicates `not-found`/`icon`/`robots`/`sitemap`; (B) delivers school nav + footer + theme with no bleed, at lower risk to working M2 code. Theme isolation uses a scoped wrapper class overriding the `:root` CSS vars — the base was already built "resolve to whichever theme is active," so this is the intended mechanism.

## Schema decision

School content is a **distinct `schoolPage` doc type** (not a `section: "school"` flag on `page`) — mirrors the resort `page`/`service` split, keeps school content in its own desk group, and routes cleanly under `/school/...`. `schoolPage` shares the full resort page-builder block set, so every existing section is reusable.

## M3 tasks

- [x] **Schema layer** — `schoolPage` doc type (`studio/.../documents/schoolPage.ts`) + `schoolSettings` singleton (`.../singletons/schoolSettings.tsx`, own nav/footer/hours/funnel-email/back-to-resort). Registered in `schemaTypes/index.ts`; grouped in the desk under "Rio Grooming School" (`structure/index.ts`). Presentation tool wired for `/school` + `/school/:slug` (`sanity.config.ts`). Types regenerated; studio + frontend type-check clean. **Seeded + published to `7ze0boy4`/production (6/17).**
- [x] **Routing + layouts** — resort routes moved into `app/(site)/` group (`page.tsx`, `[slug]`, `services` via `git mv`); new `app/(site)/layout.tsx` owns resort Header/Footer + `<main>`. New `app/(school)/layout.tsx` owns school chrome + `theme-school` wrapper. Root `app/layout.tsx` slimmed to global concerns only (html/body, fonts, analytics, JSON-LD, SanityLive, skip-link). **Production build green**: `/school` + `/school/[slug]` resolve with no collision vs resort `/[slug]`; all M2 routes intact; Studio no longer gets site chrome leaked in. Public URLs unchanged (route groups are URL-invisible).
- [x] **School theme tokens** — `.theme-school` scoped class in `globals.css` overriding the `--color-*` tokens Tailwind utilities reference, so every page-builder block reskins inside the subtree with zero per-component work and no bleed into the resort. ⚠️ Provisional pine/gold/ivory palette — retune in that one block when Amy's riogrooming.com-derived refresh lands.
- [x] **School Header/Footer** — `app/components/school/SchoolHeader.tsx` (back-to-resort bar, logo/wordmark text fallback, nav w/ dropdown support, CTA, mobile menu, a11y) + `SchoolFooter.tsx` (columns, contact + school hours, social, back-to-resort). Frontend queries added: `schoolSettingsQuery`, `schoolHomeQuery`, `getSchoolPageQuery`, `schoolPageSlugs`. (Resort nav → school cross-link already exists via the "Grooming School" nav item → `/school`.)
- [x] **School home page** — `schoolPage` `school-home` (slug `home`) published, rendered at `/school` (verified 200): heroMinimal (forest, "The Rio Grooming School" + accent "A Legacy of Professional Grooming Education"), infoSection (approved "Since 2009…" verbatim), iconGrid (7 program highlights), teamGrid Meet the Dean (Amy Ericson — themes-based bio, no invented credentials; portrait pending photo pass). Verified rendering under `theme-school` with school chrome; no theme bleed into resort.
- [x] **7 sub-pages** — `schoolPage` docs published (`school-<slug>`): Why Become a Groomer? · Enrollment & Financing · Scholarships · Student Housing · Career Placement · Request Information · Schedule a Tour. Approved titles + heroMinimal headers; bodies are `[TBD — content pending Amy/Brian]` placeholders. Nav/footer links resolve; `/school/[slug]` routes 200 (verified). Grouped under nav: Home · Why Become a Groomer? · Admissions (dropdown: Enrollment, Scholarships, Housing, Career) · Schedule a Tour; CTA → Request Information.
- [x] **Funnel forms** — Request Information + Schedule a Tour now render `contactForm` blocks via `scripts/seed-intake-forms.js`; destination resolves from `schoolSettings.formEmail` and falls back to `CONTACT_FORM_TO_EMAIL`. Same SMTP "not configured until env set" caveat as the resort contact form; real submit-test remains blocked until SMTP + destination email are configured. `/api/contact` includes form/page context in submissions.

## M3 pending inputs

- School content carry-over vs. rewrite for the 7 sub-pages — PENDING (Amy/Brian). Home copy is approved; sub-page bodies are not.
- School visual language — derive from riogrooming.com with Amy's refreshes (not yet seen). Building a distinct school theme from brand tokens as a starting point.
- School funnel form destination email — PENDING (`schoolSettings.formEmail`, `[EMAIL-TBD]`).

## Carry-forward (net-new, later milestones)

~~FAQ doc type + `FAQPage` JSON-LD (M4)~~ ✓ · ~~`locationPage` (M4)~~ ✓ · `(school)` route group + `schoolSettings`/`schoolPage` (M3) ✓ · ~~`next.config` 301 map (M4)~~ ✓ (done as middleware, see M4).

## Rules in effect (from CLAUDE.md)

School not Academy · no placeholder contact data · pricing/booking via CMS only · domain via single config constant (unconfirmed) · investigate before editing · work on `main`, commit only when asked.

---

# M4 — SEO Scope Items + Redirects

**Dates:** 6/19–6/21 · **Status:** Code-complete (built 6/18, ahead of schedule)

## Decisions (this session)

- **Grooming School nav stays a single portal link** to `/school` — no dropdown. Preserves the site-within-a-site boundary; SchoolHeader owns the school nav. (No code change — current behavior already correct.)
- **FAQ = dedicated `/faq` page** built from the existing `faqAccordion` block; block stays reusable on any page.
- **301 map = mechanism now, URL pairs deferred** until a riogrooming.com crawl.

## M4 tasks

- [x] **Location pages — schema** — new `locationPage` doc type (`studio/src/schemaTypes/documents/locationPage.ts`, `PinIcon`): `suburb`, `slug`, `seo`, `pageBuilder` (full resort block set). Registered in `schemaTypes/index.ts`; auto-lists in the desk (not in `DISABLED_TYPES`). Types regenerated; type-check clean both workspaces.
- [x] **Location pages — route** — `frontend/app/(site)/locations/[suburb]/page.tsx`, mirrors `(site)/[slug]`. `generateStaticParams` → `locationPageSlugs`; `generateMetadata` → `getLocationPageQuery` (canonical `/locations/<slug>`); renders shared `PageBuilderPage`. Literal `locations/` segment — no collision with `[slug]` catch-all. **Build: all 7 SSG-prerendered.**
- [x] **Location pages — sitemap/queries** — added `getLocationPageQuery` + `locationPageSlugs` (`queries.ts`); extended `sitemapData` to include `locationPage`; added `/locations` prefix + 0.6 priority in `sitemap.ts`. **Verified:** all 7 in `/sitemap.xml`, **absent from nav** (nav is explicit in `settings.navItems`).
- [x] **Location pages — content** — 7 `locationPage` docs seeded + published (`location-<slug>`): Hastings · Cottage Grove · Woodbury · Afton MN; Prescott · Ellsworth WI; Lakeville MN. Real per-suburb intro (relationship to the Hastings campus + greater-TC/western-WI framing) + shared services `iconGrid` + per-suburb SEO. **Not doorway pages.** Seeded via `scripts/seed-m4-content.js`.
- [x] **FAQ page + JSON-LD** — `page` doc `page-faq` (slug `faq`, `/faq`): heroMinimal + `faqAccordion` (8 Q&A, no hardcoded pricing/booking URLs). `buildFaqPageJsonLd` + `collectFaqs` helpers (`sanity/lib/utils.ts`) emit `FAQPage` JSON-LD from any page containing an `faqAccordion`, wired in `(site)/[slug]/page.tsx` (same inline-script pattern as layout's LocalBusiness schema). **Verified:** `/faq` 200, FAQPage script with all 8 questions present. ⚠️ Still needs Google Rich Results validation in M5 QA.
- [x] **FAQ discoverability** — `/faq` link added to the footer "Company" column (kept out of main nav). Verified rendering.
- [x] **301 redirect scaffolding (mechanism; URLs deferred)** — `frontend/middleware.ts` + `frontend/app/redirect-map.ts`. Path-aware: keyed off **legacy Host** (`riogrooming.com`, `riogroomingschool.com`; Barks & Rec TODO) so canonical traffic is never touched; school/enrollment-shaped paths → `/school`, everything else → `/`; redirects to `SITE_URL` (single config constant). **Verified:** legacy host → 301 to /school or /; canonical host → 200 (no redirect).
- [x] **301 map populated from riogrooming.com crawl (6/20)** — crawled page/post/portfolio sitemaps (27 pages + 5 posts + ~30 job-board URLs). `EXPLICIT_REDIRECTS` now lands legacy URLs on the precise new page: 6 `/grooming-school/*` deep links → matching `/school/*` sub-pages; all `/grooming-services/*` + appointment-request pages → `/services/grooming`; `/rooms` → `/services/boarding`; `/about-us/*` → `/about`. Added `CAREERS_PREFIXES` (`/jobs`, `/submit-a-job-posting`) → `/careers` for the external job board. Blog/legal/template artifacts fall through to `/`. Verified all 30 sampled legacy paths resolve correctly; canonical host untouched; type-check clean. **Still TODO:** add Barks & Rec legacy host once Peter confirms the domain.

## Documented divergences (template → this repo)

- 301 map implemented as **Next proxy** (host-keyed), not `next.config` `redirects` — keeps the canonical site untouched and lets the map grow without config sprawl. `next.config.ts` stays redirect-free.
- New seed scripts under `scripts/` read the Sanity write token from the CLI session (same pattern as `migrate-settings-id.js`): `seed-m4-content.js` (location + FAQ content), `seed-home-marquee.js` (homepage hero swap).

## M4 pending inputs / follow-ups

- ~~riogrooming.com crawl → populate `EXPLICIT_REDIRECTS`~~ ✓ (6/20). Remaining: add the Barks & Rec legacy host once Peter confirms the domain (before M6).
- FAQPage schema → structurally validated in local QA; still run Google Rich Results validation on preview.
- Suburb pages currently use a shared services grid + per-suburb intro; richer per-suburb imagery/blurbs can be layered in during the imagery pass.

## Out-of-milestone note (M2 imagery)

- **Homepage hero swapped `hero` → `heroMarquee`** with 6 **placeholder Unsplash dog photos** uploaded as Sanity assets (approved copy + CTAs preserved). ⚠️ Placeholder only — replace with curated Rio/Barks & Rec Facebook photos in the imagery pass. Reproducible via `scripts/seed-home-marquee.js`.

## School visual polish pass (6/20)

- **School heroes → `heroSplit`.** All 8 `schoolPage` docs converted from bare centered `heroMinimal` to `heroSplit` (image right, top funnel CTAs) — bringing the school section to the same visual bar as the resort pages. Approved eyebrow/heading preserved verbatim; home's `headingAccent` folded into the hero body. **Copy-agnostic: the 7 sub-page `[TBD]` `infoSection` bodies were left untouched** (pending Amy/Brian). Home keeps its approved "Since 2009…" intro + highlights + dean. Reproducible via `scripts/seed-school-split-heroes.js`. ⚠️ Hero images are placeholder Unsplash — swap in the imagery pass.
- **School home hero → `heroMarquee`.** `/school` now uses `heroMarquee` with the same approved content and a dark/forest background option, reusing the existing school hero photos as editable marquee images. Decorative resort dog illustrations are disabled and compact vertical spacing is enabled for this block. Reproducible via `scripts/seed-school-home-marquee.js`.
- **Funnel `ctaStrip` appended** to each of the 7 sub-pages (generic enrollment-funnel chrome → Request Information / Schedule a Tour; never points a page at itself). `sand` bg for AA-safe contrast + separation from the dark footer.
- **`.theme-school` lightly tuned** (`globals.css`): deeper pine, richer antique gold, warmer ivory; `terracotta-dark` (primary-button bg) + `text-muted` kept AA-safe. Still PROVISIONAL — full retune pending Amy's riogrooming.com-derived refresh.
- Verified: clean production build (8 school routes SSG); type-check clean both workspaces; `/school` + sub-pages 200 with heroSplit image + CTAs; `[TBD]` bodies intact; no `theme-school` bleed into resort routes. Sanity types regenerated.

---

# Client revision round 1 (6/24 — Brian)

All edits made directly in Sanity (`7ze0boy4`/production) via MCP and **published**.

- **Daycare pricing corrected** (`service-daycare`): Full Day $39 → **$35**, Half Day $29 → **$25**. Package matrix + boarding left unchanged per Brian. Added a per-row `note` on the 5-Day package row: *"Special introductory pricing for first-time daycare clients."*
- **Scholarship page assessed + fixed** (`school-scholarships`): the flagged sentence read strange for two reasons — (1) meta/reporting voice ("Rio's existing scholarship page says…"), (2) a garbled fact: the original riogrooming.com page funds *tuition up to $5,000* with *$200–$500* individual awards, and our copy had dropped the $5,000. Rewrote the whole page into Rio's own voice, restored $5,000, kept all facts (MN/WI residency, 2.0 GPA, Jan 1–Nov 15 window, 200/436-hr programs, Nov 16 award notice).
- **Rio school narrative alignment — all 8 school pages** rewritten out of the hedged "Rio currently lists…/this page avoids guarantees" voice into Rio's own voice, grounded in a fresh read of riogrooming.com (home, why-dog-grooming, enroll-financing, student-housing, tours, scholarships). Facts preserved/restored: founded 2009; Amy Ericson = President & Dean, at Rio since age five, grad 2009; programs 436-hr Pet Stylist $10,000 + $100 app fee, 200-hr Bather/Brusher $5,000, tool kit $2,800+tax, TFC financing up to $5,000, ~$223.64/mo; 3 partner hotels w/ addresses; tour days Mon–Wed 8–5 + FaceTime/Zoom virtual; full career-paths list. Removed an internal-scaffolding leak in career-placement FAQ ("The current project source supports…").

⚠️ **Needs client confirmation** — these facts were pulled from the *live (legacy) riogrooming.com* and may be stale for Riverside: tuition/tool-kit/financing figures, the 3 partner hotels, and tour hours. Flag to Brian/Amy before launch.

Pending from original Brian note: ~~Olivia sending current photos (imagery pass)~~ ✓ (see round 2); end-of-week final review.

---

# Client revision round 2 — imagery pass (6/25 — Brian)

Brian: homepage scroller felt grooming-heavy; Boarding/Daycare hero images were grooming-focused; incorporate Olivia's new photos. Received **31 real customer photos** ("Pup Pics" batch — overwhelmingly daycare/boarding, only one true grooming shot). Categorized by eye (unsorted/generic filenames). Excluded the one photo showing a **"Barks & Rec"-branded harness** (pre-rebrand identity). All edits to `7ze0boy4`/production, **published**, via `scripts/seed-real-photos.js` (uploads local files as Sanity assets; surgical image-only block patches; `PHOTOS_DIR` env points at the source folder).

- **Homepage de-placeholdered** (replaced all Unsplash): top `heroMarquee` (`hero1`) → balanced 7 (3 daycare · 2 boarding · 1 indoor · 1 grooming — grooming present, not dominant); bottom `photoMarquee` (`home-photo-marquee`) → 8 daycare/boarding; both `splitContent` images (`home-campus-intro`, `home-rio-bridge`) → real photos. Directly answers "scroller feels grooming-heavy" (handled **both** homepage scrollers since the note was ambiguous).
- **Service hero images swapped** off grooming-y Unsplash → on-subject: Boarding (`bh`) → two goldens on a raised cot (suite/rest); Daycare (`dh`) → border collie in the play yard; Grooming (`gh`) → real grooming-tub bath shot (upgrade from Unsplash).
- All real alt text written (a11y). Verified live via re-query. 19 unique assets uploaded (grooming bath reused on homepage marquee + grooming hero).

Still pending: Brian's final booking-link review (he's connecting Goose + Amy separately); group final approval; **target go-live Friday 6/26**.

---

# Client revision round 3 — homepage CTAs + grooming booking (6/25 — Brian)

Brian: the single homepage "Book Now" implies one portal books everything (it doesn't); replace with three distinct entry points. And the grooming booking CTA needs clearer wording + a destination that works everywhere (the `tel:` link reads as "leads nowhere" on desktop). **Launch proposed for midday 6/26** pending a final leadership pass.

**Code changes (need a deploy — not just CMS):**
- `heroMarquee` schema: added optional **`tertiaryCta`** (`studio/.../objects/heroMarquee.ts`). Types regenerated both workspaces.
- `HeroMarquee.tsx`: render `tertiaryCta` (outline, mirrors secondary; dark-mode aware). Button row now `md:flex-wrap` so three CTAs wrap gracefully instead of overflowing on narrow desktops.
- `sanity/lib/queries.ts`: added `tertiaryCta ${buttonFields}` to the `heroMarquee` projection (was dropping the field).

**Content (Sanity `7ze0boy4`/production, published):**
- Homepage hero (`hero1`) → three buttons: **Book Boarding & Daycare** → Goose portal (`…/search/daycare/pets`) · **Book a Grooming Appointment** → `/services/grooming` · **Grooming School** → `/school`. (Decorative `bubbleText` "All-inclusive care under one roof" left as-is.)
- Grooming hero (`gh`) primaryCta: **"Call to Book" → "Make an Appointment"**, still `tel:651-480-4726` (grooming is Booker phone-only per Amy). Homepage routes to the grooming page (works on every device); the page itself offers the direct-dial action.

Verified: type-check clean both workspaces; production build green (all routes prerendered); dev render confirms 3 hero buttons + grooming "Make an Appointment". Note: persistent **header** "Book Now" CTA is separate and unchanged (not in Brian's scope).

⚠️ These are **repo code changes** — must be committed + pushed so Vercel deploys before the homepage shows three buttons in production.

---

# Client revision round 4 — grooming/school edits, forms, galleries (6/26 — Brian)

Brian's consolidated list for the Grooming + Grooming School sections, plus a Job Listings form and a photo gallery. All Sanity edits to `7ze0boy4`/production, **published**. Reproducible via `scripts/seed-revision-round4-copy.js`, `seed-round4-grooming-form.js`, `seed-round4-job-listings.js`, `seed-round4-galleries.js`.

**Code changes (need a deploy — not just CMS):**
- **Per-form destination-email override.** `contactForm` schema gains optional `destinationEmailOverride` (`studio/.../objects/contactForm.ts`). `ContactForm.tsx` now sends `_blockKey`; `app/api/contact/route.ts` `getRecipientEmail()` reads the override **from the CMS block** (keyed by `_pageId`+`_blockKey`) — never trusted from the client payload, so the endpoint can't be used as an open relay. `isPlaceholderEmail()` guard means `[EMAIL-TBD]` never sends. Added email field labels (company/city/state/zip/preferredDays/etc.); `_blockKey` excluded from the email body. Types regenerated; type-check clean both workspaces.
- **Redirects** (`app/redirect-map.ts`): `/jobs` + `/submit-a-job-posting` legacy paths now 301 → `/job-listings` (was `/careers`). Verified via legacy-host curl.

**School copy edits (Sanity):**
- `school-home` `sh-key-info` ("What Training at Rio Looks Like"): removed the "retail and presentation skills" clause (students don't learn retail); "meet the team" → **"meet the instructors"** (Brian's "Next Best Step" line).
- `school-schedule-a-tour`: tours **Monday–Wednesday → Monday–Friday** (both the `st-overview` prose and the `st-faq` "When are tours offered?" answer).
- `school-enrollment-financing` `ef-overview` heading: "Start When a Spot Opens" → **"Open Enrollment Year-Round."**
- `school-scholarships`: removed the **MN/WI residency requirement** (`sc-eligibility` item + `sc-faq` answer clause) and the **"recent high school graduates" preference** (item + answer sentence). ⚠️ These reverse facts preserved in the 6/24 revision (pulled from legacy riogrooming.com) — applied per Brian's explicit request.

**Grooming "Request an Appointment" form (`service-grooming`, `groom-appt-form`):**
- Recreated the legacy riogrooming.com form (existing-clients request form): name, email, phone, pet(s) name, Service Requested (select), preferred day(s)/time, add-on requests, special notes, preferred contact method. Verbatim "Current Rio clients" intro + **new-customer "please call 651-480-4726"** note + 24-hr cancellation note in the description. `destinationEmailOverride = [EMAIL-TBD]`.
- ⚠️ Legacy form **auto-books into the POS**; our recreation is **request-by-email** (matches grooming = Booker phone-only per Amy). The legacy Service/add-on dropdown options are rendered from a menu image — exact option lists + submit-button wording to confirm with Brian.

**Job Listings page (`page-job-listings`, `/job-listings`):**
- Employer job-submission form (email, name, company, address/city/state/zip, phone, job description) recreating the legacy "Submit a Job Posting" page; `destinationEmailOverride = [EMAIL-TBD]` (school administrator). Linked in footer Company column. ⚠️ Net-new beyond the original $3,500 scope — built as goodwill; flag to keep the boundary documented.

**Galleries (boxers-style grids, existing `galleryPage` block):**
- **Resort `/gallery`** (`page-gallery`, "Pup Pics") — 11 finished-groom dog portraits + wash-station shot. In main nav + footer.
- **School `/school/gallery`** (`school-gallery`, "Inside Rio Grooming School") — 10 **students/facility/group/hands-on** photos only. In school nav + footer.
- Applied the client's rule: **single-dog photos go on the resort gallery, never the school pages.** The dropped `school/` folder was ~85% single-dog finished-groom portraits (routed to the resort gallery); only the student/booth/certificate/class shots went to the school gallery.

**Photos:** galleries populated from the dropped batch (`~/Desktop/riverisde pet resort`). ⚠️ **Still pending Brian:** (1) grooming-page service photos (his "second email"); (2) curated school student/facility photos to extend `/school/gallery` and swap school-page hero placeholders — re-run `seed-round4-galleries.js` with new entries to add them.

**QuickSchools (answer for Brian, no build):** the school **Request Information** form currently delivers by **email** (`schoolSettings.formEmail`, `[EMAIL-TBD]`) — it does **not** auto-populate QuickSchools. To replicate the legacy auto-populate, Rio must provide either (a) QuickSchools' embeddable inquiry-form code, or (b) a lead webhook/API endpoint to POST to. Same answer covers "where do Schedule a Tour / Request Info submissions go": currently email to `schoolSettings.formEmail` → falls back to `CONTACT_FORM_TO_EMAIL` (both pending).

Verified: type-check clean both workspaces; production build green; dev render confirms `/gallery`, `/school/gallery`, `/job-listings`, and the grooming appointment form all 200 with correct content; Gallery links in both navs; legacy job + appointment paths 301 correctly; canonical host untouched.

⚠️ **Repo code changes (contactForm override, redirect map) must be committed + pushed** so Vercel deploys before the new forms/redirects work in production. CMS content (copy edits, forms, galleries, nav) is already live in `7ze0boy4`/production.

**Pending human inputs (relay to Brian):** grooming appointment form destination email(s) · school funnel/Job Listings destination email · QuickSchools embed/webhook · grooming photos (2nd email) · curated school student/facility photos.

---

# Client revision round 5 — header CTAs, job-listings move, grooming photo (6/26 — Brian)

**Code changes (need a deploy):**
- **Persistent header = three CTAs + phone left.** `Header.tsx` now renders a `ctaButtons` array (Book Boarding & Daycare · Book a Grooming Appointment · Grooming School) on every page instead of a single Book Now, and the phone number moved to the **left, next to the logo**. `(site)/layout.tsx` builds the three CTAs — the boarding/daycare URL stays CMS-driven (`settings.posUrls.daycareBookingUrl`); the other two are internal routes (`/services/grooming`, `/school`). Desktop buttons are compact (primary + two outline); mobile menu stacks them full-width. Backward-compatible (`ctaButton` fallback retained). ⚠️ Desktop header is now dense — tune if Brian finds it crowded.
- **Job Listings moved into the school section.** Redirect map (`/jobs`, `/submit-a-job-posting`) now → `/school/job-listings`.

**Content (Sanity, published — `scripts/seed-round5.js`):**
- **Job Listings → school page.** New `schoolPage` `school-job-listings` (`/school/job-listings`) built from the old resort page's builder; resort `page-job-listings` **deleted**; removed from the resort footer; added to the **school nav, right after "Schedule a Tour"** (Brian). Keeps visitors in the school "building." Form destination now resolves to the school email (override `[EMAIL-TBD]` → falls through to `schoolSettings.formEmail`).
- **Grooming hero photo swapped.** `service-grooming` `gh` image: the white-dog bath shot (IMG_7387) → an Amy-supplied finished-groom photo (goldendoodle teddy-bear cut). Rest of the Riverside photos left as-is (Brian: "all good").

**Item 4 (Amy's Studio access for photos + monthly job listings):** handled separately by Mike (Sanity project invite). Note: the job-listings page is currently an employer **submission form** — if Amy needs to *publish* incoming postings for students to see, that needs a small "current openings" content type/section (separate ask).

Verified: type-check clean; production build green; dev render confirms 3 header CTAs persist across pages (homepage + interior), phone next to logo, grooming hero shows the goldendoodle, `/school/job-listings` 200 + in school nav, old `/job-listings` 404, resort footer no longer links it, legacy job paths 301 → `/school/job-listings`.

---

# Pre-launch readiness review (6/26 — domain cutover prep)

Domain **confirmed: riversidepetmn.com** (Peter loaded it into GoDaddy). It's already the default in `frontend/app/site-config.ts` (single constant). Reviewed the full project for go-live readiness ahead of pointing GoDaddy DNS at Vercel.

## Code state: READY

- Working tree clean; `origin/main` up to date — all round 3/4/5 code changes (contactForm override, redirect map, header CTAs) are committed AND pushed. The "must commit + push" warnings in the round notes above are **satisfied**.
- Type-check clean both workspaces.
- Redirects wired via `frontend/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`; `export function proxy` + matcher correct). Not a missing-middleware bug.

## Emails: CODE-COMPLETE, blocked on destination address + Vercel env

- Delivery path (`app/api/contact/route.ts`) is sound: destination read server-side from the CMS (open-relay-safe), `isPlaceholderEmail()` rejects `[EMAIL-TBD]`/`[`-bearing values, 503 (unconfigured) vs 500 (real failure) distinguished. `ContactForm.tsx` sends all routing fields (`_pageId`/`_pageType`/`_pagePath`/`_blockKey`/`_formName`) — verified.
- **Live CMS audit (6/26):** ALL 5 forms currently resolve to the env fallback `CONTACT_FORM_TO_EMAIL`, because every per-form `destinationEmailOverride` and `schoolSettings.formEmail` is still `[EMAIL-TBD]`:
  - `page-contact` (`/contact`), grooming appt (`service-grooming`), school Request Info, Schedule a Tour, Job Listings (`school-*`) → all fall through to `CONTACT_FORM_TO_EMAIL`.
  - `settings.email` = null, `schoolSettings.formEmail` = `[EMAIL-TBD]`.
- **Single blocker:** `CONTACT_FORM_TO_EMAIL` is empty in `.env.local` and (presumably) not yet set in Vercel. While it's empty, **every form returns 503 — no form delivers.** Set it + the 5 SMTP vars in Vercel and all forms work.
- **Relay VERIFIED (6/26):** dedicated Gmail relay `riversidepetmn.notifications@gmail.com` (2FA + app password) created. riversidepetmn.com email is on **Microsoft 365 (via GoDaddy)**, so the Gmail relay sends *to* the client's M365 mailboxes — we never touch their mail. Local submit-test against `/api/contact` returned 200 / delivered (test routed to Mike's own inbox, not the client). SMTP chain proven end-to-end; values live in `frontend/.env.local` (gitignored). **Still need:** same 6 vars in Vercel + one preview submit-test.
- **FINAL routing confirmed by client (6/26) — set as per-form `destinationEmailOverride` in Sanity, published, LIVE (no deploy; override-reading code already shipped):**
  - Contact (`page-contact`/`kform`) → `reception@riversidepetmn.com, olivia@riversidepetmn.com`
  - Grooming Appt (`service-grooming`/`groom-appt-form`) → `support@, sarah@, amy@, sabrina@riogrooming.com`
  - School Request Info (`school-request-information`/`rio-request-info-form`) → `amy@riogrooming.com` *(client eventually wants this wired to their QuickSchools account — needs QuickSchools embed/webhook; email for now)*
  - School Schedule a Tour (`school-schedule-a-tour`/`rio-schedule-tour-form`) → `amy@riogrooming.com`
  - School Job Listings (`school-job-listings`/`jl-form`) → `amy@, jen@riogrooming.com`
  - `schoolSettings.formEmail` fallback → `amy@riogrooming.com`
  - Note: grooming + school forms deliver to **@riogrooming.com** mailboxes (Rio's existing M365 on external CSP — we only *send to* them, never touch their records). `CONTACT_FORM_TO_EMAIL` env stays as the global safety-net fallback (currently reception@ + olivia@).
- Env vars to set in Vercel (Production + Preview), then **redeploy**: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASS` (Gmail **app password**, not account pw), `SMTP_FROM`, `CONTACT_FORM_TO_EMAIL` (both addresses, comma-separated). Then submit-test each of the 5 forms on the preview URL (the one thing un-verifiable from code).

## Redirects: READY (two operational notes)

- All 12 redirect targets cross-checked against live CMS slugs (6/26) — every destination resolves to a real published page (6 `/grooming-school/*` → `/school/*`; `/grooming-services/*` + appt paths → `/services/grooming`; `/rooms` → `/services/boarding`; `/about-us/*` → `/about`; `/jobs` + `/submit-a-job-posting` → `/school/job-listings`; prefix fallbacks → `/school` or `/`).
- ⚠️ **Operational:** host-based 301s only fire if the legacy domains are **added as domains in the Vercel project** (not merely DNS-pointed) — otherwise Vercel 404s before `proxy.ts` runs. Add `riogrooming.com` / `riogroomingschool.com` (+ Barks & Rec) as Vercel project domains.
- ✅ **Barks & Rec — RESOLVED, no code work (6/26).** Domain is `barksnrec.co`, a **live multi-location** site: `/north-loop` (Minneapolis), `/lakeville`, `/hastings` — all paths on one domain; only **Hastings** becomes Riverside. **Do NOT add `barksnrec.co` to `LEGACY_HOSTS`** — our redirect is host-based, so that would hijack North Loop + Lakeville traffic to Riverside. Its DNS will never point at our Vercel (the other two locations keep running on it). Correct disposition: the `/hastings` → riversidepetmn.com redirect is a **single path redirect on barksnrec.co's own hosting, set up by Peter's side** — outside this repo. The earlier "add Barks & Rec host" assumption (which presumed a dedicated domain like riogrooming.com) is **superseded**. The `// TODO` comment in `redirect-map.ts` should be removed/updated to reflect this.

## Other pre-launch items (not code)

- Sanity CORS origin for `https://riversidepetmn.com` (+ `*.vercel.app` preview) — Mike handling.
- Confirm Vercel project **Root Directory = `frontend`** (monorepo) and all Sanity env vars present in Vercel.
- DNS at GoDaddy, not Cloudflare (diverges from CLAUDE.md Cloudflare plan, but works) — add Vercel's A/CNAME records as shown in the Vercel Domains tab. **24h notice to Brian before cutover; never touch Rio M365 email records.**
- FAQ JSON-LD still needs Google Rich Results validation on preview (M5).
