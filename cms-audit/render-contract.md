# Riverside Pet Resort — Post-Projection Render Contract

Evidence is from `frontend/sanity/lib/queries.ts`, route/component source, and read-only production GROQ on 2026-07-11. "Optional live" means absent from at least one live instance of that block. The site runs two chromes from one dataset: the resort (`(site)` route group) and the Rio Grooming School (`(school)`).

## 1. Routing map

| Route | File | Data/query | Mapping and behavior |
|---|---|---|---|
| `/` | `frontend/app/(site)/page.tsx` | `homepageQuery` | `_type=='page' && slug.current=='homepage'`; page builder; canonical `/`; empty-state copy if missing |
| `/[slug]` | `frontend/app/(site)/[slug]/page.tsx` | `getPageQuery`, `pagesSlugs` | `$slug` selects page; published static params; emits FAQPage JSON-LD when faqAccordion blocks are present |
| `/services/[slug]` | `frontend/app/(site)/services/[slug]/page.tsx` | `getServiceQuery`, `serviceSlugs` | `$slug` selects service; published static params; page builder |
| `/locations/[suburb]` | `frontend/app/(site)/locations/[suburb]/page.tsx` | `getLocationPageQuery`, `locationPageSlugs` | segment named `suburb`; `generateStaticParams` maps `{slug}` → `{suburb}`; canonical `/locations/[suburb]` |
| `/school` | `frontend/app/(school)/school/page.tsx` | `schoolHomeQuery` | schoolPage slug `home` special case; canonical `/school` |
| `/school/[slug]` | `frontend/app/(school)/school/[slug]/page.tsx` | `getSchoolPageQuery`, `schoolPageSlugs` | static params exclude `home`; canonical `/school/[slug]` |
| `/studio/[[...tool]]` | `frontend/app/studio/[[...tool]]/page.tsx` | `NextStudio` | Embedded Studio |
| `/api/contact` | `frontend/app/api/contact/route.ts` | 2 inline GROQ lookups | POST email handler with CMS-driven recipient routing (see §5) |
| `/api/draft-mode/enable` | `frontend/app/api/draft-mode/enable/route.ts` | `defineEnableDraftMode` | Preview enablement |
| `/sitemap.xml` | `frontend/app/sitemap.ts` | `sitemapData` | All four routable types; schoolPage `home` → `/school`; noIndex + `homepage` excluded; canonical host always `SITE_URL` |
| `/robots.txt` | `frontend/app/robots.ts` | none | Disallows `/studio`, `/api/` |

`frontend/app/layout.tsx` (root) fetches `settingsQuery` for metadata, JSON-LD (LocalBusiness/Organization/WebSite/FAQ per route), and inline GTM/GA4. `(site)/layout.tsx` re-fetches `settingsQuery` plus `servicesNavQuery` for the resort Header/Footer; `(school)/layout.tsx` fetches `schoolSettingsQuery` for the school chrome. `error.tsx`/`not-found.tsx` fetch nothing. **Not a route:** `frontend/app/redirect-map.ts` defines legacy-host 301s but is unwired (no middleware).

## 2. Projection delta

Source fragments are `linkReference`, `linkFields`, `buttonFields`, and `pageBuilderExpansion` in `frontend/sanity/lib/queries.ts`; full expanded text is in `cms-audit/schema-inventory.json`.

| Query | Stored → returned delta |
|---|---|
| `settingsQuery` | `...` retains raw fields. Internal `link.page` refs become target `slug.current` + computed `pageType` (nav items, children, header CTA, footer columns, footer-bottom links). `faviconUrl` computed from `favicon.asset->url`. Unordered `[0]`. |
| `schoolSettingsQuery` | Same link-resolution pattern over school nav/CTA/footer columns; passes through `backToResort`, `contactInfo`, `hours`, `socialLinks` raw. Unordered `[0]`. |
| `getPageQuery` / `homepageQuery` | Top level restricted to `_id`, `_type`, `name`, `slug`, `seo` + projected `pageBuilder`. Block CTA buttons and PT `markDefs` link marks get resolved `page`/`pageType`; `serviceTabs.tabs[]->` and `testimonials.reviews[]->` are dereferenced to selected fields. |
| `getServiceQuery` | Same expansion; top level `_id,_type,title,slug,heading,shortDescription,seo,pageBuilder`. |
| `getLocationPageQuery` | Same expansion; top level `_id,_type,suburb,slug,seo,pageBuilder`. |
| `getSchoolPageQuery` / `schoolHomeQuery` | Same expansion; top level `_id,_type,name,slug,seo,pageBuilder`. School pages may contain the two school-only blocks (below). |
| `sitemapData` | Computed `slug`, `noIndex`; retains `_type`, `_updatedAt`; covers page/service/locationPage/schoolPage. |
| slug queries | Replace slug objects with `{slug: string}`; school variant excludes `home`. |
| `servicesNavQuery` | `_id`, `title`, computed `slug`, title-ascending. |

