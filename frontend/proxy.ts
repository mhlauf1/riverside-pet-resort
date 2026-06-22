import {NextRequest, NextResponse} from 'next/server'

import {SITE_URL} from '@/app/site-config'
import {isLegacyHost, resolveLegacyRedirect} from '@/app/redirect-map'

/**
 * Path-aware 301 redirects for legacy domains (riogrooming.com, etc.) pointed at
 * this deployment at DNS cutover. Only requests whose Host is a known legacy host
 * are rewritten; canonical-domain traffic passes straight through.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')
  if (!isLegacyHost(host)) {
    return NextResponse.next()
  }

  const target = resolveLegacyRedirect(request.nextUrl.pathname)
  const destination = new URL(target, SITE_URL)

  return NextResponse.redirect(destination, 301)
}

export const config = {
  matcher: ['/((?!api|studio|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}
