#!/usr/bin/env node

/**
 * Client revision round 6:
 * - Replace the Rio Request Information email form with the QuickSchools embed.
 * - Add a current job-postings display section above the employer submission form.
 * - Point the grooming hero "Contact Us" CTA to the on-page grooming request form.
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'

function token() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN

  const bin = path.join(process.cwd(), 'node_modules', '.bin', 'sanity')
  const raw = execSync(`"${bin}" debug --secrets 2>&1`, {
    encoding: 'utf8',
    cwd: path.join(process.cwd(), 'studio'),
    env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'},
  })
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const match = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!match) throw new Error('Could not read CLI auth token. Run sanity login first.')
  return match[1]
}

function pt(text) {
  return [
    {
      _key: 'p1',
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{_key: 's1', _type: 'span', marks: [], text}],
    },
  ]
}

function replaceByKey(blocks, key, replacement) {
  return blocks.map((block) => (block._key === key ? replacement : block))
}

function insertAfterKeyOnce(blocks, afterKey, blockToInsert) {
  if (blocks.some((block) => block._key === blockToInsert._key)) return blocks
  const index = blocks.findIndex((block) => block._key === afterKey)
  if (index === -1) return [...blocks, blockToInsert]
  return [...blocks.slice(0, index + 1), blockToInsert, ...blocks.slice(index + 1)]
}

function ensureLinkOnce(links = [], linkToInsert, afterKey) {
  if (links.some((link) => link._key === linkToInsert._key)) return links
  const index = links.findIndex((link) => link._key === afterKey)
  if (index === -1) return [...links, linkToInsert]
  return [...links.slice(0, index + 1), linkToInsert, ...links.slice(index + 1)]
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: token(),
    useCdn: false,
  })

  const [requestInfo, jobsPage, grooming] = await Promise.all([
    client.getDocument('school-request-information'),
    client.getDocument('school-job-listings'),
    client.getDocument('service-grooming'),
  ])
  const schoolSettings = await client.getDocument('schoolSettings')

  if (!requestInfo?._id) throw new Error('Missing school-request-information')
  if (!jobsPage?._id) throw new Error('Missing school-job-listings')
  if (!grooming?._id) throw new Error('Missing service-grooming')
  if (!schoolSettings?._id) throw new Error('Missing schoolSettings')

  const quickSchoolsBlock = {
    _key: 'rio-quickschools-enquiry',
    _type: 'quickSchoolsEnquiry',
    eyebrow: 'Admissions',
    heading: 'Ask About Rio Grooming School',
    description: pt(
      'Tell us a little about your interest in Rio Grooming School. This form sends your information directly to our admissions area in QuickSchools.',
    ),
    scriptUrl: 'https://riogran.quickschools.com/sms/es/enquiry?divId=enquiry-form',
    divId: 'enquiry-form',
    showFootnote: true,
  }

  const currentJobsBlock = {
    _key: 'jl-current-postings',
    _type: 'jobListings',
    eyebrow: 'For Students & Graduates',
    heading: 'Current Job Postings',
    description: pt(
      'Approved grooming and pet-care job opportunities will appear here for Rio students and graduates.',
    ),
    emptyMessage:
      'There are no current job postings at this time. Please check back soon.',
    backgroundColor: 'cream',
  }

  const updatedRequestInfoBlocks = replaceByKey(
    requestInfo.pageBuilder || [],
    'rio-request-info-form',
    quickSchoolsBlock,
  ).map((block) => {
    if (block._key !== 'ri-faq') return block
    return {
      ...block,
      faqs: (block.faqs || []).map((faq) => {
        if (faq._key !== 'faq-72') return faq
        return {
          ...faq,
          question: 'Where does this form go?',
          answer: pt(
            'This inquiry form sends your information directly to Rio Grooming School admissions through QuickSchools.',
          ),
        }
      }),
    }
  })

  await client
    .patch(requestInfo._id)
    .set({pageBuilder: updatedRequestInfoBlocks})
    .commit({autoGenerateArrayKeys: true})
  console.log('✓ school-request-information: QuickSchools enquiry form installed')

  const updatedJobsBlocks = insertAfterKeyOnce(
    jobsPage.pageBuilder || [],
    'jl-hero',
    currentJobsBlock,
  )

  await client
    .patch(jobsPage._id)
    .set({pageBuilder: updatedJobsBlocks})
    .commit({autoGenerateArrayKeys: true})
  console.log('✓ school-job-listings: current postings section added')

  const updatedGroomingBlocks = (grooming.pageBuilder || []).map((block) => {
    if (block._key !== 'gh') return block
    return {
      ...block,
      secondaryCta: {
        _type: 'button',
        buttonText: 'Contact Us',
        link: {_type: 'link', href: '#groom-appt-form', linkType: 'href'},
      },
    }
  })

  await client
    .patch(grooming._id)
    .set({pageBuilder: updatedGroomingBlocks})
    .commit({autoGenerateArrayKeys: true})
  console.log('✓ service-grooming: Contact Us CTA points to #groom-appt-form')

  const jobFooterLink = {
    _key: 'sfl-jobs',
    label: 'Job Listings',
    link: {_type: 'link', href: '/school/job-listings', linkType: 'href'},
  }
  const updatedFooterColumns = (schoolSettings.footerColumns || []).map((column) => {
    if (column._key !== 'sfc-start') return column
    return {
      ...column,
      links: ensureLinkOnce(column.links, jobFooterLink, 'sfl-tour'),
    }
  })

  await client
    .patch(schoolSettings._id)
    .set({footerColumns: updatedFooterColumns})
    .commit({autoGenerateArrayKeys: true})
  console.log('✓ schoolSettings: Job Listings added to school footer')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