### Page-builder projection details

- CTA/button fields across all block types resolve nested internal links (`buttonFields`); PT bodies resolve `markDefs` link annotations (`linkReference`). `heroMarquee` additionally resolves the new `tertiaryCta`.
- **`jobListings` (school-only block) computes a `jobs` array via a cross-document subquery** — active (`isActive != false`), unexpired (`!defined(expiresAt) || dateTime(expiresAt) > dateTime(now())`) `jobPosting` docs ordered `coalesce(postedAt, _createdAt) desc`, each with `_id,title,company,location,employmentType,postedAt,applicationUrl,applicationEmail,description` (PT with resolved links). The component receives resolved `jobs`, not references. **The adapter must reproduce this join.**
- `quickSchoolsEnquiry` (school-only block) resolves its PT `description`; `scriptUrl`/`divId` pass through raw for the third-party embed.
- Other live blocks use `...` and retain stored field names plus image reference/crop/hotspot objects. No page-builder image asset is dereferenced to URL/lqip/dimensions — components receive `_ref` + crop/hotspot and build URLs (`SanityImage.tsx`).

### Representative before/after sketch

```json
// stored schoolPage (abbreviated)
{
  "_type": "schoolPage", "name": "Job Listings",
  "slug": {"_type": "slug", "current": "job-listings"},
  "pageBuilder": [{
    "_type": "jobListings", "_key": "abc",
    "heading": "Current Job Postings",
    "description": [{"_type": "block", "markDefs": [{"_type": "link", "linkType": "page", "page": {"_ref": "id"}}]}]
  }]
}

// projected (abbreviated)
{
  "_id": "…", "_type": "schoolPage", "name": "Job Listings",
  "slug": {"_type": "slug", "current": "job-listings"}, "seo": null,
  "pageBuilder": [{
    "_type": "jobListings", "_key": "abc",
    "heading": "Current Job Postings",
    "description": [{"_type": "block", "markDefs": [{"_type": "link", "linkType": "page", "page": "target-slug", "pageType": "page"}]}],
    "jobs": []   // computed join; [] while jobPosting count is 0
  }]
}
```

## 3. Block props contract (live blocks only, 24 types / 121 instances)

All rendered via `PageBuilder.tsx` → `BlockRenderer.tsx` (lazy components map; each block wrapped with `id={block._key}` + `scroll-mt-24` — an anchor-target affordance new vs Wags). Shapes as received after projection:

