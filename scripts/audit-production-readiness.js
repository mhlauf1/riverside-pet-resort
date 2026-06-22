#!/usr/bin/env node
/**
 * Read-only launch readiness audit for the Sanity-backed production content.
 * It does not validate real SMTP delivery or Goose login flows; it flags the
 * known blockers that must be resolved before launch.
 *
 * Usage: node scripts/audit-production-readiness.js
 */

const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://riversidepetmn.com').replace(/\/$/, '')

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const REQUIRED_POS_URLS = ['daycareBookingUrl', 'boardingBookingUrl', 'groomingBookingUrl']

function isPlaceholder(value) {
  return !value || /\[.*tbd.*\]/i.test(value)
}

function isMissingUrl(value) {
  return !value || value === '#' || /\[.*tbd.*\]/i.test(value)
}

function check(label, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'}\t${label}${detail ? `\t${detail}` : ''}`)
  return pass
}

async function main() {
  const [settings, schoolPages, schoolSettings] = await Promise.all([
    client.fetch(`*[_type == "settings"][0]{contactInfo, posUrls, transitionBanner}`),
    client.fetch(`*[_type == "schoolPage" && defined(slug.current)]{
      name,
      "slug": slug.current,
      "noIndex": seo.noIndex
    } | order(slug asc)`),
    client.fetch(`*[_type == "schoolSettings"][0]{formEmail}`),
  ])

  let ok = true
  ok = check('NEXT_PUBLIC_SITE_URL set', Boolean(SITE_URL), SITE_URL) && ok
  ok = check('CONTACT_FORM_TO_EMAIL set', Boolean(process.env.CONTACT_FORM_TO_EMAIL), process.env.CONTACT_FORM_TO_EMAIL || 'missing') && ok
  ok = check('SMTP_HOST set', Boolean(process.env.SMTP_HOST), process.env.SMTP_HOST || 'missing') && ok
  ok = check('SMTP_USER set', Boolean(process.env.SMTP_USER), process.env.SMTP_USER || 'missing') && ok
  ok = check('SMTP_PASS set', Boolean(process.env.SMTP_PASS), process.env.SMTP_PASS ? 'present' : 'missing') && ok

  for (const field of REQUIRED_POS_URLS) {
    const value = settings?.posUrls?.[field]
    ok = check(`settings.posUrls.${field}`, !isMissingUrl(value), value || 'missing') && ok
  }

  ok = check(
    'transition banner configured or intentionally off',
    settings?.transitionBanner?.enabled === false || Boolean(settings?.transitionBanner?.content?.length),
    settings?.transitionBanner?.enabled ? 'enabled' : 'off',
  ) && ok

  ok = check(
    'schoolSettings.formEmail set or falls back to contact email',
    !isPlaceholder(schoolSettings?.formEmail || process.env.CONTACT_FORM_TO_EMAIL),
    schoolSettings?.formEmail || 'fallback/missing',
  ) && ok

  for (const page of schoolPages) {
    const expectedNoIndex = page.slug !== 'home'
    ok = check(
      `schoolPage ${page.slug} index policy`,
      expectedNoIndex ? page.noIndex === true : page.noIndex !== true,
      expectedNoIndex ? 'subpage should be noindex while placeholder copy remains' : 'home should be indexable',
    ) && ok
  }

  process.exit(ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
