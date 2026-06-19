# M5 QA Checklist — Riverside Pet Resort

**Started:** 2026-06-19 · **Run by:** Claude Code (automated half) · **Build:** clean production build, served via `npm run start`

This is the M5 "ships complete" QA record (contractual in spirit). This pass covers everything **not** blocked on pending human inputs. Items needing the form email, Goose links, canonical domain, or a real browser/deploy are listed under **Blocked** / **Manual follow-ups**.

---

## ✅ Passed

| Check | Result |
|---|---|
| **Route sweep** — all 26 real routes | All **200** (home, about, careers, contact, faq; services ×3; locations ×7; school + 7 sub-pages; sitemap, robots, studio) |
| **Image alt text** | 0 images missing `alt` across sampled pages (home 16, about/service/location 2 each) |
| **Single `<h1>` per page** | Exactly 1 on every sampled page |
| **FAQ `FAQPage` JSON-LD** | Structurally valid — 8 questions, 0 malformed, correct `@context`/`Question`/`acceptedAnswer.text` |
| **robots.txt** | Correct — `Disallow: /studio`, `/api/`; sitemap points to `SITE_URL` |
| **sitemap.xml** | 15 URLs = home + 4 pages + 3 services + 7 locations; `/studio` excluded; `homepage` slug excluded |
| **Location pages in sitemap, out of nav** | ✓ all 7 in sitemap; 0 in rendered nav |
| **Internal links** | 0 broken (non-200) among crawled internal links |
| **type-check** (both workspaces) | Clean |
| **Production build** | Green; locations SSG-prerendered, middleware registered |
| **Touched-file lint** | Clean (my M3/M4/UX files have no new lint errors) |

---

## 🔧 Fixed during QA

- **Soft-404 → real 404.** All three dynamic routes (`(site)/[slug]`, `(site)/locations/[suburb]`, `(school)/school/[slug]`) returned **HTTP 200** with an inline "not found" `<div>` for unknown slugs — a soft-404 that pollutes the index. Replaced with Next's `notFound()`; unknown URLs now return **404** and render the app `not-found` page. Verified: `/nope`, `/locations/nope`, `/school/nope` → 404; real routes still 200. *(Inherited from the base template.)*

---

## ⚠️ Findings / decisions

1. **School pages are absent from the sitemap** *(decision needed)*. `sitemapData` only includes `page`/`service`/`locationPage`, so `/school` + 8 sub-pages aren't listed. `/school` (home) is real content and should be indexed. The 7 sub-pages still have `[TBD]` bodies (pending Amy) — indexing placeholders is bad. **Recommendation:** add `schoolPage` to `sitemapData` once school content lands, or add `/school` now and `noindex` the placeholder sub-pages until their copy is in. Not auto-changed — confirms SEO intent first.

2. **Contact form renders client-side only.** `/contact` form fields aren't in the SSR/no-JS HTML because `ContactForm` uses `useSearchParams()` (correctly wrapped in Suspense — no build warning). Works fine for real users with JS. Acceptable for a contact form; flagged for awareness (no-JS visitors see no form).

3. **`/api/contact` returns HTTP 500** when unconfigured (`{"error":"Contact form is not configured"}`). Expected until SMTP/email env is set, but 500 is a slightly off status for a config state (503 would be more correct). The client catches it and shows a friendly message. Low priority.

4. **Inherited lint debt:** 142 problems (131 errors / 11 warnings) — `no-explicit-any`, `error.tsx` `<a>` vs `<Link>`, `<img>` vs `next/image`. All pre-existing from the base (documented in investigation-map). Non-blocking for build. Optional cleanup pass before launch.

5. **Local `.next` fetch-cache staleness (not a defect).** A published settings change (footer FAQ link) didn't appear until `.next` was cleared and rebuilt. Real Vercel deploys build clean each time, so this won't occur in production. Noted as a QA-process reminder: **test against a clean build.**

---

## ⛔ Blocked on pending human inputs

- **Submit-test every form** (contact + school funnels) — blocked on `CONTACT_FORM_TO_EMAIL` + SMTP creds (Brian). API currently returns "not configured" by design.
- **Verify every booking link** — hero/CTA booking buttons are `#` placeholders pending Goose URLs (Hung/Caitlin). Confirmed only the expected placeholders exist (homepage hero).
- **Verify every redirect** — middleware logic verified (legacy host → `/school` or `/`; canonical host untouched), but the exhaustive old→new pairs await the riogrooming.com crawl.
- **Canonical domain** — sitemap/robots/canonicals resolve to the single `SITE_URL` constant (`riversidepetmn.com` default); final values land when Peter confirms.

## 🖐 Manual follow-ups (need a browser / deploy)

- **Lighthouse** (perf/SEO/a11y/best-practices) — run against the Vercel preview.
- **Google Rich Results test** for the FAQPage schema — structurally valid here; confirm in Google's tool.
- **Mobile + desktop click-through** of every page (visual/interaction QA).
- **Real form submission** once email is configured.

---

## Verification commands (re-runnable)

- Route sweep / link crawl / a11y greps: see this session's QA run against `localhost:3000` (clean prod build).
- Redirect check: `curl -H "Host: riogrooming.com" -I localhost:3000/enrollment` → 301 → `/school`.
- FAQ JSON-LD: fetch `/faq`, parse `application/ld+json`, assert `@type==FAQPage`.
