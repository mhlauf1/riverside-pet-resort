#!/usr/bin/env node
/**
 * Round 5 follow-up (Brian): the scholarships eligibility grid dropped to 4
 * items (round 4) and rendered 3-up with an orphan. Set the iconGrid to 2
 * columns so the four cards form a clean 2x2. Idempotent.
 *
 * Usage:  node scripts/seed-round5-scholarship-grid.js
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

;(async () => {
  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })
  const doc = await client.getDocument('school-scholarships')
  const pageBuilder = doc.pageBuilder.map((b) => (b._key === 'sc-eligibility' ? {...b, columns: 2} : b))
  await client.patch('school-scholarships').set({pageBuilder}).commit()
  console.log('✓ school-scholarships sc-eligibility: columns → 2 (2x2 grid)')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
