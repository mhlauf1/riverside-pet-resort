# Milestones — Riverside Pet Resort

Hard dates: **tested by 6/23 · live by 6/30 · rebrand 7/3**. Today's plan assumes kickoff 6/12.

## M0 — Setup & Investigation (6/12–6/13)

- Clone base decision: Wags Stay N' Play (preferred — has Goose POS settings pattern) if stable; otherwise Kingdom Canine + port the Goose singleton pattern.
- Clone with clean git history → push to `mhlauf1/riverside-pet-resort`.
- New Sanity project (`riverside-pet-resort`), CORS for localhost + Vercel preview. New Vercel project from the repo. Custom domain waits until launch.
- **Investigation pass (Claude Code):** grep entire repo for predecessor brand names, content, URLs, Sanity project ID, hardcoded values. Produce a written map of CMS-driven vs. hardcoded content before any edits.
- Exit criteria: repo builds and deploys to Vercel preview with predecessor content; investigation map documented.

## M1 — Brand Swap & Strip (6/13–6/15)

- Swap brand tokens: Navy #0B1D3A, Maroon #8B1E2D, Stone #F5F5F2; Cinzel Bold / Montserrat SemiBold; logo assets from brand pack.
- Strip all predecessor content; replace with intake content or `[TBD]` markers.
- Wire new Sanity project; seed settings singleton (site identity, banner toggle/copy, booking URLs as placeholders).
- Exit criteria: zero predecessor brand strings in repo (verified by grep); preview shows Riverside shell.

## M2 — Resort Pages (6/15–6/17)

- Home (hero, CTAs, intro, services overview, Why Riverside, banner component).
- Boarding, Daycare (pricing tables as structured CMS content), Grooming (4 sub-sections), About, Careers, Contact (form via Gmail app-password SMTP pattern, destination pending).
- Imagery pass from Facebook pages + existing sites.
- Exit criteria: all resort pages content-complete except PENDING business details.

## M3 — School Section (6/17–6/19)

- `/school` route group: own layout, nav, theme tokens derived from riogrooming.com's look (with Amy's refreshes).
- School home + 7 sub-pages; enrollment/tour/info funnels and forms.
- Exit criteria: school section navigable end-to-end with its own visual language; forms submit.

## M4 — SEO Scope Items + Redirects (6/19–6/21)

- Location page layout + per-suburb content (list from Brian/Peter); excluded from nav, included in sitemap.
- FAQ section with `FAQPage` JSON-LD; validate schema.
- Crawl riogrooming.com indexed pages → build path-aware 301 map (school deep links → `/school/...`, rest → `/`). Implement in Next config/middleware; activates at DNS cutover.
- Exit criteria: location pages + FAQ live on preview, schema validates, 301 map written and reviewed.

## M5 — QA Milestone: "Ships Complete" (6/21–6/23) ⚠️ non-negotiable

- Full click-through of every page, desktop + mobile.
- Submit-test every form: contact, appointment request, tour request, info request — confirm delivery to the real destination address.
- Verify every booking link (Goose or Gingr per Brian's answer).
- Verify every redirect in the 301 map against the crawl list.
- Validate FAQ schema; Lighthouse pass; sitemap + robots include location pages and exclude nothing unintended.
- Exit criteria: written QA checklist completed and archived. **This commitment justified the rate — it must visibly happen.**

## M6 — Launch (by 6/30)

- Cloudflare zone for the confirmed canonical domain under the Embark account (domain + registrar pending Peter). Gray cloud (DNS only) on all Vercel records. A 216.150.1.1 / CNAME per current Vercel docs.
- **24-hour notice to Brian before DNS cutover** (standing Embark rule — POS pricing/config updates in step).
- Cutover; verify SSL, redirects live, forms still deliver.
- riogrooming.com 301s activated (separate DNS session; email records untouched — Rio M365 on external CSP, do not touch).
- Post-launch smoke test.

## Out of scope (do not absorb)

- Additional SEO recommendations beyond the two scoped items — separate scoping, agreed in writing with Peter.
- Portfolio rollout of location-page/FAQ patterns — separate, per site.
- riogroomingschool.com transfer (Network Solutions, location unknown) — separate infrastructure track.
- Any Rio email/M365 work — frozen until CSP renewal.
