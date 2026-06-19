#!/usr/bin/env node
/**
 * One-shot: convert the homepage's first block from `hero` to `heroMarquee`,
 * preserving the approved copy + CTAs, and seed the marquee with placeholder
 * dog photos from Unsplash (uploaded as real Sanity image assets).
 *
 * Placeholder imagery only — replace the marquee images with the curated
 * Rio Grooming / Barks & Rec Facebook photos during the imagery pass.
 *
 * Reads the Sanity write token from the CLI session (`sanity debug --secrets`),
 * same pattern as scripts/migrate-settings-id.js. Run `sanity login` first if
 * the token can't be read.
 *
 * Usage:  node scripts/seed-home-marquee.js
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const HOMEPAGE_ID = 'homepage'
const HERO_KEY = 'hero1'

// Stable Unsplash dog photos (placeholder imagery only).
const UNSPLASH = [
  {id: 'photo-1552053831-71594a27632d', alt: 'Happy golden retriever outdoors'},
  {id: 'photo-1517849845537-4d257902454a', alt: 'Pug looking up at the camera'},
  {id: 'photo-1543466835-00a7907e9de1', alt: 'Golden retriever resting on grass'},
  {id: 'photo-1561037404-61cd46aa615b', alt: 'Brown and white dog smiling'},
  {id: 'photo-1583512603805-3cc6b41f3edb', alt: 'Dog being groomed'},
  {id: 'photo-1587300003388-59208cc962cb', alt: 'Golden retriever puppy'},
]

function getCliToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN
  const studioDir = path.join(__dirname, '..', 'studio')
  // Monorepo hoists binaries to the repo-root node_modules/.bin.
  const bin = path.join(__dirname, '..', 'node_modules', '.bin', 'sanity')
  const raw = execSync(`"${bin}" debug --secrets`, {
    encoding: 'utf8',
    cwd: studioDir,
    env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'},
  })
  // Strip any ANSI color codes the CLI may emit, then read the token.
  const out = raw.replace(/\[[0-9;]*m/g, '')
  const m = out.match(/Auth token:\s*'([^']+)'/)
  if (!m) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return m[1]
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

  // 1. Download + upload each Unsplash photo as a Sanity image asset.
  const imageMembers = []
  for (const {id, alt} of UNSPLASH) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`
    process.stdout.write(`Uploading ${id} … `)
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`SKIPPED (${res.status})`)
      continue
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buffer, {filename: `${id}.jpg`})
    imageMembers.push({
      _type: 'image',
      _key: `marquee-${id}`,
      asset: {_type: 'reference', _ref: asset._id},
      alt,
    })
    console.log('ok')
  }

  if (imageMembers.length === 0) {
    throw new Error('No images uploaded — aborting so we do not wipe the hero.')
  }

  // 2. Read the homepage, find the existing hero block, preserve its copy/CTAs.
  const doc = await client.getDocument(HOMEPAGE_ID)
  if (!doc) throw new Error(`Document "${HOMEPAGE_ID}" not found`)
  const builder = Array.isArray(doc.pageBuilder) ? doc.pageBuilder : []
  const hero = builder.find((b) => b._key === HERO_KEY) || {}

  const heroMarquee = {
    _type: 'heroMarquee',
    _key: HERO_KEY,
    eyebrow: hero.eyebrow || 'Home of the Rio Grooming School',
    heading: hero.heading || 'Riverside Pet Resort',
    headingAccent: hero.headingAccent || undefined,
    subtext: hero.subtext || 'Premier Boarding • Daycare • Grooming • Grooming Education',
    primaryCta: hero.primaryCta || undefined,
    secondaryCta: hero.secondaryCta || undefined,
    bubbleText: 'All-inclusive care under one roof',
    marqueeImages: imageMembers,
  }

  // 3. Replace the hero block in place (keep order); append if it was missing.
  const newBuilder = builder.some((b) => b._key === HERO_KEY)
    ? builder.map((b) => (b._key === HERO_KEY ? heroMarquee : b))
    : [heroMarquee, ...builder]

  await client.patch(HOMEPAGE_ID).set({pageBuilder: newBuilder}).commit()
  console.log(
    `\nDone — homepage hero is now heroMarquee with ${imageMembers.length} placeholder dog photos.`,
  )
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
