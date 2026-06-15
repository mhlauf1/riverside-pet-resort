# Investigation Map — Riverside Pet Resort (M0)

Read-only investigation of the cloned base. **No edits made.** Produced before any brand swap, per `current-milestone.md` exit criteria and `kickoff-prompt.md`.

## TL;DR — riskiest findings

1. **The base is much more mature than `milestones.md` assumes.** The Wags clone already ships 48 page-builder block types, three pricing calculators, an `faqAccordion` block, a working Nodemailer SMTP contact form, dynamic `sitemap.ts`/`robots.ts`, and LocalBusiness/Organization/WebSite JSON-LD. **M1–M2 are mostly re-skin + content, not net-new build.**
2. **Tailwind is v4** (CSS `@theme` in `globals.css`, no `tailwind.config.js`) — confirms the open question in `coding-standards.md`.
3. **Booking URLs already follow the Goose-swappable pattern** as `settings.posUrls` — no rename needed, no school booking link needed (matches brief).
4. **Three M3/M4 needs do not exist yet** and are genuine net-new: a `transitionBanner` field, an FAQ **document type + `FAQPage` JSON-LD**, and a `locationPage` type. No `/school` route group. No redirects in `next.config`.
5. **Canonical domain is hardcoded** (`SITE_URL` in `layout.tsx` + `robots.ts`) — must move to a single config constant; domain still UNCONFIRMED pending Peter.
6. **Phone number is hardcoded in 8 places** (incl. pricing calculators) rather than read from CMS.
7. **"Academy" appears nowhere** — that concern is cleared.

---

## (a) Predecessor strings to purge

All are **hardcoded** (edited in M1). Email/social URLs are CMS-driven and need no code edits.

### Brand name "Wags Stay N Play"
- `frontend/app/page.tsx:36` — `<h1>Welcome to Wags Stay N Play</h1>`
- `frontend/app/layout.tsx:99` — title fallback
- `frontend/app/components/Header.tsx:189` — logo `alt`
- `frontend/app/components/Footer.tsx:59` — logo `alt`; `:175` — copyright fallback
- `frontend/app/components/sections/PhotoMarquee.tsx:49` — alt-text fallback *(found in M0 grep; missed in first pass)*
- `frontend/app/components/sections/HeroMarquee.tsx:92, :260` — alt-text fallbacks *(found in M0 grep)*
- `frontend/app/api/contact/route.ts:55` — email sender name; `:63` — email body footer
- `frontend/sanity.config.ts:33` and `studio/sanity.config.ts:50` — Studio title
- `studio/src/schemaTypes/singletons/settings.tsx:16` — `title` initialValue; `:219` — field-description example text
- Root `README.md` and `CLAUDE.md` — title/description/location/domain

### Domain `https://wagsstaynplay.com`
- `frontend/app/layout.tsx:34` — `const SITE_URL = 'https://wagsstaynplay.com'`
- `frontend/app/robots.ts:10` — sitemap URL
- `sitemap.ts` **already auto-detects host from request headers** (no hardcode) — good.

### Phone `(218) 287-2000` / `2182872000` (should be CMS, not hardcoded)
- `Header.tsx:292, :295, :476, :492`
- `pricing/DaycareCalculator.tsx:55`, `pricing/BoardingCalculator.tsx:66`
- `pricing/CalculatorInputs.tsx:204, :205`
- Recommendation: wire these to `settings.contactInfo.phone` during M1/M2.

### Other
- Logo asset `frontend/public/images/wags-logo-no-bg.png` + refs `Header.tsx:188`, `Footer.tsx:58`
- Sanity project ID `dafhmkyq` (Wags) — `scripts/migrate-settings-id.js:32`
- Package name `wags-stay-n-play` — `package.json:2` (+ lockfile, auto-regenerates)
- **"Academy": none found — cleared.**

---

## (b) CMS vs. hardcoded map per route

GROQ queries live in `frontend/sanity/lib/queries.ts`.

| Route | File | Source | Query |
|---|---|---|---|
| `/` | `app/page.tsx` | CMS | `homepageQuery` (page w/ `slug=='homepage'`) → `PageBuilder` |
| `/[slug]` | `app/[slug]/page.tsx` | CMS | `getPageQuery` (+`pagesSlugs` for static params) → `PageBuilder` |
| `/services/[slug]` | `app/services/[slug]/page.tsx` | CMS | `getServiceQuery` (+`serviceSlugs`) → `PageBuilder` |
| `/studio/[[...tool]]` | `app/studio/...` | embedded Studio | — |

Root `app/layout.tsx` fetches `settingsQuery` for nav, footer, SEO metadata, and JSON-LD; injects services into the "Services" nav dropdown. **All hardcoded leftovers = the strings listed in (a).**

---

## (c) Settings singleton — current vs. target

`studio/src/schemaTypes/singletons/settings.tsx` (document id `siteSettings`). Studio sidebar expects fixed id `siteSettings`; `scripts/migrate-settings-id.js` migrates an auto-UUID doc to that id (frontend queries by `_type=='settings'`, so the migration is safe).

