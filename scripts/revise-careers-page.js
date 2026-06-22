#!/usr/bin/env node
/**
 * Light CMS content pass for /careers.
 *
 * Preserves the approved career areas:
 * - Grooming Careers
 * - Pet Care Careers
 * - Client Experience Careers
 * - Student Opportunities
 *
 * Does not invent open roles, benefits, pay, schedules, hiring guarantees,
 * application systems, or response-time promises.
 *
 * Usage: node scripts/revise-careers-page.js
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

const button = (buttonText, href) => ({
  _type: 'button',
  buttonText,
  link: {_type: 'link', linkType: 'href', href},
})

function imageFrom(block, fallbackAlt) {
  if (!block?.image?.asset?._ref) return undefined
  return {
    _type: 'image',
    _key: `${block._key || 'image'}-image`,
    asset: block.image.asset,
    crop: block.image.crop,
    hotspot: block.image.hotspot,
    alt: block.image.alt || fallbackAlt,
  }
}

function buildCareersPage(existingHero) {
  return [
    {
      _type: 'heroSplit',
      _key: 'ch',
      eyebrow: 'Careers',
      heading: 'Join the Riverside Team',
      body: "Riverside Pet Resort brings boarding, daycare, grooming, client care, and the Rio Grooming School together on one Hastings campus. We're interested in people who care about pets, communicate clearly, and take pride in clean, thoughtful work.",
      primaryCta: existingHero?.primaryCta || button('Contact Us', '/contact'),
      secondaryCta: existingHero?.secondaryCta,
      image: imageFrom(existingHero, 'A friendly dog at Riverside Pet Resort'),
      imagePosition: 'right',
      imageAspect: 'landscape',
      backgroundColor: 'forest',
    },
    {
      _type: 'featureGrid',
      _key: 'cgrid',
      heading: 'Where You Could Fit In',
      columns: 4,
      backgroundColor: 'cream',
      items: [
        {
          _key: 'cg1',
          icon: 'mdi:content-cut',
          title: 'Grooming Careers',
          description:
            'For experienced groomers and stylists who want to practice their craft in a pet-focused, education-minded environment.',
        },
        {
          _key: 'cg2',
          icon: 'mdi:paw',
          title: 'Pet Care Careers',
          description:
            'For team members who help with daycare and boarding guests through clean routines, enrichment, and attentive daily care.',
        },
        {
          _key: 'cg3',
          icon: 'mdi:account-heart',
          title: 'Client Experience Careers',
          description:
            'For people who enjoy helping families feel informed, welcomed, and confident about their pet care options.',
        },
        {
          _key: 'cg4',
          icon: 'mdi:school',
          title: 'Student Opportunities',
          description:
            'For future grooming professionals interested in hands-on education through Rio Grooming School.',
        },
      ],
    },
    {
      _type: 'whatsIncluded',
      _key: 'cfit',
      eyebrow: 'What We Look For',
      heading: 'A Good Fit at Riverside',
      description:
        'Different roles ask for different skills, but the same basics matter across the campus.',
      layout: 'inline',
      columns: 3,
      backgroundColor: 'sand',
      iconColor: 'forest',
      items: [
        {
          _key: 'cf1',
          icon: 'mdi:heart',
          title: 'Care for Pets',
          description: 'Comfort with animals, patience, and attention to each pet’s needs.',
        },
        {
          _key: 'cf2',
          icon: 'mdi:spray-bottle',
          title: 'Pride in the Details',
          description: 'Clean spaces, steady routines, and follow-through make the campus work.',
        },
        {
          _key: 'cf3',
          icon: 'mdi:account-group',
          title: 'Team Communication',
          description: 'Clear handoffs and kind communication help pets, families, and coworkers.',
        },
      ],
    },
    {
      _type: 'ctaStrip',
      _key: 'ccta',
      heading: 'Interested in working with Riverside?',
      subtext:
        'Reach out through the Contact page and tell us what kind of role or opportunity you are interested in.',
      cta: button('Contact Us', '/contact'),
      backgroundColor: 'forest',
    },
  ]
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2025-09-25',
    token: getCliToken(),
    useCdn: false,
  })

  const doc = await client.getDocument('page-careers')
  if (!doc) throw new Error('page-careers document not found')

  const existingHero = (doc.pageBuilder || []).find((block) => block._key === 'ch')
  await client
    .patch('page-careers')
    .set({pageBuilder: buildCareersPage(existingHero)})
    .commit()

  console.log('Updated page-careers with focused careers content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
