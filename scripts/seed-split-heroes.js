#!/usr/bin/env node
/**
 * One-shot: convert the leading centered `heroMinimal` header on the service
 * pages (Boarding, Daycare, Grooming) and the About page into a `heroSplit`
 * (heading + intro text on the left, image on the right) — matching the
 * Hound Around reference and the homepage hero treatment.
 *
 * For each page we merge the existing `heroMinimal` + its intro `infoSection`
 * into one `heroSplit`, preserving the approved eyebrow/heading/narrative
 * verbatim, and seed a PLACEHOLDER dog photo from Unsplash (uploaded as a real
 * Sanity asset). The block requires an image, so placeholders go in now and get
 * swapped for real Rio/Barks & Rec photos during the imagery pass.
 *
 * Reads the Sanity write token from the CLI session, same as the other scripts.
 * Usage:  node scripts/seed-split-heroes.js
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

const BOOK_NOW = {
  _type: 'button',
  buttonText: 'Book Now',
  // Placeholder until Goose booking links arrive (Hung/Caitlin).
  link: {_type: 'link', linkType: 'href', href: '#'},
}
const SCHEDULE_TOUR = {
  _type: 'button',
  buttonText: 'Schedule a Tour',
  link: {_type: 'link', linkType: 'href', href: '/contact'},
}
const CONTACT_US = {
  _type: 'button',
  buttonText: 'Contact Us',
  link: {_type: 'link', linkType: 'href', href: '/contact'},
}

// One placeholder Unsplash photo per page (known-good IDs proven to upload in
// seed-home-marquee.js). Subject-appropriate where possible.
const PAGES = [
  {
    id: 'service-boarding',
    heroKey: 'bh',
    introKey: 'bnarr',
    backgroundColor: 'forest',
    primaryCta: BOOK_NOW,
    secondaryCta: SCHEDULE_TOUR,
    photo: 'photo-1543466835-00a7907e9de1',
    alt: 'A dog resting comfortably',
  },
  {
    id: 'service-daycare',
    heroKey: 'dh',
    introKey: 'dnarr',
    backgroundColor: 'cream',
    primaryCta: BOOK_NOW,
    secondaryCta: SCHEDULE_TOUR,
    photo: 'photo-1561037404-61cd46aa615b',
    alt: 'A happy dog enjoying the day',
  },
  {
    id: 'service-grooming',
    heroKey: 'gh',
    introKey: 'gnarr',
    backgroundColor: 'forest',
    primaryCta: BOOK_NOW,
    secondaryCta: SCHEDULE_TOUR,
    photo: 'photo-1583512603805-3cc6b41f3edb',
    alt: 'A dog being professionally groomed',
  },
  {
    id: 'page-about',
    heroKey: 'ah',
    introKey: 'anarr',
    backgroundColor: 'cream',
    primaryCta: CONTACT_US,
    secondaryCta: null,
    photo: 'photo-1552053831-71594a27632d',
    alt: 'A friendly dog outdoors',
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

function firstParagraph(infoBlock) {
  const blocks = infoBlock?.content || []
  return (blocks[0]?.children || []).map((c) => c.text).join('')
}
function paragraphsFrom(infoBlock) {
  return (infoBlock?.content || []).map((b) => (b.children || []).map((c) => c.text).join(''))
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

    const hero = builder.find((b) => b._key === page.heroKey)
    const intro = builder.find((b) => b._key === page.introKey)
    if (!hero) throw new Error(`${page.id}: no heroMinimal block with _key "${page.heroKey}"`)
    if (!intro) throw new Error(`${page.id}: no infoSection block with _key "${page.introKey}"`)

    process.stdout.write(`Uploading photo for ${page.id} … `)
    const assetId = await uploadPhoto(client, page.photo)
    console.log('ok')

    const paragraphs = paragraphsFrom(intro)
    const body = page.id === 'page-about' ? paragraphs[0] : firstParagraph(intro)

    const heroSplit = {
      _type: 'heroSplit',
      _key: page.heroKey, // keep key to preserve order
      eyebrow: hero.eyebrow || undefined,
      heading: hero.heading, // required, approved verbatim
      body,
      ...(page.primaryCta && {primaryCta: page.primaryCta}),
      ...(page.secondaryCta && {secondaryCta: page.secondaryCta}),
      image: {
        _type: 'image',
        _key: `${page.heroKey}-img`,
        asset: {_type: 'reference', _ref: assetId},
        alt: page.alt,
      },
      imagePosition: 'right',
      backgroundColor: page.backgroundColor,
    }

    let newBuilder
    if (page.id === 'page-about' && paragraphs.length > 1) {
      // Keep About's second narrative paragraph in a trimmed infoSection.
      const trimmedIntro = {
        ...intro,
        content: (intro.content || []).slice(1),
      }
      newBuilder = builder.map((b) => {
        if (b._key === page.heroKey) return heroSplit
        if (b._key === page.introKey) return trimmedIntro
        return b
      })
    } else {
      // Services: replace hero, drop the absorbed intro infoSection.
      newBuilder = builder
        .filter((b) => b._key !== page.introKey)
        .map((b) => (b._key === page.heroKey ? heroSplit : b))
    }

    await client.patch(page.id).set({pageBuilder: newBuilder}).commit()
    console.log(`  ${page.id}: heroSplit set (${page.backgroundColor}), intro merged.`)
  }

  console.log('\nDone. Placeholder split heroes seeded on 3 services + About.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
