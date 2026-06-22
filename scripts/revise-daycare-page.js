#!/usr/bin/env node
/**
 * One-shot CMS polish pass for /services/daycare.
 *
 * Preserves the approved daycare narrative and pricing from intake-content.md:
 * - Full Day: $39
 * - Half Day: $29
 * - Packages: 5/10/20/30 day full + half pricing table
 *
 * Adds richer support copy and section rhythm so the daycare page matches the
 * more complete homepage and boarding treatment without introducing unconfirmed
 * policies, booking URLs, vaccination requirements, or guarantees.
 *
 * Usage: node scripts/revise-daycare-page.js
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

const approvedDaycareNarrative =
  'Our daycare experience blends socialization, enrichment, free-form off-leash play, and structured rest periods to create a balanced and enjoyable day. Every dog is unique. Our team carefully evaluates play styles, energy levels, and personalities to help ensure a safe and positive experience.'

const packageTable = {
  _key: 'dpkgt',
  _type: 'matrixTable',
  tableName: 'Package Pricing',
  columnHeaders: ['Days', 'Full', 'Half'],
  rows: [
    {
      _key: 'r5',
      _type: 'matrixRow',
      rowLabel: '5',
      cells: [
        {_key: 'r5a', _type: 'matrixCell', value: '$165'},
        {_key: 'r5b', _type: 'matrixCell', value: '$115'},
      ],
    },
    {
      _key: 'r10',
      _type: 'matrixRow',
      rowLabel: '10',
      cells: [
        {_key: 'r10a', _type: 'matrixCell', value: '$320'},
        {_key: 'r10b', _type: 'matrixCell', value: '$225'},
      ],
    },
    {
      _key: 'r20',
      _type: 'matrixRow',
      rowLabel: '20',
      cells: [
        {_key: 'r20a', _type: 'matrixCell', value: '$600'},
        {_key: 'r20b', _type: 'matrixCell', value: '$425'},
      ],
    },
    {
      _key: 'r30',
      _type: 'matrixRow',
      rowLabel: '30',
      cells: [
        {_key: 'r30a', _type: 'matrixCell', value: '$830'},
        {_key: 'r30b', _type: 'matrixCell', value: '$595'},
      ],
    },
  ],
}

function buildDaycarePage(existingHero) {
  return [
    {
      _type: 'heroSplit',
      _key: 'dh',
      eyebrow: 'Dog Daycare in Hastings',
      heading: 'A Better Day for Your Best Friend',
      body: approvedDaycareNarrative,
      primaryCta: existingHero?.primaryCta || button('Book Daycare', '#'),
      secondaryCta: existingHero?.secondaryCta || button('Contact Us', '/contact'),
      image: existingHero?.image,
      imagePosition: 'right',
      imageAspect: 'landscape',
      backgroundColor: 'cream',
    },
    {
      _type: 'iconGrid',
      _key: 'dhl',
      eyebrow: 'Balanced Daycare',
      heading: 'What Daycare Includes',
      description:
        'Daycare is built around social time, enrichment, thoughtful group management, and rest so dogs can enjoy a better day.',
      columns: 3,
      backgroundColor: 'cream',
      items: [
        {
          _key: 'di1',
          icon: 'mdi:dog-side',
          title: 'Supervised Off-Leash Play',
          description: 'Dogs have room to move, play, and interact under team supervision.',
        },
        {
          _key: 'di2',
          icon: 'mdi:paw',
          title: 'Socialization Opportunities',
          description: 'Daycare gives dogs structured chances to spend time around other dogs and people.',
        },
        {
          _key: 'di3',
          icon: 'mdi:bone',
          title: 'Enrichment Activities',
          description: 'Activity and engagement help keep daycare days interesting and balanced.',
        },
        {
          _key: 'di4',
          icon: 'mdi:sleep',
          title: 'Structured Rest Periods',
          description: 'Rest is part of the rhythm, helping dogs reset between play and activity.',
        },
        {
          _key: 'di5',
          icon: 'mdi:shield-check',
          title: 'Safe Group Management',
          description:
            'The team considers play styles, energy levels, and personalities to support positive groups.',
        },
        {
          _key: 'di6',
          icon: 'mdi:spray-bottle',
          title: 'Clean & Sanitized Environment',
          description: 'Cleanliness and sanitation are part of the daily daycare routine.',
        },
      ],
    },
    {
      _type: 'whatsIncluded',
      _key: 'dflow',
      eyebrow: 'Daycare Rhythm',
      heading: 'A Day Built for Balance',
      description:
        'A good daycare day is active, social, and structured enough to help each dog have a positive experience.',
      layout: 'inline',
      columns: 2,
      backgroundColor: 'sand',
      iconColor: 'forest',
      items: [
        {
          _key: 'df1',
          icon: 'mdi:account-eye',
          title: 'Thoughtful Introductions',
          description: 'The team evaluates play style, personality, and energy level as part of daycare care.',
        },
        {
          _key: 'df2',
          icon: 'mdi:dog-service',
          title: 'Play and Social Time',
          description: 'Dogs get opportunities for free-form off-leash play and socialization.',
        },
        {
          _key: 'df3',
          icon: 'mdi:leaf',
          title: 'Enrichment Breaks',
          description: 'Activities help add variety beyond open play.',
        },
        {
          _key: 'df4',
          icon: 'mdi:weather-night',
          title: 'Rest Built In',
          description: 'Structured rest periods help keep the day from becoming overstimulating.',
        },
      ],
    },
    {
      _type: 'pricingList',
      _key: 'dprice',
      eyebrow: 'Rates',
      heading: 'Daycare Rates',
      description: 'Choose a full day or half day, with package pricing available for frequent visits.',
      columns: 2,
      backgroundColor: 'cream',
      items: [
        {_key: 'dp1', _type: 'pricingListItem', service: 'Full Day', price: '$39'},
        {_key: 'dp2', _type: 'pricingListItem', service: 'Half Day', price: '$29'},
      ],
    },
    {
      _type: 'pricingMatrix',
      _key: 'dpkg',
      eyebrow: 'Save with Packages',
      heading: 'Daycare Packages',
      description: 'Package pricing keeps recurring daycare simple for dogs who visit regularly.',
      backgroundColor: 'sand',
      tables: [packageTable],
    },
    {
      _type: 'ctaStrip',
      _key: 'dcta',
      heading: 'Ready to plan a better day for your dog?',
      subtext:
        'Contact Riverside Pet Resort to talk through daycare options, availability, and next steps.',
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

  const doc = await client.getDocument('service-daycare')
  if (!doc) throw new Error('service-daycare document not found')

  const existingHero = (doc.pageBuilder || []).find((block) => block._key === 'dh')
  await client.patch('service-daycare').set({pageBuilder: buildDaycarePage(existingHero)}).commit()

  console.log('Updated service-daycare pageBuilder with enriched daycare content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
