# Coding Standards — Riverside Pet Resort

## Stack (Embark portfolio standard)

- **Next.js (App Router)** + TypeScript
- **Sanity CMS** (project: `riverside-pet-resort`)
- **Vercel** hosting · **Cloudflare** DNS (gray cloud on all Vercel records)
- Tailwind (version per cloned base — confirm during investigation)
- GitHub: `mhlauf1/riverside-pet-resort`

## Conventions

- Follow the cloned base's existing patterns. This repo descends from the Hound Around → HAFH → Kingdom Canine → Wags lineage; consistency across the portfolio matters more than local preference. **Document any deliberate divergence from the template pattern** in investigation-map.md or commit messages.
- No hardcoded content where the base is CMS-driven. No hardcoded pricing or booking URLs anywhere, full stop.
- Brand tokens centralized (Tailwind theme/CSS vars): `navy: #0B1D3A`, `maroon: #8B1E2D`, `stone: #F5F5F2`. Fonts: Cinzel (Bold) for RIVERSIDE display, Montserrat (SemiBold) for supporting display, script font per brand pack for "Rio" (likely served as an asset/lockup rather than live text — match the pack).
- Accessible by default: semantic headings, alt text on all imagery, form labels, focus states.

## School section architecture

- Route group: `app/(school)/school/...` (or the base's equivalent) with its **own root layout**: school nav, school footer, school theme.
- School theme tokens derived from existing riogrooming.com visual language (with Amy's refreshes) — kept separate from resort tokens. Two design languages, one codebase; don't let them bleed.
- Cross-links: resort nav links *into* the school ("Learn About Grooming School"); school layout carries a clear path back to the resort. A visitor should always know which "building" they're in.

## Forms / SMTP

- Gmail app-password SMTP pattern (same as Boxers): `smtp.gmail.com:465`, credentials in env vars, never committed.
- Forms: contact, appointment request, tour request, info request. Destination from Sanity settings (pending Brian).
- Honeypot/spam protection per the base's pattern.

## Redirects

- Path-aware 301 map in `next.config` redirects or `proxy.ts` (version-controlled).
- Map built from a crawl of riogrooming.com's indexed pages before implementation.

## SEO

- Location pages: indexable, in sitemap, out of main nav. Real content per suburb — no doorway-page shortcuts, no noindex.
- `FAQPage` JSON-LD generated from Sanity FAQ docs; must pass Google Rich Results validation.
- Per-page metadata via the base's SEO pattern; canonical domain from a single config constant (domain unconfirmed as of 6/12 — see intake-content.md).

## Git

- Clean history at init (template clone, history wiped).
- Small, scoped commits; messages state what changed and why when diverging from template.
- No secrets in the repo, ever.
