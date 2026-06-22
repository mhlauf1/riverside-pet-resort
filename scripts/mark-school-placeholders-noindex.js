#!/usr/bin/env node
/**
 * Mark Rio Grooming School placeholder sub-pages as noindex while keeping the
 * school home indexable. Run after seeding or whenever placeholder content is
 * restored during review.
 *
 * Usage: node scripts/mark-school-placeholders-noindex.js
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
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const match = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!match) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return match[1]
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  const pages = await client.fetch(
    `*[_type == "schoolPage" && defined(slug.current)]{_id, name, "slug": slug.current}`,
  )

  const tx = client.transaction()
  for (const page of pages) {
    const noIndex = page.slug !== 'home'
    tx.patch(page._id, (patch) => patch.set({seo: {noIndex}}))
  }

  if (pages.length > 0) await tx.commit()

  for (const page of pages) {
    console.log(`${page.slug === 'home' ? 'index' : 'noindex'}\t${page.slug}\t${page.name}`)
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