| Block (live count) | Resolved props shape |
|---|---|
| iconGrid (20) | heading/eyebrow strings; items[] {icon: Iconify name string, title, text}; layout options raw |
| ctaStrip (12) | text strings; `cta` button w/ resolved link {label, linkType, href or page-slug+pageType, openInNewTab} |
| splitContent (12) | heading, PT `body` (resolved link marks), image {asset._ref, crop, hotspot, alt}, nested `link.link` resolved, badge image optional live |
| heroMinimal (12) | eyebrow/heading/subheading strings; no CTAs |
| heroSplit (10) | heading, PT-free strings, primary/secondaryCta resolved buttons, image object, **imageAspect: 'square'\|'landscape'\|'wide'\|'portrait'** (optional live — nulls on older instances) |
| faqAccordion (9) | heading; faqs[] {question string, answer PT w/ resolved links}; feeds FAQPage JSON-LD on (site)/[slug] |
| infoSection (7) | eyebrow/heading; **body plain-text string (new, optional live)**; content PT via custom renderer |
| processSteps (6) | heading; steps[] {title, text}; cta resolved button |
| contactForm (4) | heading, PT description, fields[] {label, type, required, **placeholder (new)**}; **destinationEmailOverride is NOT sent to the client** — the route re-reads it server-side by `_pageId`+`_blockKey` |
| whatsIncluded (4) | heading; items[] strings |
| spacer (3) | size token |
| serviceCards (3) | heading; cards[] {title, text, **icon (new)**, cta resolved button} |
| contentColumns (3) | columns[] {heading, PT body w/ resolved links, cta button} |
| pricingList (3) | heading; rows[] {label, price strings} |
| galleryPage (2) / galleryCarousel (1) | images[] {asset._ref, alt, crop/hotspot} → lightbox at width 1600 |
| photoMarquee (2) | marqueeImages[] (min 3) {asset, alt, hotspot} |
| heroMarquee (2) | heading/subheading; primary/secondary/**tertiary (new)** resolved CTAs; **backgroundColor cream\|sand\|forest (optional live — null on homepage instance)**; **belowCtaText**; **showIllustrations (false on the school instance)**; **verticalSpacing**; marquee images |
| featureGrid (1) / featureList (1) / valuePillars (1) / pricingMatrix (1) | as stored (`...` projection) w/ resolved CTA/PT where defined |
| jobListings (1) | eyebrow/heading/PT description/emptyMessage/backgroundColor + **computed `jobs[]`** (see §2); renders bare PT for descriptions |
| quickSchoolsEnquiry (1) | eyebrow/heading/PT description; scriptUrl + divId for the riogran.quickschools.com embed; showFootnote boolean |

## 4. Preview/editing coupling inventory (deleted at migration)

- `frontend/sanity/lib/live.ts` — `defineLive`, `sanityFetch`, `SanityLive` (all reads)
- `frontend/sanity/lib/client.ts` — stega config
- `frontend/app/layout.tsx` — `VisualEditing`, `DraftModeToast`, `draftMode()`
- `frontend/app/api/draft-mode/enable/route.ts` — `defineEnableDraftMode`
- `frontend/app/components/PageBuilder.tsx`, `BlockRenderer.tsx` — `dataAttr`/`createDataAttribute` optimistic-update wiring
- `frontend/app/components/DraftModeToast.tsx`
- `frontend/sanity.config.ts` — Presentation tool (`resolve`, preview URL)
- `sanity typegen` pipeline (`prebuild`/`predev` scripts; root `sanity.schema.json`; `frontend/sanity.types.ts`)

## 5. Shared shell data

- **Root layout** (`app/layout.tsx`): `settingsQuery` → title template `%s | settings.title` (→ `SITE_NAME`), description (`toPlainText`, empty-string live), metadataBase (`settings.ogImage.metadataBase` → `SITE_URL`), favicon (unset live → `app/icon.svg`), Google site verification, LocalBusiness/Organization/WebSite JSON-LD, inline GTM/GA4 (both ids unset live — nothing fires).
- **Resort chrome** (`(site)/layout.tsx`): `settingsQuery` + `servicesNavQuery`. The `Services` nav label triggers live service-children injection (lineage magic-label path, live here). Header receives hardcoded booking CTAs — the boarding/daycare URL from `settings.posUrls` (live Goose URLs), grooming hardcoded to `/services/grooming`. `transitionBanner` passed to Header → `TransitionBanner.tsx` (disabled live). Logo is hardcoded `/images/riverside-logo-2026.png`, NOT the CMS field.
- **School chrome** (`(school)/layout.tsx`): `schoolSettingsQuery` → SchoolHeader/SchoolFooter with CMS logo (width 360), nav, CTA button, backToResort link, contact/hours/social. Scoped by the `theme-school` class.
- **Contact recipient chain** (`app/api/contact/route.ts`): block `destinationEmailOverride` (server-side GROQ by `_pageId`+`_blockKey`, comma-separated recipients, bracket/TBD markers treated as unset) → `schoolSettings.formEmail` when `_pageType=='schoolPage'` or path starts `/school` → `CONTACT_FORM_TO_EMAIL` env. Both lookups `revalidate: 300`. The client form posts `_formName`, `_pageId`, `_pageType`, `_pagePath`, `_blockKey` (`ContactForm.tsx:94-97`).
