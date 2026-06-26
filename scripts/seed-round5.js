#!/usr/bin/env node
/**
 * Client revision round 5 (Brian, 6/26).
 *
 *  2. Move Job Listings into the Grooming School section so the school-banner
 *     link keeps visitors in the school "building":
 *       - create schoolPage `school-job-listings` (/school/job-listings) from
 *         the existing resort job-listings page builder
 *       - delete the resort `page-job-listings`
 *       - remove the "Job Listings" link from the resort footer
 *       - add "Job Listings" to the school nav, right after "Schedule a Tour"
 *  3. Replace the white-dog bath photo on the grooming page hero with an
 *     Amy-supplied finished-groom photo.
 *
 * (Item 1 — header three buttons + phone left — is a code change. Item 4 —
 * Amy's Studio access — is handled separately.)
 *
 * Usage:  PHOTOS_DIR="/Users/michaellaufersweiler/Desktop/riverisde pet resort" \
 *           node scripts/seed-round5.js
 */
const path = require('node:path')
const fs = require('node:fs')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const PHOTOS_DIR = process.env.PHOTOS_DIR || '/Users/michaellaufersweiler/Desktop/riverisde pet resort'

// Amy-supplied finished-groom photo for the grooming page hero (replaces the
// white-dog bath shot IMG_7387). A clean, appealing professional-groom result.
const GROOMING_HERO = {
  file: 'school/582408038_18542296411000299_2249175644490417684_n.jpg',
  alt: 'A goldendoodle with a freshly groomed teddy-bear trim at Riverside Pet Resort',
}

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
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  // ---- 2. Move Job Listings into the school section -------------------------
  const resortJobs = await client.getDocument('page-job-listings')
  if (resortJobs) {
    await client.createOrReplace({
      _id: 'school-job-listings',
      _type: 'schoolPage',
      name: 'Job Listings',
      slug: {_type: 'slug', current: 'job-listings'},
      seo: resortJobs.seo,
      pageBuilder: resortJobs.pageBuilder,
    })
    console.log('✓ school-job-listings created (/school/job-listings)')
    await client.delete('page-job-listings')
    console.log('✓ resort page-job-listings deleted')
  } else {
    console.log('• page-job-listings not found (already moved?) — skipping create/delete')
  }

  // Remove "Job Listings" from the resort footer Company column.
  const settings = await client.getDocument('siteSettings')
  const footerColumns = (settings.footerColumns || []).map((col) =>
    col.title === 'Company'
      ? {...col, links: (col.links || []).filter((l) => l._key !== 'fl-jobs')}
      : col,
  )
  await client.patch('siteSettings').set({footerColumns}).commit()
  console.log('✓ siteSettings: removed Job Listings from resort footer')

  // Add "Job Listings" to the school nav, right after "Schedule a Tour".
  const school = await client.getDocument('schoolSettings')
  const sNav = (school.navItems || []).filter((n) => n._key !== 'snav-jobs')
  const tourIdx = sNav.findIndex((n) => n._key === 'snav-tour')
  const jobsNav = {
    _type: 'navItem',
    _key: 'snav-jobs',
    label: 'Job Listings',
    link: {_type: 'link', href: '/school/job-listings', linkType: 'href'},
  }
  sNav.splice(tourIdx === -1 ? sNav.length : tourIdx + 1, 0, jobsNav)
  await client.patch('schoolSettings').set({navItems: sNav}).commit()
  console.log('✓ schoolSettings: added Job Listings after Schedule a Tour')

  // ---- 3. Replace the white-dog grooming hero photo -------------------------
  const abs = path.join(PHOTOS_DIR, GROOMING_HERO.file)
  const asset = await client.assets.upload('image', fs.readFileSync(abs), {
    filename: path.basename(GROOMING_HERO.file),
  })
  const groom = await client.getDocument('service-grooming')
  const pageBuilder = groom.pageBuilder.map((b) =>
    b._key === 'gh'
      ? {
          ...b,
          image: {
            ...(b.image || {}),
            _type: 'image',
            asset: {_type: 'reference', _ref: asset._id},
            alt: GROOMING_HERO.alt,
          },
        }
      : b,
  )
  await client.patch('service-grooming').set({pageBuilder}).commit()
  console.log('✓ service-grooming: grooming hero photo replaced (white dog → goldendoodle)')

  console.log('\nRound 5 content changes committed.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
