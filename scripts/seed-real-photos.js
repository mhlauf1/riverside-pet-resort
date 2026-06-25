#!/usr/bin/env node
/**
 * Imagery pass (client revision round 2 — Brian, 6/25): replace the homepage's
 * placeholder Unsplash imagery with real Rio / Barks & Rec customer photos
 * (Olivia's "Pup Pics" batch), rebalanced so the homepage scrollers represent
 * boarding + daycare + grooming evenly rather than skewing grooming-heavy, and
 * swap the Boarding / Daycare / Grooming hero images to on-subject photos.
 *
 * Surgical: each block is read and only its image field(s) are replaced; every
 * other block field (copy, CTAs, imagePosition, backgroundColor) is preserved.
 *
 * Source files live OUTSIDE the repo (session scratchpad) — pass the directory
 * via PHOTOS_DIR. Each unique file is uploaded to Sanity once and reused.
 *
 * Reads the Sanity write token from the CLI session, same pattern as the other
 * seed scripts. Run `sanity login` first if the token can't be read.
 *
 * Usage:  PHOTOS_DIR=/abs/path/to/photos node scripts/seed-real-photos.js
 */

const path = require('node:path')
const fs = require('node:fs')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const PHOTOS_DIR = process.env.PHOTOS_DIR

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

// Photo file (relative to PHOTOS_DIR) -> descriptive alt text. Categorized by
// eye from the unsorted batch. The Barks & Rec branded-harness photo is
// deliberately excluded (shows the pre-rebrand identity).
const PHOTOS = {
  // daycare / group play
  d_ball: {file: 'Pup_Pics_(2)/IMG_5764.jpeg', alt: 'A group of dogs playing together in the outdoor turf yard'},
  d_two: {file: 'Pup_Pics/IMG_2344.jpeg', alt: 'Two happy dogs sitting together in the daycare play yard'},
  d_indoor: {file: 'Pup_pics_(1)/IMG_3232.jpeg', alt: 'Dogs at play in the indoor climate-controlled playroom'},
  d_huskies: {file: 'Pup_Pics/IMG_5296.jpeg', alt: 'Two white huskies relaxing on a rock in the play yard'},
  d_patio: {file: 'Pup_Pics/IMG_0018.jpeg', alt: 'Dogs greeting the camera on the outdoor patio'},
  d_wrestle: {file: 'Pup_Pics/IMG_9854.jpeg', alt: 'Two dogs happily play-wrestling on the turf'},
  d_trough1: {file: 'Pup_pics_(1)/IMG_5367.jpeg', alt: 'A Labrador cooling off in a water trough on a summer day'},
  d_pack: {file: 'Pup_pics_(1)/IMG_7635.jpeg', alt: 'A pack of daycare dogs out together for group play'},
  d_pedestal: {file: 'Pup_Pics/IMG_9365.jpeg', alt: 'Two dogs posing on a rock pedestal in the play yard'},
  d_pups: {file: 'Pup_pics_(1)/IMG_4782.jpeg', alt: 'Two puppies relaxing in the sunny play yard'},
  d_goldshep: {file: 'Pup_pics_(1)/IMG_6606.jpeg', alt: 'A golden retriever and German shepherd in the outdoor yard'},
  d_trough2: {file: 'Pup_Pics_(2)/IMG_5698.jpeg', alt: 'A happy dog cooling off in a water trough'},
  d_lab: {file: 'Pup_Pics/IMG_3237.jpeg', alt: 'A black Labrador and friends in the turf play yard'},
  d_collie: {file: 'Pup_pics_(1)/IMG_3230.jpeg', alt: 'A smiling border collie enjoying the daycare play yard'},
  // boarding / rest & enrichment
  b_cot: {file: 'Pup_pics_(1)/IMG_4815.jpeg', alt: 'Two golden retrievers resting on a raised cot in a boarding suite'},
  b_treat: {file: 'Pup_pics_(1)/IMG_3231.jpeg', alt: 'A dog enjoying a frozen enrichment treat during a boarding stay'},
  b_rest: {file: 'Pup_Pics/IMG_9607.jpeg', alt: 'A golden retriever and shepherd puppy resting calmly during boarding'},
  b_portrait: {file: 'Pup_Pics/IMG_3236.jpeg', alt: 'A golden retriever with a toy'},
  // grooming
  g_bath: {file: 'Pup_Pics/IMG_7387.jpeg', alt: 'A freshly bathed dog in the grooming wash station'},
}

