# Current Milestone: M1 — Brand Swap & Strip

**Dates:** 6/13–6/15 · **Status:** Active

## Goal

Swap brand tokens (color/type), strip all predecessor (Wags) content, centralize config, and seed the settings schema so the preview shows a Riverside shell. Exit when zero predecessor brand strings remain (grep) and the preview renders as Riverside.

## Pending human decisions/inputs (do not proceed past them)

- [ ] **New Sanity project** `riverside-pet-resort` — created manually by Mike; provide project ID + read token (then I wire env + migration script)
- [ ] Vercel project from repo; confirm preview deploy builds
- [ ] Form destination email (Brian follow-up) → `CONTACT_FORM_TO_EMAIL`
- [ ] Canonical domain confirmed with Peter (riversidepetmn.com vs "RiversidePet.com") → `NEXT_PUBLIC_SITE_URL`
- [ ] Goose booking links from Hung and Caitlin → `settings.posUrls`
- [ ] **Brand-pack logo asset** → `frontend/public/images/riverside-logo.png` (Header/Footer reference it; currently missing)
- [ ] Invoice sent / deposit status confirmed

## M1 tasks

- [x] Swap brand color tokens → Navy `#0B1D3A` / Maroon `#8B1E2D` / Stone `#F5F5F2` (`frontend/app/globals.css`, value-swap; names retained — documented divergence)
- [x] Swap fonts → Cinzel (heading) + Montserrat (body) (`layout.tsx` + `globals.css`)
- [x] Centralize canonical domain in one config constant (`frontend/app/site-config.ts`; consumed by `layout.tsx`, `robots.ts`)
- [x] Strip predecessor brand strings from frontend (page.tsx, Header, Footer, PhotoMarquee, HeroMarquee, contact route, Studio configs)
- [x] Replace hardcoded predecessor phone (Header → CMS `contactInfo.phone`; pricing calculators → confirmed 651-480-4726 interim, TODO to CMS in M2)
- [x] Add `transitionBanner` field to settings schema (toggle + portable text + link)
- [x] Rename package + update README / root CLAUDE.md / migration script (env-driven project id)
- [x] Verify: grep clean (only intentional provenance/divergence comments remain) · `npm run type-check` passes both workspaces
- [ ] **Blocked on new Sanity project:** wire `.env.local` (frontend + studio); seed settings singleton (identity, banner toggle, posUrls placeholders, contactInfo from intake); confirm preview renders Riverside shell
- [ ] **Blocked on brand pack:** add `riverside-logo.png` asset (or wire Header/Footer to CMS `settings.logo`)

## Exit criteria

Zero predecessor brand strings (grep ✓ for code) · preview shows Riverside shell (blocked on Sanity project + logo asset). Then update this file to M2.

## Known carry-forward (from investigation-map.md)

- Base ships ~111 pre-existing ESLint errors (no-explicit-any, error.tsx `<a>`) — inherited debt, not from rebrand; optional cleanup pass before M5 QA.
- Net-new still owed: FAQ doc type + `FAQPage` JSON-LD (M4), `locationPage` (M4), `(school)` route group + `schoolSettings`/`schoolPage` (M3), `next.config` 301 map (M4), frontend `<TransitionBanner>` render component (M2).

## Rules in effect (from CLAUDE.md)

School not Academy · no placeholder contact data (Austin/512/riversidepetresort.com is fake) · domain via single config constant (unconfirmed — see intake-content.md) · investigate before editing · confirm before destructive actions.
