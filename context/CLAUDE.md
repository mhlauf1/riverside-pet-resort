# CLAUDE.md — Riverside Pet Resort

This repo is the website for **Riverside Pet Resort** (domain: see CLAUDE.md rule 3), a new flagship in the Embark Pet Services portfolio. It consolidates Rio Grooming School & Salon and Barks & Rec Hastings under one brand.

## Read order (before touching anything)

1. `context/project-overview.md` — what this is, who's involved, deadlines
2. `context/current-milestone.md` — what we are working on RIGHT NOW
3. `context/intake-content.md` — all approved page content and pricing
4. `context/sanity-schema.md` — CMS content model
5. `context/coding-standards.md` — stack and conventions
6. `context/ai-interaction.md` — how to work in this repo
7. `context/milestones.md` — full phased plan

## Hard rules — never violate

1. **"Rio Grooming SCHOOL," never "Academy."** The development brief and some brand assets predate the naming decision and say "Academy." Every instance is wrong. If you find "Academy" anywhere in code, content, or CMS, flag it and fix it to "School."
2. **Zero contact data from source materials.** The brand pack's business card and letterhead contain placeholder data: *1234 Riverside Drive, Austin, TX 78730*, *(512) 555-0123*, *info@riversidepetresort.com*, *riversidepetresort.com*. None of it is real. The business is in **Hastings, Minnesota**. Real address/phone/email come only from `intake-content.md` → "Confirmed business details" (pending from client). If that section still says PENDING, use clearly-marked placeholders like `[ADDRESS-TBD]` — never the Austin data.
3. **Canonical domain is ⚠️ UNCONFIRMED — pending Peter.** Working assumption was riversidepetmn.com, but Brian (6/12) referenced "RiversidePet.com." Definitely NOT riversidepetresort.com (brand pack placeholder). Keep the domain in a single env var/config constant; do not scatter it through redirects, canonical tags, schema, or sitemap config until confirmed. Check `context/intake-content.md` → Confirmed business details for current status.
4. **This repo was cloned from a predecessor Embark site.** Investigate before editing: grep for predecessor brand names, content, URLs, Sanity project IDs, and hardcoded values before swapping anything. Document what's CMS-driven vs. hardcoded.
5. **Pricing is CMS-driven, never hardcoded.** The brief explicitly flags future price changes (luxury boarding → ~$129/night after renovations).
6. **All booking/POS URLs live in the Sanity site-settings singleton.** Portfolio standard — enables the single-point Gingr → Goose swap.
7. **Never touch DNS, email records, or domain config from this repo's tooling.** Infrastructure work happens separately with explicit human confirmation.
8. **Ask before destructive or irreversible actions.** Sequential execution with confirmation is the working style here.

## Brand quick reference

- Colors: Navy `#0B1D3A` · Maroon `#8B1E2D` · Stone `#F5F5F2`
- Type: RIVERSIDE in Cinzel Bold · PET RESORT in Montserrat SemiBold · "Rio" in script (per brand pack)
- Paw icon = brand identifier
- Tagline line: "Boarding • Daycare • Grooming"

## The two-brand architecture (critical)

- **Riverside Pet Resort** = primary consumer identity (boarding, daycare, grooming).
- **Rio Grooming School** = distinct institution *within* Riverside — like a university's school of engineering. It gets a **site-within-a-site**: its own route group, layout, nav, funnels, and a visual language derived from the existing riogrooming.com site (with minor refreshes).
- A groomer "works at Riverside Pet Resort." A student "attends Rio Grooming School."
- Messaging: "Rio Grooming and Barks & Rec are excited to begin a new chapter as Riverside Pet Resort" — never "Rio launches Riverside."

## Deadlines

- **June 23, 2026** — complete and fully tested (QA milestone, non-negotiable)
- **June 30, 2026** — live (hard deadline)
- **July 3, 2026** — operational rebrand; doors open under the Riverside identity
