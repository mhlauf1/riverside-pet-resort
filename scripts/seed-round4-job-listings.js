#!/usr/bin/env node
/**
 * Client revision round 4 (Brian) — Job Listings page.
 *
 * Recreates riogrooming.com's "Submit a Job Posting" function: employers submit
 * an opening through a form; the school administrator posts it for current and
 * past students. (Net-new beyond the original $3,500 scope — built as goodwill.)
 *
 * Creates `page-job-listings` (slug `job-listings`, renders at /job-listings via
 * the (site)/[slug] route) and adds a footer "Company" column link.
 *
 * Destination is the "[EMAIL-TBD]" marker until Brian confirms the school
 * administrator address (likely the same as the school funnel email).
 *
 * Idempotent: createOrReplace for the page; footer link de-duped by _key.
 *
 * Usage:  node scripts/seed-round4-job-listings.js
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

const span = (text, marks = []) => ({_type: 'span', _key: 'sp' + Math.abs(hash(text)), text, marks})
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
const block = (children, key) => ({_type: 'block', _key: key, style: 'normal', markDefs: [], children})
const field = (fieldName, label, type, required) => ({_type: 'formField', _key: fieldName, fieldName, label, type, required})

const JOB_LISTINGS_PAGE = {
  _id: 'page-job-listings',
  _type: 'page',
  name: 'Job Listings',
  slug: {_type: 'slug', current: 'job-listings'},
  seo: {
    metaTitle: 'Job Listings — Submit a Pet Industry Job Posting | Rio Grooming School',
    metaDescription:
      'Employers can submit pet care and grooming job openings to share with current and past Rio Grooming School students. Post a job for free.',
  },
  pageBuilder: [
    {
      _type: 'heroMinimal',
      _key: 'jl-hero',
      eyebrow: 'For Employers',
      heading: 'Job Listings',
      subtext:
        'Hiring groomers, bathers, or pet care staff? Submit your opening below and we will share it with current and past Rio Grooming School students.',
      backgroundColor: 'forest',
    },
    {
      _type: 'contactForm',
      _key: 'jl-form',
      eyebrow: 'Submit a Job Posting',
      heading: 'Post a Job',
      destinationEmailOverride: '[EMAIL-TBD]',
      description: [
        block(
          [
            span('Post jobs, search, and find qualified candidates — '),
            span('all for free.', ['strong']),
            span(' Job postings go to the school administrator, who posts them for current and past students of the Rio Grooming School & Salon.'),
          ],
          'jl-d',
        ),
      ],
      formFields: [
        field('email', 'Your Email', 'email', true),
        field('name', 'Your Name', 'text', true),
        field('company', 'Company', 'text', true),
        field('address', 'Address', 'text', false),
        field('city', 'City', 'text', false),
        field('state', 'State', 'text', false),
        field('zip', 'Zipcode', 'text', false),
        field('phone', 'Phone', 'tel', false),
        field('message', 'Job Description', 'textarea', true),
      ],
      submitButtonText: 'Submit Job Posting',
      successMessage:
        'Thank you! Your job posting has been received. Our school administrator will review and share it with students.',
    },
  ],
}

async function run() {
  const token = getCliToken()
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', token, useCdn: false})

  await client.createOrReplace(JOB_LISTINGS_PAGE)
  console.log('✓ page-job-listings created/replaced (/job-listings)')

  // Add a footer "Company" column link (de-duped).
  const settings = await client.getDocument('siteSettings')
  const footerColumns = (settings.footerColumns || []).map((col) => {
    if (col.title !== 'Company') return col
    const links = (col.links || []).filter((l) => l._key !== 'fl-jobs')
    return {
      ...col,
      links: [
        ...links,
        {
          _key: 'fl-jobs',
          label: 'Job Listings',
          link: {_type: 'link', href: '/job-listings', linkType: 'href'},
        },
      ],
    }
  })
  await client.patch('siteSettings').set({footerColumns}).commit()
  console.log('✓ siteSettings: added "Job Listings" to footer Company column')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
