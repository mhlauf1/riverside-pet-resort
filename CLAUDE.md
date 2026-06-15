# Riverside Pet Resort

Website for Riverside Pet Resort, a full-service pet care campus (boarding, daycare, grooming) and home of the Rio Grooming School in Hastings, MN. Consolidates Rio Grooming School & Salon and Barks & Rec Hastings under one brand. Part of the [Embark Pet Services](https://www.embarkpetservices.com/) portfolio operated by Cadence Private Capital.

**Live domain:** UNCONFIRMED — pending Peter (working assumption: riversidepetmn.com; NOT riversidepetresort.com). Single config constant in `frontend/app/site-config.ts` (`NEXT_PUBLIC_SITE_URL`).
**Content references:** riogrooming.com (also the school-section visual reference) · Barks & Rec Hastings · Rio Grooming + Barks & Rec Facebook pages (client photos)
**Cloned from:** Wags Stay N' Play (Embark portfolio base)

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/sanity-schema.md
- @context/current-milestone.md
- @context/milestones.md
- @context/intake-content.md
- @context/service-content/ (daycare, boarding, grooming content docs)

## Commands

Monorepo with `frontend/` (Next.js) and `studio/` (Sanity) workspaces. Run from the repo root:

- **Dev (both workspaces)**: `npm run dev` — runs frontend + studio in parallel (Next on http://localhost:3000, Studio on http://localhost:3333; Studio is also embedded at `/studio`)
- **Dev (frontend only)**: `npm run dev:next`
- **Dev (studio only)**: `npm run dev:studio`
- **Build**: `npm run build --workspace=frontend`
- **Production server**: `npm run start --workspace=frontend`
- **Lint**: `npm run lint`
- **Type-check**: `npm run type-check`
- **Format**: `npm run format`

**IMPORTANT:** Do not add Claude to any commit messages
