/**
 * Path-aware 301 redirect map (version-controlled, deterministic — NOT in Sanity).
 *
 * Purpose: when legacy domains (riogrooming.com, the Barks & Rec domain, …) are
 * pointed at this deployment at DNS cutover, their old URLs must 301 to the
 * right place on the new canonical site — preserving search equity. Per the
 * requirement: school/enrollment deep links → `/school/...`, everything else → `/`.
 *
 * SAFETY: redirects only fire for requests whose Host is a LEGACY_HOST (see
 * middleware.ts). Canonical-domain traffic is never rewritten, so the live
 * Riverside routes are unaffected.
 *
 * The exhaustive old→new pairs come from a crawl of riogrooming.com's indexed
 * pages (page/post/portfolio sitemaps, 6/20). EXPLICIT_REDIRECTS below carries the
 * precise equity transfers; the path-aware prefix fallback handles anything not
 * enumerated (e.g. blog posts, legal, template artifacts → resort home).
 */

/**
 * Hosts whose traffic should be treated as legacy and redirected. Compared
 * case-insensitively, port stripped. Add the Barks & Rec domain once confirmed.
 */
export const LEGACY_HOSTS = [
  'riogrooming.com',
  'www.riogrooming.com',
  'riogroomingschool.com',
  'www.riogroomingschool.com',
  // TODO: add the Barks & Rec Hastings domain once Peter confirms it (redirects
  // to Riverside at launch per Brian, 6/12).
]

/**
 * Exact legacy path → new path, built from the riogrooming.com crawl (6/20).
 * Keys are pathnames without trailing slash, lowercased. Explicit entries win
 * over the prefix fallbacks below — use them to land legacy URLs on the precise
 * new page (school sub-page, specific service) instead of a generic section root.
 */
export const EXPLICIT_REDIRECTS: Record<string, string> = {
  // Rio Grooming School — deep links to the matching school sub-pages.
  '/grooming-school': '/school',
  '/grooming-school/request-school-info': '/school/request-information',
  '/grooming-school/student-housing': '/school/student-housing',
  '/grooming-school/why-dog-grooming': '/school/why-become-a-groomer',
  '/grooming-school/tours': '/school/schedule-a-tour',
  '/grooming-school/scholarships': '/school/scholarships',
  '/grooming-school/enroll-financing': '/school/enrollment-financing',

  // Grooming services — all sub-services consolidate onto the one resort
  // grooming page (which carries professional / student / cat / self-serve
  // sub-sections). Appointment-request pages land on grooming (booking CTA).
  '/grooming-services': '/services/grooming',
  '/grooming-services/professional-grooming': '/services/grooming',
  '/grooming-services/grooming-students': '/services/grooming',
  '/grooming-services/cat-grooming': '/services/grooming',
  '/grooming-services/dog-services': '/services/grooming',
  '/grooming-services/self-service-dog-wash': '/services/grooming',
  '/grooming-appointment-request': '/services/grooming',
  '/rio-grooming-appointment-request': '/services/grooming',

  // Boarding — Rio's "rooms" = overnight accommodations.
  '/rooms': '/services/boarding',

  // About — staff/partners/birthday-club folded into the single About page.
  '/about-us': '/about',
  '/about-us/staff': '/about',
  '/about-us/partners': '/about',
  '/about-us/doggy-birthday-club': '/about',

  // Contact.
  '/contact': '/contact',
}

/**
 * Legacy path prefixes that indicate school/enrollment content. Any unmatched
 * legacy path starting with one of these routes to the school home; everything
 * else falls back to the resort home.
 */
const SCHOOL_PREFIXES = [
  '/school',
  '/grooming-school',
  '/grooming-academy',
  '/academy',
  '/enroll',
  '/enrollment',
  '/admissions',
  '/scholarship',
  '/student',
  '/tour',
  '/career',
]

/**
 * Legacy path prefixes for the Rio job board (other companies' postings) +
 * employer job submission. No per-posting equivalent on the new site; the
 * closest topical home is the resort Careers page.
 */
const CAREERS_PREFIXES = ['/jobs', '/submit-a-job-posting']

/**
 * Resolve the redirect target for a legacy pathname.
 * Returns the destination path (e.g. '/school' or '/'), always defined for
 * legacy hosts. Explicit map wins; otherwise path-aware prefix fallback.
 */
export function resolveLegacyRedirect(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/'

  if (clean in EXPLICIT_REDIRECTS) return EXPLICIT_REDIRECTS[clean]

  if (SCHOOL_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`))) {
    return '/school'
  }

  if (CAREERS_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`))) {
    return '/careers'
  }

  return '/'
}

/** True when the given Host header belongs to a legacy domain. */
export function isLegacyHost(host: string | null | undefined): boolean {
  if (!host) return false
  const bare = host.split(':')[0].toLowerCase()
  return LEGACY_HOSTS.includes(bare)
}
