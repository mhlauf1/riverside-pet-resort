/**
 * Site-wide configuration constants.
 *
 * ⚠️ CANONICAL DOMAIN IS UNCONFIRMED (pending Peter — riversidepetmn.com vs
 * "RiversidePet.com"; definitely NOT riversidepetresort.com, which is brand-pack
 * placeholder). Keep the domain in this ONE place. Override at deploy time with
 * NEXT_PUBLIC_SITE_URL. Do not scatter the domain through redirects, canonical
 * tags, schema, or sitemap config — import SITE_URL from here instead.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://riversidepetmn.com'

/** Display name used as a fallback when Sanity settings.title is absent. */
export const SITE_NAME = 'Riverside Pet Resort'
