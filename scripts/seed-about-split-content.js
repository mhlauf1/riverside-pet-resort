#!/usr/bin/env node
/**
 * Convert the About page's lonely centered narrative paragraph (the leftover
 * `infoSection` `anarr`) into a `splitContent` section with an image on the
 * left and the text on the right — so it reads as an intentional section
 * instead of a floating centered block.
 *
 * Reuses the existing approved paragraph verbatim as the body. Adds a required
 * heading ("Rooted in Our Community") — NEW copy, pending client approval,
 * editable in Studio. Placeholder Unsplash image (swapped in the imagery pass).
 *
 * Usage:  node scripts/seed-about-split-content.js
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

  const doc = await client.getDocument('page-about')
  const builder = doc.pageBuilder || []
  const narr = builder.find((b) => b._key === 'anarr')
  if (!narr) throw new Error('page-about: expected infoSection block "anarr"')
  if (narr._type === 'splitContent') {
    console.log('Already converted — nothing to do.')
    return
  }

  process.stdout.write('Uploading photo for page-about split section … ')
  const assetId = await uploadPhoto(client, 'photo-1561037404-61cd46aa615b')
  console.log('ok')

  const splitContent = {
    _type: 'splitContent',
    _key: 'anarr', // keep key to preserve order
    heading: 'Rooted in Our Community', // NEW copy — pending approval
    body: narr.content || [], // reuse the approved paragraph verbatim (portable text)
    image: {
      _type: 'image',
      _key: 'anarr-img',
      asset: {_type: 'reference', _ref: assetId},
      alt: 'A dog at Riverside Pet Resort',
    },
    imagePosition: 'left',
    backgroundColor: 'sand',
  }

  const newBuilder = builder.map((b) => (b._key === 'anarr' ? splitContent : b))
  await client.patch('page-about').set({pageBuilder: newBuilder}).commit()
  console.log('page-about: narrative paragraph converted to splitContent (image left, sand).')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
