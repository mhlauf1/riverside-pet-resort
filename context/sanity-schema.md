# Sanity Schema — Riverside Pet Resort

One Sanity project for the whole site, including the school section. Schema below is the target model; reconcile against the cloned base's existing schema during investigation (extend, don't fork patterns, unless documented).

## Settings singleton (`siteSettings`) — portfolio standard

Single document, single source of truth for swappable config:

- `siteName`, `tagline`
- `address`, `phone`, `email` — **seed with `[TBD]` markers until Brian confirms; never the brand pack placeholders**
- `bookingUrls` (object): `boarding`, `daycare`, `grooming` — **Goose URLs** (confirmed; Riverside is already on Goose). Pending from Hung and Caitlin. No dedicated Rio school booking link (Brian, 6/12). Still the single-point POS swap — do not hardcode booking URLs anywhere in components.
- `transitionBanner` (object): `enabled` (boolean), `content` (rich text/portable text), optional `linkUrl` — Brian/Peter finalize copy without a deploy
- `socialLinks`, `hoursOfOperation` (school + resort hours may differ — model both)

## Pricing (CMS-driven, structured — never hardcoded)

- `pricingItem`: `label`, `price`, `unit` (e.g., "/night", "/day"), `note`
- `pricingTable`: `title`, array of `pricingItem`, optional footnote
- Boarding uses footnote for the renovation/$129 note. Daycare packages table: rows of (days, full price, half price) — model as a dedicated `packageTable` if cleaner.

## Pages

Follow the cloned base's page-document pattern (likely page builder / section blocks). Required content types to support:

- Hero (heading, subheading, CTA array)
- Rich text / narrative sections
- Highlights list (icon + label)
- Services overview grid
- Sub-section blocks (Grooming page has 4 distinct sub-services)
- Image galleries (Facebook-sourced photos)
- Team/person feature ("Meet the Dean" — Amy Ericson: portrait, bio, legacy narrative)

## School section

- School documents either typed distinctly (`schoolPage`) or flagged (`section: "school"`) — decide during investigation based on what the base's routing expects; document the choice in investigation-map.md.
- School nav is its own structure (not derived from resort nav).
- Funnel forms: enrollment info request, tour request, general info — form destination email comes from `siteSettings.email` (or a school-specific override field if Amy's funnels route elsewhere).

## FAQ

- `faqItem`: `question`, `answer` (portable text)
- `faqSection`: title + array of `faqItem`
- Frontend renders `FAQPage` JSON-LD from these documents. Schema must validate (Google Rich Results test) — part of QA.

## Location pages (suburb SEO)

- `locationPage`: `suburbName`, `slug`, `intro` (portable text), `servicesBlurb`, optional `faqItems`, `seoTitle`, `seoDescription`
- One layout component renders all of them.
- **Excluded from main nav. Included in sitemap. Fully indexable.** No noindex, no cloaking — these are real pages.
- Suburb list pending from Brian/Peter; build the type and layout now, populate when the list arrives.

## Redirects

301 map lives in Next config/middleware, not Sanity (deterministic, version-controlled). Path-aware: riogrooming.com school/enrollment paths → `/school/...`; everything else → `/`. Built from a crawl of riogrooming.com's indexed pages.