**Present (matches target):**
- Identity: `title`, `tagline`, `logo`, `favicon`
- Nav/CTA: `navItems` (nested w/ dropdowns), `ctaButton`
- Footer: `footerSticker`, `footerTagline`, `footerColumns`, `footerText`, `footerTextLink`, `footerBottomLinks`
- Contact: `contactInfo { address, phone, email }`, `yearEstablished`
- Social: `socialLinks { facebook, instagram, google }`
- **Booking: `posUrls { portalUrl, registrationUrl, daycareBookingUrl, boardingBookingUrl, groomingBookingUrl, transportationBookingUrl }`** — the Goose-swappable pattern. No school booking link (matches Brian 6/12). Keep all booking URLs here; never hardcode.
- SEO/analytics: `ogImage`, `googleSiteVerification`, `ga4MeasurementId`, `gtmContainerId`
- Structured data: `localBusiness { businessName, businessType, address{street,city,state,zip,country}, phone, geoCoordinates, businessHours[], priceRange }`

**Gap vs. `sanity-schema.md` target:**
- **No `transitionBanner`** — required site-wide CMS banner (`enabled` toggle + portable-text `content` + optional `linkUrl`). Must add (M1/M2).
- Note: `contactInfo.address` (single text) and `localBusiness.address` (structured) are two separate representations — keep in sync when seeding.

---

## (d) Env var checklist

`.env.local` is git-ignored; `.env.example` exists in both workspaces.

**Frontend** (`frontend/.env.local`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — **NEW** (Riverside project, user-created)
- `NEXT_PUBLIC_SANITY_DATASET` — `production`
- `NEXT_PUBLIC_SANITY_API_VERSION` — keep base value
- `SANITY_API_READ_TOKEN` — **NEW** (read token from new project)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` — Gmail app-password pattern (`smtp.gmail.com:465`)
- `CONTACT_FORM_TO_EMAIL` — **PENDING Brian** (form destination)

**Studio** (`studio/.env.local`):
- `SANITY_STUDIO_PROJECT_ID` — = frontend's new project id
- `SANITY_STUDIO_DATASET` — `production`
- `SANITY_STUDIO_PREVIEW_URL` — localhost / Vercel preview

**Also:**
- `scripts/migrate-settings-id.js:32` — replace hardcoded `dafhmkyq` with the new project id
- Move `SITE_URL` out of `layout.tsx`/`robots.ts` into a single env/config constant (domain UNCONFIRMED pending Peter — do not bake in).

---

## (e) Brand token locations

- **Tailwind v4.1.x** — CSS-based `@theme`, **no `tailwind.config.js`**.
- Colors + font vars: `frontend/app/globals.css` — `:root` `--theme-*` vars (~lines 13–35) and the Tailwind theme mapping (~40–98). Current palette: cream/sand/forest/terracotta. Target: Navy `#0B1D3A` / Maroon `#8B1E2D` / Stone `#F5F5F2`.
- Fonts: loaded via `next/font/google` in `frontend/app/layout.tsx` (currently Bricolage Grotesque + Geist; bound to `--theme-font-heading` / `--theme-font-body` in `globals.css`). Target: Cinzel Bold (RIVERSIDE display) + Montserrat SemiBold; "Rio" script likely served as an asset/lockup per brand pack rather than live web font.

---

## (f) School route-group recommendation

Model already in repo: `/studio/[[...tool]]` demonstrates the route-group + isolated-layout pattern (its layout hides the global header/footer).

**Recommendation:** `frontend/app/(school)/` route group with its **own `layout.tsx`** (own nav, footer, theme tokens derived from riogrooming.com with Amy's refreshes), fed by a separate `schoolSettings` singleton + `schoolPage` document type, **reusing the existing `PageBuilder` blocks**. `Header`/`Footer` are already fully prop-driven, so they can render school content/theme without forking. Resort nav links *into* the school; school layout carries a clear path back. Two design languages, one codebase — don't let tokens bleed. (M3)

---

## (g) Schema gaps to build (feeds M3/M4)

- **`transitionBanner`** on `settings` — toggle + portable text + optional link (M1/M2)
- **FAQ document type + `FAQPage` JSON-LD** — only a presentational `faqAccordion` block exists today; current JSON-LD covers LocalBusiness/Organization/WebSite only. Need a queryable FAQ doc and frontend JSON-LD generation that passes Google Rich Results (M4)
- **`locationPage`** type (suburbName, slug, intro, servicesBlurb, optional faqItems, seoTitle, seoDescription) + one shared layout; excluded from nav, included in sitemap, fully indexable (M4)
- **`next.config` path-aware 301 redirect map** — none today; school/enrollment deep links → `/school/...`, everything else → `/` (M4)
- **School:** `(school)` route group, `schoolSettings` singleton, `schoolPage` doc type (M3)

---

## (h) Doc corrections to flag (not edited this session)

- Root `CLAUDE.md` "Commands" are stale: there is **no `npm run sanity:dev`** and **no `npm run sanity:dev`/`:3333`** script. Actual: `npm run dev` runs both workspaces in parallel via `npm-run-all` (frontend Next on :3000; Studio is the `studio/` workspace and is also embedded at the `/studio` route). Fix `CLAUDE.md` Commands in a later docs pass.
- This is a Sanity official monorepo (`frontend/` + `studio/` workspaces) — `package.json` still named `wags-stay-n-play`.
