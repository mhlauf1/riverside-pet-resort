#!/usr/bin/env node
/**
 * Client revision round 6 — gallery cleanup.
 *
 * Surgical patch to the resort /gallery (`page-gallery`) galleryPage block:
 *   • REMOVE the nighttime staff-holding-dog photo (new/Pup pics 2/IMG_0966 —
 *     alt "A staff member with a happy golden retriever on a snowy evening").
 *     Dark and person-focused; off-format for the clean pup grid. Excluded per
 *     client review.
 *   • ADD new/IMG_5764 — a poodle, boxer, schnauzer & Labrador in group play.
 *     The one genuinely-unused, gallery-worthy still left in the "Pup Pics"
 *     batch (the other 28 were already seeded by seed-round4-galleries.js;
 *     IMG_3238 is the excluded Barks & Rec-branded harness; IMG_5698 is a
 *     near-duplicate of the existing stock-tank pool shot, so it's left out).
 *
 * Net: resort gallery stays at 39 photos (−1 +1), no school-gallery change.
 * Surgical: uploads one asset, patches only the images array (no re-upload of
 * the other 38). Idempotent: re-running is a no-op once applied.
 *
 * Usage:  PHOTOS_DIR="/Users/michaellaufersweiler/Desktop/riverisde pet resort" \
 *           node scripts/seed-round6-gallery.js
 */

const path = require('node:path')
const fs = require('node:fs')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const PHOTOS_DIR = process.env.PHOTOS_DIR || '/Users/michaellaufersweiler/Desktop/riverisde pet resort'

// Matches the key scheme used by seed-round4-galleries.js so this stays consistent.
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
const keyFor = (rel) => 'img-' + Math.abs(hash(rel))

const REMOVE_REL = 'new/Pup pics 2/IMG_0966.jpeg'
const ADD_REL = 'new/IMG_5764.jpeg'
const ADD_ALT = 'A poodle, boxer, schnauzer, and Labrador playing together in the turf yard'

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

async function run() {
  const token = getCliToken()
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', token, useCdn: false})

  const doc = await client.getDocument('page-gallery')
  if (!doc) throw new Error('page-gallery not found')
  const gridIdx = doc.pageBuilder.findIndex((b) => b._type === 'galleryPage')
  if (gridIdx === -1) throw new Error('galleryPage block not found on page-gallery')

  const removeKey = keyFor(REMOVE_REL)
  const addKey = keyFor(ADD_REL)
  let images = doc.pageBuilder[gridIdx].images || []
  const before = images.length

  // Remove the rejected nighttime staff photo (by deterministic key, with an
  // alt fallback in case the key scheme ever drifts).
  images = images.filter(
    (img) => img._key !== removeKey && img.alt !== 'A staff member with a happy golden retriever on a snowy evening',
  )
  const removed = before - images.length

  // Add IMG_5764 if not already present.
  let added = 0
  if (!images.some((img) => img._key === addKey)) {
    const abs = path.join(PHOTOS_DIR, ADD_REL)
    process.stdout.write(`  uploading ${ADD_REL} … `)
    const asset = await client.assets.upload('image', fs.readFileSync(abs), {filename: path.basename(ADD_REL)})
    console.log('ok')
    images.push({
      _type: 'image',
      _key: addKey,
      asset: {_type: 'reference', _ref: asset._id},
      alt: ADD_ALT,
    })
    added = 1
  }

  await client.patch('page-gallery').set({[`pageBuilder[${gridIdx}].images`]: images}).commit()
  console.log(`✓ page-gallery /gallery — removed ${removed}, added ${added} → ${images.length} photos`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
