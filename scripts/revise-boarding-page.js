#!/usr/bin/env node
/**
 * One-shot CMS polish pass for /services/boarding.
 *
 * Preserves the approved boarding narrative and pricing from intake-content.md:
 * - Standard Boarding: $52/night
 * - Luxury Boarding: $69/night
 * - Premium/luxury-suite renovation note: approximately $129/night when complete
 *
 * Adds richer support copy and section rhythm so the boarding page matches the
 * more complete homepage/school presentation without introducing unconfirmed
 * policies, booking URLs, or operational guarantees.
 *
 * Usage: node scripts/revise-boarding-page.js
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

const approvedBoardingNarrative =
  "At Riverside Pet Resort, your dog's comfort, safety, and happiness are our top priorities. Our boarding program combines personalized care, structured routines, enrichment activities, and attentive supervision to ensure every guest enjoys a safe and comfortable stay. Whether staying for one night or an extended vacation, each guest receives individualized attention from our experienced pet care team."

function buildBoardingPage(existingHero) {
  return [
    {
      _type: 'heroSplit',
      _key: 'bh',
      eyebrow: 'Dog Boarding in Hastings',
      heading: 'A Comfortable Stay Away From Home',
      body: approvedBoardingNarrative,
      primaryCta: existingHero?.primaryCta || button('Book Boarding', '#'),
      secondaryCta: existingHero?.secondaryCta || button('Contact Us', '/contact'),
      image: existingHero?.image,
      imagePosition: 'right',
      imageAspect: 'landscape',
      backgroundColor: 'forest',
    },
    {
      _type: 'iconGrid',
      _key: 'bhl',
      eyebrow: 'Overnight Care',
      heading: 'What Your Dog Can Expect',
      description:
        'Comfortable boarding starts with clean accommodations, steady routines, enrichment, and attentive care from the pet care team.',
      columns: 3,
      backgroundColor: 'cream',
      items: [
        {
          _key: 'bi1',
          icon: 'mdi:spray-bottle',
          title: 'Clean & Sanitized Accommodations',
          description: 'Care spaces are kept clean and refreshed so guests can settle in comfortably.',
        },
        {
          _key: 'bi2',
          icon: 'mdi:bone',
          title: 'Daily Enrichment Activities',
          description: 'Boarding stays include activity and engagement to help dogs have a more balanced day.',
        },
        {
          _key: 'bi3',
          icon: 'mdi:hand-heart',
          title: 'Individualized Care',
          description: "The team pays attention to each guest's needs, routine, and comfort throughout the stay.",
        },
        {
          _key: 'bi4',
          icon: 'mdi:pill',
          title: 'Medication Administration Available',
          description:
            'Medication support is available for boarding guests; share details when booking so the team can plan appropriately.',
        },
        {
          _key: 'bi5',
          icon: 'mdi:account-group',
          title: 'Trained Pet Care Professionals',
          description: 'Experienced pet care staff provide attentive supervision and daily care.',
        },
        {
          _key: 'bi6',
          icon: 'mdi:bed',
          title: 'Comfortable Overnight Accommodations',
          description: 'Overnight guests have a dedicated place to rest between activity and care routines.',
        },
      ],
    },
    {
      _type: 'whatsIncluded',
      _key: 'bprep',
      eyebrow: 'Before the Stay',
      heading: 'Planning a Boarding Stay',
      description:
        "A little preparation helps the team keep your dog's visit smooth, comfortable, and consistent.",
      layout: 'inline',
      columns: 2,
      backgroundColor: 'sand',
      iconColor: 'forest',
      items: [
        {
          _key: 'bp-plan-1',
          icon: 'mdi:calendar-clock',
          title: 'Short or Extended Visits',
          description: 'Boarding is available for one-night stays and longer vacation plans.',
        },
        {
          _key: 'bp-plan-2',
          icon: 'mdi:clipboard-text',
          title: 'Care Details',
          description: "Share your dog's routine, needs, and comfort notes when you book.",
        },
        {
          _key: 'bp-plan-3',
          icon: 'mdi:pill-multiple',
          title: 'Medication Notes',
          description: 'If medication is needed, provide instructions early so the team can prepare.',
        },
        {
          _key: 'bp-plan-4',
          icon: 'mdi:phone-message',
          title: 'Questions Before Drop-Off',
          description: 'Reach out before the stay if you want to talk through your pet care plan.',
        },
      ],
    },
    {
      _type: 'pricingList',
      _key: 'bprice',
      eyebrow: 'Rates',
      heading: 'Boarding Rates',
      description:
        'A premium suite tier is expected at approximately $129/night upon completion of our luxury suite renovations. Pricing is subject to change.',
      columns: 1,
      backgroundColor: 'cream',
      items: [
        {_key: 'bp1', service: 'Standard Boarding', price: '$52/night'},
        {_key: 'bp2', service: 'Luxury Boarding', price: '$69/night'},
      ],
    },
    {
      _type: 'ctaStrip',
      _key: 'bcta',
      heading: "Have questions before your dog's stay?",
      subtext:
        'Contact the Riverside Pet Resort team to talk through boarding needs, availability, and next steps.',
      cta: button('Contact Us', '/contact'),
      backgroundColor: 'forest',
    },
  ]
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  const doc = await client.getDocument('service-boarding')
  if (!doc) throw new Error('service-boarding document not found')

  const existingHero = (doc.pageBuilder || []).find((block) => block._key === 'bh')
  await client.patch('service-boarding').set({pageBuilder: buildBoardingPage(existingHero)}).commit()

  console.log('Updated service-boarding pageBuilder with enriched boarding content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
