#!/usr/bin/env node
/**
 * One-shot: bring the Rio Grooming School pages up to the same visual quality
 * bar as the resort pages (which got `heroSplit` treatment via
 * scripts/seed-split-heroes.js). The school section was never run through that
 * pass, so its pages still lead with a bare centered `heroMinimal`.
 *
 * For each of the 8 `schoolPage` docs we:
 *  - find the leading `heroMinimal` block by _type (keys aren't hardcoded),
 *  - convert it to a `heroSplit` (heading/eyebrow preserved verbatim; the home
 *    page's `headingAccent` folds into the hero body so no approved copy is
 *    lost; image on the right),
 *  - seed a PLACEHOLDER Unsplash photo (uploaded as a real Sanity asset) —
 *    swapped for real Rio/Barks & Rec photos during the imagery pass,
 *  - add top CTAs into the enrollment funnels (Request Information / Schedule
 *    a Tour), never pointing a page's CTA at itself.
 *
 * On the 7 sub-pages we also APPEND a funnel `ctaStrip` at the bottom. We do
 * NOT touch the `[TBD]` `infoSection` bodies — that copy is pending Amy/Brian.
 * The school home keeps its approved "Since 2009…" intro + highlights + dean.
 *
 * Copy-agnostic, visual-only. No invented page prose.
 *
 * Reads the Sanity write token from the CLI session, same as the other scripts.
 * Usage:  node scripts/seed-school-split-heroes.js
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'

function getCliToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN
  const bin = path.join(__dirname, '..', 'node_modules', '.bin', 'sanity')
  const raw = execSync(`"${bin}" debug --secrets 2>&1`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'studio'),
    env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'},
  })
  // eslint-disable-next-line no-control-regex
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const m = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!m) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return m[1]
}

// Funnel CTA buttons (school enrollment funnels).
const REQUEST_INFO = {
  _type: 'button',
  buttonText: 'Request Information',
  link: {_type: 'link', linkType: 'href', href: '/school/request-information'},
}
const SCHEDULE_TOUR = {
  _type: 'button',
  buttonText: 'Schedule a Tour',
  link: {_type: 'link', linkType: 'href', href: '/school/schedule-a-tour'},
}
const EXPLORE_PROGRAMS = {
  _type: 'button',
  buttonText: 'Explore the School',
  link: {_type: 'link', linkType: 'href', href: '/school'},
}

// Per-page config. Placeholder Unsplash IDs are reused from the proven set in
// seed-home-marquee.js / seed-split-heroes.js (known to upload cleanly).
const PAGES = [
  {
    id: 'school-home',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: null, // home already flows into highlights + dean
    photo: 'photo-1583512603805-3cc6b41f3edb',
    alt: 'A dog being professionally groomed',
  },
  {
    id: 'school-why-become-a-groomer',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: {heading: 'Ready to start your grooming career?', cta: REQUEST_INFO},
    photo: 'photo-1587300003388-59208cc962cb',
    alt: 'A groomer working with a dog',
  },
  {
    id: 'school-enrollment-financing',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: {heading: 'Have questions about getting started?', cta: REQUEST_INFO},
    photo: 'photo-1543466835-00a7907e9de1',
    alt: 'A dog resting comfortably',
  },
  {
    id: 'school-scholarships',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: {heading: 'Ready to take the next step?', cta: REQUEST_INFO},
    photo: 'photo-1561037404-61cd46aa615b',
    alt: 'A happy dog enjoying the day',
  },
  {
    id: 'school-student-housing',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: {heading: 'Want to learn more about the program?', cta: REQUEST_INFO},
    photo: 'photo-1552053831-71594a27632d',
    alt: 'A friendly dog outdoors',
  },
  {
    id: 'school-career-placement',
    backgroundColor: 'forest',
    primaryCta: REQUEST_INFO,
    secondaryCta: SCHEDULE_TOUR,
    funnel: {heading: 'Start your grooming career with Rio.', cta: REQUEST_INFO},
    photo: 'photo-1517849845537-4d257902454a',
    alt: 'A dog with its groomer',
  },
  {
    id: 'school-request-information',
    backgroundColor: 'forest',
    // Don't point the CTA at this page; drive to a tour instead.
    primaryCta: SCHEDULE_TOUR,
    secondaryCta: EXPLORE_PROGRAMS,
    funnel: {heading: 'Prefer to see the school in person?', cta: SCHEDULE_TOUR},
    photo: 'photo-1583512603805-3cc6b41f3edb',
    alt: 'A dog being professionally groomed',
  },
  {
    id: 'school-schedule-a-tour',
    backgroundColor: 'forest',
    // Don't point the CTA at this page; drive to the info request instead.
    primaryCta: REQUEST_INFO,
    secondaryCta: EXPLORE_PROGRAMS,
    funnel: {heading: 'Want details sent your way?', cta: REQUEST_INFO},
    photo: 'photo-1587300003388-59208cc962cb',
    alt: 'A groomer working with a dog',
  },
]

async function uploadPhoto(client, id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Unsplash ${id} -> ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename: `${id}.jpg`})
  return asset._id
}

async function main() {
  const token = getCliToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  for (const page of PAGES) {
    const doc = await client.getDocument(page.id)
    if (!doc) throw new Error(`Document "${page.id}" not found`)
    const builder = Array.isArray(doc.pageBuilder) ? doc.pageBuilder : []

    const hero = builder.find((b) => b._type === 'heroMinimal')
    if (!hero) throw new Error(`${page.id}: no heroMinimal block found`)

    // Fold the home page's headingAccent into the hero body so it isn't lost
    // (heroSplit has no accent field). Sub-pages have no accent → no body.
    const body = hero.headingAccent || hero.subtext || undefined

    process.stdout.write(`Uploading photo for ${page.id} … `)
    const assetId = await uploadPhoto(client, page.photo)
    console.log('ok')

    const heroSplit = {
      _type: 'heroSplit',
      _key: hero._key, // keep key to preserve block order
      ...(hero.eyebrow && {eyebrow: hero.eyebrow}),
      heading: hero.heading, // required, approved verbatim
      ...(body && {body}),
      ...(page.primaryCta && {primaryCta: page.primaryCta}),
      ...(page.secondaryCta && {secondaryCta: page.secondaryCta}),
      image: {
        _type: 'image',
        _key: `${hero._key}-img`,
        asset: {_type: 'reference', _ref: assetId},
        alt: page.alt,
      },
      imagePosition: 'right',
      imageAspect: 'square', // matches resort heroes; shorter than portrait
      backgroundColor: page.backgroundColor,
    }

    let newBuilder = builder.map((b) => (b._key === hero._key ? heroSplit : b))

    // Append a funnel CTA strip on the sub-pages (sand bg → AA-safe, separates
    // visually from the dark footer). Generic funnel chrome, not page copy.
    if (page.funnel) {
      newBuilder = [
        ...newBuilder,
        {
          _type: 'ctaStrip',
          _key: `${hero._key}-funnel`,
          heading: page.funnel.heading,
          cta: page.funnel.cta,
          backgroundColor: 'sand',
        },
      ]
    }

    await client.patch(page.id).set({pageBuilder: newBuilder}).commit()
    console.log(`  ${page.id}: heroSplit set${page.funnel ? ' + funnel ctaStrip appended' : ''}.`)
  }

  console.log('\nDone. Placeholder split heroes + funnel CTAs seeded on the school pages.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
