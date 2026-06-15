# Riverside Pet Resort

Website for **Riverside Pet Resort**, a full-service pet care campus (boarding, daycare, grooming) and home of the **Rio Grooming School** in Hastings, MN. Consolidates Rio Grooming School & Salon and Barks & Rec Hastings under one brand. Part of the [Embark Pet Services](https://www.embarkpetservices.com/) portfolio.

**Live domain:** _UNCONFIRMED — pending Peter (working assumption: riversidepetmn.com). Set via `NEXT_PUBLIC_SITE_URL`; see `frontend/app/site-config.ts`._

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **CMS:** Sanity.io
- **CSS:** Tailwind CSS v4
- **Hosting:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio (embedded)
- Standalone Studio: http://localhost:3333 (via `npm run dev:studio`)

## Project Structure

```
├── frontend/     # Next.js app with embedded Sanity Studio
├── studio/       # Standalone Sanity Studio
└── context/      # Project documentation and instructions
```

## Design

Brand palette — Navy `#0B1D3A` · Maroon `#8B1E2D` · Stone `#F5F5F2`. Fonts: Cinzel (display) + Montserrat (body).

Colors, fonts, and spacing are defined as CSS custom properties in `frontend/app/globals.css` using Tailwind CSS v4's `@theme` directive. Note: token names (`forest`/`terracotta`/`cream`) are inherited from the base and value-swapped to the Riverside palette — see the comment in `globals.css`.
