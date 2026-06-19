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
 * ⚠️ The exhaustive old→new pairs come from a crawl of riogrooming.com's indexed
 * pages — deferred until that crawl is run (before M6 launch). The explicit map
 * below is a placeholder; the path-aware fallback already handles the general case.
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
 * Exact legacy path → new path. Populate from the riogrooming.com crawl.
 * Keys are pathnames without trailing slash, lowercased.
 *
 * TODO: populate from riogrooming.com crawl (deferred — see file header).
 */
export const EXPLICIT_REDIRECTS: Record<string, string> = {
  // '/grooming-academy': '/school',
  // '/enroll': '/school/enrollment-financing',
  // '/about-rio': '/school',
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
 * Resolve the redirect target for a legacy pathname.
 * Returns the destination path (e.g. '/school' or '/'), always defined for
 * legacy hosts. Explicit map wins; otherwise path-aware fallback.
 */
export function resolveLegacyRedirect(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/'

  if (clean in EXPLICIT_REDIRECTS) return EXPLICIT_REDIRECTS[clean]

  if (SCHOOL_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`))) {
    return '/school'
  }

  return '/'
}

/** True when the given Host header belongs to a legacy domain. */
export function isLegacyHost(host: string | null | undefined): boolean {
  if (!host) return false
  const bare = host.split(':')[0].toLowerCase()
  return LEGACY_HOSTS.includes(bare)
}
