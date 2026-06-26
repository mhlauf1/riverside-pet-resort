#!/usr/bin/env node
/**
 * Client revision round 4 (Brian) — Grooming School copy edits.
 *
 * Surgical text edits to published `schoolPage` docs. Each change is keyed to a
 * specific block (_key) so unrelated copy is never touched. Re-runnable: every
 * edit is an idempotent string replacement / item filter / heading set.
 *
 *  1. school-home / sh-key-info ("What Training at Rio Looks Like"):
 *       - remove the "retail and presentation skills" clause (students don't
 *         learn retail)
 *       - "meet the team" -> "meet the instructors" (the "best next step" line)
 *  2. school-schedule-a-tour: tours Monday–Wednesday -> Monday–Friday
 *       (st-overview prose + st-faq "When are tours offered?" answer)
 *  3. school-enrollment-financing / ef-overview heading:
 *       "Start When a Spot Opens" -> "Open Enrollment Year-Round"
 *  4. school-scholarships: drop the MN/WI residency requirement and the
 *       "recent high school graduates" preference (sc-eligibility items +
 *       sc-faq "Who can apply?" answer)
 *
 * Reads the Sanity write token from the CLI session (run `sanity login` first).
 *
 * Usage:  node scripts/seed-revision-round4-copy.js
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

// Replace text in every span of a portable-text array (block.children[].text)
// and in plain-string fields. Returns a new value; leaves structure intact.
function replaceInPortableText(blocks, replacements) {
  return blocks.map((blk) => {
    if (blk._type !== 'block' || !Array.isArray(blk.children)) return blk
    return {
      ...blk,
      children: blk.children.map((child) => {
        if (typeof child.text !== 'string') return child
        let text = child.text
        for (const [from, to] of replacements) text = text.split(from).join(to)
        return {...child, text}
      }),
    }
  })
}

async function run() {
  const token = getCliToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  // ---- 1. school-home -------------------------------------------------------
  {
    const doc = await client.getDocument('school-home')
    const pageBuilder = doc.pageBuilder.map((b) => {
      if (b._key !== 'sh-key-info') return b
      return {
        ...b,
        body: replaceInPortableText(b.body, [
          ['client communication, retail and presentation skills, creative expression', 'client communication, creative expression'],
          ['meet the team', 'meet the instructors'],
        ]),
      }
    })
    await client.patch('school-home').set({pageBuilder}).commit()
    console.log('✓ school-home: removed retail clause + meet the team → meet the instructors')
  }

  // ---- 2. school-schedule-a-tour -------------------------------------------
  {
    const doc = await client.getDocument('school-schedule-a-tour')
    const pageBuilder = doc.pageBuilder.map((b) => {
      if (b._key === 'st-overview') {
        return {
          ...b,
          body: replaceInPortableText(b.body, [['Monday through Wednesday', 'Monday through Friday']]),
        }
      }
      if (b._key === 'st-faq') {
        return {
          ...b,
          faqs: b.faqs.map((f) => ({
            ...f,
            answer: replaceInPortableText(f.answer, [['Monday through Wednesday', 'Monday through Friday']]),
          })),
        }
      }
      return b
    })
    await client.patch('school-schedule-a-tour').set({pageBuilder}).commit()
    console.log('✓ school-schedule-a-tour: tours Monday–Wednesday → Monday–Friday')
  }

  // ---- 3. school-enrollment-financing --------------------------------------
  {
    const doc = await client.getDocument('school-enrollment-financing')
    const pageBuilder = doc.pageBuilder.map((b) =>
      b._key === 'ef-overview' ? {...b, heading: 'Open Enrollment Year-Round'} : b,
    )
    await client.patch('school-enrollment-financing').set({pageBuilder}).commit()
    console.log('✓ school-enrollment-financing: heading → Open Enrollment Year-Round')
  }

  // ---- 4. school-scholarships ----------------------------------------------
  {
    const doc = await client.getDocument('school-scholarships')
    const pageBuilder = doc.pageBuilder.map((b) => {
      if (b._key === 'sc-eligibility') {
        // Remove the residency requirement and the recent-graduate preference.
        return {...b, items: b.items.filter((it) => it._key !== 'sc-location' && it._key !== 'sc-preference')}
      }
      if (b._key === 'sc-faq') {
        return {
          ...b,
          faqs: b.faqs.map((f) => ({
            ...f,
            answer: replaceInPortableText(f.answer, [
              ['New students admitted to a qualified program who are residents of Minnesota or Wisconsin, are enrolled', 'New students admitted to a qualified program who are enrolled'],
              [' Preference is given to recent high school graduates.', ''],
            ]),
          })),
        }
      }
      return b
    })
    await client.patch('school-scholarships').set({pageBuilder}).commit()
    console.log('✓ school-scholarships: removed MN/WI residency + recent-graduate preference')
  }

  console.log('\nAll round-4 copy edits committed (published docs patched directly).')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
