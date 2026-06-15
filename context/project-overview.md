# Project Overview — Riverside Pet Resort

## What this is

A new flagship website consolidating **Rio Grooming School & Salon** (riogrooming.com) and **Barks & Rec Hastings** under the new **Riverside Pet Resort** identity — a full-service pet care campus in **Hastings, Minnesota**. Services: boarding, daycare, professional grooming, student grooming, cat grooming, 24-hour self-serve dog wash, plus the Rio Grooming School as an educational institution within the campus.

Part of the Embark Pet Services portfolio (PE-backed, operated by Cadence Private Capital). Built by Mike Laufersweiler / Lauf Studio on the standard Embark stack.

Domain: **UNCONFIRMED** — assumed riversidepetmn.com; Brian (6/12) referenced "RiversidePet.com"; Peter to confirm. Single config constant until then.

## Brand architecture (settled — do not relitigate)

- **Riverside Pet Resort** — primary operating identity; the campus and all consumer pet care services.
- **Rio Grooming School** — distinct institution within Riverside, like a university's School of Engineering. Own identity, history (since 2009), enrollment funnels, and legacy. Name deliberately preserved; the Rio brand carries real equity in the grooming industry.
- Site philosophy: **three strong businesses under one roof** — Riverside Pet Resort (boarding & daycare), Riverside Grooming Services, Rio Grooming School.
- **"School," not "Academy"** — Amy Ericson's call. The dev brief predates this and says Academy throughout; corrected in `intake-content.md`.
- Messaging direction: "Rio Grooming and Barks & Rec are excited to begin a new chapter as Riverside Pet Resort." Never frame Rio as having launched Riverside.
- The site must NOT feel corporate or PE-owned. Tone: professional, warm, educational, trustworthy, community-focused, clean/modern, pet-centric. "Locally owned in feel, professionally operated in execution."

## Stakeholders

| Person | Role | Relevance |
|---|---|---|
| Brian Remo | VP Ops, Embark | Day-to-day contact; wrote the dev brief; owns banner copy with Peter |
| Peter Mark | Principal, Cadence | Budget holder; approved $3,500; owns GoDaddy + Cloudflare accounts; decides Barks & Rec domain disposition |
| Jack Brady | Partner, Cadence | CC'd on threads |
| Amy Ericson | Dean, Rio Grooming School | Oversees Riverside + the school; made the School-vs-Academy call; owns the school section "minor refreshes" |

## Scope & commercial boundary

- **$3,500 fixed**, approved by Peter, covering the full build: Riverside site + Rio school section + two SEO items:
  1. **Suburb location pages** — real, indexable pages for surrounding suburbs, outside main nav, in the sitemap. (NOT hidden doorway pages — corrected with Peter in writing.)
  2. **FAQ section with FAQPage JSON-LD schema.**
- **Everything else is out of scope.** Further SEO recommendations and any portfolio rollout get scoped separately, per site — agreed with Peter in writing. If new asks arrive mid-build, they go to a separate scope conversation, not into this build.
- The rate was justified by the **"ships complete" commitment**: every page, form, booking link, and redirect built, tested, and verified before go-live. The QA milestone is contractual in spirit — it must visibly happen.

## Timeline

- **6/23** — complete and fully tested (QA milestone before this date)
- **6/30** — live (hard deadline)
- **7/3** — operational rebrand under the Riverside identity

## Related infrastructure (context, not in this repo's hands)

- riogrooming.com → 301 to the new canonical domain. Path-aware: school/enrollment deep links → school section; everything else → homepage. (Peter's stated requirement is a redirect to the main site; path-aware implementation satisfies it and preserves search equity.)
- riogroomingschool.com — sits on an unknown Network Solutions account; eventual redirect, but its transfer is a separate infrastructure issue. **Do not block launch on it.**
- Barks & Rec domain — **redirects to Riverside at launch** (Brian, 6/12). Add to the redirect plan once the canonical domain is confirmed.
- Rio's M365 email is on an external CSP (IT partner Scott) — **untouchable until CSP renewal**, per Peter. No email records change during website cutover.
- **Riverside is already operating on Goose.** Booking links come from Hung and Caitlin (Goose contacts). No dedicated Rio school booking link needed.

## Open questions (tracked; see intake-content.md for status)

1. ~~Address/phone~~ ✓ (12260 Margo Ave, Hastings MN 55033 · 651-480-4726) — **form destination email still pending** (follow-up to Brian)
2. ~~Suburb list~~ ✓ (see intake-content.md)
3. Booking URLs — Goose confirmed; links pending from Hung and Caitlin
4. **Canonical domain confirmation (riversidepetmn.com vs RiversidePet.com) + registrar/zone — with Peter** ← biggest open item
5. ~~Barks & Rec domain~~ ✓ redirects to Riverside at launch
6. ~~School content~~ ✓ carries over substantially as-is from riogrooming.com (visual refreshes per Amy still apply)
7. Final transition banner copy (component built now; copy dropped in later via CMS)
