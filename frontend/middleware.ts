import {NextRequest, NextResponse} from 'next/server'

import {SITE_URL} from '@/app/site-config'
import {isLegacyHost, resolveLegacyRedirect} from '@/app/redirect-map'

/**
 * Path-aware 301 redirects for legacy domains (riogrooming.com, etc.) pointed at
 * this deployment at DNS cutover. Only requests whose Host is a known legacy host
 * are rewritten — canonical-domain traffic passes straight through, so the live
 * Riverside routes are never affected. See app/redirect-map.ts.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  if (!isLegacyHost(host)) {
    return NextResponse.next()
  }

  const target = resolveLegacyRedirect(request.nextUrl.pathname)

  // Land on the canonical domain when it's configured; otherwise keep the
  // redirect relative (the domain stays unconfirmed in a single env var).
  const destination = SITE_URL ? new URL(target, SITE_URL) : new URL(target, request.url)

  return NextResponse.redirect(destination, 301)
}

export const config = {
  // Run on everything except API routes, the embedded Studio, Next internals,
  // and static asset requests.
  matcher: ['/((?!api|studio|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}
