#!/usr/bin/env node
/**
 * One-shot: the school heroSplit blocks were seeded with imageAspect 'portrait'
 * (~3/4), which made the placeholder image ~800px tall and the hero sections
 * too tall. Switch them to 'square' to match the resort heroes (shorter).
 *
 * Patches the heroSplit block on each schoolPage in place (no asset re-upload).
 * Reads the Sanity write token from the CLI session, same as the seed scripts.
 * Usage:  node scripts/fix-school-hero-aspect.js
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

async function main() {
  const token = getCliToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  const pages = await client.fetch(
    `*[_type == "schoolPage"]{_id, "heroKey": pageBuilder[_type == "heroSplit"][0]._key}`,
  )

  for (const page of pages) {
    if (!page.heroKey) {
      console.log(`  ${page._id}: no heroSplit block, skipped`)
      continue
    }
    await client
      .patch(page._id)
      .set({[`pageBuilder[_key=="${page.heroKey}"].imageAspect`]: 'square'})
      .commit()
    console.log(`  ${page._id}: heroSplit imageAspect -> square`)
  }

  console.log('\nDone. School hero aspect fixed.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
