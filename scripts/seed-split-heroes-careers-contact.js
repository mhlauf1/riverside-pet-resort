#!/usr/bin/env node
/**
 * Convert the Careers and Contact page heroes from centered `heroMinimal` to a
 * split hero (`heroSplit`: heading + intro text left, image right), matching the
 * service/about pages.
 *
 *  - Careers: merge the leading heroMinimal + its intro infoSection into a
 *    heroSplit; remove the now-absorbed infoSection.
 *  - Contact: convert the heroMinimal to a heroSplit and move the contact form's
 *    welcoming line up into the hero body (cleared from the form to avoid
 *    duplication). Form heading + fields + map are untouched.
 *
 * Placeholder Unsplash photos (uploaded as Sanity assets) — swapped for real
 * Rio/Barks & Rec photos in the imagery pass. Reads the Sanity write token from
 * the CLI session, same as the other seed scripts.
 *
 * Usage:  node scripts/seed-split-heroes-careers-contact.js
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

function blockText(block) {
  return (block?.children || []).map((c) => c.text).join('')
}
function ptText(ptArray) {
  return (ptArray || []).map(blockText).join('\n\n')
}

async function uploadPhoto(client, id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Unsplash ${id} -> ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename: `${id}.jpg`})
  return asset._id
}

function imageField(heroKey, assetId, alt) {
  return {
    _type: 'image',
    _key: `${heroKey}-img`,
    asset: {_type: 'reference', _ref: assetId},
    alt,
  }
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

  // ── Careers ──────────────────────────────────────────────────────────────
  {
    const doc = await client.getDocument('page-careers')
    const builder = doc.pageBuilder || []
    const hero = builder.find((b) => b._key === 'ch')
    const intro = builder.find((b) => b._key === 'cnarr')
    if (!hero || !intro) throw new Error('page-careers: expected blocks ch + cnarr')

    process.stdout.write('Uploading photo for page-careers … ')
    const assetId = await uploadPhoto(client, 'photo-1517849845537-4d257902454a')
    console.log('ok')

    const heroSplit = {
      _type: 'heroSplit',
      _key: 'ch',
      eyebrow: hero.eyebrow || undefined,
      heading: hero.heading,
      body: blockText((intro.content || [])[0]),
      primaryCta: {
        _type: 'button',
        buttonText: 'Contact Us',
        link: {_type: 'link', linkType: 'href', href: '/contact'},
      },
      image: imageField('ch', assetId, 'A friendly dog at Riverside Pet Resort'),
      imagePosition: 'right',
      backgroundColor: 'forest',
    }

    const newBuilder = builder
      .filter((b) => b._key !== 'cnarr')
      .map((b) => (b._key === 'ch' ? heroSplit : b))
    await client.patch('page-careers').set({pageBuilder: newBuilder}).commit()
    console.log('  page-careers: heroSplit set (forest), intro merged.')
  }

  // ── Contact ──────────────────────────────────────────────────────────────
  {
    const doc = await client.getDocument('page-contact')
    const builder = doc.pageBuilder || []
    const hero = builder.find((b) => b._key === 'kh')
    const form = builder.find((b) => b._key === 'kform')
    if (!hero || !form) throw new Error('page-contact: expected blocks kh + kform')

    process.stdout.write('Uploading photo for page-contact … ')
    const assetId = await uploadPhoto(client, 'photo-1587300003388-59208cc962cb')
    console.log('ok')

    // Move the form's welcoming line into the hero; clear it from the form.
    const introCopy = ptText(form.description)

    const heroSplit = {
      _type: 'heroSplit',
      _key: 'kh',
      eyebrow: hero.eyebrow || undefined,
      heading: hero.heading,
      body: introCopy || undefined,
      primaryCta: {
        _type: 'button',
        buttonText: 'Call Us',
        link: {_type: 'link', linkType: 'href', href: 'tel:6514804726'},
      },
      image: imageField('kh', assetId, 'A happy dog welcoming you to Riverside Pet Resort'),
      imagePosition: 'right',
      backgroundColor: 'forest',
    }

    const newBuilder = builder.map((b) => {
      if (b._key === 'kh') return heroSplit
      if (b._key === 'kform') {
        // Drop the description so it isn't shown twice; keep everything else.
        const {description, ...rest} = b // eslint-disable-line no-unused-vars
        return rest
      }
      return b
    })
    await client.patch('page-contact').set({pageBuilder: newBuilder}).commit()
    console.log('  page-contact: heroSplit set (forest), form intro moved into hero.')
  }

  console.log('\nDone. Careers + Contact now use the split hero.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