// Top homepage hero marquee — balanced across services, grooming present but
// not dominant (3 daycare, 2 boarding, 1 indoor, 1 grooming).
const HERO_MARQUEE = ['d_ball', 'd_two', 'b_rest', 'd_indoor', 'd_huskies', 'b_treat', 'g_bath']
// Bottom homepage photo marquee — daycare/boarding variety.
const PHOTO_MARQUEE = ['d_patio', 'd_wrestle', 'd_trough1', 'd_pack', 'd_pedestal', 'd_pups', 'd_goldshep', 'd_trough2']

async function main() {
  if (!PHOTOS_DIR) throw new Error('Set PHOTOS_DIR to the folder containing the photo files.')
  const token = getCliToken()
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', token, useCdn: false})

  // 1. Upload each unique photo once; build name -> assetId.
  const assetIds = {}
  for (const [name, {file}] of Object.entries(PHOTOS)) {
    const abs = path.join(PHOTOS_DIR, file)
    if (!fs.existsSync(abs)) throw new Error(`Missing file: ${abs}`)
    process.stdout.write(`Uploading ${name} (${file}) … `)
    const buffer = fs.readFileSync(abs)
    const asset = await client.assets.upload('image', buffer, {filename: path.basename(file)})
    assetIds[name] = asset._id
    console.log('ok')
  }

  const imgMember = (name, keyPrefix) => ({
    _type: 'image',
    _key: `${keyPrefix}-${name}`,
    asset: {_type: 'reference', _ref: assetIds[name]},
    alt: PHOTOS[name].alt,
  })

  // 2. Patch homepage: both marquees + the two splitContent images.
  const home = await client.getDocument('homepage')
  const newHomeBuilder = home.pageBuilder.map((b) => {
    if (b._key === 'hero1') return {...b, marqueeImages: HERO_MARQUEE.map((n) => imgMember(n, 'hm'))}
    if (b._key === 'home-photo-marquee') return {...b, marqueeImages: PHOTO_MARQUEE.map((n) => imgMember(n, 'pm'))}
    if (b._key === 'home-campus-intro') {
      return {...b, image: {_type: 'image', _key: (b.image && b.image._key) || 'campus-img', asset: {_type: 'reference', _ref: assetIds.d_lab}, alt: PHOTOS.d_lab.alt}}
    }
    if (b._key === 'home-rio-bridge') {
      return {...b, image: {_type: 'image', _key: (b.image && b.image._key) || 'bridge-img', asset: {_type: 'reference', _ref: assetIds.b_portrait}, alt: PHOTOS.b_portrait.alt}}
    }
    return b
  })
  await client.patch('homepage').set({pageBuilder: newHomeBuilder}).commit()
  console.log('homepage: both marquees + 2 split images updated.')

  // 3. Patch the three service hero images (heroSplit).
  const heroes = [
    {id: 'service-boarding', key: 'bh', photo: 'b_cot'},
    {id: 'service-daycare', key: 'dh', photo: 'd_collie'},
    {id: 'service-grooming', key: 'gh', photo: 'g_bath'},
  ]
  for (const {id, key, photo} of heroes) {
    const doc = await client.getDocument(id)
    const newBuilder = doc.pageBuilder.map((b) => {
      if (b._key !== key) return b
      return {
        ...b,
        image: {
          _type: 'image',
          _key: (b.image && b.image._key) || `${key}-img`,
          asset: {_type: 'reference', _ref: assetIds[photo]},
          alt: PHOTOS[photo].alt,
        },
      }
    })
    await client.patch(id).set({pageBuilder: newBuilder}).commit()
    console.log(`${id}: hero image -> ${photo}.`)
  }

  console.log('\nDone. Homepage de-placeholdered + service heroes on-subject.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
