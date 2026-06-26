#!/usr/bin/env node
/**
 * Fix: the round-4 pages (gallery, job-listings, school gallery) were seeded
 * with `title`, but the `page`/`schoolPage` Studio list uses the `name` field
 * (select: {title: 'name'}) — so they showed as "Untitled". Set `name` and drop
 * the stray `title`. Idempotent.
 *
 * Usage:  node scripts/fix-round4-page-names.js
 */
const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

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

const NAMES = {
  'page-gallery': 'Gallery',
  'page-job-listings': 'Job Listings',
  'school-gallery': 'Gallery',
}

async function run() {
  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })
  for (const [id, name] of Object.entries(NAMES)) {
    await client.patch(id).set({name}).unset(['title']).commit()
    console.log(`✓ ${id}: name = "${name}" (removed stray title)`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
